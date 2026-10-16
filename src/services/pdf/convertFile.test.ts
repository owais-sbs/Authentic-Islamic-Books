/**
 * Debug harness: convert any local PDF and write the pages + intermediate markdown.
 *   PDF_PATH="D:\\Books\\x.pdf" PDF_OUT="out-dir" npx vitest run src/services/pdf/convertFile.test.ts
 * Fonts without a character map: also pass LEARN_IMAGES="7=dir/p7.png,8=dir/p8.png"
 * (pages pre-rendered at 144 dpi, i.e. scale 2) to learn the glyph mappings with OCR.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { it } from 'vitest';
import { layoutTextItems, type PdfTextItem } from './layout';
import { runPipeline } from './pipeline';
import { GlyphDecoder, applyRegionTexts, canvasWordToPdfSpace, headingRegionsToOcr, regionTextIsPlausible } from './glyphDecoder';
import type { RawPage } from '@/lib/pdfExtractor';

it.skipIf(!process.env.PDF_PATH)('convert PDF_PATH', async () => {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const path = process.env.PDF_PATH!;
  const out = process.env.PDF_OUT ?? '.';
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(readFileSync(path)), isEvalSupported: false }).promise;

  const pageItems: PdfTextItem[][] = [];
  const pageHeights: number[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    pageItems.push((await page.getTextContent()).items as PdfTextItem[]);
    pageHeights.push(page.view[3] - page.view[1]);
    page.cleanup();
  }
  await pdf.destroy();

  const decoder = new GlyphDecoder();
  if (process.env.LEARN) {
    // Same strategy as the app: OCR the page with the most undecoded glyphs, up to 8 pages
    const { createWorker } = await import('tesseract.js');
    const { execFileSync } = await import('node:child_process');
    const worker = await createWorker('eng', 1);
    const learned = new Set<number>();
    for (let round = 0; round < 8; round++) {
      const idx = decoder.pickLearningPage(pageItems, learned);
      if (idx === null) break;
      const img = join(out, `learn-p${idx + 1}.png`);
      execFileSync('python', ['-I', '-c', `import pymupdf;pymupdf.open(r'${path}')[${idx}].get_pixmap(dpi=144).save(r'${img}')`]);
      const { data } = await worker.recognize(img, {}, { text: true, blocks: true });
      const toPdf = (w: { text: string; bbox: { x0: number; y0: number; x1: number; y1: number } }) => canvasWordToPdfSpace(w, 2, pageHeights[idx]);
      decoder.learn(pageItems[idx], data.words.map(toPdf));
      decoder.markAttempted(pageItems[idx]);
      learned.add(idx);
      console.log(`learned from p${idx + 1}; overall coverage ${decoder.coverage(pageItems.flat()).toFixed(3)}`);
    }
    decoder.learnFromVocabulary(pageItems);
    console.log(`after vocabulary: overall coverage ${decoder.coverage(pageItems.flat()).toFixed(3)}`);
    // Chapter banners still containing unknown glyphs: OCR just those strips
    await worker.setParameters({ tessedit_pageseg_mode: '7' as never });
    for (let idx = 0; idx < pageItems.length; idx++) {
      const regions = headingRegionsToOcr(pageItems[idx], decoder);
      if (!regions.length) continue;
      const img = join(out, `banner-p${idx + 1}.png`);
      execFileSync('python', ['-I', '-c', `import pymupdf;pymupdf.open(r'${path}')[${idx}].get_pixmap(dpi=144).save(r'${img}')`]);
      const replacements: Array<{ region: (typeof regions)[number]; text: string }> = [];
      for (const r of regions) {
        const h = pageHeights[idx];
        const pad = 4;
        const rectangle = { left: (r.x0 - pad) * 2, top: (h - r.y1 - pad) * 2, width: (r.x1 - r.x0 + pad * 2) * 2, height: (r.y1 - r.y0 + pad * 2) * 2 };
        const { data } = await worker.recognize(img, { rectangle });
        const text = data.text.replace(/\s+/g, ' ').trim();
        if (regionTextIsPlausible(text, r, pageItems[idx])) replacements.push({ region: r, text });
      }
      pageItems[idx] = applyRegionTexts(pageItems[idx], replacements);
    }
    await worker.terminate();
  }

  if (process.env.DUMP_PAGE) {
    const n = Number(process.env.DUMP_PAGE) - 1;
    for (const it of decoder.decode(pageItems[n])) {
      if (Math.abs(it.transform?.[3] ?? 0) > 12 && it.str?.trim()) {
        console.log('ITEM', JSON.stringify({ s: it.str.slice(0, 40), x: Math.round(it.transform![4]), w: Math.round(it.width ?? 0), y: Math.round(it.transform![5]), size: it.transform![3] }));
      }
    }
  }

  const pages: RawPage[] = pageItems.map((items, i) => {
    const layout = layoutTextItems(decoder.decode(items));
    return { pageNum: i + 1, text: layout.text, headingLines: layout.headingLines };
  });
  const book = runPipeline(pages, path.split(/[\\/]/).pop() ?? 'book.pdf');
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'pages.txt'), pages.map((p) => `--- p${p.pageNum} headings=${JSON.stringify(p.headingLines)}\n${p.text}`).join('\n'));
  writeFileSync(join(out, 'book.md'), book.extraction?.markdown ?? '');
  writeFileSync(
    join(out, 'outline.txt'),
    book.chapters.map((c) => `${c.number}. ${c.title}\n${c.sections.map((s) => `   ${s.number} ${s.title} (${s.rawText.length} chars)`).join('\n')}`).join('\n'),
  );
}, 900_000);

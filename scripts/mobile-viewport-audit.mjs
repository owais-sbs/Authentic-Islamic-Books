/**
 * One-off mobile viewport overflow audit for Task 6.
 * Run: npx playwright install chromium && node scripts/mobile-viewport-audit.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.AUDIT_BASE || 'http://localhost:5173';
const WIDTHS = [320, 360, 375, 390, 414, 430, 768, 1024, 1280, 1440];
const PAGES = [
  { name: 'homepage', path: '/' },
  { name: 'library', path: '/library' },
  { name: 'categories', path: '/categories' },
  { name: 'scholars', path: '/scholars' },
  {
    name: 'book-detail-prayer',
    path: '/books/prophet-muhammads-manner-of-performing-prayers',
  },
  {
    name: 'book-detail-three-principles',
    path: '/books/the-three-fundamental-principles-and-their',
  },
  {
    name: 'reader-three-principles',
    path: '/books/the-three-fundamental-principles-and-their/read',
  },
  {
    name: 'reader-prayer',
    path: '/books/prophet-muhammads-manner-of-performing-prayers/read',
  },
  {
    name: 'book-detail-association',
    path: '/books/the-association-for-multi-lingual-islamic-content',
  },
  { name: 'admin-login', path: '/admin/login' },
  { name: 'admin-books', path: '/admin/books' },
];

async function measure(page) {
  return page.evaluate(() => {
    const de = document.documentElement;
    const cw = de.clientWidth;
    const sw = Math.max(de.scrollWidth, document.body.scrollWidth);
    const wide = [];
    document.querySelectorAll('body *').forEach((el) => {
      if (!(el instanceof HTMLElement)) return;
      if (el.scrollWidth > cw + 2 && el.getBoundingClientRect().width > cw + 2) {
        wide.push({
          tag: el.tagName,
          cls: String(el.className || '').slice(0, 70),
          w: Math.round(el.getBoundingClientRect().width),
        });
      }
    });
    const arabic = document.querySelectorAll(
      '.reader-arabic, .reader-quran-arabic, [lang="ar"], [dir="rtl"]',
    ).length;
    const urdu = document.querySelectorAll('.reader-urdu, [lang="ur"]').length;
    return {
      cw,
      sw,
      overflow: sw > cw + 2,
      wide: wide.slice(0, 6),
      arabic,
      urdu,
      h1: document.querySelector('h1')?.textContent?.trim()?.slice(0, 90) || null,
      title: document.title,
    };
  });
}

async function waitReady(page, path) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(path.includes('/read') || path.includes('/books/') ? 1500 : 700);
}

const results = [];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

for (const w of WIDTHS) {
  const height = w < 768 ? 812 : 900;
  await page.setViewportSize({ width: w, height });
  for (const p of PAGES) {
    const url = `${BASE}${p.path}`;
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await waitReady(page, p.path);
      const m = await measure(page);
      results.push({
        width: w,
        page: p.name,
        path: p.path,
        ...m,
      });
      console.log(
        `${w}px\t${p.name}\toverflow=${m.overflow}\tcw=${m.cw}\tsw=${m.sw}\tarabic=${m.arabic}`,
      );
    } catch (err) {
      results.push({
        width: w,
        page: p.name,
        path: p.path,
        error: String(err.message || err),
      });
      console.log(`${w}px\t${p.name}\tERROR\t${err.message || err}`);
    }
  }
}

await browser.close();

const overflows = results.filter((r) => r.overflow);
const errors = results.filter((r) => r.error);
console.log('\n--- SUMMARY ---');
console.log(`checks=${results.length} overflows=${overflows.length} errors=${errors.length}`);
if (overflows.length) {
  console.log('OVERFLOW CASES:');
  for (const o of overflows) {
    console.log(JSON.stringify(o, null, 2));
  }
}
if (errors.length) {
  console.log('ERRORS:');
  for (const e of errors) console.log(JSON.stringify(e));
}

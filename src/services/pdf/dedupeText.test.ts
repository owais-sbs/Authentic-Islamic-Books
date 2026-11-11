import { describe, expect, it } from 'vitest';
import { dedupeIntraLine, dedupePageText, textSimilarity } from './dedupeText';

describe('dedupeText', () => {
  it('collapses exact doubled halves', () => {
    expect(dedupeIntraLine('PROPHETPROPHET')).toBe('PROPHET');
  });

  it('removes consecutive near-duplicate paragraphs', () => {
    const page = [
      'To perform completely the ablution, adopting the method commanded by Allah.',
      '',
      'To perform completely the ablution, adopting the method commanded by Allah.',
      '',
      'The Prophet said something else entirely about prayer.',
    ].join('\n');
    const out = dedupePageText(page);
    expect(out).toContain('The Prophet said');
    expect(out.match(/To perform completely/g)?.length).toBe(1);
  });

  it('keeps legitimate similar but distinct lines', () => {
    const a = 'First: Knowledge, that is to know about Allah.';
    const b = 'Second: To act upon this knowledge.';
    expect(textSimilarity(a, b)).toBeLessThan(0.88);
    const out = dedupePageText(`${a}\n\n${b}`);
    expect(out).toContain('First:');
    expect(out).toContain('Second:');
  });
});

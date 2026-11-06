import { describe, expect, it } from 'vitest';
import { repairFragmentedArabic } from './arabic';

describe('repairFragmentedArabic', () => {
  it('joins tatweel-spaced PDF glyph fragments', () => {
    const broken =
      'ـلـ ـلشـ ـيـ ـخـ ـ مـ ـحـ ـ مـ ـد ـالـ ـتـ ـ مـ ـيـ ـمـ ـي';
    const fixed = repairFragmentedArabic(broken);
    expect(fixed.includes('ـ')).toBe(false);
    expect(fixed.split(/\s+/).every((w) => w.length >= 2 || !/[\u0600-\u06FF]/.test(w))).toBe(true);
    expect(fixed.replace(/\s+/g, '')).toContain('تميم');
  });

  it('leaves normal Arabic prose alone', () => {
    const clean = 'الحمد لله رب العالمين';
    expect(repairFragmentedArabic(clean)).toBe(clean);
  });

  it('preserves diacritics on clean Quranic Arabic', () => {
    const ayah = 'وَأَنَّ الْمَسَاجِدَ لِلَّهِ فَلَا تَدْعُوا مَعَ اللَّهِ أَحَدًا';
    expect(repairFragmentedArabic(ayah)).toBe(ayah);
  });
});

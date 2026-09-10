import { describe, expect, it } from 'vitest';
import { parseBookContent } from '@/services/content/parseBookContent';

describe('smoke samples', () => {
  it('classifies mixed islamic sample types', () => {
    const input = [
      'CHAPTER ONE',
      '',
      'The Importance of Tawheed',
      '',
      'Tawheed is the foundation of Islamic belief and the basis of salvation.',
      '',
      'وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ',
      '',
      'And establish prayer and give zakah.',
      '',
      "Qur'an 2:43",
      '',
      'Narrated Abu Hurairah',
      '',
      'The Messenger of Allah said: Actions are but by intention.',
      '',
      'Sahih al-Bukhari',
      '',
      'Ibn Taymiyyah said:',
      '',
      '"Faith increases and decreases."',
      '',
      "Majmu' al-Fatawa, 9/34",
      '',
      '1.1 Definition of Tawheed',
      '',
      'Normal paragraph content continues here.',
      '',
      '[1] Source reference text for the footnote.',
    ].join('\n');

    const blocks = parseBookContent(input);
    const types = blocks.map((b) => b.type);
    expect(types).toContain('heading');
    expect(types).toContain('quran');
    expect(types).toContain('hadith');
    expect(types).toContain('quote');
    expect(types).toContain('footnote');
    expect(types).toContain('paragraph');
    // Citation may be a reference block or attached as quote.source
    const hasCitation =
      types.includes('reference') ||
      blocks.some((b) => b.type === 'quote' && Boolean(b.source));
    expect(hasCitation).toBe(true);
  });

  it('does not invent quran from volume/page prose', () => {
    const types = parseBookContent('Volume 2, Page 43 discusses the topic.').map((b) => b.type);
    expect(types).not.toContain('quran');
  });
});

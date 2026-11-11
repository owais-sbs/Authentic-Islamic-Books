import { describe, expect, it } from 'vitest';
import { detectMetaFromText, isUnusableBookTitle } from './structureDetector';

describe('metadata detection', () => {
  it('rejects copyright / association titles', () => {
    expect(isUnusableBookTitle('(© The Association for Multi-lingual islamic Content, 2026')).toBe(
      true,
    );
    expect(isUnusableBookTitle('Copyright © 2023 All rights reserved')).toBe(true);
    expect(isUnusableBookTitle('ISBN 978-1-23456-789-0')).toBe(true);
  });

  it('accepts a real scholarly title', () => {
    expect(isUnusableBookTitle('The Three Fundamental Principles and Their Proofs')).toBe(false);
  });

  it('skips copyright lines when choosing a title', () => {
    const text = [
      '(© The Association for Multi-lingual islamic Content, 2026',
      'www.example.com',
      'The Three Fundamental Principles and Their Proofs',
      'By Shaykh Muhammad at-Tamimi',
      'This book explains the foundations of Islam with proofs from the Qur’an.',
    ].join('\n');
    const meta = detectMetaFromText(text, 'scan.pdf');
    expect(meta.title).toMatch(/Three Fundamental Principles/i);
    expect(meta.author.toLowerCase()).toContain('tamimi');
  });
});

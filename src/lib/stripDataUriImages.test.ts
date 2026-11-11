import { describe, expect, it } from 'vitest';
import { stripDataUriImages } from './stripDataUriImages';

describe('stripDataUriImages', () => {
  it('removes data-URI figures and counts them', () => {
    const html = `<p>Hello</p><figure class="content-image"><img src="data:image/png;base64,aaa"/><figcaption>x</figcaption></figure>`;
    const { html: out, removed } = stripDataUriImages(html);
    expect(removed).toBeGreaterThanOrEqual(1);
    expect(out).not.toMatch(/data:image/);
    expect(out).toContain('Hello');
  });

  it('keeps https image URLs', () => {
    const html = `<figure class="content-image"><img src="https://example.com/a.png"/></figure>`;
    const { html: out, removed } = stripDataUriImages(html);
    expect(removed).toBe(0);
    expect(out).toContain('https://example.com/a.png');
  });
});

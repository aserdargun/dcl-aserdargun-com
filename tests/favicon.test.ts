import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(__dirname, '..');

function load(rel: string): string {
  return readFileSync(resolve(ROOT, rel), 'utf8');
}

function isPng(buf: Buffer): boolean {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buf.length < 24) return false;
  if (!buf.subarray(0, 8).equals(sig)) return false;
  // IHDR
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  return w === 32 || w === 180 ? h === w : false;
}

describe('favicon family (green)', () => {
  it('SVG: family geometry, colors and meaningful paths', () => {
    const svg = load('public/favicon.svg');
    expect(svg).toContain('viewBox="0 0 320 320"');
    expect(svg).toMatch(/<rect[^>]*width="320"[^>]*height="320"[^>]*rx="64"[^>]*fill="#121310"/);
    expect(svg).toMatch(/<circle[^>]*cx="160"[^>]*cy="142"[^>]*r="108"[^>]*fill="#c8ff36"/);
    // Glyph group with proper stroke styling
    expect(svg).toMatch(/<g[^>]*fill="none"[^>]*stroke="#0c0d0a"[^>]*stroke-width="9"[^>]*stroke-linecap="round"[^>]*stroke-linejoin="round"/);
    // Local rounded rect + 2 lines
    expect(svg).toMatch(/<rect[^>]*x="83"[^>]*y="110"[^>]*width="48"[^>]*height="54"[^>]*rx="5"/);
    expect(svg).toMatch(/<line[^>]*x1="92"[^>]*y1="124"[^>]*x2="122"[^>]*y2="124"/);
    expect(svg).toMatch(/<line[^>]*x1="92"[^>]*y1="139"[^>]*x2="122"[^>]*y2="139"/);
    // Cloud
    expect(svg).toContain('M183 143h43');
    // Branch + center dot
    expect(svg).toContain('M108 164v27h96v-38');
    expect(svg).toMatch(/<circle[^>]*cx="156"[^>]*cy="191"[^>]*r="7"[^>]*fill="#0c0d0a"/);
    // Text label
    expect(svg).toMatch(/<text[^>]*x="160"[^>]*y="296"[^>]*text-anchor="middle"[^>]*fill="#c8ff36"/);
    expect(svg).toContain('DCL');
    // aria-label
    expect(svg).toMatch(/aria-label="DCL"/);
  });

  it('index.html has 3 link tags with versioned hrefs', () => {
    const html = load('index.html');
    expect(html).toMatch(/<link rel="icon" type="image\/png" sizes="32x32" href="\/favicon-32\.png\?v=family-green-1" \/>/);
    expect(html).toMatch(/<link rel="icon" type="image\/svg\+xml" href="\/favicon\.svg\?v=family-green-1" \/>/);
    expect(html).toMatch(/<link rel="apple-touch-icon" sizes="180x180" href="\/apple-touch-icon\.png\?v=family-green-1" \/>/);
  });

  it('PNG 32 + apple-touch 180 are valid PNGs with correct dimensions', () => {
    const p32 = readFileSync(resolve(ROOT, 'public/favicon-32.png'));
    const p180 = readFileSync(resolve(ROOT, 'public/apple-touch-icon.png'));
    expect(isPng(p32)).toBe(true);
    expect(isPng(p180)).toBe(true);
    expect(p32.readUInt32BE(16)).toBe(32);
    expect(p32.readUInt32BE(20)).toBe(32);
    expect(p180.readUInt32BE(16)).toBe(180);
    expect(p180.readUInt32BE(20)).toBe(180);
  });

  it('rejects legacy 64x64 favicon, wrong label, blue SVG using same validator', () => {
    const validator = (svg: string): boolean => {
      if (!svg.includes('viewBox="0 0 320 320"')) return false;
      if (!/rx="64"[^>]*fill="#121310"/.test(svg)) return false;
      if (!/fill="#c8ff36"/.test(svg)) return false;
      if (!/stroke="#0c0d0a"/.test(svg)) return false;
      if (!svg.includes('DCL')) return false;
      if (!/aria-label="DCL"/.test(svg)) return false;
      return true;
    };
    // 64x64 legacy
    expect(
      validator('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-label="DCL"><rect width="64" height="64" rx="10" fill="#121310"/><circle cx="32" cy="32" r="22" fill="#c8ff36"/><text x="32" y="36" text-anchor="middle" fill="#c8ff36">DCL</text></svg>')
    ).toBe(false);
    // Wrong label
    expect(
      validator('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" aria-label="WRONG"><rect width="320" height="320" rx="64" fill="#121310"/><circle cx="160" cy="142" r="108" fill="#c8ff36"/><text x="160" y="296" text-anchor="middle" fill="#c8ff36">DCL</text></svg>')
    ).toBe(false);
    // Blue SVG (not green)
    expect(
      validator('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" aria-label="DCL"><rect width="320" height="320" rx="64" fill="#121310"/><circle cx="160" cy="142" r="108" fill="#3b82f6"/><text x="160" y="296" text-anchor="middle" fill="#c8ff36">DCL</text></svg>')
    ).toBe(false);
    // Valid family-green passes
    expect(validator(load('public/favicon.svg'))).toBe(true);
  });
});

import {readFileSync} from 'node:fs';
import path from 'node:path';

const cssFiles = [
  'src/css/custom.css',
  'src/pages/index.module.css',
  'src/pages/evmbench.module.css',
  'src/components/Comparison/styles.module.css',
  'src/components/CostCalculator/styles.module.css',
  'src/components/Coverage/styles.module.css',
  'src/components/Faq/styles.module.css',
  'src/components/FinalCta/styles.module.css',
  'src/components/Pillars/styles.module.css',
  'src/components/Pricing/styles.module.css',
  'src/components/ProofStats/styles.module.css',
  'src/components/Testimonials/styles.module.css',
  'src/components/TrustLogos/styles.module.css',
  'src/components/TweetCard/styles.module.css',
].map(file => path.resolve(process.cwd(), file));

const sources = cssFiles.map(file => ({
  file: path.relative(process.cwd(), file),
  css: readFileSync(file, 'utf8'),
}));
const allCss = sources.map(source => source.css).join('\n');
const allowedFontSizes = new Set([11, 12.5, 14, 15, 16, 18, 20, 24, 32, 44, 56]);

type CssNumber = {
  file: string;
  property: string;
  value: number;
  declaration: string;
};

function extractDeclarations(propertyPattern: RegExp): CssNumber[] {
  const results: CssNumber[] = [];

  for (const source of sources) {
    for (const match of source.css.matchAll(/(?<property>[-a-zA-Z]+)\s*:\s*(?<value>[^;]+);/g)) {
      const property = match.groups?.property ?? '';
      const value = match.groups?.value ?? '';

      if (!propertyPattern.test(property)) continue;

      for (const numberMatch of value.matchAll(/-?\d*\.?\d+px/g)) {
        results.push({
          file: source.file,
          property,
          value: Number.parseFloat(numberMatch[0]),
          declaration: `${property}: ${value}`,
        });
      }
    }
  }

  return results;
}

function extractRule(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = allCss.match(new RegExp(`${escaped}\\s*\\{(?<body>[^}]*)\\}`, 'm'));

  return (match?.groups?.body ?? '').replace(/\s+/g, ' ').trim();
}

function extractMediaRule(query: string, selector: string): string {
  const start = allCss.indexOf(query);
  if (start === -1) return '';
  const openBrace = allCss.indexOf('{', start);
  let depth = 0;

  for (let index = openBrace; index < allCss.length; index += 1) {
    if (allCss[index] === '{') depth += 1;
    if (allCss[index] === '}') depth -= 1;
    if (depth === 0) {
      const mediaBlock = allCss.slice(openBrace + 1, index);
      const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const match = mediaBlock.match(new RegExp(`${escaped}\\s*\\{(?<body>[^}]*)\\}`, 'm'));
      return (match?.groups?.body ?? '').replace(/\s+/g, ' ').trim();
    }
  }

  return '';
}

describe('R1 polish CSS metrics', () => {
  it('keeps font sizes on the approved v2 scale, with documented exceptions only', () => {
    const allowedExceptions = new Map<string, string>([
      ['src/css/custom.css|font-size: 95%|95', 'Infima code-size token is percent-based and not part of px scale extraction.'],
      ['src/pages/index.module.css|font-size: 52px|52', 'Audit R1 requires a laptop-only H1 size of 52px to prevent a five-line hero title.'],
    ]);
    const offScale = extractDeclarations(/^font-size$/)
      .filter(item => !allowedFontSizes.has(item.value))
      .filter(item => !allowedExceptions.has(`${item.file}|${item.declaration}|${item.value}`));

    expect(offScale).toEqual([]);
  });

  it('uses no more than 12 distinct approved font sizes', () => {
    const distinctSizes = new Set(extractDeclarations(/^font-size$/).map(item => item.value));

    expect(distinctSizes.size).toBeLessThanOrEqual(12);
  });

  it('keeps padding, margin and gap values on the 4px grid, with documented exceptions only', () => {
    const allowedExceptions = new Map<string, string>([
      ['src/css/custom.css|margin-right: .65rem|0.65', 'Navbar logo spacing is rem-based and excluded from px grid extraction.'],
    ]);
    const offGrid = extractDeclarations(/^(padding|padding-top|padding-right|padding-bottom|padding-left|margin|margin-top|margin-right|margin-bottom|margin-left|gap|row-gap|column-gap)$/)
      .filter(item => Math.abs(item.value / 4 - Math.round(item.value / 4)) > 0.001)
      .filter(item => !allowedExceptions.has(`${item.file}|${item.declaration}|${item.value}`));

    expect(offGrid).toEqual([]);
  });

  it('sets a centered max-width 1440 container for landing content', () => {
    expect(extractRule('.heroInner')).toMatch(/max-width:\s*1440px/);
    expect(extractRule('.heroInner')).toMatch(/margin:\s*0 auto/);
    expect(allCss).toMatch(/max-width:\s*1440px/);
  });

  it('uses the laptop H1 size required by the audit fix', () => {
    const laptopTitle = extractMediaRule('@media screen and (min-width: 997px) and (max-width: 1439px)', '.title');

    expect(laptopTitle).toMatch(/font-size:\s*52px/);
  });

  it('uses an outline navbar CTA instead of a second filled primary style', () => {
    const ctaRule = extractRule('.navbar-cta');

    expect(ctaRule).not.toMatch(/background:\s*var\(--site-accent\)/);
    expect(ctaRule).toMatch(/border:\s*1px solid/);
    expect(ctaRule).toMatch(/color:\s*var\(--site-text\)/);
  });

  it('keeps dark nav links neutral instead of accent-colored', () => {
    expect(allCss).toMatch(/\[data-theme='dark'\]\s+\.navbar__link[^{]*\{[^}]*color:\s*var\(--site-text-soft\)/);
  });

  it('reduces proof stat number color to the main text token', () => {
    expect(extractRule('.statValue')).toMatch(/color:\s*var\(--site-text\)/);
    expect(allCss).not.toMatch(/\[data-theme='dark'\]\s+\.statValue[^{]*\{[^}]*color:\s*var\(--site-accent\)/);
  });
});

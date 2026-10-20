import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {render, screen, within} from '@testing-library/react';
import Home from '../../src/pages';

const partners = [
  {name: '1inch', file: 'OneInchLogo.tsx'},
  {name: 'Lido', file: 'LidoLogo.tsx'},
  {name: 'Pessimistic Security', file: 'PessimisticLogo.tsx'},
  {name: 'OXORIO', file: 'OxorioLogo.tsx'},
  {name: 'MixBytes', file: 'MixBytesLogo.tsx'},
  {name: 'Gearbox', file: 'GearboxLogo.tsx'},
  {name: 'Hexens', file: 'HexensLogo.tsx'},
  {name: 'TON Core', file: 'TonCoreLogo.tsx'},
  {name: 'Mellow Finance', file: 'MellowLogo.tsx'},
  {name: 'BGD Labs', file: 'BgdLabsLogo.tsx'},
];

describe('trust logos and proof stats', () => {
  beforeEach(() => {
    render(<Home />);
  });

  it('renders the trust logos section', () => {
    expect(screen.getByTestId('trust-logos')).toBeInTheDocument();
  });

  it('renders ten partner logo components', () => {
    expect(screen.queryAllByTestId('partner-logo')).toHaveLength(10);
  });

  test.each(partners)('renders the $name partner logo as an inline accessible image', ({name}) => {
    const logo = screen.queryByRole('img', {name: `${name} logo`});

    expect(logo).not.toBeNull();
    if (!logo) return;

    expect(logo).toHaveAttribute('data-testid', 'partner-logo');
    expect(logo.tagName).not.toBe('IMG');
  });

  it('adds TON Core, Mellow Finance, and BGD Labs at the end of the row', () => {
    const logoNames = screen.queryAllByTestId('partner-logo')
      .map(logo => logo.getAttribute('aria-label'));

    expect(logoNames.slice(-3)).toEqual([
      'TON Core logo',
      'Mellow Finance logo',
      'BGD Labs logo',
    ]);
  });

  test.each(partners.filter(partner => partner.file !== 'MellowLogo.tsx'))(
    'normalizes the $file source to currentColor',
    ({file}) => {
    const logoPath = path.resolve(process.cwd(), 'src/components/TrustLogos/logos', file);
    const exists = existsSync(logoPath);
    const source = exists ? readFileSync(logoPath, 'utf8') : '';

    expect(exists).toBe(true);
    expect(source).toContain('fill="currentColor"');
    expect(source).not.toMatch(/#1D1E21/i);
    expect(source).not.toMatch(/fill=["']white["']/i);
    expect(source).not.toContain('fill="url(');
    expect(source).not.toMatch(/filter\s*:/i);
    },
  );

  it('uses evenodd or masking for the TON Core knockout glyph', () => {
    const logoPath = path.resolve(process.cwd(), 'src/components/TrustLogos/logos/TonCoreLogo.tsx');
    const source = existsSync(logoPath) ? readFileSync(logoPath, 'utf8') : '';

    expect(source).toMatch(/currentColor/);
    expect(source).toMatch(/fillRule=["']evenodd["']|clipRule=["']evenodd["']|mask/i);
  });

  it('uses the 1inch icon plus text lockup instead of the old horizontal merged path', () => {
    const logoPath = path.resolve(process.cwd(), 'src/components/TrustLogos/logos/OneInchLogo.tsx');
    const source = existsSync(logoPath) ? readFileSync(logoPath, 'utf8') : '';

    expect(source).toContain('1inch');
    expect(source).toMatch(/<text[\s>]/);
    expect(source).not.toContain('M1148.87');
  });

  it('keeps the BGD Labs component monochrome without hard-coded fills', () => {
    const logoPath = path.resolve(process.cwd(), 'src/components/TrustLogos/logos/BgdLabsLogo.tsx');
    const source = existsSync(logoPath) ? readFileSync(logoPath, 'utf8') : '';

    expect(source).toContain('fill="currentColor"');
    expect(source).not.toMatch(/fill=["']#[0-9a-f]{3,8}["']/i);
    expect(source).not.toMatch(/stroke=["']#[0-9a-f]{3,8}["']/i);
  });

  it('renders exactly seven proof stat cards', () => {
    expect(screen.getAllByTestId('stat-card')).toHaveLength(7);
  });

  test.each(['95.7%', 'Top-6', '100%', '17.9%', '87–95%', '200+', '$75'])(
    'renders the %s proof number',
    value => {
      expect(screen.getByTestId('proof-stats')).toHaveTextContent(value);
    },
  );

  it('frames CTFBench as our open smart contract benchmark', () => {
    const ctfbenchCard = screen
      .getAllByTestId('stat-card')
      .find(card => card.textContent?.includes('CTFBench'));

    expect(ctfbenchCard).toBeDefined();
    expect(ctfbenchCard).toHaveTextContent('our open smart contract benchmark');
    expect(ctfbenchCard).not.toHaveTextContent(/independent/i);
  });

  it('gives every proof card a secure source link', () => {
    for (const card of screen.getAllByTestId('stat-card')) {
      const link = within(card).getByRole('link', {name: /source/i});

      expect(link).toHaveAttribute('href', expect.stringMatching(/^https:\/\//));
    }
  });

  it('uses proof as the proof-stats section id', () => {
    expect(screen.getByTestId('proof-stats')).toHaveAttribute('id', 'proof');
  });

  it('orders hero before trust logos before proof stats', () => {
    const bodySections = Array.from(document.body.querySelectorAll('[data-testid]'));

    expect(bodySections.indexOf(screen.getByTestId('hero')))
      .toBeLessThan(bodySections.indexOf(screen.getByTestId('trust-logos')));
    expect(bodySections.indexOf(screen.getByTestId('trust-logos')))
      .toBeLessThan(bodySections.indexOf(screen.getByTestId('proof-stats')));
  });
});

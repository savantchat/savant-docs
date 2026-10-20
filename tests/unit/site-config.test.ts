import config from '../../docusaurus.config';

type HeadTag = {
  tagName?: string;
  attributes?: Record<string, string>;
  innerHTML?: string;
};

type NavbarItem = {
  label?: string;
  to?: string;
  href?: string;
  className?: string;
  type?: string;
};

type FooterItem = {
  label?: string;
  href?: string;
  to?: string;
};

type FooterLinkColumn = {
  title?: string;
  items?: FooterItem[];
};

function getHeadTags(): HeadTag[] {
  return Array.isArray(config.headTags) ? (config.headTags as HeadTag[]) : [];
}

const navbar = config.themeConfig.navbar;
const footer = config.themeConfig.footer;
const navbarItems = navbar.items as NavbarItem[];
const footerLinks = footer.links as FooterLinkColumn[];
const signupUrl = config.customFields?.signupUrl;

describe('Docusaurus theme config', () => {
  it('uses the savant.chat site identity', () => {
    expect(config.title).toBe('Savant Chat — AI Code Auditor');
    expect(config.tagline).toBe(
      'Smart contract audits first — and one language-agnostic engine for any code: ZK circuits, nodes, backends.',
    );
    expect(config.url).toBe('https://savant.chat');
  });

  it('uses the dashboard login signup URL via pathname://', () => {
    // pathname:// keeps the app route out of the Docusaurus SPA router and
    // out of trailing-slash rewriting (the app serves /dashboard/auth?mode=register).
    expect(signupUrl).toBe('pathname:///dashboard/auth?mode=register');
  });

  it('allows the temporary dashboard route to remain unresolved until the app exists', () => {
    expect(config.onBrokenLinks).toBe('warn');
  });

  it('uses the savant favicon asset', () => {
    expect(config.favicon).toBe('img/savant-favicon.png');
  });

  it('defaults color mode to dark', () => {
    expect(config.themeConfig?.colorMode?.defaultMode).toBe('dark');
  });

  it('does not respect the OS color scheme', () => {
    expect(config.themeConfig?.colorMode?.respectPrefersColorScheme).toBe(false);
  });

  it('preconnects to fonts.googleapis.com', () => {
    expect(
      getHeadTags().some(
        tag =>
          tag.tagName === 'link' &&
          tag.attributes?.rel === 'preconnect' &&
          tag.attributes?.href === 'https://fonts.googleapis.com',
      ),
    ).toBe(true);
  });

  it('embeds the self-hosted Matomo snippet without analytics cookies', () => {
    const matomoTag = getHeadTags().find(
      tag => tag.tagName === 'script' && (tag.innerHTML ?? '').includes('matomo.js'),
    );

    expect(matomoTag).toBeDefined();
    expect(matomoTag?.innerHTML).toContain('//analytics.savant.chat/');
    expect(matomoTag?.innerHTML).toContain("_paq.push(['setSiteId', '2'])");
    // Keeps the cookie policy's "no analytics cookies" promise true.
    expect(matomoTag?.innerHTML).toContain("_paq.push(['disableCookies'])");
  });

  it('loads Geist and Geist Mono from Google Fonts css2', () => {
    expect(
      getHeadTags().some(tag => {
        const href = tag.attributes?.href ?? '';

        return (
          tag.tagName === 'link' &&
          tag.attributes?.rel === 'stylesheet' &&
          href.includes('fonts.googleapis.com/css2') &&
          href.includes('Geist') &&
          href.includes('Geist+Mono')
        );
      }),
    ).toBe(true);
  });
});

describe('savant.chat navbar config', () => {
  it('uses the savant.chat navbar title', () => {
    expect(navbar.title).toBe('savant.chat');
  });

  it('uses theme-aware savant logo assets', () => {
    expect(navbar.logo?.src).toBe('img/logo_short.svg');
    expect(navbar.logo?.srcDark).toBe('img/logo_short_dark.svg');
  });

  it.each([
    ['What we audit', '/#coverage'],
    ['How it works', '/#pillars'],
    ['Proof', '/#proof'],
    ['EVMBench', '/evmbench/'],
    ['Pricing', '/pricing/'],
    ['Blog', '/blog'],
  ])('includes the %s nav item', (label, to) => {
    expect(navbarItems.some(item => item.label === label && item.to === to)).toBe(true);
  });

  it('keeps the Docs navbar item', () => {
    expect(navbarItems.some(item => item.label === 'Docs' && item.type === 'docSidebar')).toBe(true);
  });

  it('uses the signup URL for the navbar CTA', () => {
    expect(
      navbarItems.some(
        item =>
          item.label === 'Start free' &&
          item.to === signupUrl &&
          item.className?.split(/\s+/).includes('navbar-cta'),
      ),
    ).toBe(true);
  });

  it('does not enable hideOnScroll', () => {
    expect(navbar.hideOnScroll).not.toBe(true);
  });
});

describe('savant.chat footer config', () => {
  it.each(['PRODUCT', 'RESOURCES', 'COMPANY'])('includes the %s column', title => {
    expect(footerLinks.some(column => column.title === title)).toBe(true);
  });

  it.each([
    ['GitHub', 'https://github.com/savantchat'],
    ['X', 'https://x.com/savantchat'],
    ['Privacy', '/privacy-policy/'],
    ['Terms', '/terms-of-service/'],
  ])('includes the %s footer link', (label, href) => {
    const allItems = footerLinks.flatMap(column => column.items ?? []);

    expect(allItems.some(item => item.label === label && item.href === href)).toBe(true);
  });

  it('uses the Novel Codes DMCC copyright', () => {
    expect(footer.copyright).toContain('Novel Codes DMCC');
  });
});

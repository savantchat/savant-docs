import config from '../../docusaurus.config';

type NavbarItem = {
  label?: string;
  to?: string;
  href?: string;
  className?: string;
  type?: string;
};

type FooterLinkColumn = {
  title?: string;
};

const navbar = config.themeConfig.navbar;
const footer = config.themeConfig.footer;
const navbarItems = navbar.items as NavbarItem[];
const footerLinks = footer.links as FooterLinkColumn[];

describe('navbar config', () => {
  it('uses savant.chat as the navbar title', () => {
    expect(navbar.title).toBe('savant.chat');
  });

  it('uses the theme-aware logo assets', () => {
    expect(navbar.logo?.src).toBe('img/logo_short.svg');
    expect(navbar.logo?.srcDark).toBe('img/logo_short_dark.svg');
  });

  it('includes a Docs sidebar link', () => {
    expect(navbarItems.some(item => item.label === 'Docs' && item.type === 'docSidebar')).toBe(true);
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

  it('includes the Start free CTA item', () => {
    expect(
      navbarItems.some(
        item =>
          item.label === 'Start free' &&
          item.to === config.customFields?.signupUrl &&
          item.className?.split(/\s+/).includes('navbar-cta'),
      ),
    ).toBe(true);
  });
});

describe('footer config', () => {
  it.each(['PRODUCT', 'RESOURCES', 'COMPANY'])('includes the %s column', title => {
    expect(footerLinks.some(column => column.title === title)).toBe(true);
  });

  it('uses Novel Codes DMCC in the copyright', () => {
    expect(footer.copyright).toContain('Novel Codes DMCC');
  });
});

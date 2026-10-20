import {execSync} from 'node:child_process';
import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

// pathname:// keeps the app route out of the Docusaurus SPA router:
// a plain '/dashboard/auth?mode=register' link would be client-side-routed to the docs 404.
const signupUrl = 'pathname:///dashboard/auth?mode=register';

// React pages (src/pages/*.tsx) don't get git-based lastmod from the pages
// plugin, so their sitemap entries are dated from git history explicitly.
const sitemapSourceFiles: Record<string, string> = {
  'https://savant.chat/': 'src/pages/index.tsx',
  'https://savant.chat/pricing/': 'src/pages/pricing.tsx',
  'https://savant.chat/evmbench/': 'src/config/evmbench.ts',
};

function gitLastmod(file: string): string | null {
  try {
    const iso = execSync(`git log -1 --format=%cI -- ${file}`, {
      encoding: 'utf8',
    }).trim();
    return iso ? iso.slice(0, 10) : null;
  } catch {
    return null;
  }
}

// Docusaurus' showLastUpdateTime hard-errors ("outside any Git worktree") when
// the build has no .git — e.g. building the container image from a vendored
// submodule tree (gitlink) rather than a real clone. Detect a usable worktree
// once and gate git-based lastmod on it: real dates in CI (git present),
// gracefully disabled in the image build (no crash, no fake dates).
const gitLastUpdate = (() => {
  try {
    execSync('git rev-parse --is-inside-work-tree', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return true;
  } catch {
    return false;
  }
})();

const config = {
  title: 'Savant Chat — AI Code Auditor',
  tagline:
    'Smart contract audits first — and one language-agnostic engine for any code: ZK circuits, nodes, backends.',
  favicon: 'img/savant-favicon.png',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://savant.chat',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',
  // Production serves trailing-slash URLs (e.g. /pricing/); keep canonical,
  // sitemap, and edge URLs identical to avoid canonical-points-to-redirect.
  trailingSlash: true,

  customFields: {
    signupUrl,
  },

  // Makes the navbar "Start free" CTA auth-aware (swaps to "Go to dashboard" when the
  // visitor has a live session). Runs client-side only; SSG keeps the signed-out default.
  clientModules: [require.resolve('./src/clientModules/authCta.ts')],

  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: 'anonymous',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=Geist+Mono:wght@400;500;600&display=swap',
      },
    },
    // Matomo (self-hosted) — ported from the legacy site (siteId 2).
    // disableCookies keeps the cookie policy's "no analytics cookies" promise
    // true and removes any consent-banner requirement.
    {
      tagName: 'script',
      attributes: {},
      innerHTML: `
        var _paq = window._paq = window._paq || [];
        _paq.push(['disableCookies']);
        _paq.push(['trackPageView']);
        _paq.push(['enableLinkTracking']);
        (function() {
        var u="//analytics.savant.chat/";
        _paq.push(['setTrackerUrl', u+'matomo.php']);
        _paq.push(['setSiteId', '2']);
        var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
        g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
        })();
      `,
    },
  ],

  organizationName: 'savantchat',
  projectName: 'savant-docs',

  onBrokenLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
          // Feeds route lastUpdatedAt from git so sitemap.xml gets <lastmod>
          showLastUpdateTime: gitLastUpdate,
        },
        blog: {
          showLastUpdateTime: gitLastUpdate,
          blogTitle: 'Blog',
          blogDescription:
            'Engineering notes from the Savant Chat team on AI code auditing, smart contract security, and vulnerability detection.',
          blogSidebarCount: 5,
          blogSidebarTitle: 'Recent Posts',
          showReadingTime: true,
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        pages: {
          showLastUpdateTime: gitLastUpdate,
        },
        sitemap: {
          // 'date' makes the sitemap plugin read git per route; disable when
          // there is no worktree (container build) so it does not hard-error.
          // Explicit per-page lastmod is still added below via gitLastmod().
          lastmod: gitLastUpdate ? 'date' : undefined,
          ignorePatterns: [
            '/blog/archive/**',
            '/blog/authors/**',
            '/blog/tags/**',
            '/docs/tags/**',
            '/search/**',
          ],
          createSitemapItems: async params => {
            const items = await params.defaultCreateSitemapItems(params);
            return items.map(item => {
              const source = sitemapSourceFiles[item.url];
              const lastmod = source ? gitLastmod(source) : null;
              return lastmod ? {...item, lastmod} : item;
            });
          },
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/savant-social-card.png',
    metadata: [
      {name: 'twitter:site', content: '@savantchat'},
      {name: 'twitter:card', content: 'summary_large_image'},
    ],
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'savant.chat',
      hideOnScroll: false,
      logo: {
        alt: 'savant.chat logo',
        src: 'img/logo_short.svg',
        srcDark: 'img/logo_short_dark.svg',
      },
      items: [
        {to: '/#coverage', label: 'What we audit', position: 'left'},
        {to: '/#pillars', label: 'How it works', position: 'left'},
        {to: '/#proof', label: 'Proof', position: 'left'},
        {to: '/evmbench/', label: 'EVMBench', position: 'left'},
        {to: '/pricing/', label: 'Pricing', position: 'left'},
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          label: 'Docs',
          position: 'left',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          to: signupUrl,
          label: 'Start free',
          position: 'right',
          className: 'navbar-cta',
          target: '_self',
        },
      ],
    },
    footer: {
      links: [
        {
          title: 'PRODUCT',
          items: [
            {label: 'What we audit', href: '/#coverage'},
            {label: 'EVMBench leaderboard', href: '/evmbench/'},
            {label: 'Pricing', href: '/pricing/'},
            {label: 'FAQ', href: '/#faq'},
            {label: 'Docs', href: '/docs/'},
            {label: 'Blog', href: '/blog/'},
          ],
        },
        {
          title: 'RESOURCES',
          items: [
            {label: 'GitHub', href: 'https://github.com/savantchat'},
            {label: 'X', href: 'https://x.com/savantchat'},
            {label: 'CTFBench', href: 'https://github.com/savantchat/ctfbench'},
          ],
        },
        {
          title: 'COMPANY',
          items: [
            {label: 'Imprint', href: '/imprint/'},
            {label: 'Privacy', href: '/privacy-policy/'},
            {label: 'Terms', href: '/terms-of-service/'},
          ],
        },
      ],
      copyright: '© 2026 Novel Codes DMCC · Savant Chat',
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
} satisfies Config;

export default config;

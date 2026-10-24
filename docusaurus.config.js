// @ts-check
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';
import rehypeScrollRegions from './src/plugins/rehype-scroll-regions.mjs';

// Light code theme: prism's "github" theme with the five colors that fail
// WCAG 4.5:1 on the #f6f8fa code background swapped for darker ones.
// Comments, numbers/booleans, strings, keywords/tags, and attribute names.
const lightCodeColorSwap = {
  '#999988': '#57606a',
  '#36acaa': '#116d6b',
  '#00a4db': '#0b6e99',
  '#d73a49': '#cf222e',
  '#e3116c': '#b3135a',
};
const lightCodeTheme = {
  ...prismThemes.github,
  styles: prismThemes.github.styles.map((entry) => {
    const color = entry.style.color?.toLowerCase();
    return color && lightCodeColorSwap[color]
      ? {...entry, style: {...entry.style, color: lightCodeColorSwap[color]}}
      : entry;
  }),
};

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Jordan Yan · AI Documentation',
  tagline:
    'Documentation samples for AI systems and developer tools, plus defense and aerospace technical writing.',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  url: 'https://ai.jordanyan.com',
  baseUrl: '/',

  organizationName: 'kopyk',
  projectName: 'ai-docs',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // Small browser-only behaviours that need no component change. Each one
  // exports onRouteDidUpdate and cleans up after itself.
  clientModules: [
    './src/clientModules/mobileDrawerFocus.js',
    './src/clientModules/scrollRegions.js',
    './src/clientModules/searchMain.js',
    './src/clientModules/tabsA11y.js',
  ],

  stylesheets: [
    {
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap',
      type: 'text/css',
    },
  ],

  headTags: [
    {
      tagName: 'link',
      attributes: {rel: 'icon', href: '/favicon.ico', sizes: '32x32'},
    },
    {
      tagName: 'link',
      attributes: {rel: 'apple-touch-icon', href: '/apple-touch-icon.png'},
    },
    {
      tagName: 'link',
      attributes: {rel: 'manifest', href: '/site.webmanifest'},
    },
    {
      tagName: 'link',
      attributes: {rel: 'preconnect', href: 'https://fonts.googleapis.com'},
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: 'anonymous',
      },
    },
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: 'docs',
          sidebarPath: './sidebars.js',
          showLastUpdateTime: true,
          rehypePlugins: [rehypeScrollRegions],
        },
        pages: {
          rehypePlugins: [rehypeScrollRegions],
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          lastmod: 'date',
          changefreq: null,
          priority: null,
          ignorePatterns: ['/search', '/search/**'],
        },
      }),
    ],
  ],

  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      /** @type {import('@easyops-cn/docusaurus-search-local').PluginOptions} */
      ({
        hashed: true,
        indexBlog: false,
        docsRouteBasePath: 'docs',
        highlightSearchTermsOnTargetPage: false,
        searchBarShortcutHint: true,
        // Removed only from the plugin's parsed copy of each page, not from the
        // site: the "About this sample" title would otherwise be indexed as a
        // second heading section, and the active navbar link doubles the
        // breadcrumb label in results.
        ignoreCssSelectors: ['.about-sample__title', '.navbar__link--active'],
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/social-card.png',
      metadata: [
        {
          name: 'description',
          content:
            'Technical writing samples by Jordan Yan: AI model cards, RAG tutorials, API references, and evaluation rubrics, plus defense and aerospace documentation.',
        },
        {
          name: 'keywords',
          content:
            'technical writing, AI documentation, developer documentation, model card, RAG, API reference, LLM evaluation, Jordan Yan',
        },
        {name: 'author', content: 'Jordan Yan'},
        {property: 'og:type', content: 'website'},
        {property: 'og:site_name', content: 'Jordan Yan · AI Documentation'},
        {property: 'og:image:width', content: '1200'},
        {property: 'og:image:height', content: '630'},
        {
          property: 'og:image:alt',
          content: 'Jordan Yan: AI and developer documentation samples',
        },
        {
          name: 'twitter:image:alt',
          content: 'Jordan Yan: AI and developer documentation samples',
        },
        {name: 'theme-color', content: '#ffffff', media: '(prefers-color-scheme: light)'},
        {name: 'theme-color', content: '#0f0f10', media: '(prefers-color-scheme: dark)'},
      ],
      colorMode: {
        respectPrefersColorScheme: true,
      },
      docs: {
        sidebar: {
          hideable: true,
          autoCollapseCategories: true,
        },
      },
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 3,
      },
      navbar: {
        title: 'Jordan Yan',
        logo: {
          alt: '',
          src: 'img/favicon.svg',
          width: 28,
          height: 28,
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'aiSidebar',
            position: 'left',
            label: 'AI documentation',
          },
          {
            type: 'docSidebar',
            sidebarId: 'defenseSidebar',
            position: 'left',
            label: 'Defense & aerospace',
          },
          {to: '/projects', label: 'Projects', position: 'left'},
          {to: '/about', label: 'About', position: 'left'},
          {
            href: 'https://www.jordanyan.com',
            label: 'Portfolio',
            position: 'right',
          },
          {
            href: 'https://github.com/kopyk',
            position: 'right',
            className: 'header-github-link',
            'aria-label': 'GitHub profile',
          },
          {
            type: 'search',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'light',
        links: [
          {label: 'Projects', to: '/projects'},
          {label: 'GitHub', href: 'https://github.com/kopyk'},
          {label: 'LinkedIn', href: 'https://www.linkedin.com/in/jordanxyan/'},
          {label: 'Portfolio', href: 'https://www.jordanyan.com'},
        ],
        // Rendered as HTML. The location stays together on one line; the
        // string can still break after the "·" on narrow screens.
        copyright: `© ${new Date().getFullYear()} Jordan Yan · <span style="white-space:nowrap">San Luis Obispo, CA</span>`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: prismThemes.vsDark,
        additionalLanguages: ['http'],
      },
    }),
};

export default config;

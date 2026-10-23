# ai-docs

Source for [ai.jordanyan.com](https://ai.jordanyan.com), Jordan Yan's AI and developer documentation
samples. The site is built with [Docusaurus](https://docusaurus.io/) 3.9 and has two sample sets:

- **AI documentation:** model card, RAG tutorial, API reference, and LLM evaluation rubric
- **Defense & aerospace:** maintenance procedure (work package) and interface control document

It also has a **Projects** page (including [ask-my-docs](https://github.com/kopyk/ask-my-docs)) and an
**About** page. All samples are original work. Systems, part numbers and data are fictional.

## Project layout

| Path | Contents |
|------|----------|
| `docs/ai/`, `docs/defense/` | The writing samples (Markdown) |
| `src/pages/` | Landing page (`index.js`), Projects, and About |
| `src/css/custom.css` | Design tokens, theme overrides (light and dark), and the responsive layout rules |
| `src/theme/` | Two small ejected theme components (see [Swizzled components](#swizzled-components)) |
| `src/plugins/rehype-scroll-regions.mjs` | Build-time plugin that wraps tables and code blocks in labelled scroll regions |
| `sidebars.js` | The two docs sidebars |
| `static/` | Favicons, social card, `robots.txt`, web manifest, `CNAME`, and `.nojekyll` |
| `.github/workflows/deploy.yml` | Build and deploy to GitHub Pages |

## Responsive layout

Desktop and mobile use different layouts with the same tokens and principles. Breakpoints:

| Width | Layout |
|-------|--------|
| ≤ 639px | Phone: one column, 16px gutter, full-bleed code blocks, landing cards as compact rows |
| 640–996px | Tablet: same mobile shell, content capped at 720px, cards 2-up |
| 997–1199px | Small desktop: 248px sidebar and the article; "On this page" is a bar at the top of the article |
| ≥ 1100px | Landing page: two-column hero with a model-card excerpt, AI samples as a bento grid |
| ≥ 1200px | Desktop: 280px sidebar, article up to 760px, 224px "On this page" rail |

Below 1200px, "On this page" is a sticky 44px bar under the navbar. It opens a list over the
article; Esc, choosing a section, or clicking outside closes it.

Docusaurus switches between the drawer and the sidebar at 996/997px, and its CSS module class names
are hashed, so `custom.css` matches them with `[class*='…']`. After upgrading Docusaurus, rebuild and
check the 997–1199px range (the TOC override) and the mobile search box.

## Swizzled components

Only two small components are ejected. Re-check them when upgrading Docusaurus.

| Component | Why |
|-----------|-----|
| `TOCCollapsible` | Adds `aria-expanded`/`aria-controls` to the "On this page" toggle, closes the list on Esc (returning focus to the toggle), on a link, or on an outside click, and highlights the current section. The stock component has none of these. |
| `NotFound` (and `NotFound/Content`) | A 404 page in the site's design, with a search box and links to each section, and `noindex`. |

## Local development

Requires Node.js 20 or later.

```bash
npm ci            # install the exact versions in package-lock.json
npm start         # dev server with live reload at http://localhost:3000
npm run build     # production build into build/
npm run serve     # serve the production build locally
```

`npm start` doesn't build the search index. To test search, run `npm run build` and then `npm run serve`.

The build fails on broken links and anchors (`onBrokenLinks: 'throw'`), so fix any it reports before you push.

"Last updated" dates come from Git history. The build needs at least one commit, and the deploy
workflow checks out full history (`fetch-depth: 0`) so the dates are accurate.

## Deploy

Every push to `main` builds the site and deploys it to GitHub Pages with GitHub Actions
(`.github/workflows/deploy.yml`). You can also run the workflow manually from the **Actions** tab.

One-time setup:

1. In the GitHub repository, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
2. Under **Custom domain**, enter `ai.jordanyan.com` and save. The domain is also set in `static/CNAME`,
   which the build copies to the site root.
3. At the DNS provider for `jordanyan.com`, add a CNAME record:

   | Type | Name | Value |
   |------|------|-------|
   | CNAME | `ai` | `kopyk.github.io` |

4. After DNS resolves and GitHub issues the certificate, select **Enforce HTTPS** in **Settings → Pages**.

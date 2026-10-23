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
| `src/css/custom.css` | Design tokens and theme overrides (light and dark) |
| `sidebars.js` | The two docs sidebars |
| `static/` | Favicon, `CNAME`, and `.nojekyll` |
| `.github/workflows/deploy.yml` | Build and deploy to GitHub Pages |

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

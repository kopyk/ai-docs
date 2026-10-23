# ai-docs

Source for [ai.jordanyan.com](https://ai.jordanyan.com), Jordan Yan's AI and developer documentation
samples. The site is built with [Docusaurus](https://docusaurus.io/) 3.9 and has two sample sets:

- **AI documentation:** model card, RAG tutorial, API reference, and LLM evaluation rubric
- **Defense & aerospace:** maintenance procedure (work package) and interface control document

It also has a **Projects** page (including [ask-my-docs](https://github.com/kopyk/ask-my-docs)) and an
**About** page. All samples are original work written for this portfolio. Systems, part numbers and data
are fictional. No CUI, export-controlled (ITAR/EAR) or proprietary information is included. The exception
is the ask-my-docs tool, which is real.

Each sample opens with an **About this sample** box (audience, document type, approach, how it was
checked). The proof label in that box is only used where a check exists and runs in CI; see
[Sample checks](#sample-checks).

## Project layout

| Path | Contents |
|------|----------|
| `docs/ai/`, `docs/defense/` | The writing samples (Markdown) |
| `src/pages/` | Landing page (`index.js`), Projects, and About |
| `src/components/AboutSample/` | The "About this sample" box and the `ProofLabel` pill |
| `src/css/custom.css` | Design tokens, theme overrides (light and dark), and the responsive layout rules |
| `src/theme/` | A few small ejected or wrapped theme components (see [Swizzled components](#swizzled-components)) |
| `src/clientModules/` | Browser-only behaviour registered in `docusaurus.config.js`: focus management for the mobile drawer, Tab stops only on tables that overflow, and a `main` landmark on the search page |
| `src/plugins/rehype-scroll-regions.mjs` | Build-time plugin that wraps tables and code blocks in labelled scroll regions and names them by heading; a client module removes `tabindex` from tables that don't overflow |
| `sidebars.js` | The two docs sidebars |
| `static/` | Favicons, social card, `robots.txt`, `llms.txt`, web manifest, `CNAME`, and `.nojekyll` |
| `static/openapi/atlas-classify.yaml` | OpenAPI 3.1 file for the API reference sample; linted and compared with the page in CI |
| `tests/` | pytest checks that the samples' proof claims hold (see [Sample checks](#sample-checks)); `tests/fixtures/` holds the docs the RAG tutorial test runs against |
| `requirements-dev.txt`, `pytest.ini`, `redocly.yaml` | Python packages for the checks, pytest paths, and the Redocly lint config |
| `.github/workflows/ci.yml` | Build, sample checks, and OpenAPI lint on every push and pull request |
| `.github/workflows/deploy.yml` | Build and deploy to GitHub Pages on `main` |

## Sample checks

Every proof label on the site is backed by something you can run. `.github/workflows/ci.yml` runs all of
it on every push and pull request (Node 20, Python 3.12):

| Check | What it proves | Label on the sample |
|-------|----------------|---------------------|
| `npm run build` | The site builds; broken links and anchors fail it | — |
| `tests/test_rag_tutorial.py` | The Python blocks in `docs/ai/rag-tutorial.md` run as printed, against `tests/fixtures/docs`, with the Claude call replaced by a stand-in | Code tested in CI |
| `tests/test_icd_layout.py` | The ICD's byte ranges are contiguous, match their types, total 32 bytes, fit after scaling, and the CRC covers every byte before it | Layout verified |
| `tests/test_eval_rubric.py` | The rubric's results table adds up (pass counts, rates, overall, scored example) | Math verified |
| `tests/test_model_card.py` | Frame counts sum to the stated test set; DoD principle and NIST AI RMF function names match the sources | Sources checked, Totals verified |
| `tests/test_maintenance_procedure.py` | Steps number continuously, every WARNING/CAUTION precedes a step, torque target is within the wrench range | Standards cited |
| `tests/test_openapi_spec.py` + Redocly CLI | `static/openapi/atlas-classify.yaml` matches `docs/ai/api-reference.md` field for field and is valid OpenAPI 3.1 | OpenAPI spec validated |

Run them locally:

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
pytest
npx --yes @redocly/cli@2.70.0 lint static/openapi/atlas-classify.yaml   # same pinned version as CI
```

If a test fails after you edit a sample, the sample is what to fix (or the test, if the sample is right
and the check is too strict). Don't weaken a label to make a test pass.

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

Only a few small components are ejected or wrapped. Re-check them when upgrading Docusaurus.

| Component | Why |
|-----------|-----|
| `TOCCollapsible` (ejected) | Adds `aria-expanded`/`aria-controls` to the "On this page" toggle, closes the list on Esc (returning focus to the toggle), on a link, when focus leaves it, or on an outside click, moves focus to the chosen heading, and highlights the current section. The stock component has none of these. |
| `NotFound` (and `NotFound/Content`, ejected) | A 404 page in the site's design, with a search box and links to each section, and `noindex`. |
| `DocRoot/Layout/Sidebar/ExpandButton` (ejected) | The stock "Expand sidebar" control is a `div` that toggles on any key, including Tab. This one is a real `button`, takes focus after the sidebar is collapsed, and hands focus to "Collapse sidebar" after expanding. |
| `BackToTopButton` (wrapped) | Under `prefers-reduced-motion: reduce` the stock button still animates the scroll; the wrapper jumps instantly instead, and moves focus to the page title so it doesn't drop to `body` when the button hides. |

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
The checks in `ci.yml` run alongside it; they don't gate the deploy, so watch both in the **Actions** tab.

One-time setup:

1. In the GitHub repository, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
2. Under **Custom domain**, enter `ai.jordanyan.com` and save. The domain is also set in `static/CNAME`,
   which the build copies to the site root.
3. At the DNS provider for `jordanyan.com`, add a CNAME record:

   | Type | Name | Value |
   |------|------|-------|
   | CNAME | `ai` | `kopyk.github.io` |

4. After DNS resolves and GitHub issues the certificate, select **Enforce HTTPS** in **Settings → Pages**.

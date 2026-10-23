---
title: About
description: Jordan Yan is a technical writer focused on AI and developer documentation, based in San Luis Obispo, California. How this site is built and checked, and how to get in touch.
hide_table_of_contents: true
wrapperClassName: mdx-wrapper page-with-aside
---

<p className="eyebrow">About</p>

# Jordan Yan

Technical writer focused on AI and developer documentation, based in San Luis Obispo, California.

<aside className="page-aside" aria-labelledby="about-at-a-glance">
  <h2 id="about-at-a-glance" className="page-aside__title">At a glance</h2>
  <dl className="page-facts">
    <div><dt>Focus</dt><dd>AI and developer documentation</dd></div>
    <div><dt>Background</dt><dd>Regulated healthcare documentation (HIPAA EDI)</dd></div>
    <div><dt>Education</dt><dd>B.A. in English, University of Houston, December 2025</dd></div>
    <div><dt>Location</dt><dd>San Luis Obispo, California</dd></div>
    <div><dt>Work status</dt><dd>U.S. citizen; no current clearance; willing to undergo a background investigation.</dd></div>
  </dl>
</aside>

I write documentation that helps people use and evaluate complex systems: model cards, tutorials, API
references, and evaluation guides. My background is in regulated healthcare documentation. As a
Technical Writer Intern at Gainwell Technologies (May–Aug 2025), I wrote the 837I v1.3 update and
edited and enhanced the 276/277 v1.1 guide, two HIPAA EDI companion guides for DC Medicaid trading
partners. Both are public on Gainwell's site, and the [Projects page](/projects#gainwell-technologies-dc-medicaid-edi-companion-guides)
has the case study.

**Education and recognition:** B.A. in English, University of Houston, December 2025 (coursework in
Technical Communications, Professional Writing, and Advanced Composition); finalist for the Arm Graduate
Technical Writer role in Austin, TX, advancing to the final panel interview with Staff and Senior
Information Developers.

**Work status:** U.S. citizen; no current clearance; willing to undergo a background investigation.

## About these samples

All samples are original work written for this portfolio. Systems, part numbers and data are fictional.
No CUI, export-controlled (ITAR/EAR) or proprietary information is included.

The [ask-my-docs](/projects) tool is the exception: it's real, and so are its evaluation results.

Each sample opens with an **About this sample** box: who it is for, what kind of document it is, how I
approached it, and how it was checked. The proof label in that box is only used where the check exists
and runs (see below).

## How this site is built

This site is a [Docusaurus](https://docusaurus.io/) 3.9 project; the source is on
[GitHub](https://github.com/kopyk/ai-docs). Three things about it are deliberate:

- **Broken links fail the build.** `onBrokenLinks`, `onBrokenAnchors` and `onBrokenMarkdownLinks` are
  set to `throw`, so a bad link or anchor never reaches the published site.
- **"Last updated" dates come from Git.** The date in each sample's footer is the date of its last
  commit, not a hand-typed date.
- **Every proof label has a check behind it.** [GitHub Actions](https://github.com/kopyk/ai-docs/blob/main/.github/workflows/ci.yml)
  runs the checks below on every push and pull request, on Python 3.12 and Node 20.

<div className="label-table">

| Check | What it proves |
|-------|----------------|
| Site build | `npm run build` succeeds, so there are no broken links or anchors. |
| RAG tutorial | The [tutorial](/docs/ai/rag-tutorial)'s code runs as printed: `tests/test_rag_tutorial.py` extracts the Python blocks from the page and runs them against a fixture docs folder, with the Claude call replaced by a stand-in. |
| ICD layout | The [ICD](/docs/defense/interface-control-document)'s byte ranges are contiguous and non-overlapping, match each type's size, total the stated 32 bytes, fit their types after scaling, and the CRC covers every byte before it (`tests/test_icd_layout.py`). |
| Rubric math | The [evaluation rubric](/docs/ai/eval-rubric)'s results table adds up: pass counts, per-type rates, the overall rate, and the scored example (`tests/test_eval_rubric.py`). |
| Model card | The [model card](/docs/ai/model-card)'s frame counts sum to the stated test set, and its DoD principle and NIST AI RMF function names match the cited sources (`tests/test_model_card.py`). |
| Work package | The [maintenance procedure](/docs/defense/maintenance-procedure)'s steps number continuously, every WARNING and CAUTION precedes a step, and the torque target is within the listed wrench range (`tests/test_maintenance_procedure.py`). |
| OpenAPI file | The [API reference](/docs/ai/api-reference)'s OpenAPI file matches the page field for field and its three request examples send the spec's request example (`tests/test_openapi_spec.py`); the file is valid OpenAPI 3.1 (Redocly CLI). |

</div>

## Contact

<div className="contact-rows">

- **Email:** [jordanxianyan@gmail.com](mailto:jordanxianyan@gmail.com)
- **LinkedIn:** [linkedin.com/in/jordanxyan](https://www.linkedin.com/in/jordanxyan/)
- **GitHub:** [github.com/kopyk](https://github.com/kopyk)
- **Portfolio:** [jordanyan.com](https://www.jordanyan.com)

</div>

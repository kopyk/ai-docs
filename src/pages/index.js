import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import styles from './index.module.css';

// `summary` is the short version shown in the phone layout (≤639px): one line
// from 360px up, up to two lines below that (see index.module.css).
const aiDocs = [
  {
    to: '/docs/ai/model-card',
    type: 'Model card',
    title: 'Runway debris detection',
    description:
      'Intended use, condition-level performance, failure modes, and human oversight, mapped to the DoD AI Ethical Principles and the NIST AI RMF.',
    summary: 'Performance and failure modes',
    sections: [
      'Intended use',
      'Performance',
      'Training data',
      'Limitations and failure modes',
      'Responsible AI alignment',
      'Revision history',
    ],
  },
  {
    to: '/docs/ai/rag-tutorial',
    type: 'Tutorial',
    title: 'Build a Q&A bot over your docs',
    description:
      'Explains retrieval-augmented generation (RAG) and walks through working Python code that calls the Claude API.',
    summary: 'RAG in Python with the Claude API',
  },
  {
    to: '/docs/ai/api-reference',
    type: 'API reference',
    title: 'Document classification endpoint',
    description:
      'Parameters, request and response examples, errors, and rate limits for an AI REST endpoint.',
    summary: 'Parameters, errors, and rate limits',
  },
  {
    to: '/docs/ai/eval-rubric',
    type: 'Evaluation guide',
    title: 'LLM evaluation rubric',
    description:
      'Pass/fail grading criteria, test-set design, and reporting results by question type for a documentation assistant.',
    summary: 'Grading criteria and test-set design',
  },
];

const defenseDocs = [
  {
    to: '/docs/defense/maintenance-procedure',
    type: 'Maintenance procedure',
    title: 'UAS propeller replacement',
    description:
      'A MIL-STD-40051-2 work package with MIL-STD-38784B WARNING, CAUTION, and NOTE advisories, prerequisites, and verifiable steps.',
    summary: 'MIL-STD-40051-2 work package',
  },
  {
    to: '/docs/defense/interface-control-document',
    type: 'Interface control document',
    title: 'Telemetry message',
    description:
      'Byte-level message layout with units, scale, ranges, enumerations, and requirements traceability.',
    summary: 'Byte layout, ranges, and traceability',
  },
];

// Rows copied from section 2 of the model card sample.
const excerptRows = [
  ['Daylight, dry', '0.96', '0.91'],
  ['Daylight, wet', '0.92', '0.86'],
  ['Night (IR-assisted)', '0.88', '0.83'],
  ['Fog / visibility < 800 m', '0.71', '0.78'],
];

function Card({to, type, title, description, summary, sections, className}) {
  return (
    <li className={clsx(styles.cardItem, className)}>
      <Link to={to} className={styles.card}>
        <span className={styles.cardType}>{type}</span>
        <span className={styles.cardTitle}>{title}</span>
        <span className={styles.cardText}>{description}</span>
        <span className={styles.cardSummary}>{summary}</span>
        {sections && (
          <span className={styles.cardSections}>
            <span className={styles.cardSectionsLabel}>Sections</span>
            {sections.map((section, index) => (
              <span key={section} className={styles.cardSection}>
                <span className={styles.cardSectionNumber}>{index + 1}</span>
                {section}
              </span>
            ))}
          </span>
        )}
        <span className={styles.cardMore} aria-hidden="true">
          Read sample →
        </span>
      </Link>
    </li>
  );
}

function Section({id, eyebrow, title, intro, items, layout}) {
  return (
    <section className={styles.section} aria-labelledby={id}>
      <div className={styles.sectionHeader}>
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={id} className={styles.sectionTitle}>
          {title}
        </h2>
        <p className={styles.sectionIntro}>{intro}</p>
      </div>
      <ul className={clsx(styles.cardRow, layout === 'bento' ? styles.bento : styles.pair)}>
        {items.map((item, index) => (
          <Card
            key={item.to}
            {...item}
            className={layout === 'bento' ? styles[`bento${index + 1}`] : undefined}
          />
        ))}
      </ul>
    </section>
  );
}

function HeroExcerpt() {
  return (
    <figure className={styles.excerpt} aria-labelledby="hero-excerpt-caption">
      <div className={styles.excerptBar}>
        <span>Model card</span>
        <span aria-hidden="true">·</span>
        <span>2. Performance</span>
      </div>
      <div className={styles.excerptBody}>
        <p className={styles.excerptEyebrow}>AI · Model card</p>
        <p className={styles.excerptTitle}>SKYSWEEP FOD Detector v2.1</p>
        <table className={styles.excerptTable}>
          <thead>
            <tr>
              <th scope="col">Condition</th>
              <th scope="col">Recall</th>
              <th scope="col">Precision</th>
            </tr>
          </thead>
          <tbody>
            {excerptRows.map(([condition, recall, precision]) => (
              <tr key={condition}>
                <td>{condition}</td>
                <td>{recall === '0.71' ? <strong>{recall}</strong> : recall}</td>
                <td>{precision}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.excerptAlert}>
          <span className={styles.excerptAlertTitle}>Known limitation</span>
          Recall drops to <strong>0.71</strong> in fog. In low-visibility conditions, operators
          must perform a manual FOD walk regardless of model output.
        </div>
      </div>
      <figcaption id="hero-excerpt-caption" className={styles.excerptCaption}>
        Excerpt from the <Link to="/docs/ai/model-card#2-performance">model card sample</Link>.
        SKYSWEEP is fictional.
      </figcaption>
    </figure>
  );
}

export default function Home() {
  return (
    <Layout
      title="AI and developer documentation"
      description="Technical writing samples by Jordan Yan: AI model cards, RAG tutorials, API references, and evaluation rubrics, plus defense and aerospace documentation.">
      <main>
        <header className={styles.hero}>
          <div className={clsx('container', styles.heroGrid)}>
            <div className={styles.heroCopy}>
              <p className="eyebrow">Jordan Yan · Technical Writer II, Zone 5 Technologies</p>
              <h1 className={styles.heroTitle}>AI and developer documentation</h1>
              <p className={styles.heroAbstract}>
                Writing samples that show how I document AI systems and developer tools: what a
                model is for, where it fails, how to call it, and how to check its answers. Each
                one follows the conventions of a document type engineering teams use every day.
              </p>
              <div className={styles.heroActions}>
                <Link className={styles.buttonPrimary} to="/docs/ai/model-card">
                  Browse AI documentation
                </Link>
                <Link className={styles.buttonSecondary} to="/projects">
                  See ask-my-docs
                </Link>
              </div>
            </div>
            <HeroExcerpt />
          </div>
        </header>

        <div className="container">
          <p className={styles.samplesNote}>
            <strong>About these samples.</strong> All samples are original work written for this
            portfolio. Systems, part numbers and data are fictional. No CUI, export-controlled
            (ITAR/EAR) or proprietary information is included.
          </p>

          <Section
            id="ai-documentation"
            eyebrow="AI documentation"
            title="Document AI systems honestly"
            intro="Model documentation, developer tutorials, API references, and evaluation guides."
            items={aiDocs}
            layout="bento"
          />

          <section className={styles.section} aria-labelledby="featured-project">
            <a
              className={styles.featured}
              href="https://github.com/kopyk/ask-my-docs"
              target="_blank"
              rel="noopener noreferrer">
              <span className={styles.featuredBody}>
                <span className={styles.cardType}>Featured project · Python · Claude API</span>
                <span id="featured-project" className={styles.featuredTitle}>
                  ask-my-docs
                </span>
                <span className={styles.featuredText}>
                  Ask questions about a folder of Markdown documentation and get answers from
                  Claude, with sources. 56 automated tests and a retrieval check run on every
                  change; retrieval finds the right file for 10 of 10 test questions.
                </span>
              </span>
              <span className={styles.featuredMore}>
                View on GitHub ↗<span className={styles.srOnly}> (opens in a new tab)</span>
              </span>
            </a>
          </section>

          <Section
            id="defense-aerospace"
            eyebrow="Defense & aerospace"
            title="Write for high-stakes systems"
            intro="A work package that follows military standards and an interface control document with a verified byte layout."
            items={defenseDocs}
            layout="pair"
          />
        </div>
      </main>
    </Layout>
  );
}

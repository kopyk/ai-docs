import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import styles from './index.module.css';

const aiDocs = [
  {
    to: '/docs/ai/model-card',
    type: 'Model card',
    title: 'Runway debris detection',
    description:
      'Intended use, condition-level performance, failure modes, and human oversight, mapped to the DoD AI Ethical Principles and the NIST AI RMF.',
  },
  {
    to: '/docs/ai/rag-tutorial',
    type: 'Tutorial',
    title: 'Build a Q&A bot over your docs',
    description:
      'Explains retrieval-augmented generation (RAG) and walks through working Python code that calls the Claude API.',
  },
  {
    to: '/docs/ai/api-reference',
    type: 'API reference',
    title: 'Document classification endpoint',
    description:
      'Parameters, request and response examples, errors, and rate limits for an AI REST endpoint.',
  },
  {
    to: '/docs/ai/eval-rubric',
    type: 'Evaluation guide',
    title: 'LLM evaluation rubric',
    description:
      'Pass/fail grading criteria, test-set design, and reporting results by question type for a documentation assistant.',
  },
];

const defenseDocs = [
  {
    to: '/docs/defense/maintenance-procedure',
    type: 'Maintenance procedure',
    title: 'UAS propeller replacement',
    description:
      'A MIL-STD-40051-2 work package with MIL-STD-38784 WARNING, CAUTION, and NOTE advisories, prerequisites, and verifiable steps.',
  },
  {
    to: '/docs/defense/interface-control-document',
    type: 'Interface control document',
    title: 'Telemetry message',
    description:
      'Byte-level message layout with units, scale, ranges, enumerations, and requirements traceability.',
  },
];

function Card({to, type, title, description}) {
  return (
    <Link to={to} className={styles.card}>
      <span className={styles.cardType}>{type}</span>
      <span className={styles.cardTitle}>{title}</span>
      <span className={styles.cardText}>{description}</span>
      <span className={styles.cardMore} aria-hidden="true">
        Read sample →
      </span>
    </Link>
  );
}

function Section({id, eyebrow, title, intro, items, columns}) {
  return (
    <section className={styles.section} aria-labelledby={id}>
      <div className={styles.sectionHeader}>
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={id} className={styles.sectionTitle}>
          {title}
        </h2>
        <p className={styles.sectionIntro}>{intro}</p>
      </div>
      <div className={columns === 2 ? styles.grid2 : styles.grid4}>
        {items.map((item) => (
          <Card key={item.to} {...item} />
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <Layout
      title="AI and developer documentation"
      description="Technical writing samples by Jordan Yan: AI model cards, RAG tutorials, API references, and evaluation rubrics, plus defense and aerospace documentation.">
      <main>
        <header className={styles.hero}>
          <div className="container">
            <p className="eyebrow">Jordan Yan · Technical writer</p>
            <h1 className={styles.heroTitle}>AI and developer documentation</h1>
            <p className={styles.heroAbstract}>
              Writing samples that show how I document AI systems and developer tools: what a
              model is for, where it fails, how to call it, and how to check its answers. Each one
              follows the conventions of a document type engineering teams use every day.
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
        </header>

        <div className="container">
          <p className={styles.samplesNote}>
            <strong>About these samples.</strong> All samples are original work written for this
            portfolio. Systems, part numbers and data are fictional. No CUI, export-controlled
            (ITAR/EAR) or proprietary information is included. The exception is the ask-my-docs
            tool, which is real.
          </p>

          <Section
            id="ai-documentation"
            eyebrow="AI documentation"
            title="Document AI systems honestly"
            intro="Model documentation, developer tutorials, API references, and evaluation guides."
            items={aiDocs}
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
                <span className={styles.cardText}>
                  Ask questions about a folder of Markdown documentation and get answers from
                  Claude, with sources. Includes a retrieval evaluation: with rare-word weighting,
                  retrieval found the right file for 10 of 10 test questions in the top 4
                  sections.
                </span>
              </span>
              <span className={styles.cardMore}>
                View on GitHub ↗<span className={styles.srOnly}> (opens in a new tab)</span>
              </span>
            </a>
          </section>

          <Section
            id="defense-aerospace"
            eyebrow="Defense & aerospace"
            title="Write for high-stakes systems"
            intro="Technical manual and interface documentation that follows military standards."
            items={defenseDocs}
            columns={2}
          />
        </div>
      </main>
    </Layout>
  );
}

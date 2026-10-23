/**
 * "About this sample": the card under the title of each writing sample.
 *
 * Four facts: audience, document type and standard, approach, and how the
 * sample was checked. The proof labels ("Code tested in CI", "Layout
 * verified", ...) are chips next to the title, and the children explain what
 * was checked and link to the evidence. Only claim a label that is backed by
 * something real: a test in tests/, the CI workflow, or a cited source.
 *
 * Layout (src/css/custom.css, .about-sample):
 * - Phones and tablets (<997px): title, then the four facts as stacked rows,
 *   with the chips as the last row. The <details> below is shown open-style
 *   (no summary) where the browser supports ::details-content.
 * - Desktop (>=997px): a compact box so the sample starts above the fold.
 *   Title and chips share one row, Audience and Document type sit side by
 *   side, and Approach plus "How it was checked" are behind a closed
 *   <details>. It is rendered closed on the server and the client alike, so
 *   there is no hydration mismatch or layout shift, and a native <details>
 *   works without JS. For print, the disclosure is opened and then restored.
 */
import React, {useEffect, useRef} from 'react';

function CheckIcon() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16" width="14" height="14">
      <path
        d="M3 8.5l3 3 7-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ProofLabel({children}) {
  return (
    <span className="proof-label">
      <CheckIcon />
      {children}
    </span>
  );
}

export default function AboutSample({audience, docType, approach, proofs = [], children}) {
  const titleId = 'about-this-sample';
  const detailsRef = useRef(null);

  // Print the whole box: open the disclosure before printing, restore it after.
  useEffect(() => {
    const details = detailsRef.current;
    if (!details) {
      return undefined;
    }
    let wasOpen = false;
    function beforePrint() {
      wasOpen = details.open;
      details.open = true;
    }
    function afterPrint() {
      details.open = wasOpen;
    }
    window.addEventListener('beforeprint', beforePrint);
    window.addEventListener('afterprint', afterPrint);
    return () => {
      window.removeEventListener('beforeprint', beforePrint);
      window.removeEventListener('afterprint', afterPrint);
    };
  }, []);

  return (
    <aside className="about-sample" aria-labelledby={titleId}>
      <div className="about-sample__header">
        <h2 id={titleId} className="about-sample__title">
          About this sample
        </h2>
        {proofs.length > 0 && (
          <p className="proof-labels">
            {proofs.map((label) => (
              <ProofLabel key={label}>{label}</ProofLabel>
            ))}
          </p>
        )}
      </div>
      <dl className="about-sample__facts about-sample__facts--top">
        <div>
          <dt>Audience</dt>
          <dd>{audience}</dd>
        </div>
        <div>
          <dt>Document type</dt>
          <dd>{docType}</dd>
        </div>
      </dl>
      <details ref={detailsRef} className="about-sample__more">
        <summary>How this sample was made and checked</summary>
        <dl className="about-sample__facts about-sample__facts--more">
          <div>
            <dt>Approach</dt>
            <dd>{approach}</dd>
          </div>
          <div>
            <dt>How it was checked</dt>
            <dd>{children}</dd>
          </div>
        </dl>
      </details>
    </aside>
  );
}

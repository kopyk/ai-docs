/**
 * "About this sample": the card under the title of each writing sample.
 *
 * Four rows: audience, document type and standard, approach, and how the
 * sample was checked. The last row starts with one or more proof labels
 * ("Code tested in CI", "Layout verified", ...) and the children explain what
 * was checked and link to the evidence. Only claim a label that is backed by
 * something real: a test in tests/, the CI workflow, or a cited source.
 *
 * Styles live in src/css/custom.css (.about-sample, .proof-label) so the box
 * follows the same tokens and breakpoints as the rest of the site.
 */
import React from 'react';

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
  return (
    <aside className="about-sample" aria-labelledby={titleId}>
      <h2 id={titleId} className="about-sample__title">
        About this sample
      </h2>
      <dl className="about-sample__facts">
        <div>
          <dt>Audience</dt>
          <dd>{audience}</dd>
        </div>
        <div>
          <dt>Document type</dt>
          <dd>{docType}</dd>
        </div>
        <div>
          <dt>Approach</dt>
          <dd>{approach}</dd>
        </div>
        <div>
          <dt>How it was checked</dt>
          <dd>
            {proofs.length > 0 && (
              <p className="proof-labels">
                {proofs.map((label) => (
                  <ProofLabel key={label}>{label}</ProofLabel>
                ))}
              </p>
            )}
            {children}
          </dd>
        </div>
      </dl>
    </aside>
  );
}

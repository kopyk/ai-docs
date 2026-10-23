/**
 * Ejected from @docusaurus/theme-classic 3.9.2 (NotFound/Content).
 * Why: the stock 404 says "contact the owner of the site", which is no help
 * here. This version explains what happened and offers the main destinations
 * plus a search box (a plain GET form, so it works before JavaScript loads).
 */
import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

const destinations = [
  {
    to: '/docs/ai/model-card',
    eyebrow: 'AI documentation',
    title: 'Model card, RAG tutorial, API reference, evaluation rubric',
  },
  {
    to: '/docs/defense/maintenance-procedure',
    eyebrow: 'Defense & aerospace',
    title: 'Maintenance procedure and interface control document',
  },
  {
    to: '/projects',
    eyebrow: 'Projects',
    title: 'ask-my-docs and the DC DHCF companion guides',
  },
  {
    to: '/about',
    eyebrow: 'About',
    title: 'Background and contact details',
  },
];

export default function NotFoundContent({className}) {
  const searchUrl = useBaseUrl('/search');
  return (
    <main className={clsx('container', styles.page, className)}>
      <div className={styles.grid}>
        <div className={styles.copy}>
          <p className="eyebrow">Error 404</p>
          <h1 className={styles.title}>Page not found</h1>
          <p className={styles.abstract}>
            There's no page at this address. The link may be out of date, or the URL may have a
            typo. Search the samples, or go to one of the sections listed here.
          </p>
          <form className={styles.search} action={searchUrl} method="get" role="search">
            <label className={styles.searchLabel} htmlFor="not-found-search">
              Search the samples
            </label>
            <div className={styles.searchRow}>
              <input
                id="not-found-search"
                className={styles.searchInput}
                type="search"
                name="q"
                placeholder="For example: recall, torque, rate limit"
                autoComplete="off"
              />
              <button className={styles.searchButton} type="submit">
                Search
              </button>
            </div>
          </form>
          <Link className={styles.homeLink} to="/">
            ← Back to the home page
          </Link>
        </div>
        <nav className={styles.destinations} aria-labelledby="not-found-destinations">
          <h2 id="not-found-destinations" className={styles.destinationsTitle}>
            Sections
          </h2>
          <ul className={styles.list}>
            {destinations.map((item) => (
              <li key={item.to}>
                <Link className={styles.row} to={item.to}>
                  <span className={styles.rowEyebrow}>{item.eyebrow}</span>
                  <span className={styles.rowTitle}>{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </main>
  );
}

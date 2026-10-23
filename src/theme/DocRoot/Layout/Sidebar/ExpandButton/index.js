/**
 * Ejected from @docusaurus/theme-classic 3.9.2 (DocRoot/Layout/Sidebar/ExpandButton).
 *
 * Why: the stock "Expand sidebar" control is a <div role="button"> whose
 * onKeyDown calls toggleSidebar, so any key, including Tab and Shift+Tab,
 * re-expands the sidebar. And collapsing the sidebar leaves focus on the
 * now-hidden collapse button, which the browser drops to <body>.
 *
 * Changes from upstream:
 * - a native <button>, so only Enter and Space activate it (no onKeyDown)
 * - takes focus when it appears right after the sidebar was collapsed (focus
 *   is on <body> or still inside the sidebar container). On a navigation
 *   remount (ResetOnSidebarChange) focus is on the link that was followed,
 *   so it is left alone.
 * - after expanding, moves focus to the "Collapse sidebar" button
 */
import React, {useEffect, useRef} from 'react';
import {translate} from '@docusaurus/Translate';
import IconArrow from '@theme/Icon/Arrow';
import styles from './styles.module.css';

const SIDEBAR_CONTAINER = '.theme-doc-sidebar-container';
const COLLAPSE_BUTTON = "button[class*='collapseSidebarButton']";

export default function DocRootLayoutSidebarExpandButton({toggleSidebar}) {
  const buttonRef = useRef(null);

  useEffect(() => {
    const button = buttonRef.current;
    const active = document.activeElement;
    const container = button?.closest(SIDEBAR_CONTAINER);
    if (!button || !container) {
      return;
    }
    if (!active || active === document.body || container.contains(active)) {
      button.focus({preventScroll: true});
    }
  }, []);

  function onClick() {
    const container = buttonRef.current?.closest(SIDEBAR_CONTAINER);
    toggleSidebar();
    // The collapse button is visible again once React has re-rendered.
    window.requestAnimationFrame(() => {
      container?.querySelector(COLLAPSE_BUTTON)?.focus({preventScroll: true});
    });
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      className={styles.expandButton}
      title={translate({
        id: 'theme.docs.sidebar.expandButtonTitle',
        message: 'Expand sidebar',
        description:
          'The ARIA label and title attribute for expand button of doc sidebar',
      })}
      aria-label={translate({
        id: 'theme.docs.sidebar.expandButtonAriaLabel',
        message: 'Expand sidebar',
        description:
          'The ARIA label and title attribute for expand button of doc sidebar',
      })}
      onClick={onClick}>
      <IconArrow className={styles.expandButtonIcon} />
    </button>
  );
}

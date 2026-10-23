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
 * - takes focus when it appears because the user collapsed the sidebar (the
 *   wrapped "Collapse sidebar" button records that in focusIntent.js). On a
 *   navigation remount (ResetOnSidebarChange, when the AI and Defense
 *   sidebars swap) there is no such request, so focus is left alone.
 *   document.activeElement can't tell the two apart: Docusaurus moves focus
 *   to the skip-to-content container on every route push.
 * - after expanding, moves focus to the "Collapse sidebar" button
 */
import React, {useEffect, useRef} from 'react';
import {translate} from '@docusaurus/Translate';
import IconArrow from '@theme/Icon/Arrow';
import {consumeExpandFocus} from './focusIntent';
import styles from './styles.module.css';

const SIDEBAR_CONTAINER = '.theme-doc-sidebar-container';
const COLLAPSE_BUTTON = "button[class*='collapseSidebarButton']";

export default function DocRootLayoutSidebarExpandButton({toggleSidebar}) {
  const buttonRef = useRef(null);

  useEffect(() => {
    if (consumeExpandFocus()) {
      buttonRef.current?.focus({preventScroll: true});
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

/**
 * Ejected from @docusaurus/theme-classic 3.9.2 (TOCCollapsible).
 *
 * Why: this is the "On this page" disclosure shown on phones, tablets and
 * 997-1199px desktops. The stock component's toggle has no aria-expanded,
 * Esc does nothing, and the list stays open after a link is chosen. Those
 * fixes need the collapsed state, which CSS or a --wrap can't reach.
 *
 * Changes from upstream:
 * - toggle gets aria-expanded and aria-controls (WCAG 4.1.2)
 * - Esc collapses the list and returns focus to the toggle
 * - choosing a link, clicking outside, or tabbing out collapses the list, so
 *   the open panel never covers the newly focused element
 * - choosing a link moves focus to that heading instead of dropping it to <body>
 * - the list highlights the current section (scroll-spy), like the desktop rail
 */
import React, {useCallback, useEffect, useId, useRef} from 'react';
import clsx from 'clsx';
import {useCollapsible, Collapsible} from '@docusaurus/theme-common';
import TOCItems from '@theme/TOCItems';
import CollapseButton from '@theme/TOCCollapsible/CollapseButton';
import styles from './styles.module.css';

export default function TOCCollapsible({
  toc,
  className,
  minHeadingLevel,
  maxHeadingLevel,
}) {
  const {collapsed, setCollapsed, toggleCollapsed} = useCollapsible({
    initialState: true,
  });
  const rootRef = useRef(null);
  const panelId = useId();

  const collapse = useCallback(
    ({restoreFocus = false} = {}) => {
      setCollapsed(true);
      if (restoreFocus) {
        rootRef.current?.querySelector('button')?.focus();
      }
    },
    [setCollapsed],
  );

  // While open: Esc closes it, a click outside closes it, and focus leaving
  // it closes it. relatedTarget is null when the window loses focus or a
  // non-focusable area is clicked, and those must not close it (the
  // pointerdown handler already covers clicks outside).
  useEffect(() => {
    if (collapsed) {
      return undefined;
    }
    const root = rootRef.current;
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        collapse({restoreFocus: true});
      }
    }
    function onPointerDown(event) {
      if (!root?.contains(event.target)) {
        collapse();
      }
    }
    function onFocusOut(event) {
      if (event.relatedTarget && !root?.contains(event.relatedTarget)) {
        collapse();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    root?.addEventListener('focusout', onFocusOut);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
      root?.removeEventListener('focusout', onFocusOut);
    };
  }, [collapsed, collapse]);

  // Choosing a section closes the list, so the heading isn't covered by it,
  // and focus moves to the heading. preventScroll leaves the scrolling to the
  // native hash navigation and the html scroll-padding-top.
  const onPanelClick = useCallback(
    (event) => {
      const link = event.target.closest('a');
      if (!link) {
        return;
      }
      collapse();
      const id = decodeURIComponent(link.hash.slice(1));
      const el = id ? document.getElementById(id) : null;
      if (el) {
        if (!el.hasAttribute('tabindex')) {
          el.setAttribute('tabindex', '-1');
        }
        el.focus({preventScroll: true});
      }
    },
    [collapse],
  );

  return (
    <div
      ref={rootRef}
      className={clsx(
        styles.tocCollapsible,
        !collapsed && styles.tocCollapsibleExpanded,
        className,
      )}>
      <CollapseButton
        collapsed={collapsed}
        onClick={toggleCollapsed}
        aria-expanded={!collapsed}
        aria-controls={panelId}
      />
      <div id={panelId} className="toc-collapsible-panel" onClick={onPanelClick}>
        <Collapsible
          lazy
          className={styles.tocCollapsibleContent}
          collapsed={collapsed}>
          <TOCItems
            toc={toc}
            minHeadingLevel={minHeadingLevel}
            maxHeadingLevel={maxHeadingLevel}
            linkActiveClassName="table-of-contents__link--active"
          />
        </Collapsible>
      </div>
    </div>
  );
}

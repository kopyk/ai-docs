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
 * - choosing a link, or clicking outside, collapses the list
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

  // While open: Esc closes it, and a click outside closes it.
  useEffect(() => {
    if (collapsed) {
      return undefined;
    }
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        collapse({restoreFocus: true});
      }
    }
    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        collapse();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [collapsed, collapse]);

  // Choosing a section closes the list, so the heading isn't covered by it.
  const onPanelClick = useCallback(
    (event) => {
      if (event.target.closest('a')) {
        collapse();
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

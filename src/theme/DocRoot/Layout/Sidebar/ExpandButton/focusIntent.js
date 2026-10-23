/**
 * Shared by the wrapped "Collapse sidebar" button
 * (src/theme/DocSidebar/Desktop/CollapseButton) and the ejected "Expand
 * sidebar" button in this folder.
 *
 * Collapsing the sidebar unmounts the collapse button while it has focus, so
 * focus would drop to <body>. The collapse wrapper records that the user asked
 * for the collapse; when the expand button mounts right after, it takes focus
 * once. A mount from navigation (ResetOnSidebarChange remounts the sidebar
 * when the AI and Defense sidebars swap) finds no request and leaves focus
 * alone. document.activeElement can't be used for this: Docusaurus moves focus
 * to the skip-to-content container on every route push.
 */

const WINDOW_MS = 1000;

let requestedAt = 0;

/** Called when the user activates "Collapse sidebar". */
export function requestExpandFocus() {
  requestedAt = Date.now();
}

/** True once, if a collapse was requested in the last second. */
export function consumeExpandFocus() {
  const fresh = requestedAt !== 0 && Date.now() - requestedAt < WINDOW_MS;
  requestedAt = 0;
  return fresh;
}

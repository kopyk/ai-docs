/**
 * Name and wire the language tabs in the API reference (stock @theme/Tabs).
 *
 * The stock Tabs render a tablist and tabpanels with no connection between
 * them: tabs have no aria-controls, panels have no name, and Home/End do
 * nothing. TabItem drops every prop except children, hidden and className, so
 * none of this can be set from MDX. For each .tabs-container this adds:
 * - aria-label on the tablist
 * - ids on the tabs and panels, aria-controls on each tab and
 *   aria-labelledby on each panel (matched in DOM order)
 * - Home and End on the tablist, which move focus to the first or last tab
 *   (focus only: the stock tabs select on Enter, and this keeps that)
 *
 * React only toggles `hidden`, tabIndex, aria-selected and class on these
 * elements, so the added attributes survive tab switches. The Tabs component
 * does remount once after hydration (its key changes when the browser is
 * detected), so a MutationObserver re-wires any tablist that appears.
 */

const TABLIST_LABEL = 'Request example language';

let observer = null;
let wired = [];
let scheduled = false;

function onKeyDown(event) {
  if (event.key !== 'Home' && event.key !== 'End') {
    return;
  }
  const tabs = [...event.currentTarget.querySelectorAll('[role="tab"]')];
  if (tabs.length === 0) {
    return;
  }
  event.preventDefault();
  tabs[event.key === 'Home' ? 0 : tabs.length - 1].focus();
}

function wire(container, index) {
  const tablist = container.querySelector('[role="tablist"]');
  if (!tablist || tablist.dataset.a11yWired) {
    return;
  }
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const panels = [...container.querySelectorAll('[role="tabpanel"]')];
  if (tabs.length === 0 || tabs.length !== panels.length) {
    return;
  }
  tablist.dataset.a11yWired = 'true';
  if (!tablist.hasAttribute('aria-label')) {
    tablist.setAttribute('aria-label', TABLIST_LABEL);
  }
  tabs.forEach((tab, i) => {
    const tabId = `tabs-${index}-tab-${i}`;
    const panelId = `tabs-${index}-panel-${i}`;
    tab.id = tabId;
    tab.setAttribute('aria-controls', panelId);
    panels[i].id = panelId;
    panels[i].setAttribute('aria-labelledby', tabId);
  });
  tablist.addEventListener('keydown', onKeyDown);
  wired.push(tablist);
}

function wireAll() {
  scheduled = false;
  document.querySelectorAll('.tabs-container').forEach((container, index) => wire(container, index + 1));
}

function scheduleWire() {
  if (!scheduled) {
    scheduled = true;
    window.requestAnimationFrame(wireAll);
  }
}

function cleanup() {
  observer?.disconnect();
  observer = null;
  wired.forEach((tablist) => tablist.removeEventListener('keydown', onKeyDown));
  wired = [];
}

export function onRouteDidUpdate() {
  if (typeof window === 'undefined' || typeof MutationObserver === 'undefined') {
    return;
  }
  cleanup();
  wireAll();
  const root = document.getElementById('__docusaurus') ?? document.body;
  observer = new MutationObserver((records) => {
    if (records.some((record) => record.addedNodes.length > 0)) {
      scheduleWire();
    }
  });
  observer.observe(root, {childList: true, subtree: true});
}

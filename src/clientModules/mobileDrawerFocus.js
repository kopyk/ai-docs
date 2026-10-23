/**
 * Focus management for the mobile navigation drawer (≤996px, which includes
 * desktop browsers at 200% zoom).
 *
 * Docusaurus toggles `navbar-sidebar--show` on `.navbar` but leaves focus
 * behind the drawer, lets Tab leave it while it is open, and ignores Escape.
 * This module watches that class. While the drawer is open it:
 * - gives .navbar-sidebar role="dialog", aria-modal="true", aria-label="Site menu"
 * - moves focus to the close button
 * - sets `inert` on everything outside the drawer: the skip link, the main
 *   wrapper, the footer, and the navbar's other children (.navbar__inner with
 *   the brand, search, items and toggle). The backdrop stays live so a click
 *   on it still closes the drawer, and .navbar itself is never inert because
 *   it contains the drawer. Docusaurus's own inert toggling between the
 *   primary and secondary panels is untouched.
 * - closes it on Escape, by clicking the close button
 * When the drawer closes by any route, the inert attributes are removed and
 * focus returns to the toggle, unless it closed because a link to another
 * page was followed; then the route change is left to handle focus.
 */

const SHOW_CLASS = 'navbar-sidebar--show';

let observedNavbar = null;
let observer = null;
let open = false;
let inertTargets = [];
let followedLink = false;

function drawer() {
  return document.querySelector('.navbar-sidebar');
}

function setInertOutside(navbar, sidebar) {
  const targets = [];
  const root = document.getElementById('__docusaurus') ?? document.body;
  for (const child of root.children) {
    if (child !== navbar && !child.contains(sidebar)) {
      targets.push(child);
    }
  }
  for (const child of navbar.children) {
    if (child !== sidebar && !child.classList.contains('navbar-sidebar__backdrop')) {
      targets.push(child);
    }
  }
  inertTargets = targets.filter((el) => !el.hasAttribute('inert'));
  inertTargets.forEach((el) => el.setAttribute('inert', ''));
}

function clearInert() {
  inertTargets.forEach((el) => el.removeAttribute('inert'));
  inertTargets = [];
}

function onKeyDown(event) {
  if (event.key !== 'Escape' || event.defaultPrevented) {
    return;
  }
  const close = document.querySelector('.navbar-sidebar__close');
  if (close) {
    event.preventDefault();
    close.click();
  }
}

// A click on a link to another page closes the drawer through navigation.
function onDrawerClick(event) {
  const link = event.target.closest('a[href]');
  if (!link) {
    return;
  }
  let url;
  try {
    url = new URL(link.href, window.location.href);
  } catch {
    return;
  }
  followedLink = url.origin !== window.location.origin || url.pathname !== window.location.pathname;
}

function onOpen(navbar) {
  const sidebar = drawer();
  if (!sidebar) {
    return;
  }
  open = true;
  followedLink = false;
  sidebar.setAttribute('role', 'dialog');
  sidebar.setAttribute('aria-modal', 'true');
  sidebar.setAttribute('aria-label', 'Site menu');
  setInertOutside(navbar, sidebar);
  document.addEventListener('keydown', onKeyDown);
  sidebar.addEventListener('click', onDrawerClick, true);
  sidebar.querySelector('.navbar-sidebar__close')?.focus({preventScroll: true});
}

function onClose(navbar) {
  if (!open) {
    return;
  }
  open = false;
  document.removeEventListener('keydown', onKeyDown);
  const sidebar = drawer();
  if (sidebar) {
    sidebar.removeEventListener('click', onDrawerClick, true);
    sidebar.removeAttribute('role');
    sidebar.removeAttribute('aria-modal');
    sidebar.removeAttribute('aria-label');
  }
  clearInert();
  if (!followedLink) {
    navbar.querySelector('.navbar__toggle')?.focus({preventScroll: true});
  }
  followedLink = false;
}

function sync(navbar) {
  const shown = navbar.classList.contains(SHOW_CLASS);
  if (shown && !open) {
    onOpen(navbar);
  } else if (!shown && open) {
    onClose(navbar);
  }
}

function watch(navbar) {
  if (observedNavbar === navbar) {
    return;
  }
  observer?.disconnect();
  observedNavbar = navbar;
  observer = new MutationObserver(() => sync(navbar));
  observer.observe(navbar, {attributes: true, attributeFilter: ['class']});
  sync(navbar);
}

export function onRouteDidUpdate() {
  if (typeof window === 'undefined' || typeof MutationObserver === 'undefined') {
    return;
  }
  const navbar = document.querySelector('nav.navbar');
  if (navbar) {
    watch(navbar);
  } else if (open) {
    clearInert();
    open = false;
  }
}

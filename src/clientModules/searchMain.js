/**
 * Give the search results page a main landmark.
 *
 * @easyops-cn/docusaurus-search-local's SearchPage renders its results in a
 * plain <div> inside <Layout>, so /search has no <main>. Every other page
 * renders its own <main>, so the landmark is only added on the search route
 * and removed again when the route changes. It lands on the main wrapper,
 * which is also the skip link's target, after hydration.
 */

const MAIN_WRAPPER_ID = '__docusaurus_skipToContent_fallback';

function isSearchRoute(pathname) {
  return pathname.replace(/\/+$/, '').endsWith('/search');
}

export function onRouteDidUpdate({location}) {
  if (typeof document === 'undefined') {
    return;
  }
  const wrapper = document.getElementById(MAIN_WRAPPER_ID);
  if (!wrapper) {
    return;
  }
  if (isSearchRoute(location.pathname)) {
    wrapper.setAttribute('role', 'main');
  } else if (wrapper.getAttribute('role') === 'main') {
    wrapper.removeAttribute('role');
  }
}

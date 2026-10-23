/**
 * Only tables that actually scroll are Tab stops.
 *
 * src/plugins/rehype-scroll-regions.mjs wraps every table in a
 * <div class="table-scroll" role="region" tabindex="0"> at build time, so the
 * region is reachable by keyboard without JS (WCAG 2.1.1). Most tables fit at
 * desktop widths, though, and a Tab stop on a table that doesn't scroll is
 * noise. This watches each region and its table with a ResizeObserver and
 * keeps tabindex="0" only while the content overflows. The attribute is left
 * alone while the region has focus, so focus is never dropped mid-use.
 */

let observers = [];

function update(region) {
  if (region.scrollWidth > region.clientWidth + 1) {
    region.setAttribute('tabindex', '0');
  } else if (region !== document.activeElement) {
    region.removeAttribute('tabindex');
  }
}

export function onRouteDidUpdate() {
  if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined') {
    return;
  }
  observers.forEach((observer) => observer.disconnect());
  observers = [];
  document.querySelectorAll('.table-scroll').forEach((region) => {
    const observer = new ResizeObserver(() => update(region));
    // The wrapper is max-content wide and capped at 100%, so observe the
    // table too: its size is what changes when the viewport does.
    observer.observe(region);
    if (region.firstElementChild) {
      observer.observe(region.firstElementChild);
    }
    observers.push(observer);
    update(region);
  });
}

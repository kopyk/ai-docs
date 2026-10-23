/**
 * Wraps @theme/BackToTopButton (Docusaurus 3.9.2).
 *
 * Why: under prefers-reduced-motion: reduce, custom.css sets scroll-behavior
 * to auto, and the stock button's useSmoothScrollTo then falls back to a
 * requestAnimationFrame polyfill, so the scroll is still animated.
 *
 * Changes:
 * - with reduce, the click is intercepted and the page jumps to the top
 * - with no-preference, the stock smooth scroll runs unchanged
 * - in both cases focus moves to the page title, so it doesn't drop to <body>
 *   when the button hides at the top of the page
 */
import React from 'react';
import BackToTopButton from '@theme-original/BackToTopButton';

function focusPageTitle() {
  const title = document.querySelector('main h1') ?? document.querySelector('h1');
  if (!title) {
    return;
  }
  if (!title.hasAttribute('tabindex')) {
    title.setAttribute('tabindex', '-1');
  }
  title.focus({preventScroll: true});
}

export default function BackToTopButtonWrapper(props) {
  function onClickCapture(event) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      event.preventDefault();
      event.stopPropagation();
      window.scrollTo({top: 0, behavior: 'instant'});
    }
    focusPageTitle();
  }
  return (
    <div style={{display: 'contents'}} onClickCapture={onClickCapture}>
      <BackToTopButton {...props} />
    </div>
  );
}

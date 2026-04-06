/**
 * custom-header-state.js — GLDN header scroll/hover state management
 *
 * Handles scroll-based and hover-based header style transitions without
 * modifying Horizon's header.liquid core file.
 *
 * Approach: observe scroll position and pointer events on the header
 * element, then toggle data attributes / CSS classes on <body> or the
 * header element itself so custom.css can drive the visual changes.
 */

const SCROLL_THRESHOLD = 50;
const HEADER_SELECTOR = 'header-section, .header-wrapper, [data-section-type="header"]';

function initHeaderState() {
  const header = document.querySelector(HEADER_SELECTOR);

  if (!header) return;

  // Scroll state
  const onScroll = () => {
    document.body.toggleAttribute('data-scrolled', window.scrollY > SCROLL_THRESHOLD);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hover state
  header.addEventListener('mouseenter', () => {
    header.setAttribute('data-hovered', '');
  });

  header.addEventListener('mouseleave', () => {
    header.removeAttribute('data-hovered');
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeaderState);
} else {
  initHeaderState();
}

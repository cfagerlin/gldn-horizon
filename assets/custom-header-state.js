/**
 * custom-header-state.js — GLDN header scroll/hover color states
 *
 * Sets data-gldn-state="normal|hover|scroll" on #header-component.
 * CSS rules in custom.css (keyed to these states) drive the visual output.
 * The colour values themselves come from CSS custom properties injected by
 * sections/custom-header-states.liquid (a header-group section).
 *
 * State priority: scroll > hover > normal
 *   scroll — any window.scrollY above SCROLL_THRESHOLD
 *   hover  — pointer/focus inside header, not scrolled
 *   normal — default
 *
 * Does NOT touch or import from sections/header.liquid.
 */

const HEADER_ID = 'header-component';
const SCROLL_THRESHOLD = 10; // px before "scrolled" state activates

class GldnHeaderState {
  #el = null;
  #isScrolled = false;
  #isHovered = false;
  #reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  init() {
    this.#el = document.getElementById(HEADER_ID);
    if (!this.#el) return;

    // Scroll detection — passive for performance
    window.addEventListener('scroll', this.#onScroll, { passive: true });

    // Pointer hover
    this.#el.addEventListener('mouseenter', this.#onEnter);
    this.#el.addEventListener('mouseleave', this.#onLeave);

    // Keyboard focus traversal (treat focused-within as hovered)
    this.#el.addEventListener('focusin', this.#onEnter);
    this.#el.addEventListener('focusout', this.#onFocusOut);

    // Set initial state immediately (page may already be scrolled on load)
    this.#onScroll();
  }

  destroy() {
    window.removeEventListener('scroll', this.#onScroll);
    this.#el?.removeEventListener('mouseenter', this.#onEnter);
    this.#el?.removeEventListener('mouseleave', this.#onLeave);
    this.#el?.removeEventListener('focusin', this.#onEnter);
    this.#el?.removeEventListener('focusout', this.#onFocusOut);
  }

  // ── Private ────────────────────────────────────────────────────────────────

  #onScroll = () => {
    const scrolled = window.scrollY > SCROLL_THRESHOLD;
    if (scrolled === this.#isScrolled) return;
    this.#isScrolled = scrolled;
    this.#update();
  };

  #onEnter = () => {
    this.#isHovered = true;
    this.#update();
  };

  #onLeave = (e) => {
    // Ignore if focus/pointer moved to a child (mouseleave bubbles on Chrome)
    if (this.#el.contains(e.relatedTarget)) return;
    this.#isHovered = false;
    this.#update();
  };

  #onFocusOut = (e) => {
    // Only clear hover if focus left the header entirely
    if (!this.#el.contains(e.relatedTarget)) {
      this.#isHovered = false;
      this.#update();
    }
  };

  #update() {
    if (!this.#el) return;

    let state = 'normal';
    if (this.#isScrolled) {
      state = 'scroll';
    } else if (this.#isHovered) {
      state = 'hover';
    }

    // Only write attribute when state changes — avoids style recalc churn
    if (this.#el.dataset.gldnState !== state) {
      this.#el.dataset.gldnState = state;
    }
  }
}

// ── Boot ─────────────────────────────────────────────────────────────────────

const gldnHeaderState = new GldnHeaderState();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => gldnHeaderState.init());
} else {
  gldnHeaderState.init();
}

/**
 * custom-mega-menu.js
 * GLDN — Mega menu hover activation
 *
 * Shows/hides custom mega menu panels when hovering over top-level nav items
 * that have a matching data-mega-menu-for panel (shop, gift-guide, about).
 *
 * Also suppresses Horizon's native (empty) dropdown for these items and
 * triggers the header hover state.
 */

class CustomMegaMenu extends HTMLElement {
  /** @type {Map<string, HTMLElement>} */
  #panels = new Map();

  /** @type {Map<string, HTMLElement>} */
  #triggers = new Map();

  /** @type {Map<string, HTMLElement>} menu-item elements keyed by panel key */
  #menuItems = new Map();

  /** @type {number|null} */
  #closeTimer = null;

  /** @type {string|null} */
  #activePanel = null;

  static CLOSE_DELAY = 350;

  connectedCallback() {
    for (const panel of this.querySelectorAll('[data-mega-menu-for]')) {
      this.#panels.set(panel.dataset.megaMenuFor, panel);
    }
    this.#init();
  }

  #init() {
    const header = document.getElementById('header-component');
    if (!header) {
      setTimeout(() => this.#init(), 100);
      return;
    }
    if (!header.contains(this)) {
      header.appendChild(this);
    }
    this.#bindTriggers();
  }

  #bindTriggers() {
    const header = document.getElementById('header-component');
    if (!header) return;

    const labelToKey = {
      'shop': 'shop',
      'gift guide': 'gift-guide',
      'about': 'about'
    };

    const navLinks = header.querySelectorAll(
      '.menu-list__link, .overflow-menu__link, [class*="header-menu"] a'
    );

    for (const link of navLinks) {
      const text = link.textContent.trim().toLowerCase();
      const key = labelToKey[text];
      if (key && this.#panels.has(key)) {
        this.#triggers.set(key, link);

        const menuItem = link.closest('.menu-list__item') || link.parentElement;
        this.#menuItems.set(key, menuItem);

        // Suppress Horizon's native <details> disclosure completely.
        // This prevents it from opening/closing and causing layout thrash.
        const details = menuItem.querySelector('details');
        if (details) {
          details.addEventListener('toggle', (e) => {
            if (details.open) details.open = false;
          });
          // Also prevent click from toggling
          const summary = details.querySelector('summary');
          if (summary) {
            summary.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
            });
          }
        }

        menuItem.addEventListener('pointerenter', () => this.#open(key));
        menuItem.addEventListener('pointerleave', () => this.#scheduleClose());
      }
    }

    // The custom-mega-menu element itself (including the ::before bridge)
    // keeps the menu alive when the mouse crosses the gap.
    this.addEventListener('pointerenter', () => this.#cancelClose());
    this.addEventListener('pointerleave', () => this.#scheduleClose());

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.#activePanel) {
        this.#close();
      }
    });

    // Close when clicking outside the menu or triggers
    document.addEventListener('click', (e) => {
      if (!this.#activePanel) return;
      if (this.contains(e.target)) return;
      // Check if click is on a trigger menu item
      for (const [, menuItem] of this.#menuItems) {
        if (menuItem.contains(e.target)) return;
      }
      this.#close();
    });
  }

  #open(key) {
    this.#cancelClose();

    // Already showing this panel — nothing to do
    if (this.#activePanel === key) return;

    // Close previous panel
    if (this.#activePanel) {
      const prev = this.#panels.get(this.#activePanel);
      if (prev) prev.classList.remove('is-active');
    }

    const panel = this.#panels.get(key);
    if (!panel) return;

    panel.classList.add('is-active');
    this.#activePanel = key;
    this.setAttribute('aria-hidden', 'false');

    const header = document.getElementById('header-component');
    if (header) {
      header.setAttribute('data-gldn-state', 'hover');
    }
  }

  #scheduleClose() {
    // Don't stack timers
    if (this.#closeTimer) return;
    this.#closeTimer = setTimeout(() => this.#close(), CustomMegaMenu.CLOSE_DELAY);
  }

  #cancelClose() {
    if (this.#closeTimer) {
      clearTimeout(this.#closeTimer);
      this.#closeTimer = null;
    }
  }

  #close() {
    if (this.#activePanel) {
      const panel = this.#panels.get(this.#activePanel);
      if (panel) panel.classList.remove('is-active');
    }
    this.#activePanel = null;
    this.setAttribute('aria-hidden', 'true');
    this.#closeTimer = null;
  }
}

customElements.define('custom-mega-menu', CustomMegaMenu);

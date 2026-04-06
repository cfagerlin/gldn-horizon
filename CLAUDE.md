# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Horizon** is Shopify's flagship first-party Liquid Storefront theme. It is a reference implementation, not intended for Theme Store submission. The theme is built on these principles:
- Web-native and evergreen: leverage latest browser APIs with progressive enhancement (no polyfills)
- Server-rendered HTML via Liquid; client-side rendering only as a last resort
- Lean and functional — functionality defaults to "no" until it meets quality requirements

## Developer Tools

There is no `package.json` or Node.js build pipeline. This is a pure Shopify Liquid/vanilla JS theme.

```bash
# Lint and validate the theme
shopify theme check

# Serve the theme against a live store (requires Shopify CLI)
shopify theme dev --store=<your-store>

# Push theme to a store
shopify theme push
```

Theme Check also runs automatically on every commit via GitHub Actions (`Shopify/theme-check-action`).

## Architecture

### Directory Structure

```
assets/      # Flat directory — JS modules, CSS, and SVG icons (no subdirectories allowed)
blocks/      # Reusable block components (prefixed with `_`)
sections/    # Full page sections with Liquid + inline {% stylesheet %} / {% javascript %}
snippets/    # Shared Liquid partials rendered via {% render %}
templates/   # Page templates in JSON format (plus gift_card.liquid)
layout/      # theme.liquid and password.liquid
config/      # Theme settings schema and default data
locales/     # 50+ language JSON translation files
```

### Component Hierarchy

**Templates → Sections → Blocks → Snippets**

- **Templates** (`templates/*.json`) define section layout for each page type
- **Sections** (`sections/*.liquid`) are major page components with `{% schema %}` for Theme Editor settings
- **Blocks** (`blocks/_*.liquid`) are sub-components used within sections via `{% content_for 'block' %}`
- **Snippets** (`snippets/*.liquid`) are stateless Liquid partials included with `{% render %}`

### JavaScript Component Framework

All JS components extend a base `Component` class (see `assets/component.js`). Import it as:

```javascript
import { Component } from '@theme/component';
```

Key features of the `Component` framework:
- **`ref` attribute**: DOM refs auto-tracked — access via `this.refs.myRef`
- **`on:event` attribute**: Event delegation — `on:click="/handleClick"` calls `this.handleClick`
- **`connectedCallback`/`disconnectedCallback`**: Always call `super` in these methods
- **Private methods**: Use `#method()` syntax for methods requiring instance access
- **Module-level functions**: Use for utilities that don't need instance access

```liquid
<my-component>
  <button ref="submitBtn" on:click="/handleSubmit">Submit</button>
</my-component>
```

```javascript
class MyComponent extends Component {
  connectedCallback() {
    super.connectedCallback();
  }
  handleSubmit(event) {
    event.preventDefault();
    this.refs.submitBtn.disabled = true;
  }
}
customElements.define('my-component', MyComponent);
```

### Declarative Shadow DOM

Components use Declarative Shadow DOM to avoid layout shift. There's a `DeclarativeShadowElement` base class for shadow-DOM-based components.

## Code Standards

### JavaScript

- Zero external dependencies — native browser APIs only
- `const` over `let`; avoid mutation
- `for (const item of items)` over `forEach`
- `async/await` over `.then()` chaining
- Early returns over nested conditionals
- Private class fields (`#field`) for instance-only state
- Add new lines before blocks (`{`)

### CSS

- **Never** use IDs as selectors
- **Avoid** element selectors; target classes
- **Never** hardcode colors — use color scheme CSS variables
- Prefer `0 1 0` specificity (single class); max `0 4 0`
- Be cautious with `:has()` — anchor as close to children as possible and use `>` combinator to limit traversal; prefer server-rendered classes when possible
- Scope CSS variables to the component they belong to, namespaced: `--component-name-property`
- Global variables go in `snippets/theme-styles-variables.liquid` scoped to `:root`
- Set instance-specific values via inline `style` attributes using CSS variables (avoids per-instance CSS classes):

```liquid
<section style="--background-color: {{ section.settings.background_color }};">
```

### Liquid

- Business logic and formatting (money, translations) belong server-side, not client-side
- Use `{% render %}` for snippets (not `{% include %}`)
- Translations use the `t:` filter: `{{ 'key.path' | t }}`
- Icons embedded via `{{ 'icon-name.svg' | inline_asset_content }}`

### Locales

- All user-facing strings must have translation keys in `locales/en.default.json`
- Key structure: hierarchical, max 3 levels, snake_case, grouped by feature
- Schema translations live in `locales/en.default.schema.json`

### Accessibility

Accessibility is a first-class requirement (WCAG compliance). The `.cursor/rules/` directory has detailed rules for every component pattern. Key global requirements:
- Skip link required at top of every page
- No `title` attribute on non-iframe elements; iframes must have descriptive `title`
- Viewport meta must not prevent zooming (no `user-scalable=no` or `maximum-scale=1.0`)
- Always provide `aria-label` or visible text for interactive elements
- Support `prefers-reduced-motion` for all animations

### Schemas

Section and block schemas are defined inline with `{% schema %}` in `.liquid` files. Theme-wide settings are in `config/settings_schema.json`. Setting IDs should be descriptive and use snake_case.

## Key Files

- `assets/component.js` — Base web component class
- `assets/utilities.js` — Performance helpers, view transitions, responsive utilities
- `snippets/theme-styles-variables.liquid` — Global CSS custom properties
- `config/settings_schema.json` — All theme-level settings
- `.cursor/rules/` — Detailed coding standards per topic (accessibility, CSS, JS, Liquid, schemas, etc.)

---

# GLDN Theme Migration — Horizon (Vessel Preset)

## Project
Migrating gldn.com from a legacy custom Shopify theme to Shopify's Horizon theme (Vessel preset).
Client: GLDN (jewelry brand, Shopify Plus). Contact: Jed Paulson.
Agency: Laguna Peak. Developer: Carl Fagerlin.

## Client Store Status (Confirmed)
- New customer accounts: LIVE (shopify.com/28261154947/account)
- Checkout Extensibility: LIVE (Checkout GLDN-616)
- Shopify Scripts: Active but NOT in theme code (backend only, June 2026 deadline, out of scope)
- Legacy checkout.liquid: Dead code (13 files, ~2700 lines, unused)
- Legacy customers/*.liquid: Dead code (new accounts bypass theme templates)

## Git Setup
- upstream: Shopify/horizon (for theme updates via git fetch upstream && git merge upstream/main)
- origin: cfagerlin/gldn-horizon (working fork)
- Working branch: gldn/main

## Architecture: Extension Layer
ALL customizations go in namespaced files. NEVER modify Horizon core files.
- sections/custom-*.liquid
- snippets/custom-*.liquid
- assets/custom-*.css, assets/custom-*.js
- blocks/custom-*.liquid
- JSON template alternates: templates/page.bridal.json, etc.

Entry points: assets/custom.css, assets/custom.js

## Key Custom Builds
1. Header scroll/hover states: assets/custom-header-state.js + custom.css (NOT header.liquid modification)
2. Personalizer: ~1760 lines Vue.js → snippets/custom-personalizer.liquid + assets/custom-personalizer.js + assets/custom-personalizer.css (load Vue.js only on PDP)
3. Searchspring: Port ss-script.liquid to extension layer
4. Beam Impact: Port beam-config.liquid + beam-imports.liquid to extension layer
5. Product free-text options: blocks/custom-free-text-option.liquid
6. Footer two-tone: custom.css
7. Button variants (v3-v6): custom.css

## Legacy Theme
Located at ../dev/gldn-theme-old/ — contains full legacy theme plus migration deliverables:
- GLDN_Migration_Workplan.xlsx (5-day plan, v3)
- GLDN_Settings_Gap_Analysis.xlsx (30 capability comparisons + recommendations)
- GLDN_Theme_Code_Mapping.xlsx (353 legacy files mapped to Horizon equivalents)
- GLDN_App_Audit.xlsx (49 apps, keep/evaluate/replace/remove)
- GLDN_Theme_Migration_Assessment.docx (client-ready assessment)

## Horizon Notes
- Responsive: CSS container queries (NOT per-breakpoint settings)
- Colors: Color schemes (NOT per-element color pickers)
- Animations: Minimal (legacy had 17 effects per element — accept Horizon defaults)
- Padding: Single range control (legacy had per-breakpoint text inputs — custom.css for key sections)

## Shopify CLI
- Local dev: shopify theme dev --store=gldn.myshopify.com
- Push preview: shopify theme push --unpublished --store=gldn.myshopify.com

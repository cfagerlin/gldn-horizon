# Section-Specific Notes — GLDN Horizon Migration

Per-section reference data captured during the migration process. These are implementation details for sections that have already been matched, preserved here for future debugging or refinement.

---

## Hero Slideshow

### Section Height
Live site uses `padding-top: 66.67vh`. Both live and Horizon have transparent headers overlapping the hero, so the value transfers directly:
```css
.slideshow-section slideshow-slides {
  --slide-min-height-desktop: 66.67vh !important;
}
```

### Gradient Overlay
Live site does NOT use a full-section overlay. It uses a partial-height `:before` pseudo-element:
```css
.cta-banner:before {
  content: '';
  z-index: 2;
  position: absolute;
  top: 0;
  height: 6em;        /* Only covers the TOP of the image */
  width: 100%;
  background: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
  opacity: 0.3;
}
```
Horizon's built-in overlay covers the FULL section height. Disabled in JSON (`toggle_overlay: false`) and replaced with custom CSS `:before`.

### Text Container Layout
Live site: text sits in the LEFT side of the hero, vertically centered, with text center-aligned within a ~400px (25em) container. 7em top padding pushes text slightly below vertical center.

Horizon fix: JSON sets `horizontal_alignment_flex_direction_column: "center"` and `vertical_alignment_flex_direction_column: "center"`. CSS constrains the content panel:
```css
.slideshow-section .slide__content > .group-block-content {
  max-width: 25em;
  margin-left: 0;      /* Override Horizon's margin: auto */
  margin-right: auto;
  padding-top: 5em;
  text-align: center;
}
```

### Button (`.btn.v2` style)
```css
.slideshow-section a.button {
  font-family: 'freight-sans-pro', 'Work Sans', sans-serif;
  font-size: 0.75em;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 1.17em 2em;
  color: #333333;
  background-color: #fdfdfd;
  border: 0;
  border-radius: 0;
  min-width: 240px;
  text-align: center;
}
```

### Content Copy (verified from live site)
- Heading: "Most-Loved Gifts" (hyphenated, title case)
- Subtitle: "Surprises for every spring & summer occasion."
- Button: "SHOP BESTSELLERS"

---

## CTA Gallery

### Section Padding
- Section: `padding: ~74px 0` (top/bottom)
- Inner container: `padding-inline: 18px`

### Grid Layout (6 blocks)
Asymmetric layout:
```
[ necklaces | rings | earrings ] [ flora (tall) ]
[ bracelets |     wedding      ] [ flora (cont) ]
```
CSS Grid: `grid-template-columns: 1fr 1fr 1fr 2fr; grid-template-rows: 1fr 1fr;`
- Item 5 (wedding): `grid-column: 2 / 4`
- Item 6 (flora): `grid-column: 4; grid-row: 1 / 3`

### Featured Items (with title)
Overlay always visible. Title: Spectral font, 2.18em, weight 200, NOT italic, letter-spacing -0.02em, line-height 110%.
Button: `.btn.v2` style (light bg, dark text, uppercase).

### Non-Featured Items
Hover-only overlay with centered label text + circle arrow icon.

---

## Home Anatomy / Product Spotlights

### Background Color
Live: `#aba499` (warm tan). Created custom `scheme-gldn-tan` in `settings_data.json`.

### Layout Structure
2-column grid (50/50 on desktop):
- Left: Eyebrow, title, testimonial quote, CTA button. Max-width 28em, padding 2em 0.
- Right: Product image (71% width, portrait 100:137) + features sidebar (29%), with decorative border.

### Decorative Border
```css
.img-wrap:before {
  content: '';
  position: absolute;
  bottom: -3em;
  right: -1.5em;
  width: 75%;
  height: 100%;
  border: 1px solid currentColor;
}
```
Hidden on mobile.

### Typography
- Eyebrow: 0.75em, uppercase, letter-spacing 0.1em
- Title: 2.18em, Spectral, weight 200, normal style, letter-spacing -0.02em
- Body/testimonial: 1.375em, Spectral, weight 200, line-height 130%, min-height 9em
- Body links: freight-sans-pro, 0.545454em, uppercase, underlined, weight 300
- Features strong: weight 400, uppercase, 0.625em, letter-spacing 0.1em

### Button
`.btn.v2` style. Button text ALL CAPS in JSON settings.

### Carousel Controls
Left-aligned, `bottom: 1em; left: 0`. Arrows: 2.1875em, 50% opacity → 100% on hover.
Fade transition 0.7s. Controls move below carousel at ≤1100px. Hidden on mobile (≤749px).

### Mobile
Single column. Image grid: 67/33. Decorative border hidden.
Title: 1.875em, Body: 1.1875em, Eyebrow: 0.6875em. Button: full width.
Section padding: 3.5em 1.5rem 2.5em.

---

## Header

### Section Mapping
- **Live:** Custom legacy header with 3-state colour system (transparent → hover → scroll)
- **Dev:** Horizon core `header` section + `custom-header-states` section group entry + `custom-header-state.js` + CSS overrides in `custom.css`

### Architecture
The GLDN header uses a 3-state colour system managed entirely in the extension layer:
1. **`sections/custom-header-states.liquid`** — header group section that injects CSS custom properties for each state's background/text colours. Uses `color_extract` filter for individual R/G/B values fed into `rgba()`.
2. **`assets/custom-header-state.js`** — sets `data-gldn-state="normal|hover|scroll"` on `#header-component` based on scroll position and mouse/focus events.
3. **`assets/custom.css`** — state rules use `!important` to override Horizon's color-scheme `!important` rules.

### Changes Made

#### JSON Settings (`header-group.json`)
- Announcement bar: text → "For Now & Always. Shop Our Curated Mother's Day Gift Guide.", link → `/collections/mothers-day`, bg `#5d3a26`, text `#fdfdfd`, height `45px`
- Header states: normal_bg `#ffffff` @ 0% opacity (transparent), normal_text `#fdfdfd`; hover_bg `#ffffff` @ 95%, hover_text `#333333`; scroll_bg `#ffffff` @ 100%, scroll_text `#333333`; transition 200ms
- Header: logo_position center, menu_position left, menu_row top, enable_transparent_header_home true, enable_sticky_header always, actions_display_style icon
- Menu font: 1em, wt 400, uppercase, body font link, letter-spacing 0.01em

#### CSS Overrides (`custom.css`)
- **3-state backgrounds**: `#header-component[data-gldn-state='…'] .header__row` with `background-color` and `color` using pre-computed `rgba()` vars + `!important`
- **Nav link colour propagation**: Per-state rules for `.header__nav a`, `[class*='header__menu'] a`, `.menu-list__link` with `!important`
- **Header action order**: Flexbox order — search(0), wishlist(1), account(2), cart(3)
- **LOGIN text injection** (desktop ≥750px): Hide SVG icon via `span:has(.account-button__icon) { display: none }`, show hidden text span, inject "LOGIN" via `::after` pseudo-element with freight-sans-pro 0.8125rem uppercase
- **Header row height**: Reduced from ~86px to ~56px via `padding-block: 0` on `.header__row--top` and `padding-block: 0.375rem` on `.header__columns`
- **Nav typography**: freight-sans-pro, 1em, wt 400, uppercase, ls 0.01em (updated to match live site)
- **Container max-width**: `.header__columns` → `max-width: 1248px; margin-inline: auto; padding-inline: 1.5em` (matches live `.container`)
- **Transition**: `background-color` and `color` with `var(--gldn-header-transition, 200ms ease)` on `.header__row`

#### Icon Replacements
- **Approach**: Live site uses fill-based outline SVGs (32×32 viewBox, outline thickness baked into path geometry). Horizon's default stroke-based SVGs (20×20 viewBox, `stroke-width`) appeared solid/filled at small render sizes. Replaced with live site's fill-based versions using `fill="currentColor"` for dynamic colour inheritance.
- **`assets/icon-cart.svg`**: Replaced Horizon bag icon with live site's wheeled cart (32×32 viewBox, fill-based outline)
- **`assets/icon-search.svg`**: Replaced Horizon stroke magnifying glass with live site's fill-based version (32×32 viewBox)
- **`snippets/custom-header-wishlist.liquid`**: Heart SVG updated from stroke-based (20×20) to live site's fill-based outline (32×32 viewBox)
- **`config/settings_data.json`**: `icon_stroke: "thin"` (maps to `--icon-stroke-width: 1px`) — retained for other Horizon stroke-based icons throughout the site

#### Liquid Changes (`custom-header-states.liquid`)
- Replaced `color_to_rgb` filter (outputs `rgb(R,G,B)` wrapper, breaks CSS `rgba()`) with `color_extract` filter for individual R/G/B numeric values
- Pre-compute full `rgba()` values in Liquid: `--gldn-header-hover-bg: rgba({{ r }}, {{ g }}, {{ b }}, {{ opacity }})`
- Renders `custom-header-wishlist` snippet (injects heart icon into header-actions)

### Verified States (Desktop)
- **Normal**: Transparent background, white text/icons over hero ✓
- **Hover**: White semi-transparent (95%) bg, dark text, LOGIN visible ✓
- **Scroll**: Solid white bg, dark text, sticky, announcement bar hidden ✓

#### Logo SVG Injection (`snippets/custom-header-logo.liquid`)
- Saves `assets/custom-logo-gldn.svg` with `fill="currentColor"` (sourced from live CDN: `cdn.shopify.com/.../logo.svg`, original `fill="#333333"` replaced)
- Hides Horizon's image-picker logo containers (`.header-logo__image-container--original/--inverse`)
- Injects inline SVG via `{{ 'custom-logo-gldn.svg' | inline_asset_content }}` inside `<template>`, cloned by JS into `.header-logo` element
- SVG inherits `color` from header state via `currentColor` — no separate light/dark logo images needed
- Snippet rendered from `custom-header-states.liquid`

#### Extended Colour Propagation (`custom.css`)
- Added `.header-logo`, `header-actions`, `header-actions a`, `header-actions button`, `.header__columns` to all three state colour rules
- Previously only nav links received state colour; logo and action icons were stuck on Horizon's transparent colour scheme (`rgb(242,242,242)`)
- Override `--color-foreground-rgb` per state on `#header-component[data-gldn-state]` for elements using Horizon's variable system
- Account button targeted with `[class*="color-scheme"]` selector (Shadow DOM on `shopify-account`)

#### Icon Spacing (`custom.css`)
- **Problem**: Horizon's `.svg-wrapper` elements are 44×44px touch targets; live site icons are ~24px with ~20px gaps
- **Fix**: Override `.svg-wrapper` to 24×24px with `!important` in two selectors:
  - `#header-component header-actions .svg-wrapper` (heart, cart inside `header-actions`)
  - `#header-component .header__column--right > search-button .svg-wrapper` (search is a sibling of `header-actions`, not a child)
- Reset negative margins: Horizon applies `margin-left: -14.4px` on `header-actions` and `margin: 0 -8px 0 -14.4px` on `search-button` — zeroed with `margin: 0 !important`
- `header-actions` gap set to `1.25em` (~20px), matching live site spacing
- `.header__column--right` retains its native `gap: 20px` for search→heart spacing
- Action containers (`header-actions__action`, `cart-drawer-component`, etc.) set to `width: auto !important; min-width: 0`
- **Result**: Search(24px) —20px— Heart(24px) —20px— LOGIN(41px) —20px— Cart(24px)

#### Custom Mega Menus
- **Approach**: Extension-layer overlay reading existing Shopify linklists (`mega-menu-shop`, `mega-menu-gift-guide`, `mega-menu-about`). Does NOT modify Horizon core files or require restructuring the Main menu.
- **Files created**:
  - `snippets/custom-mega-menu.liquid` — Renders hidden panels for each mega menu, iterating over linklist columns (level 1 = column headings, level 2 = links)
  - `assets/custom-mega-menu.js` — `<custom-mega-menu>` web component that: (1) moves itself into `#header-component` on init for correct absolute positioning, (2) binds `pointerenter`/`pointerleave` on nav items matching "shop"/"gift guide"/"about", (3) shows/hides panels with 200ms close delay, (4) triggers header hover state on open
  - `assets/custom.css` — mega menu panel styles: `position: absolute; top: 100%` below header, `max-width: 1248px` inner container, CSS grid `auto-fit` columns, freight-sans-pro typography
- **Wired in** via `sections/custom-header-states.liquid` → `{% render 'custom-mega-menu' %}`
- **Menu content** (from Shopify admin linklists):
  - SHOP: 6 columns (Featured, Categories, Collections, Personalized, Styles, Materials) — 44 links
  - GIFT GUIDE: 4 columns (Gifting Favorites, Personalization, Budget, Meaning) — 17 links
  - ABOUT: 4 columns (About Us, Care Team, Join Our Circle, Jewelry Guides) — 17 links
- **Future enhancements**: Live site has featured images + CTAs in GIFT GUIDE and ABOUT mega menus (not yet implemented)

### Outstanding Issues
1. **~~Logo SVG~~**: ✅ RESOLVED — Inline SVG with `currentColor` dynamically changes colour across all 3 states
2. **Favicon**: Must be uploaded via Theme Editor → Theme Settings → Logo & Favicon. Source: `https://cdn.shopify.com/s/files/1/0282/6115/4947/files/favicon.png` (download from live CDN, upload to dev store)
3. **Visible search input**: Live site has an always-visible text input field (~169px wide) next to search icon. Horizon uses a search button that opens a modal dialog. This is a fundamental structural difference requiring a custom extension section to replicate.
4. **Cart badge**: Will appear automatically once items are in the dev store cart.
5. **Responsive breakpoints**: Could not verify tablet (≤800px) or mobile (≤480px) header layouts due to macOS Chrome minimum window size constraints (~950px CSS viewport minimum). Requires device emulation or `shopify theme dev` on a mobile device.
6. **Mobile drawer**: Not tested. Horizon uses `<header-drawer>` component for mobile menu. Behaviour match needs verification at mobile widths.
7. **Mega-menu/dropdown styling**: Desktop dropdown behaviour not tested beyond confirming hover state triggers white background. Dropdown panel styling (typography, layout, featured products) needs separate verification pass.

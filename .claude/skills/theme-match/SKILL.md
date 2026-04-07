# Theme-Match Skill — GLDN Horizon Migration

Systematic methodology for matching each homepage section on the dev (Horizon) theme to the live (legacy) GLDN site. Work section-by-section from top to bottom. Each section goes through a full compare → fix → verify loop before moving on.

## Project Context

- **Live site (reference):** gldn.com — the visual target
- **Live theme export (primary code reference):** `/sessions/funny-cool-turing/mnt/gldn-theme-040626/` — exported 2026-04-06. Use this for reading section `.liquid` files, `settings_data.json`, and CSS. When matching the live site, always prefer this over gldn-theme-old.
- **Legacy theme export (deliverables only):** `/sessions/funny-cool-turing/mnt/gldn-theme-old/` — contains migration planning docs
- **Dev theme (Horizon):** `/sessions/funny-cool-turing/mnt/GLDN/gldn-horizon/` — the theme being built
- **Code mapping spreadsheet:** `/sessions/funny-cool-turing/mnt/GLDN/GLDN_Theme_Code_Mapping.xlsx` — 353 legacy files mapped to Horizon equivalents
- **Dev store:** `gldnxlayeredandlong.myshopify.com` (via `shopify theme dev`)
- **Section-specific notes from prior work:** `SECTION_NOTES.md` (in this skill's directory)

## Architecture Rules

ALL customizations go in the extension layer. NEVER modify Horizon core files.
- `sections/custom-*.liquid`
- `snippets/custom-*.liquid`
- `assets/custom-*.css`, `assets/custom-*.js`
- `blocks/custom-*.liquid`

If a variance requires modifying a core Horizon section `.liquid` file, instead create a new `custom-*` section that implements the needed functionality. This preserves upstream upgradability via `git merge upstream/main`.

## Safety Rules

**NEVER access the production store's Shopify admin.** The admin tab in Chrome (if present) is for the DEV store (`gldnxlayeredandlong.myshopify.com`) only. When inspecting the live site:
- Use the **public-facing storefront** at gldn.com (read-only browsing, screenshots, JS inspection via Chrome MCP)
- Use the **exported theme files** in `gldn-theme-040626/` for reading code, settings, and CSS
- NEVER navigate to, click into, or interact with the live store's Shopify admin (`admin.shopify.com/store/gldn/...` or similar)
- If you are unsure whether a URL points to the production admin vs the dev admin, stop and ask

## Methodology

### Step 1: Identify the Section

1. Determine which section on the homepage to work on next (top to bottom order).
2. Read `GLDN_Theme_Code_Mapping.xlsx` to find the legacy section name and its mapped Horizon equivalent.
3. Locate the section definition in both themes:
   - **Live:** Find the section in the live theme export's template JSON (e.g., `templates/index.sl-*.json`) and its `.liquid` file in `sections/`.
   - **Dev:** Find the corresponding section in `templates/index.json` and its `.liquid` file (either a Horizon core section or a `custom-*` section).
4. If no dev section exists yet for this legacy section, determine whether to use an existing Horizon section or create a new `custom-*` section based on complexity.

### Step 2: Compare Settings

1. Read the **live theme's section `.liquid` file** — this is the PRIMARY code reference. It contains:
   - The inline `<style>` block with all CSS rules, breakpoints, responsive behavior
   - The `{% schema %}` with available settings and their types
   - The HTML structure and Liquid logic
2. Read the **live theme's configured values** from `settings_data.json` (or template JSON) for this section — background colors, text, images, button classes, padding, etc.
3. Read the **dev theme's section `.liquid` file** — its `{% schema %}`, CSS, and HTML structure.
4. Read the **dev theme's configured values** from `templates/index.json` for this section.
5. Compare settings side by side. For each live setting, determine:
   - Does the dev section have an equivalent setting? → Set it to match.
   - Is the dev value already correct? → No action needed.
   - No equivalent setting exists? → Flag for CSS override or section modification (Step 5).

### Step 3: Align Settings (JSON)

Apply all setting changes that can be made via JSON (template config or `settings_data.json`):
- Color scheme (create a new named scheme in `settings_data.json` if no existing scheme matches)
- Content text, button labels, links, images
- Padding values
- Alignment options
- Width (page-width vs full-width)
- Any section-specific toggles

**Always prefer JSON settings over CSS overrides.** CSS is only for what settings cannot control.

### Step 4: Render & Inspect

1. Take a **screenshot of the live site** section (gldn.com) using computer-use tools.
2. Take a **screenshot of the dev site** section (shopify theme dev preview) at the same viewport width.
3. Use **Chrome MCP** to inspect the dev site's rendered HTML and computed CSS for the section. Focus on:
   - Section container: dimensions, background, padding, margin
   - Typography: font-family, font-size, font-weight, line-height, letter-spacing, text-transform, color
   - Layout: display, grid/flex properties, gap, alignment
   - Buttons: all computed styles
   - Images: dimensions, object-fit, aspect-ratio
   - Decorative elements: borders, shadows, pseudo-elements
4. Do the same inspection on the **live public storefront** (gldn.com) for comparison. **Always verify computed values from the live site** — exported `settings_data.json` values may be stale (e.g., the background color may have changed since the export).

### Step 5: Identify Variances

Compare the screenshots and inspected CSS. For each visual difference, categorize it:

- **Content variance**: Wrong text, image, or link → Fix in JSON (Step 3).
- **Setting variance**: A dev section setting exists but has the wrong value → Fix in JSON (Step 3).
- **CSS variance (overridable)**: The dev section renders differently but can be fixed with CSS in the section's `{% stylesheet %}` block or in `assets/custom.css` → Apply CSS override (Step 6).
- **Structural variance**: The HTML structure is fundamentally different and CSS alone can't fix it → Requires section `.liquid` changes (Step 7).
- **Missing feature**: The live section has functionality the dev section lacks entirely → May require a new custom section or JS component.

### Step 6: Apply CSS Overrides

For CSS variances, apply fixes in order of preference:

1. **Section's own `{% stylesheet %}` block** — for custom sections (`custom-*.liquid`) that we control.
2. **`assets/custom.css`** — for overriding Horizon core sections we don't want to modify.
3. **Inline `style` attribute via Liquid** — for per-instance values driven by section settings (CSS custom properties).

Guidelines:
- Use component-scoped selectors (class-based, not IDs or element selectors).
- Use `!important` only when overriding Horizon inline styles or CSS custom properties from `theme-styles-variables.liquid`.
- Match the live site's CSS values exactly — copy font-size, padding, letter-spacing values from the live `.liquid` file's `<style>` block.
- For colors not available in any Horizon color scheme, create a new named scheme (e.g., `scheme-gldn-tan`).

### Step 7: Structural Changes (with caution)

If the variance requires HTML/Liquid changes:

1. **Custom sections we own** (`custom-*.liquid`): Edit freely — these are in the extension layer.
2. **Horizon core sections**: NEVER modify directly. Instead:
   - Can the fix be achieved with CSS-only? Prefer that.
   - If not, create a new `custom-*` section that implements the needed structure.
   - Copy the minimum necessary logic from the core section, adapting it to the extension pattern.
3. Document any new custom sections or significant structural changes.

### Step 8: Verify the Fix

1. Reload the dev site preview.
2. Take a new screenshot of the dev section at the same viewport width as Step 4.
3. Compare against the live site screenshot. Check:
   - The specific variance you targeted — is it fixed?
   - No regressions — did the fix break anything else in this section?
4. If the variance persists, go back to Step 6. **Retry up to 3 times.** If still not fixed after 3 attempts, log it as an outstanding issue.

### Step 9: Next Variance

Return to Step 5 and look for the next visual difference. Repeat Steps 5-8 until all variances in this section are resolved (or logged as issues).

### Step 10: Final Visual Comparison

After all code-identified variances are addressed:

1. Take fresh side-by-side screenshots of the live and dev sections at **desktop width**.
2. Do a pure visual comparison — look for anything that wasn't caught in the code/CSS analysis:
   - Spacing that "feels off" even if individual values are correct
   - Hover states, transitions, animations
   - Interactive elements (carousels, accordions, tabs)
3. **Breakpoint verification** — render and compare at ALL breakpoints defined in the live theme's section CSS. For GLDN, the legacy theme defines these breakpoints (check each section's `<style>` block for the actual values used):
   - **Desktop:** >800px (default, already compared above)
   - **Tablet:** ≤800px (legacy `breakpoint_tablet: 800px`)
   - **Mobile:** ≤480px (or whatever `breakpoint_mobile` the section uses)
   - **Any section-specific breakpoints** (e.g., some sections have a 1100px or 1270px breakpoint)
   Use `resize_window` in Chrome MCP to set both the live and dev browsers to each breakpoint width, take screenshots, and compare. Log any responsive variances.
4. For any new variances found visually or at other breakpoints, repeat Steps 5-8.

### Step 11: Section Report

Produce a brief summary:

- **Section name** (live → dev mapping)
- **Changes made:**
  - JSON settings adjusted (list key changes)
  - CSS overrides applied (list key rules)
  - Structural changes (if any)
  - New files created (if any)
- **Outstanding issues** (variances that couldn't be resolved, with explanation)
- **Notes** for future refinement

Then move on to the next section (back to Step 1).

## Horizon-Specific Gotchas

These are patterns that recur across sections. Check for them proactively:

### margin: auto Centering
Horizon's `_slide.liquid` sets `.slide__content > * { margin: auto; }`, centering all direct children. JSON alignment settings control alignment INSIDE `.group-block-content`, not the panel itself. Override with explicit `margin-left: 0; margin-right: auto` when left-aligning content.

### Text Alignment vs Flex Alignment
Horizon's `alignment: "center"` JSON setting sets `align-items: center` on the flex parent (centering block containers), but text INSIDE those blocks remains left-aligned. Add `text-align: center` CSS when the live site centers text within a container.

### Font Overrides Require !important
Horizon's `theme-styles-variables.liquid` generates font CSS custom properties as inline styles. Custom font-family values must use `!important`.

### Overlay: Partial vs Full
Horizon's built-in overlay covers the full section height. If the live site uses a partial-height gradient (e.g., 6em from top), disable Horizon's overlay in JSON and use a custom CSS `:before` pseudo-element.

### Button Class Conflicts
Horizon's `.button` and `.button-secondary` classes add their own padding, border-radius, and color-scheme-driven colors. When implementing custom button styles (like GLDN's `.btn.v2`), remove Horizon button classes from the HTML element to avoid conflicts.

### Custom Color Schemes
When the live site uses a background color not present in any existing Horizon scheme, create a new named scheme in `settings_data.json` (e.g., `scheme-gldn-tan`). Model it after an existing scheme with similar foreground/background contrast. The scheme must be added to the `current` block (not just presets).

### Padding Limits
Horizon section padding max is 100px via the range control. If the live site exceeds this (e.g., 7em = 112px), use CSS overrides for the excess.

### Content Copy
NEVER change heading/body copy without explicit client instruction. The live site is the source of truth. Match character-for-character including capitalization, hyphens, punctuation. Do NOT rely on exported `settings_data.json` — it may be stale.

### Exported Values May Be Stale
The theme export files are a snapshot from a point in time. The live site may have been updated since. Always verify key visual values (background colors, padding, font sizes) by inspecting the **live public storefront** via Chrome MCP `javascript_tool`, not just reading the export files. When the export and live site disagree, the live site wins.

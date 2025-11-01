# Dither UI — Design System

A grayscale, halftone-forward UI with crisp outlines, sparse color, and **PT Mono** for all headline/structural text. This doc is ready to hand to design/FE.

---

## 1. Principles

1. **Monochrome first, color as signal**
   UI stays neutral; color is only for action, selection, status.
2. **Technical personality**
   Titles and labels use **PT Mono** to make it feel like a tool.
3. **Soft geometry, sharp structure**
   12 px radii, 1 px borders, light shadows.
4. **Illustration = halftone**
   Big images are dithered/halftone, not photo-real.
5. **Workspace over chrome**
   Toolbars are slim; canvas gets the attention.

---

## 2. Foundations

### 2.1 Colors (tokens)

```text
--ink-900: #0B0D0F       // Primary text
--ink-700: #1C2024       // Secondary text
--ink-500: #4B5563       // Muted text
--ink-400: #6B7280       // Hints, timestamps

--paper-000: #FFFFFF     // Surface
--paper-050: #F7F8FA     // Sub-surface, hover
--paper-075: #F0F2F5     // App background

--line-200: #E6E8EB      // Default borders
--line-300: #DDE1E6      // Card borders, tiles

--accent-blue-600: #2F6AFF
--accent-blue-700: #1E56F0
--accent-blue-100: #E8F0FF

--accent-orange-500: #FF8A3A  // Pins / callouts
--accent-green-500: #17C964   // Success
--accent-red-500: #F04438     // Destructive

--overlay-900: rgba(11,13,15,.72)
--focus: #2F6AFF
```

**Usage notes**

* Background of app: `--paper-075`
* Cards/panels: `--paper-000` + `--line-300` border
* Hover on neutral items: `--paper-050`
* Selection: `--accent-blue-100` + 1–2 px blue border

---

## 3. Typography

### 3.1 Families

```css
:root {
  --font-title: "PT Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Source Code Pro", monospace;
  --font-body: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
```

* **PT Mono** → page titles, section titles, toolbar labels, metric labels, table headers, topbar actions, panel titles.
* **Inter** → body text, descriptions, chat messages, button text, timestamps.

### 3.2 Type scale

**Mono (PT Mono):**

* Display: **40/48**, letter-spacing `-0.01em`, weight 400
* H1: **32/40**, letter-spacing `-0.01em`
* H2: **24/32**
* UI label: **14/20**

**Body (Inter):**

* Body: **16/24**
* Small: **14/20**
* Micro: **12/16**

### 3.3 CSS skeleton

```css
body {
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.5;
  color: var(--ink-900);
  background: var(--paper-075);
}

h1, h2, h3,
.title, .section-title, .toolbar-label, .metric-label {
  font-family: var(--font-title);
  letter-spacing: -0.01em;
}

.page-title {
  font-size: 2.5rem;   /* 40px */
  line-height: 3rem;   /* 48px */
}

.section-title {
  font-size: 1.5rem;   /* 24px */
  line-height: 2rem;   /* 32px */
}
```

**Note on PT Mono:** since it’s mostly regular weight, “emphasize” by (1) size, (2) spacing, (3) all-caps for tiny labels.

---

## 4. Spacing, Grid, Radii

* **Spacing scale:** 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
* **Grid:** 12-col, 72–80 px page margins, 24 px gutter, max width 1200–1280 px
* **Radii:**

  * Cards: 12 px
  * Inputs/buttons: 10 px
  * Chips/badges: 6–8 px
* **Borders:** 1 px solid `--line-200`, selected = 2 px accent
* **Shadows:**

  * Card: `0 1px 1px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.06)`
  * Popover: `0 12px 24px rgba(0,0,0,.10)`

---

## 5. Halftone / Dither Language

**Purpose:** All big visuals (venue 3D, equipment preview, hero illustration) use a halftone/dither texture to match the screenshots.

**Pattern helper:**

```css
.halftone {
  position: relative;
  isolation: isolate;
}

.halftone::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(currentColor 1px, transparent 1.6px) 0 0/6px 6px;
  mix-blend-mode: multiply;
  opacity: .18;
  pointer-events: none;
}
```

**Striped/banded section (for logo walls/footers):**

```css
.striped {
  background:
    linear-gradient(to bottom, transparent 94%, rgba(0,0,0,.06) 94%) 0 0/8px 8px;
}
```

**Art direction notes:**

* Keep assets grayscale first → tint with overlay if needed.
* Prefer 45° dot style or bitmap halftone.
* Avoid color noise — keep it clean.

---

## 6. App Frame & Layout Patterns

### 6.1 Top bar

* Left: product mark (24 px), **search** (40 px, rounded 10, icon-left)
* Center/right: segmented filters (Layout / Theme / Equipment)
* Right: chat icon, bell with count, avatar

**Search styles:**

```css
.top-search {
  height: 40px;
  border: 1px solid var(--line-200);
  border-radius: 10px;
  background: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
}
```

**Segmented dropdown:**

* Height 36 px
* PT Mono label
* On hover: `background: var(--paper-050);`
* On active: 1 px blue border, light blue bg

### 6.2 Workspace canvas

* Large panel, center-aligned
* Dithered render as background
* Floating controls:

  * **Small add button**: 32 px, square, white, 1 px border
  * **Entity tags** (e.g. “Tuki”, “Joshua”, “Kreos”): small pill with solid accent color
  * Locks/permissions: small black badge with white lock

### 6.3 Rails

* **Left rail**: vertical buttons, 44 px, icon-only, 8 px gap, selected with blue indicator and soft bg
* **Right rail/panel**: chat/activity list in a card with 1 px border

---

## 7. Components

### 7.1 Buttons

**Primary**

```css
.btn-primary {
  background: var(--accent-blue-600);
  color: #fff;
  border: 1px solid transparent;
  border-radius: 10px;
  height: 40px;
  padding: 0 14px;
  font-family: var(--font-body);
  font-weight: 600;
}
.btn-primary:hover { background: var(--accent-blue-700); }
```

**Secondary**

```css
.btn-secondary {
  background: #fff;
  color: var(--ink-900);
  border: 1px solid var(--line-200);
  border-radius: 10px;
  height: 40px;
  padding: 0 14px;
}
.btn-secondary:hover { background: var(--paper-050); }
```

**Icon-only**

* 32–40 px square, 10 px radius, center icon, hover `--paper-050`

### 7.2 Inputs

```css
.input {
  height: 40px;
  background: #fff;
  border: 1px solid var(--line-200);
  border-radius: 10px;
  padding: 0 12px;
}
.input:focus {
  outline: 2px solid var(--accent-blue-100);
  outline-offset: 2px;
  border-color: var(--accent-blue-600);
}
```

### 7.3 Cards

```css
.card {
  background: #fff;
  border: 1px solid var(--line-300);
  border-radius: 12px;
  box-shadow: 0 1px 1px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.06);
}
```

* Header text → **PT Mono 14/20**
* Body → Inter 14/20
* Action area on bottom with subtle border-top

### 7.4 Chips / Tags

* Height: 24–28 px
* Radius: 9999px or 8 px
* **Neutral**: `background: var(--paper-050); border: 1px solid var(--line-200); color: var(--ink-700); font-family: var(--font-body);`
* **Status**:

  * info → blue bg, white text
  * success → green bg, white text
  * attention (like orange “Tuki” tag) → `background: var(--accent-orange-500); color: #fff;`

### 7.5 Metric Pills

For things like “500 Guests”, “44m²”, “29 March” in the screenshot:

```css
.metric-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--paper-050);
  border: 1px solid rgba(0,0,0,0); /* or line-200 if needed */
  border-radius: 10px;
  padding: 4px 10px;
  font-family: var(--font-title);  /* PT Mono */
  font-size: 14px;
  line-height: 20px;
  color: var(--ink-700);
}
```

### 7.6 Chat / Activity List

* Container = card
* Header: PT Mono 14/20, medium
* Row: 36–40 px, avatar 20 px left, Inter 14/20 text, timestamp Inter 12/16, `color: --ink-400`
* Divider between items: 1 px `--line-200` or banded background

---

## 8. Page-Level Patterns

### 8.1 Venue / Planner view

* **Title row**:
  `Madison Hall` → PT Mono, large; subtitle location in Inter 14/20 muted.
* **Toolbar under title**:
  Metric pills + date pill + “Venue options”
* **Canvas**: halftone image with overlaid floating controls
* **Bottom shelf**: cards for “Setup Area” and “Browse Equipment”, each with dithered thumbnail and a **+** square button in bottom-right.

### 8.2 Marketing / Landing view

* **Top nav**: logo left, links center (`Features`, `Pricing`, `Docs`, `Blog`), auth right (`Login`, `Sign Up` pill)
* **Hero**: left text (PT Mono headline) + right dithered illustration
* **CTA**: secondary, rounded
* **Logo wall**: on striped background, grayscale logos
* **Dark panel with app screenshot**: centered, dark card over light bg, strong shadow

---

## 9. States & Interaction

* **Hover**: `background: var(--paper-050)` or darken border
* **Active**: lower shadow, keep outline
* **Selected**: 2 px `--accent-blue-600` border or `--accent-blue-100` bg
* **Disabled**: `opacity: .4; pointer-events: none;`
* **Focus**: 2 px blue outline + 2 px offset

---

## 10. Icons

* Outline, 1.5 px stroke
* 20 × 20 canvas
* Rounded caps/joins
* Keep icons neutral (black/ink) unless indicating state

---

## 11. Tailwind-ish Setup (optional)

```js
// tailwind.config.js (excerpt)
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        title: ['"PT Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        ink: {
          900: '#0B0D0F',
          700: '#1C2024',
          500: '#4B5563',
          400: '#6B7280',
        },
        paper: {
          0: '#FFFFFF',
          50: '#F7F8FA',
          75: '#F0F2F5',
        },
        line: {
          200: '#E6E8EB',
          300: '#DDE1E6',
        },
        accent: {
          blue: {
            100: '#E8F0FF',
            600: '#2F6AFF',
            700: '#1E56F0',
          },
          orange: {
            500: '#FF8A3A',
          },
          green: {
            500: '#17C964',
          },
        },
      },
      borderRadius: {
        lg: '12px',
        md: '10px',
        sm: '6px',
      },
    },
  },
};
```

---

## 12. Accessibility

* Text-on-white: keep to 4.5:1 (most ink tokens do).
* Blue on white buttons: pass at standard sizes.
* Don’t rely on color alone — especially for action pins on the canvas (add icon/label).
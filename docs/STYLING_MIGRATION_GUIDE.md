# Styling Migration Guide

This guide documents how to replace the placeholder CSS with your internal styling library.

## Table of Contents

1. [Current Architecture](#current-architecture)
2. [Quick Start Checklist](#quick-start-checklist)
3. [Design Tokens Reference](#design-tokens-reference)
4. [Component Class Mappings](#component-class-mappings)
5. [Migration Steps](#migration-steps)
6. [Responsive Breakpoints](#responsive-breakpoints)
7. [Animations](#animations)
8. [Special Cases](#special-cases)
9. [File Reference](#file-reference)

---

## Current Architecture

### Single Entry Point

All styles are in one file: `src/App.css` (~1,500 lines)

Imported once at: `src/routes/__root.tsx`

```tsx
import '@/App.css'
```

### No CSS-in-JS

Components use plain className strings:

```tsx
// MetricCard.tsx
<div className="metric-card">
  <div className="metric-card-content">
    <p className="metric-card-label">{label}</p>
```

### Theme System

- **State**: Zustand store at `src/shared/store/useUIStore.ts`
- **Application**: `data-theme="dark"` attribute on root element
- **Variables**: CSS custom properties respond to theme attribute

---

## Quick Start Checklist

- [ ] Map CSS variables to your design tokens
- [ ] Replace `src/App.css` import with your library initialization
- [ ] Create component style mappings or wrapper components
- [ ] Migrate responsive breakpoint logic
- [ ] Port keyframe animations
- [ ] Update ECharts theme integration
- [ ] Test light/dark theme switching

---

## Design Tokens Reference

### Layout Tokens

| CSS Variable | Default Value | Usage |
|--------------|---------------|-------|
| `--gap` | `16px` | Standard spacing between elements |
| `--gap-lg` | `24px` | Large spacing (sections, padding) |
| `--border-radius` | `4px` | Corner radius for cards, buttons |
| `--container-max-width` | `1400px` | Max width of main container |

### Grid Layout Tokens

| CSS Variable | Default Value | Responsive Values |
|--------------|---------------|-------------------|
| `--metrics-columns` | `5` | 3 @ 1200px, 2 @ 768px, 1 @ 576px |
| `--distribution-columns` | `6` | 3 @ 992px, 2 @ 576px |
| `--charts-columns` | `3` | 2 @ 992px, 1 @ 768px |

### Color Tokens - Light Theme

| CSS Variable | Value | Usage |
|--------------|-------|-------|
| `--bg-page` | `#F7F7F7` | Page background |
| `--bg-card` | `#ffffff` | Card/component background |
| `--border-color` | `#E5E5E5` | Borders, dividers |
| `--text-primary` | `#333333` | Primary text |
| `--text-secondary` | `#666666` | Secondary text |
| `--text-muted` | `#999999` | Muted/disabled text |
| `--accent-color` | `#003B70` | Primary action color |
| `--success-color` | `#00805A` | Success states |
| `--warning-color` | `#C75B12` | Warning states |
| `--danger-color` | `#D9261C` | Error/danger states |

### Color Tokens - Dark Theme

| CSS Variable | Value |
|--------------|-------|
| `--bg-page` | `#0D1117` |
| `--bg-card` | `#1A2332` |
| `--border-color` | `#2D3748` |
| `--text-primary` | `#E5E5E5` |
| `--text-secondary` | `#AAAAAA` |
| `--text-muted` | `#777777` |

### Brand Colors (Citi)

| CSS Variable | Value | Name |
|--------------|-------|------|
| `--citi-blue` | `#003B70` | Ateneo Blue (Primary) |
| `--citi-blue-light` | `#0073CF` | Light Blue |
| `--citi-blue-dark` | `#00508C` | Dark Blue |
| `--citi-red` | `#D9261C` | Citi Red |

---

## Component Class Mappings

### Layout Components

| Class | Element | Purpose |
|-------|---------|---------|
| `.dashboard` | `<div>` | Main container with max-width |
| `.dashboard-header` | `<header>` | Top navigation bar |
| `.dashboard-content` | `<main>` | Content area with flex column |
| `.header-left` | `<div>` | Left section of header |
| `.header-center` | `<div>` | Center section (navigation) |
| `.header-right` | `<div>` | Right section (theme toggle) |

### Metric Card

**File**: `src/apps/guardrails/components/MetricCard.tsx`

| Class | Element | Styles |
|-------|---------|--------|
| `.metric-card` | Container | Card with border, padding, hover effect |
| `.metric-card-content` | `<div>` | Flex column for text content |
| `.metric-card-label` | `<p>` | Uppercase label, 11px, secondary color |
| `.metric-card-value` | `<h3>` | Large bold number, 22px |
| `.metric-card-growth` | `<span>` | Growth percentage indicator |
| `.metric-card-growth-positive` | Modifier | Green color |
| `.metric-card-growth-negative` | Modifier | Red color |
| `.metric-card-icon` | `<div>` | Icon container with background |

### Data Table

**File**: `src/apps/guardrails/components/DataTable.tsx`

| Class | Element | Styles |
|-------|---------|--------|
| `.data-table` | Container | Card wrapper with overflow hidden |
| `.data-table-header` | `<div>` | Title section with border-bottom |
| `.data-table-title` | `<h3>` | 16px semibold title |
| `.data-table-content` | `<table>` | Full-width table |
| `.status-badge` | `<span>` | Pill-shaped status indicator |
| `.status-active` | Modifier | Green badge |
| `.status-scaling` | Modifier | Blue badge |
| `.status-review` | Modifier | Red badge |
| `.efficiency-bar` | `<div>` | Progress bar container |
| `.efficiency-bar-fill` | `<div>` | Progress bar fill (uses inline width) |

### Filter Bar

**File**: `src/apps/guardrails/components/FilterBar.tsx`

| Class | Element | Styles |
|-------|---------|--------|
| `.filter-bar` | Container | Flex row with card styling |
| `.filter-bar-left` | `<div>` | Title and timestamp |
| `.filter-bar-right` | `<div>` | Filter controls |
| `.filter-group` | `<div>` | Label + input wrapper |
| `.filter-label` | `<label>` | Uppercase label |
| `.filter-select` | `<select>` | Dropdown styling |
| `.filter-date` | `<input>` | Date input styling |
| `.filter-apply` | `<button>` | Apply button (disabled state) |
| `.filter-apply-dirty` | Modifier | Apply button (active/pulsing) |
| `.filter-reset` | `<button>` | Reset button |

### Pie Charts

**File**: `src/apps/guardrails/components/PieChart.tsx`

| Class | Element | Styles |
|-------|---------|--------|
| `.pie-chart` | Container | Flex column, centered |
| `.pie-chart-svg-container` | `<div>` | SVG wrapper, 72x72px |
| `.pie-chart-track` | `<circle>` | Background circle stroke |
| `.pie-chart-value` | `<span>` | Centered percentage text |
| `.pie-chart-label` | `<span>` | Category label below chart |

### Charts (ECharts)

**File**: `src/apps/guardrails/components/EChartsChart.tsx`

| Class | Element | Styles |
|-------|---------|--------|
| `.chart` | Container | Card with flex column |
| `.chart-header` | `<div>` | Icon + title row |
| `.chart-icon` | `<div>` | Icon background container |
| `.chart-titles` | `<div>` | Title + subtitle wrapper |
| `.chart-title` | `<h4>` | Chart title |
| `.chart-subtitle` | `<p>` | Chart description |
| `.chart-content` | `<div>` | Chart area container |
| `.echarts-container` | `<div>` | ECharts mount point |
| `.echarts-loading` | `<div>` | Loading state container |
| `.echarts-loading-spinner` | `<div>` | Spinning loader |

### Alerts/Toasts

**File**: `src/apps/guardrails/components/AlertContainer.tsx`

| Class | Element | Styles |
|-------|---------|--------|
| `.alert-container` | Container | Fixed position, top-right |
| `.alert` | `<div>` | Alert card with slide-in animation |
| `.alert-success` | Modifier | Green left border |
| `.alert-error` | Modifier | Red left border |
| `.alert-warning` | Modifier | Orange left border |
| `.alert-info` | Modifier | Blue left border |
| `.alert-icon` | `<span>` | Icon wrapper |
| `.alert-message` | `<span>` | Message text |
| `.alert-dismiss` | `<button>` | Close button |

### Skeletons

**File**: `src/apps/guardrails/components/Skeletons.tsx`

| Class | Element | Styles |
|-------|---------|--------|
| `.skeleton` | Modifier | Disables pointer events |
| `.skeleton-text` | `<div>` | Text placeholder with pulse |
| `.skeleton-text-sm` | Modifier | 60% width |
| `.skeleton-text-md` | Modifier | 80% width |
| `.skeleton-text-lg` | Modifier | 50% width, taller |
| `.skeleton-icon` | `<div>` | 40x40px icon placeholder |
| `.skeleton-circle` | `<div>` | 80x80px circle placeholder |
| `.skeleton-chart-area` | `<div>` | Chart area placeholder |

### Grid System

| Class | Spans |
|-------|-------|
| `.grid` | 12-column grid container |
| `.col-1` to `.col-12` | Column span utilities |
| `.row-2`, `.row-3` | Row span utilities |
| `.md-col-6`, `.md-col-12` | Tablet breakpoint (992px) |
| `.sm-col-6`, `.sm-col-12` | Small tablet (768px) |
| `.xs-col-12` | Phone breakpoint (576px) |

### Navigation

| Class | Element | Styles |
|-------|---------|--------|
| `.app-switcher` | Container | Relative positioned dropdown |
| `.app-switcher-trigger` | `<button>` | Dropdown toggle |
| `.app-switcher-dropdown` | `<ul>` | Dropdown menu |
| `.app-switcher-option` | `<a>` | Menu item |
| `.app-navigation` | `<nav>` | Navigation links container |
| `.app-nav-link` | `<a>` | Navigation link |
| `.app-nav-link.active` | Modifier | Active state with accent bg |
| `.theme-toggle` | `<button>` | Theme switch button |

---

## Migration Steps

### Step 1: Create Token Mapping

Create a file that maps your library's tokens to the current CSS variables:

```ts
// src/styles/tokens.ts (example)
export const tokens = {
  spacing: {
    md: '16px',    // was --gap
    lg: '24px',    // was --gap-lg
  },
  radius: {
    sm: '4px',     // was --border-radius
  },
  colors: {
    bgPage: '#F7F7F7',
    bgCard: '#ffffff',
    // ... etc
  }
}
```

### Step 2: Replace CSS Import

In `src/routes/__root.tsx`, replace:

```tsx
// Before
import '@/App.css'

// After
import { initializeStyles } from 'your-internal-library'
initializeStyles({ theme: 'light' })
```

### Step 3: Update Components

**Option A: Class Name Mapping**

Create a mapping utility:

```ts
// src/styles/classMap.ts
export const cx = {
  'metric-card': 'your-lib-card your-lib-card--metric',
  'metric-card-label': 'your-lib-text your-lib-text--label',
  // ...
}
```

**Option B: Wrapper Components**

Create library-based wrappers:

```tsx
// src/components/Card.tsx
import { Card as LibCard } from 'your-internal-library'

export const MetricCard = ({ label, value, growth, icon }) => (
  <LibCard variant="metric">
    <LibCard.Content>
      <LibCard.Label>{label}</LibCard.Label>
      <LibCard.Value>{value}</LibCard.Value>
      <LibCard.Growth positive={growth >= 0}>{growth}%</LibCard.Growth>
    </LibCard.Content>
    <LibCard.Icon>{icon}</LibCard.Icon>
  </LibCard>
)
```

### Step 4: Migrate Theme System

Update the theme toggle to work with your library:

```tsx
// src/shared/store/useUIStore.ts
import { setTheme } from 'your-internal-library'

export const useUIStore = create((set) => ({
  theme: 'light',
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)  // Your library's theme setter
    return { theme: newTheme }
  }),
}))
```

### Step 5: Update ECharts Theme

ECharts has its own theming at `src/shared/charts/themes/citiTheme.ts`. Sync colors:

```ts
// Ensure ECharts theme uses same tokens as your library
import { tokens } from 'your-internal-library'

export const CITI_COLORS = {
  primary: tokens.colors.brand.primary,
  // ...
}
```

---

## Responsive Breakpoints

| Breakpoint | Width | Current Changes |
|------------|-------|-----------------|
| Large Desktop | > 1200px | Default values |
| Small Desktop | ≤ 1200px | metrics: 3 cols |
| Tablet | ≤ 992px | distribution: 3 cols, charts: 2 cols |
| Large Phone | ≤ 768px | metrics: 2 cols, charts: 1 col |
| Phone | ≤ 576px | metrics: 1 col, reduced gap/padding |
| Small Phone | ≤ 480px | Alerts go full-width |

### Responsive Classes Used

```css
/* Grid responsive utilities */
.md-col-6   /* 992px */
.md-col-12  /* 992px */
.sm-col-6   /* 768px */
.sm-col-12  /* 768px */
.xs-col-12  /* 576px */
```

---

## Animations

### Skeleton Pulse

```css
@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
/* Duration: 1.5s, ease-in-out, infinite */
```

### Alert Slide (Enter/Exit)

```css
/* Transition-based animation with spring easing */
.alert {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
              opacity 0.3s ease;
}

.alert-enter {
  opacity: 0;
  transform: translateX(120%) scale(0.9);
}

.alert-visible {
  opacity: 1;
  transform: translateX(0) scale(1);
}

.alert-exit {
  opacity: 0;
  transform: translateX(120%) scale(0.9);
}
```

The AlertContainer component manages enter/exit states via React state, waiting 300ms for the exit animation before removing elements from the DOM.

### Filter Button Pulse

```css
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
  50% { box-shadow: 0 0 0 6px rgba(59, 130, 246, 0); }
}
/* Duration: 1.5s, ease-in-out, infinite */
```

### ECharts Spinner

```css
@keyframes echarts-spin {
  to { transform: rotate(360deg); }
}
/* Duration: 0.8s, linear, infinite */
```

---

## Special Cases

### Inline Styles

These components use inline styles for dynamic values:

1. **Efficiency Bar** (`DataTable.tsx:39`)
   ```tsx
   style={{ width: `${row.efficiency}%` }}
   ```

2. **Chart Bars** (`Chart.tsx`)
   ```tsx
   style={{ height: `${(value / maxValue) * 100}%` }}
   ```

3. **SVG Pie Chart** (`PieChart.tsx`)
   ```tsx
   style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
   ```

Your library will need to support inline style injection or provide utilities for dynamic values.

### ECharts Integration

ECharts uses JavaScript-based theming separate from CSS. The theme is defined in:

- `src/shared/charts/themes/citiTheme.ts`

This exports `citiLightTheme` and `citiDarkTheme` objects that are passed to ECharts. You'll need to keep this in sync with your library's color tokens.

### SVG Styling

The PieChart component uses SVG elements with CSS classes:

```tsx
<circle className="pie-chart-track" />  // Stroke color from CSS
<circle style={{ stroke: color }} />    // Dynamic stroke from JS
```

---

## File Reference

### Files to Modify

| File | Action |
|------|--------|
| `src/routes/__root.tsx` | Replace CSS import with library init |
| `src/App.css` | Delete after migration complete |
| `src/shared/store/useUIStore.ts` | Update theme toggle for library |
| `src/shared/charts/themes/citiTheme.ts` | Sync colors with library tokens |

### Components to Update

| Component | Path | Complexity |
|-----------|------|------------|
| MetricCard | `src/apps/guardrails/components/MetricCard.tsx` | Low |
| DataTable | `src/apps/guardrails/components/DataTable.tsx` | Medium |
| FilterBar | `src/apps/guardrails/components/FilterBar.tsx` | Medium |
| PieChart | `src/apps/guardrails/components/PieChart.tsx` | Low |
| EChartsChart | `src/apps/guardrails/components/EChartsChart.tsx` | Low |
| EChartsPieChart | `src/apps/guardrails/components/EChartsPieChart.tsx` | Low |
| Chart | `src/apps/guardrails/components/Chart.tsx` | Low |
| Skeletons | `src/apps/guardrails/components/Skeletons.tsx` | Low |
| AlertContainer | `src/apps/guardrails/components/AlertContainer.tsx` | Medium |
| AppSwitcher | `src/shared/components/AppSwitcher.tsx` | Medium |
| AppNavigation | `src/shared/components/AppNavigation.tsx` | Low |

### Pages to Update

| Page | Path |
|------|------|
| Dashboard | `src/apps/guardrails/pages/Dashboard.tsx` |
| Settings | `src/apps/guardrails/pages/Settings.tsx` |

---

## Summary

The codebase is well-prepared for migration:

- **Centralized styling** - Single CSS file, one import
- **Token-based** - CSS variables already define the design system
- **Semantic classes** - BEM-like naming maps cleanly to components
- **Theme-ready** - Light/dark switching infrastructure exists
- **Minimal inline styles** - Only used for truly dynamic values

Estimated effort: 11 components + 2 pages + 3 shared components = **16 files** to update

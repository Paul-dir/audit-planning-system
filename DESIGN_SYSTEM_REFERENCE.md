# Design System Quick Reference

## Color Palette

### Primary Colors
```
Primary Blue:    #2563EB (rgb(37, 99, 235))
Success Green:   #10B981 (rgb(16, 185, 129))
Warning Amber:   #F59E0B (rgb(245, 158, 11))
Danger Red:      #EF4444 (rgb(239, 68, 68))
Gold Approval:   #D4A017 (rgb(212, 160, 23))
```

### Neutral Scale
```
50:   #F8FAFC
100:  #F1F5F9
200:  #E2E8F0  (borders in light mode)
300:  #CBD5E1
400:  #94A3B8
500:  #64748B
600:  #475569
700:  #334155
800:  #1E293B  (cards in dark mode)
900:  #0F172A  (main background dark mode)
950:  #020617  (sidebar darkest)
```

## Component Usage Guide

### Buttons

**Primary Action**
```jsx
<Button variant="primary" size="md">
  Save Changes
</Button>
```

**Secondary Action**
```jsx
<Button variant="secondary" size="md">
  Cancel
</Button>
```

**Dangerous Action**
```jsx
<Button variant="danger" size="sm">
  Delete
</Button>
```

**Approval/Gold**
```jsx
<Button variant="gold" size="lg">
  Approve Plan
</Button>
```

### Status Badges

**Draft** (Gray)
```jsx
<Badge status="Draft" variant="draft" />
```

**Approved** (Green)
```jsx
<Badge status="Approved" variant="approved" />
```

**Pending** (Amber)
```jsx
<Badge status="Pending" variant="pending" />
```

**Rejected** (Red)
```jsx
<Badge status="Rejected" variant="rejected" />
```

### Cards

**Standard Card**
```jsx
<Card title="Total Cases" number="124" icon="fas fa-briefcase" />
```

**Card with Accent Border**
```jsx
<Card 
  title="Approved Plans" 
  number="45" 
  accent="success"
  icon="fas fa-check-circle"
/>
```

**Interactive Card**
```jsx
<Card variant="interactive" className="cursor-pointer">
  <p>Click me for more details</p>
</Card>
```

### Form Inputs

**Text Input**
```jsx
<FormInput
  label="Plan Name"
  type="text"
  placeholder="Enter name"
  required
/>
```

**With Error**
```jsx
<FormInput
  label="Email"
  type="email"
  error="Invalid email format"
/>
```

**With Helper Text**
```jsx
<FormInput
  label="Description"
  type="textarea"
  helperText="Max 500 characters"
  rows={4}
/>
```

## Tailwind Classes Quick Reference

### Colors
```
Text:           text-neutral-900, text-neutral-50 (dark)
Background:     bg-white, bg-neutral-800 (dark)
Borders:        border-neutral-200, border-neutral-700 (dark)
Primary:        bg-primary-600, hover:bg-primary-700
Success:        text-success-600, bg-success-100
Warning:        text-warning-600, bg-warning-100
Danger:         text-danger-600, bg-danger-100
```

### Spacing
```
Padding:        p-4, px-6, py-2
Margin:         m-4, mx-auto, mb-6
Gap:            gap-4, gap-x-2, gap-y-4
```

### Sizing
```
Width:          w-full, w-1/2, w-32
Height:         h-screen, h-12, h-auto
Max:            max-w-2xl, max-h-[90vh]
```

### Borders & Radius
```
Border:         border, border-2, border-t
Radius:         rounded-lg, rounded-full, rounded-xl
Shadow:         shadow-sm, shadow-md, shadow-lg
```

### Responsive
```
Mobile:         block sm:hidden
Tablet up:      hidden md:block
Desktop up:     hidden lg:flex
Specific:       w-full md:w-1/2 lg:w-1/3
Grid:           grid-cols-1 md:grid-cols-2 lg:grid-cols-3
```

### Dark Mode
```
All colors:     bg-white dark:bg-neutral-800
                text-neutral-900 dark:text-neutral-50
                border-neutral-200 dark:border-neutral-700
```

## Typography

### Font Selection
- Body text: `font-sans` (Inter)
- Headings: `font-serif` (Fraunces)

### Font Sizes
- Extra Small: `text-xs` (12px)
- Small: `text-sm` (13px)
- Base: `text-base` (14px)
- Large: `text-lg` (15px)
- XL: `text-xl` (16px)
- 2XL: `text-2xl` (18px)
- 3XL: `text-3xl` (24px)
- 4XL: `text-4xl` (32px)

### Font Weights
- Normal: `font-normal`
- Medium: `font-medium`
- Semibold: `font-semibold`
- Bold: `font-bold`

## Spacing Units

| Scale | Value | Use Case |
|-------|-------|----------|
| xs | 4px | Tiny gaps, icon spacing |
| sm | 8px | Default component gaps |
| md | 12px | Standard padding |
| lg | 16px | Section padding |
| xl | 24px | Large padding |
| 2xl | 32px | Container padding |
| 3xl | 48px | Section margins |
| 4xl | 64px | Page margins |

## Common Patterns

### Page Layout
```jsx
<div className="flex h-screen bg-neutral-50 dark:bg-neutral-900">
  <Sidebar />
  <div className="flex-1 flex flex-col">
    <TopBar />
    <main className="flex-1 overflow-y-auto p-8">
      {/* Content */}
    </main>
  </div>
</div>
```

### Card Grid
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <Card />
  <Card />
  <Card />
  <Card />
</div>
```

### Table
```jsx
<div className="table-container">
  <table className="table">
    <thead>
      <tr>
        <th>Header</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Data</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Modal
```jsx
<div className="modal-overlay">
  <div className="modal">
    <div className="modal-header">
      <h2 className="modal-title">Title</h2>
    </div>
    <div className="modal-body">
      {/* Content */}
    </div>
    <div className="modal-footer">
      <Button variant="secondary">Cancel</Button>
      <Button variant="primary">Confirm</Button>
    </div>
  </div>
</div>
```

## Accessibility Guidelines

### Focus States
Always include focus rings:
```jsx
focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
```

### Color Contrast
- Text on light background: #0F172A (contrast 19:1)
- Text on dark background: #F8FAFC (contrast 19:1)
- Minimum contrast ratio: 4.5:1 (WCAG AA)

### Interactive Elements
- Minimum size: 44px × 44px (touch targets)
- Visual feedback on hover, focus, active
- Keyboard navigation support

### Semantic HTML
```jsx
<button type="button">Action</button>
<label htmlFor="input">Label</label>
<input id="input" />
<h1>Page Title</h1>
<h2>Section Title</h2>
```

## Dark Mode Implementation

### Enable Dark Mode
```jsx
// In HTML element
html.dark {
  // Dark mode styles applied
}
```

### CSS Variables (in src/main.css)
```css
:root {
  --background: #F8FAFC;
  --text-primary: #0F172A;
}

html.dark {
  --background: #0F172A;
  --text-primary: #F8FAFC;
}
```

### Tailwind Dark Prefix
```jsx
className="
  bg-white dark:bg-neutral-800
  text-neutral-900 dark:text-neutral-50
"
```

## Animation Timing

- Fast: 150ms (button hover, state change)
- Standard: 200ms (transitions, fades)
- Slow: 300ms (modal enter, navigation)
- Slower: 500ms (long animations)

```jsx
transition-fast: transition-all duration-150
transition-base: transition-all duration-200
transition-slow: transition-all duration-300
```

## Common Color Combinations

### Light Mode
```
Primary Action:     bg-primary-600 hover:bg-primary-700 text-white
Secondary Action:   bg-neutral-100 hover:bg-neutral-200 text-neutral-900
Danger Action:      bg-danger-600 hover:bg-danger-700 text-white
Info Badge:         bg-info-100 text-info-700
Success Badge:      bg-success-100 text-success-700
Warning Badge:      bg-warning-100 text-warning-700
Borders:            border-neutral-200
```

### Dark Mode
```
Primary Action:     bg-primary-600 dark:bg-primary-600 text-white
Secondary Action:   bg-neutral-700 dark:bg-neutral-700 text-neutral-50
Danger Action:      bg-danger-600 dark:bg-danger-600 text-white
Info Badge:         bg-info-900/30 dark:bg-info-900/30 text-info-300
Success Badge:      bg-success-900/30 dark:bg-success-900/30 text-success-300
Warning Badge:      bg-warning-900/30 dark:bg-warning-900/30 text-warning-300
Borders:            border-neutral-700 dark:border-neutral-700
```

## Responsive Grid Examples

### 2-Column
```jsx
grid grid-cols-1 md:grid-cols-2 gap-6
```

### 3-Column
```jsx
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
```

### 4-Column
```jsx
grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6
```

### Auto-fit
```jsx
grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6
```

## File Locations

- **Color Config**: `tailwind.config.js` (extends colors)
- **Utilities**: `src/main.css` (@layer components, @layer utilities)
- **Components**: `src/components/*.jsx`
- **Layouts**: `src/components/layouts/`
- **Dashboards**: `src/components/dashboards/`
- **Modals**: `src/components/modals/`
- **Views**: `src/components/views/`

---

**Last Updated:** July 25, 2026  
**Version:** 1.0.0

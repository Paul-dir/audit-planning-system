# Design Template Pattern - Apply Exactly to All Pages

**Purpose:** This document defines the EXACT design pattern used in AuditPlanningView that must be applied to all other pages/views.

**IMPORTANT:** Only the CONTENT changes between pages. The DESIGN (colors, spacing, layout, typography, borders) remains identical.

---

## 1. PAGE WRAPPER (Outermost Container)

```jsx
<div className="space-y-6 p-8 bg-neutral-900 min-h-screen">
  {/* All page content goes here */}
</div>
```

**CSS Breakdown:**
- `space-y-6` - Vertical spacing between sections (24px gaps)
- `p-8` - Padding around entire page (32px)
- `bg-neutral-900` - Dark background (#0F172A)
- `min-h-screen` - Minimum full viewport height

---

## 2. PAGE HEADER SECTION (Title with Blue Accent)

```jsx
<div>
  <div className="flex items-center gap-3 mb-2">
    <div className="w-1 h-8 bg-primary-600 rounded-sm"></div>
    <h1 className="text-3xl font-serif font-bold text-neutral-50">Page Title</h1>
  </div>
  <p className="text-neutral-400 text-sm">Subtitle or description text</p>
</div>
```

**CSS Breakdown:**
- `flex items-center gap-3` - Horizontal flex layout with 12px gap
- `w-1 h-8` - Accent bar (4px wide, 32px tall)
- `bg-primary-600` - Blue color (#2563EB)
- `rounded-sm` - Small rounded corners (6px)
- `text-3xl font-serif font-bold` - Large serif title
- `text-neutral-50` - Bright white text
- `text-neutral-400 text-sm` - Muted gray subtitle

**Design Rules:**
- Always use primary-600 blue for the accent bar
- Always use serif font for page title
- Always use text-neutral-400 for subtitle
- The accent bar is always 4px × 32px

---

## 3. KPI METRIC CARDS GRID

### Grid Container
```jsx
<div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-7">
  {/* 7 metric cards go here */}
</div>
```

**CSS Breakdown:**
- `grid grid-cols-1` - Single column on mobile
- `gap-4` - 16px gap between cards
- `md:grid-cols-3` - 3 columns on tablet (640px+)
- `lg:grid-cols-7` - 7 columns on desktop (1024px+)

### Individual Metric Card Template

```jsx
<div className="bg-neutral-800 border border-neutral-700 border-l-4 border-l-[COLOR]-600 rounded-lg p-6 shadow-sm transition-all duration-200 hover:shadow-md">
  <h3 className="text-xs uppercase font-semibold tracking-wider text-neutral-400 mb-2">
    Metric Title
  </h3>
  <div className="text-4xl font-bold leading-none mb-2 text-neutral-50">
    {metricValue}
  </div>
  <div className="text-2xl text-neutral-400 opacity-75">
    <i className="fas fa-[ICON]"></i>
  </div>
</div>
```

**CSS Breakdown:**
- `bg-neutral-800` - Card background (#1E293B)
- `border border-neutral-700` - Gray border (#334155)
- `border-l-4 border-l-[COLOR]-600` - Colored left border (4px)
- `rounded-lg` - Medium rounded corners (12px)
- `p-6` - Internal padding (24px)
- `shadow-sm` - Subtle shadow
- `transition-all duration-200` - Smooth animations
- `hover:shadow-md` - Elevated on hover
- `text-xs uppercase tracking-wider` - Small uppercase label
- `text-neutral-400` - Muted gray text
- `mb-2` - Bottom margin (8px)
- `text-4xl font-bold leading-none` - Large metric number
- `text-neutral-50` - Bright white number
- `text-2xl text-neutral-400 opacity-75` - Icon styling

**Color Options for border-l-[COLOR]-600:**
- `border-l-primary-600` - Blue (#2563EB)
- `border-l-info-600` - Light blue (#3B82F6)
- `border-l-success-600` - Green (#10B981)
- `border-l-warning-600` - Amber (#F59E0B)
- `border-l-danger-600` - Red (#F87171)

**Important Notes:**
- Each card MUST have a colored left border
- Use semantic colors (primary, success, warning, etc.) based on card meaning
- Icons are always Font Awesome (fas fa-...)
- Metrics are always right-aligned in the card
- Title is always UPPERCASE and SMALL

---

## 4. SECTION HEADER (Title with Accent Bar)

```jsx
<div className="pt-4">
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
      <div className="w-1 h-6 bg-primary-600 rounded-sm"></div>
      <div>
        <h2 className="text-2xl font-serif font-bold text-neutral-50">
          Section Title
        </h2>
        <p className="text-neutral-400 text-sm mt-1">
          {count} items
        </p>
      </div>
    </div>
    <Button 
      variant="primary" 
      size="lg"
      onClick={() => handleCreate()}
    >
      <i className="fas fa-plus-circle mr-2"></i>
      Create New
    </Button>
  </div>
</div>
```

**CSS Breakdown:**
- `pt-4` - Top padding (16px)
- `flex items-center justify-between` - Space between left/right
- `mb-4` - Bottom margin (16px)
- `w-1 h-6` - Accent bar (4px × 24px)
- `text-2xl font-serif` - Large serif heading
- `text-neutral-50` - Bright white
- `text-neutral-400 text-sm mt-1` - Muted subtitle

**Design Rules:**
- Always use serif font for section titles
- Always have an accent bar on the left
- Always align left text and right button
- Always use text-neutral-50 for title
- Always use text-neutral-400 for subtitle

---

## 5. DATA TABLE

```jsx
<div className="bg-neutral-800 border border-neutral-700 rounded-lg overflow-hidden shadow-sm">
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="bg-neutral-800 border-b border-neutral-700">
          <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-300 uppercase tracking-wider">
            Column Header
          </th>
          <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-300 uppercase tracking-wider">
            Numeric Column
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-neutral-700">
        <tr className="hover:bg-neutral-700/50 transition-colors">
          <td className="px-6 py-4 text-sm text-neutral-50">Data</td>
          <td className="px-6 py-4 text-sm text-right text-neutral-300">Value</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

**CSS Breakdown:**
- `bg-neutral-800` - Container background
- `border border-neutral-700` - Gray border
- `rounded-lg overflow-hidden` - Rounded corners with contained overflow
- `shadow-sm` - Subtle shadow
- `overflow-x-auto` - Horizontal scroll on mobile
- `bg-neutral-800 border-b border-neutral-700` - Header styling
- `px-6 py-4` - Cell padding (24px × 16px)
- `text-left` / `text-right` - Alignment (left for text, right for numbers)
- `text-xs uppercase tracking-wider` - Small uppercase headers
- `text-neutral-300` - Light gray header text
- `divide-y divide-neutral-700` - Row dividers
- `hover:bg-neutral-700/50` - Hover effect (50% opacity)
- `transition-colors` - Smooth hover animation
- `text-neutral-50` - Body text (bright white)
- `text-neutral-300` - Secondary body text

**Design Rules:**
- Headers are ALWAYS uppercase and small (text-xs)
- Headers are ALWAYS light gray (text-neutral-300)
- Rows have hover effect with semi-transparent background
- Text alignment: LEFT for text/names, RIGHT for numbers/percentages
- Use divide-y for row separation (not individual borders)
- Container has subtle shadow (shadow-sm)

---

## 6. EMPTY STATE

```jsx
<tr>
  <td colSpan="8" className="px-6 py-12 text-center">
    <div className="flex flex-col items-center justify-center">
      <i className="fas fa-inbox text-4xl text-neutral-600 mb-4"></i>
      <p className="text-neutral-400 text-lg">
        No items found. Create your first item to get started.
      </p>
    </div>
  </td>
</tr>
```

**CSS Breakdown:**
- `py-12` - Vertical padding (48px for spacious feel)
- `text-center` - Centered text
- `flex flex-col items-center justify-center` - Centered layout
- `text-4xl text-neutral-600` - Large muted icon
- `mb-4` - Bottom margin
- `text-neutral-400 text-lg` - Muted message text

**Design Rules:**
- Large icon (text-4xl)
- Muted colors (neutral-600 for icon, neutral-400 for text)
- Centered and spacious layout
- Friendly, helpful message

---

## 7. ACCENT COLOR SYSTEM

### Color Mapping (Use Consistently)

```
PRIMARY (Blue)       #2563EB  → Primary actions, drafts, planning
  - border-l-primary-600
  
INFO (Light Blue)    #3B82F6  → Information, secondary metrics
  - border-l-info-600
  
SUCCESS (Green)      #10B981  → Approved, completed, finalized
  - border-l-success-600
  
WARNING (Amber)      #F59E0B  → Pending, in revision, warnings
  - border-l-warning-600
  
DANGER (Red)         #F87171  → Errors, rejections, critical
  - border-l-danger-600
```

### Use Cases

| Color | Use For |
|-------|---------|
| Primary (Blue) | Draft plans, primary actions, create buttons |
| Info (Light Blue) | Metrics, information, secondary actions |
| Success (Green) | Approved items, completed tasks, success states |
| Warning (Amber) | Pending items, warnings, caution states |
| Danger (Red) | Errors, rejections, critical alerts |

---

## 8. TYPOGRAPHY RULES

### Font Sizes
- **text-xs** (12px) - Small labels, headers
- **text-sm** (14px) - Body text, secondary
- **text-lg** (16px) - Larger text, important info
- **text-xl** (18px) - Section text
- **text-2xl** (20px) - Large headings
- **text-3xl** (24px) - Page titles
- **text-4xl** (32px) - Metric numbers

### Font Styles
- **serif** - Page titles, section headings, premium appearance
- **sans-serif** - Body text, labels, default
- **font-bold** - Titles, important numbers
- **font-semibold** - Headers, labels
- **font-normal** - Body text, default

### Text Colors
- **text-neutral-50** - Primary text (bright white) #F8FAFC
- **text-neutral-300** - Headers, secondary labels
- **text-neutral-400** - Subtitles, muted text
- **text-neutral-600** - Icons, very muted

### Letter Spacing
- **tracking-wider** - Headers, all-caps text (0.1em)
- **tracking-widest** - Extra emphasis (0.15em)
- **default** - Body text (0.05em)

---

## 9. SPACING SYSTEM

### Gaps & Margins
- **gap-3** - 12px (tight spacing)
- **gap-4** - 16px (standard)
- **gap-6** - 24px (comfortable)
- **mb-2** - 8px (tight)
- **mb-4** - 16px (standard)
- **mb-8** - 32px (section break)
- **p-6** - 24px padding
- **px-6** - 24px horizontal padding
- **py-4** - 16px vertical padding

### Padding
- **p-4** - 16px (small containers)
- **p-6** - 24px (standard)
- **p-8** - 32px (page wrapper)
- **px-6** - 24px (horizontal, tables)
- **py-4** - 16px (vertical, tables)

---

## 10. SHADOW & TRANSITIONS

### Shadows
- **shadow-sm** - Subtle, default for cards
- **shadow-md** - Medium, hover states
- **shadow-lg** - Large, elevated

### Transitions
- **transition-all** - All properties
- **transition-colors** - Color changes only
- **duration-200** - 200ms animations

### Hover Effects
- **hover:shadow-md** - Elevate on hover
- **hover:bg-neutral-700/50** - Background tint on hover

---

## 11. COMPONENT SIZES

### Buttons
```jsx
<Button 
  variant="primary"      // primary, secondary, tertiary, danger, success
  size="lg"              // sm, md, lg
  onClick={handleClick}
>
  <i className="fas fa-icon mr-2"></i>
  Button Text
</Button>
```

---

## 12. CHECKLIST FOR APPLYING PATTERN

When converting a page to use this pattern:

- [ ] Page wrapped in `<div className="space-y-6 p-8 bg-neutral-900 min-h-screen">`
- [ ] Page header with blue accent bar (w-1 h-8 bg-primary-600)
- [ ] Page title is serif font (font-serif)
- [ ] All KPI cards use the metric card template
- [ ] All KPI cards have colored left borders
- [ ] All KPI cards use appropriate semantic colors
- [ ] Grid is responsive (grid-cols-1 md:grid-cols-3 lg:grid-cols-7)
- [ ] Section headers have accent bars
- [ ] Tables have proper styling (bg-neutral-800, border-neutral-700)
- [ ] Table headers are uppercase and small (text-xs uppercase)
- [ ] Table rows have hover effects
- [ ] Empty states are centered and spacious
- [ ] All text colors follow the palette
- [ ] All spacing follows the system
- [ ] Icons are Font Awesome (fas fa-...)
- [ ] All transitions are smooth (transition-all duration-200)

---

## 13. DO's AND DON'Ts

### ✅ DO's
- Use the accent bar pattern for all page/section titles
- Use serif fonts for titles only
- Use metric cards for numeric KPI display
- Use colored left borders on cards
- Use semantic colors (primary, success, warning, etc.)
- Use hover effects on interactive elements
- Use proper text alignment (left for text, right for numbers)
- Use responsive grid classes (grid-cols-1 md:grid-cols-3 lg:grid-cols-7)
- Use spacing system values (gap-4, p-6, etc.)

### ❌ DON'Ts
- Don't use serif fonts for body text
- Don't use inline styles (always use Tailwind classes)
- Don't create new color combinations (use the defined palette)
- Don't forget null checks on numeric values (use || 0)
- Don't use different spacing values (stick to the system)
- Don't create custom cards (use the metric card template)
- Don't mix light and dark themes on the same page
- Don't use different border colors for cards (always use neutral-700)
- Don't forget responsive classes (always think mobile-first)

---

## 14. EXAMPLE: CONVERTING A PAGE

### Before (Generic Page)
```jsx
function MyPage() {
  return (
    <div>
      <h1>My Title</h1>
      <div>
        <div>Metric 1: {value1}</div>
        <div>Metric 2: {value2}</div>
      </div>
      <table>
        <tr><td>Data</td></tr>
      </table>
    </div>
  );
}
```

### After (Using Design Pattern)
```jsx
function MyPage() {
  return (
    <div className="space-y-6 p-8 bg-neutral-900 min-h-screen">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-primary-600 rounded-sm"></div>
          <h1 className="text-3xl font-serif font-bold text-neutral-50">My Title</h1>
        </div>
        <p className="text-neutral-400 text-sm">Description</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-7">
        <div className="bg-neutral-800 border border-neutral-700 border-l-4 border-l-primary-600 rounded-lg p-6 shadow-sm transition-all duration-200 hover:shadow-md">
          <h3 className="text-xs uppercase font-semibold tracking-wider text-neutral-400 mb-2">Metric 1</h3>
          <div className="text-4xl font-bold leading-none mb-2 text-neutral-50">{value1}</div>
          <div className="text-2xl text-neutral-400 opacity-75"><i className="fas fa-chart"></i></div>
        </div>
        <div className="bg-neutral-800 border border-neutral-700 border-l-4 border-l-success-600 rounded-lg p-6 shadow-sm transition-all duration-200 hover:shadow-md">
          <h3 className="text-xs uppercase font-semibold tracking-wider text-neutral-400 mb-2">Metric 2</h3>
          <div className="text-4xl font-bold leading-none mb-2 text-neutral-50">{value2}</div>
          <div className="text-2xl text-neutral-400 opacity-75"><i className="fas fa-check"></i></div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-800 border-b border-neutral-700">
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-300 uppercase tracking-wider">Column</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-700">
              <tr className="hover:bg-neutral-700/50 transition-colors">
                <td className="px-6 py-4 text-sm text-neutral-50">Data</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

---

## 15. QUICK REFERENCE

### Copy-Paste Templates

**Page Wrapper:**
```jsx
<div className="space-y-6 p-8 bg-neutral-900 min-h-screen">
```

**Page Header:**
```jsx
<div>
  <div className="flex items-center gap-3 mb-2">
    <div className="w-1 h-8 bg-primary-600 rounded-sm"></div>
    <h1 className="text-3xl font-serif font-bold text-neutral-50">Title</h1>
  </div>
  <p className="text-neutral-400 text-sm">Subtitle</p>
</div>
```

**Metric Card:**
```jsx
<div className="bg-neutral-800 border border-neutral-700 border-l-4 border-l-primary-600 rounded-lg p-6 shadow-sm transition-all duration-200 hover:shadow-md">
  <h3 className="text-xs uppercase font-semibold tracking-wider text-neutral-400 mb-2">Title</h3>
  <div className="text-4xl font-bold leading-none mb-2 text-neutral-50">{value}</div>
  <div className="text-2xl text-neutral-400 opacity-75"><i className="fas fa-icon"></i></div>
</div>
```

**Table:**
```jsx
<div className="bg-neutral-800 border border-neutral-700 rounded-lg overflow-hidden shadow-sm">
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="bg-neutral-800 border-b border-neutral-700">
          <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-300 uppercase tracking-wider">Header</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-neutral-700">
        <tr className="hover:bg-neutral-700/50 transition-colors">
          <td className="px-6 py-4 text-sm text-neutral-50">Data</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

---

## Summary

This is the EXACT template that MUST be used on every page:

1. **Dark background** (#0F172A) - bg-neutral-900
2. **Card backgrounds** (#1E293B) - bg-neutral-800
3. **Colored left borders** (4px) - border-l-4 border-l-[color]-600
4. **Serif titles** - font-serif font-bold text-3xl
5. **Bright white text** - text-neutral-50
6. **Muted headers** - text-neutral-300
7. **Accent bars** - w-1 h-8 bg-primary-600
8. **Responsive grids** - grid-cols-1 md:grid-cols-3 lg:grid-cols-7
9. **Hover effects** - hover:shadow-md, hover:bg-neutral-700/50
10. **Smooth transitions** - transition-all duration-200

**Only the content changes. The design stays exactly the same.**


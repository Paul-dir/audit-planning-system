# Tailwind CSS Conversion Patterns - Quick Reference

**Use this as a guide when converting components from inline styles to Tailwind utilities.**

---

## Pattern 1: Layout - Flexbox

### Before (Inline Styles)
```jsx
<div style={{ 
  display: 'flex', 
  gap: '12px', 
  alignItems: 'center',
  justifyContent: 'space-between'
}}>
  {/* content */}
</div>
```

### After (Tailwind)
```jsx
<div className="flex items-center justify-between gap-3">
  {/* content */}
</div>
```

### Common Flex Patterns
```jsx
// Vertical center
className="flex items-center"

// Horizontal space between
className="flex justify-between"

// Center both axes
className="flex items-center justify-center"
// OR use shortcut
className="flex-center"

// Column layout
className="flex flex-col"

// Column with gap
className="flex flex-col gap-4"

// Row with gap
className="flex gap-3"
```

---

## Pattern 2: Layout - Grid

### Before (Inline Styles)
```jsx
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '16px'
}}>
  {/* cards */}
</div>
```

### After (Tailwind)
```jsx
// Option 1: Fixed columns (recommended)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

// Option 2: Use custom utility
<div className="grid-auto">

// Option 3: Specific column count
<div className="grid grid-cols-3 gap-4">
```

### Grid Patterns by Column Count
```jsx
// 1 column on mobile, 2 on tablet
className="grid grid-cols-1 md:grid-cols-2 gap-4"

// 1-2-3 responsive
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"

// 1-2-3-4 responsive (auto-fit)
className="grid-auto"

// Use shortcut utilities
className="grid-2"  // 2 columns responsive
className="grid-3"  // 3 columns responsive
```

---

## Pattern 3: Cards

### Before (Inline Styles)
```jsx
<div style={{
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
  padding: '24px',
  boxShadow: 'var(--shadow-sm)'
}}>
```

### After (Tailwind)
```jsx
// Use the card utility
<div className="card-base">

// With hover effect
<div className="card-base card-hover">

// Custom if needed
<div className="bg-card border border-border rounded-lg p-6 shadow-sm">
```

---

## Pattern 4: Spacing & Padding

### Before (Inline Styles)
```jsx
style={{ 
  padding: '24px 32px',
  margin: '0 0 16px 0'
}}

style={{ 
  padding: '16px'
}}

style={{ 
  gap: '12px'
}}
```

### After (Tailwind)

**Padding** (p = padding)
```jsx
className="p-6"         // 24px all sides
className="px-8 py-6"   // 32px horizontal, 24px vertical
className="pt-4 pb-2"   // 16px top, 8px bottom
className="px-4"        // 16px horizontal
className="py-3"        // 12px vertical
```

**Margin** (m = margin)
```jsx
className="mb-4"        // 16px bottom margin
className="mt-6"        // 24px top margin
className="mx-auto"     // center horizontally
className="ml-2"        // 8px left margin
```

**Gap** (spacing between flex/grid items)
```jsx
className="gap-3"       // 12px gap
className="gap-4"       // 16px gap
className="gap-6"       // 24px gap
```

### Spacing Scale Reference
```
xs   = 4px   → space-1 / p-1
sm   = 8px   → space-2 / p-2
md   = 12px  → space-3 / p-3
lg   = 16px  → space-4 / p-4
xl   = 24px  → space-6 / p-6
2xl  = 32px  → space-8 / p-8
```

---

## Pattern 5: Text Styling

### Before (Inline Styles)
```jsx
style={{
  color: 'var(--text-primary)',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '1.5'
}}
```

### After (Tailwind)
```jsx
// Text color
className="text-text-primary"       // primary text
className="text-text-mid"           // secondary text
className="text-gray-400"           // light text

// Font size
className="text-xs"                 // 11.5px
className="text-sm"                 // 12.5px
className="text-base"               // 13.5px
className="text-lg"                 // 14.5px
className="text-xl"                 // 16px
className="text-2xl"                // 19px
className="text-4xl"                // 29px

// Font weight
className="font-medium"             // 500
className="font-semibold"           // 600
className="font-bold"               // 700

// Line height (built-in to font sizes)
className="leading-tight"           // 1.15
className="leading-snug"            // 1.375
className="leading-normal"          // 1.5
```

---

## Pattern 6: Colors

### Before (Inline Styles)
```jsx
style={{
  color: 'var(--primary)',
  background: 'var(--card)',
  borderColor: 'var(--border)',
  fill: '#C9A356'
}}
```

### After (Tailwind)

**Text Colors**
```jsx
className="text-text-primary"       // high contrast text
className="text-text-mid"           // medium contrast
className="text-gray-400"           // low contrast
className="text-gold"               // gold accent
className="text-teal"               // teal accent
className="text-coral"              // coral/danger
className="text-blue"               // blue accent
```

**Background Colors**
```jsx
className="bg-card"                 // card background
className="bg-panel"                // panel background
className="bg-gold"                 // gold background
className="bg-teal/20"              // teal with 20% opacity
className="bg-gray-50"              // light gray
```

**Border Colors**
```jsx
className="border border-border"    // 1px border with theme color
className="border border-gold"      // gold border
className="border-b border-divider" // bottom border only
```

### Design System Colors
```
ink, panel, border
text-hi, text-mid
gold, teal, coral, blue
success, warning, danger, info
```

---

## Pattern 7: Buttons

### Before (Inline Styles)
```jsx
<button style={{
  background: '#5B8FBF',
  color: 'white',
  padding: '12px 16px',
  border: 'none',
  borderRadius: '8px',
  fontWeight: '600',
  cursor: 'pointer',
  opacity: disabled ? 0.5 : 1
}}>
```

### After (Tailwind)
```jsx
// Use button utilities
<button className="btn-primary">
  Primary Button
</button>

<button className="btn-secondary">
  Secondary Button
</button>

<button className="btn-danger">
  Danger Button
</button>

// Or compose from utilities
<button className="px-4 py-2 bg-blue text-white rounded-md font-semibold hover:bg-blue/90 disabled:opacity-50">
  Custom Button
</button>
```

---

## Pattern 8: Hover & Focus States

### Before (Inline Styles)
```jsx
<div
  style={{ /* base styles */ }}
  onMouseEnter={(e) => {
    e.currentTarget.style.borderColor = 'var(--primary)';
    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.borderColor = 'var(--border)';
    e.currentTarget.style.background = 'transparent';
  }}
>
```

### After (Tailwind)
```jsx
// Hover styles (hover: prefix)
<div className="border border-border hover:border-primary hover:bg-blue-50 transition-all duration-200">

// Focus styles (focus: prefix)
<button className="focus:outline-none focus:ring-2 focus:ring-blue focus:ring-offset-2">

// Active/pressed (active: prefix)
<button className="active:scale-95">

// Dark mode variants (dark: prefix)
<div className="bg-white dark:bg-panel text-black dark:text-text-hi">

// Combined
<button className="hover:bg-blue/90 active:scale-95 focus:ring-2 focus:ring-blue/40 dark:hover:bg-blue-400">
```

---

## Pattern 9: Responsive Design

### Before (Inline Styles)
```jsx
// No easy responsive support - would use JS media queries
style={{
  display: 'grid',
  gridTemplateColumns: window.innerWidth > 1024 ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)'
}}
```

### After (Tailwind - Much Better!)
```jsx
// Mobile first - base class applies to all sizes
// Then add responsive prefixes (sm:, md:, lg:, xl:)

// 1 column on mobile, 2 on tablet, 3 on desktop, 4 on wide
className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"

// Responsive padding
className="px-4 sm:px-6 md:px-8 lg:px-12"

// Hidden on mobile, visible on tablet+
className="hidden md:block"

// Full width on mobile, constrained on desktop
className="w-full md:max-w-2xl mx-auto"

// Font size responsive
className="text-sm md:text-base lg:text-lg"
```

### Breakpoints
```
(no prefix) = 0px (mobile first)
sm:         = 640px
md:         = 768px
lg:         = 1024px
xl:         = 1280px
2xl:        = 1536px
```

---

## Pattern 10: Conditional Classes

### Before (Inline Styles)
```jsx
style={{
  color: status === 'approved' ? '#4fa893' : status === 'pending' ? '#c9a356' : '#d9724f'
}}
```

### After (Tailwind)
```jsx
// Use template literals or classnames utility
className={`
  ${status === 'approved' ? 'text-teal' : ''}
  ${status === 'pending' ? 'text-gold' : ''}
  ${status === 'rejected' ? 'text-coral' : ''}
`}

// Or use a ternary
className={status === 'approved' ? 'text-teal' : status === 'pending' ? 'text-gold' : 'text-coral'}

// Better: Extract to component or helper
const statusColorClass = {
  approved: 'text-teal',
  pending: 'text-gold',
  rejected: 'text-coral'
}
className={statusColorClass[status]}
```

---

## Pattern 11: Border & Dividers

### Before (Inline Styles)
```jsx
style={{
  border: '1px solid var(--border)',
  borderBottom: '2px solid var(--primary)'
}}
```

### After (Tailwind)
```jsx
// All borders
className="border border-border"

// Specific borders
className="border-t border-divider"         // top only
className="border-b-2 border-gold"          // bottom only, 2px
className="border-l border-teal"            // left only
className="border-r border-coral"           // right only

// Rounded corners
className="rounded-lg"                      // 14px
className="rounded-md"                      // 12px
className="rounded-sm"                      // 8px
className="rounded-full"                    // 9999px (circles/pills)

// Divider lines
className="divide-y divide-border"          // horizontal dividers between children
className="divide-x divide-border"          // vertical dividers between children
```

---

## Pattern 12: Shadows & Elevation

### Before (Inline Styles)
```jsx
style={{
  boxShadow: 'var(--shadow-lg)',
  boxShadow: '0 4px 8px rgba(0,0,0,0.08)'
}}
```

### After (Tailwind)
```jsx
className="shadow-sm"       // light shadow
className="shadow"          // medium shadow (default)
className="shadow-md"       // medium shadow
className="shadow-lg"       // large shadow
className="shadow-none"     // no shadow
className="hover:shadow-md" // shadow on hover
```

---

## Pattern 13: Opacity & Transparency

### Before (Inline Styles)
```jsx
style={{
  background: 'rgba(59, 130, 246, 0.1)',
  opacity: 0.5
}}
```

### After (Tailwind)
```jsx
// Background with opacity
className="bg-blue/10"          // 10% opacity
className="bg-blue/20"          // 20% opacity
className="bg-blue/50"          // 50% opacity
className="bg-blue/90"          // 90% opacity

// Text opacity
className="text-gray-600/75"

// Element opacity
className="opacity-50"
className="opacity-75"
className="opacity-100"
```

---

## Pattern 14: Transitions & Animations

### Before (Inline Styles)
```jsx
style={{
  transition: 'all 0.2s ease',
  cursor: disabled ? 'not-allowed' : 'pointer'
}}
```

### After (Tailwind)
```jsx
// Smooth transitions
className="transition-all duration-200"   // all properties, 200ms
className="transition-colors duration-300" // colors only, 300ms
className="transition-smooth"              // custom: all duration-200

// Animations
className="animate-spin"       // spinning loader
className="animate-pulse"      // pulsing effect

// Cursor states
className="cursor-pointer"     // pointer cursor
className="cursor-default"     // default cursor
className="cursor-not-allowed" // disabled cursor
className="cursor-wait"        // waiting cursor
```

---

## Pattern 15: Forms & Inputs

### Before (Inline Styles)
```jsx
<input
  type="text"
  style={{
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '13.5px',
    color: 'var(--text-primary)',
    background: 'var(--card)'
  }}
/>
```

### After (Tailwind)
```jsx
// Use form utility
<input type="text" className="form-input" />

// Or compose manually
<input 
  type="text"
  className="px-3 py-2 border border-border rounded-md text-text-primary bg-card focus:outline-none focus:ring-2 focus:ring-blue"
/>

// Label
<label className="form-label">Field Label</label>

// Form group (label + input)
<div className="form-group">
  <label className="form-label">Email</label>
  <input type="email" className="form-input" />
</div>
```

---

## Pattern 16: Badges & Pills

### Before (Inline Styles)
```jsx
<span style={{
  background: '#4fa893',
  color: '#EDEFF0',
  padding: '4px 12px',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: '600'
}}>
  Approved
</span>
```

### After (Tailwind)
```jsx
// Use badge utilities
<span className="badge-approved">Approved</span>
<span className="badge-pending">Pending</span>
<span className="badge-rejected">Rejected</span>
<span className="badge-info">Info</span>

// Or compose manually
<span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal/20 text-teal">
  Approved
</span>
```

---

## Pattern 17: Icons with Text

### Before (Inline Styles)
```jsx
<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  <i style={{ color: 'var(--gold)' }} className="fas fa-check" />
  <span>Approved</span>
</div>
```

### After (Tailwind)
```jsx
<div className="flex items-center gap-2">
  <i className="fas fa-check text-gold" />
  <span>Approved</span>
</div>

// Or use shortcut
<div className="flex items-center gap-2">
  <Icon name="check" className="text-gold" />
  <span>Approved</span>
</div>
```

---

## Quick Conversion Checklist

When converting a component:

- [ ] Replace all `display: flex` with `flex`
- [ ] Replace all `display: grid` with `grid`
- [ ] Replace all `gap:` with `gap-*`
- [ ] Replace all `padding:` with `p-*` (or `px-*`, `py-*`)
- [ ] Replace all `margin:` with `m-*` (or `mx-*`, `my-*`)
- [ ] Replace all `background:` with `bg-*`
- [ ] Replace all `color:` with `text-*`
- [ ] Replace all `border:` with `border` + `border-*`
- [ ] Replace all `borderRadius:` with `rounded-*`
- [ ] Replace all inline hover/focus handlers with `hover:*`, `focus:*` classes
- [ ] Add `transition-*` for smooth effects
- [ ] Add `dark:*` variants for dark mode colors
- [ ] Test responsive breakpoints with `sm:`, `md:`, `lg:`, `xl:`

---

## Common Mistakes to Avoid

❌ **Wrong**: `className="p-24"` (too much padding)  
✅ **Right**: `className="p-6"` (24px is correct)

❌ **Wrong**: `className="bg-primary"` (not defined)  
✅ **Right**: `className="bg-blue"` (from design system)

❌ **Wrong**: Forgetting `dark:` variants  
✅ **Right**: `className="bg-white dark:bg-panel text-black dark:text-text-hi"`

❌ **Wrong**: `className="w-full h-full"` everywhere (breaks things)  
✅ **Right**: Use specific widths/heights only when needed

❌ **Wrong**: `className="hidden"` without responsive prefix  
✅ **Right**: `className="hidden md:block"` (hide on mobile, show on tablet+)

---

**Ready to start converting!** Use these patterns as your reference guide. 🚀

# Phase 1: Base Components - Implementation Guide

**Phase**: Foundation & Base Components  
**Duration**: 2-3 hours  
**Status**: Ready to Start

---

## Overview

Phase 1 focuses on converting the simple, high-impact base components that are used throughout the application. These components have minimal logic and serve as building blocks for larger components.

**Goal**: Establish patterns and conventions that will be used in subsequent phases.

---

## Components to Migrate in Phase 1

### 1. Card.jsx ⭐ HIGHEST PRIORITY
**Current State**: Uses `.card` CSS class + inline styles  
**File**: `src/components/Card.jsx`  
**Lines**: ~28  
**Impact**: Used in every dashboard and many modals

**What to Convert**:
- Replace `.card` class with `card-base` utility (already defined in main.css)
- Any inline styles with Tailwind classes
- Ensure `children` render correctly

**Acceptance Criteria**:
- [ ] Component accepts className prop for customization
- [ ] Maintains all current props (children, title, etc.)
- [ ] Works with card-hover for interactive cards
- [ ] Dark mode switching works

---

### 2. Badge.jsx ⭐ HIGH PRIORITY
**Current State**: Uses `.badge` class with status variants  
**File**: `src/components/Badge.jsx`  
**Lines**: ~12  
**Impact**: Used for all status indicators

**What to Convert**:
- Replace `.badge` with badge utility classes:
  - `badge-approved` - Teal badges
  - `badge-pending` - Gold badges
  - `badge-rejected` - Coral badges
  - `badge-info` - Blue badges
  - `badge-draft` - Gray badges

**Acceptance Criteria**:
- [ ] All 5 badge variants render correctly
- [ ] Text and background colors correct in light mode
- [ ] Dark mode variants work (opacity adjustments)
- [ ] Component accepts status prop

---

### 3. Button Components 🔧 MEDIUM PRIORITY
**Current State**: Various button styles (`.btn`, `.btn-primary`, `.btn-outline`, etc.)  
**Files**: Multiple places (inline or in individual components)  
**Lines**: ~50 total across codebase

**What to Create**:
- Create a reusable Button.jsx component (if doesn't exist)
- Use button utilities from main.css:
  - `btn-primary` - Blue primary action
  - `btn-secondary` - Gray secondary action
  - `btn-danger` - Coral danger/delete action
  - `btn-outline` - Border-only button

**Acceptance Criteria**:
- [ ] Button component created (or updated)
- [ ] All 4 variants work correctly
- [ ] Hover and focus states visible
- [ ] Disabled state applies opacity and cursor
- [ ] Icon + text combinations work

**Example Usage**:
```jsx
<Button variant="primary" onClick={handleClick}>
  Create Plan
</Button>

<Button variant="danger" disabled>
  Delete
</Button>
```

---

### 4. ThemeToggle.jsx 🌓 MEDIUM PRIORITY
**Current State**: Theme toggle with inline styles and CSS variables  
**File**: `src/components/ThemeToggle.jsx`  
**Lines**: ~70

**What to Convert**:
- Replace inline styles with Tailwind classes
- Keep the `dark` class toggle logic (don't change)
- Keep localStorage persistence (don't change)
- Update button styling to use `btn-outline` or custom

**Current Logic to Preserve**:
```javascript
// Don't change this - it works perfectly
const toggleTheme = () => {
  const html = document.documentElement;
  if (html.classList.contains('dark')) {
    html.classList.remove('dark');
    html.classList.add('light');
    localStorage.setItem('theme', 'light');
  } else {
    html.classList.add('dark');
    html.classList.remove('light');
    localStorage.setItem('theme', 'dark');
  }
};
```

**What to Update**:
- Button styling
- Icon styling
- Container styling
- Use Tailwind classes instead of inline styles

**Acceptance Criteria**:
- [ ] Toggle button styled with Tailwind
- [ ] Dark mode still toggles correctly
- [ ] Theme persists in localStorage
- [ ] No visual regression
- [ ] Icons display correctly in both themes

---

### 5. Form Input Component 📝 MEDIUM PRIORITY
**Current State**: Form elements styled via `.form-group`, `.form-input` classes  
**Approach**: Create reusable FormInput.jsx if doesn't exist

**What to Create**:
```jsx
// src/components/FormInput.jsx
export default function FormInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  disabled,
  className
}) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`form-input ${error ? 'border-coral focus:ring-coral' : ''} ${className || ''}`}
      />
      {error && <p className="text-xs text-coral mt-1">{error}</p>}
    </div>
  );
}
```

**Acceptance Criteria**:
- [ ] Component accepts all standard input props
- [ ] Label renders when provided
- [ ] Error state shows coral border and text
- [ ] Placeholder text visible
- [ ] Focus ring shows correctly
- [ ] Works in dark mode

---

### 6. Status Indicators 🎯 LOW PRIORITY
**Current State**: Various status displays using colors  
**Approach**: Create reusable StatusBadge or update Badge.jsx

**What to Create**:
Component that displays:
- Status text
- Color indicator dot
- Optional tooltip

**Example**:
```jsx
<StatusIndicator status="approved" label="Approved" />
<StatusIndicator status="pending" label="Pending" />
<StatusIndicator status="rejected" label="Rejected" />
```

---

## Step-by-Step Implementation

### Step 1: Start with Card.jsx (10 minutes)

1. **Open** `src/components/Card.jsx`
2. **Check current structure** - look for `.card` class or inline styles
3. **Replace** with:
```jsx
export default function Card({ children, title, className = '', ...props }) {
  return (
    <div className={`card-base ${className}`} {...props}>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      {children}
    </div>
  );
}
```
4. **Test** in a dashboard to ensure cards render correctly
5. **Verify** dark mode switching works

---

### Step 2: Convert Badge.jsx (10 minutes)

1. **Open** `src/components/Badge.jsx`
2. **Look for** switch statement or conditional for status
3. **Replace with**:
```jsx
export default function Badge({ status, children }) {
  const badgeClasses = {
    approved: 'badge-approved',
    pending: 'badge-pending',
    rejected: 'badge-rejected',
    info: 'badge-info',
    draft: 'badge-draft'
  };
  
  return (
    <span className={badgeClasses[status] || 'badge-info'}>
      {children || status}
    </span>
  );
}
```
4. **Test** all variants in dashboard
5. **Verify** dark mode colors

---

### Step 3: Create Button Component (20 minutes)

1. **Create** `src/components/Button.jsx` (if doesn't exist)
2. **Implementation**:
```jsx
export default function Button({
  variant = 'primary',
  children,
  disabled = false,
  onClick,
  icon: Icon,
  className = '',
  ...props
}) {
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    outline: 'btn-outline'
  };
  
  return (
    <button
      className={`${variantClasses[variant]} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {Icon && <Icon className="inline mr-2" />}
      {children}
    </button>
  );
}
```
3. **Test** all variants
4. **Test** hover, focus, disabled states
5. **Update any existing button usage** to use new component

---

### Step 4: Update ThemeToggle.jsx (15 minutes)

1. **Open** `src/components/ThemeToggle.jsx`
2. **Keep** the JavaScript toggle logic (don't change)
3. **Replace** inline styles with Tailwind:

**Before**:
```jsx
<button style={{
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '8px 12px',
  cursor: 'pointer'
}}>
```

**After**:
```jsx
<button className="bg-card border border-divider rounded-md px-3 py-2 hover:border-gold transition-all duration-200">
```

4. **Test** toggle works (dark/light switching)
5. **Verify** theme persists on refresh

---

### Step 5: Create FormInput Component (20 minutes)

1. **Create** `src/components/FormInput.jsx`
2. **Copy template from Step 6 above**
3. **Test** in modals and forms
4. **Verify** error states display correctly

---

### Step 6: Visual Testing (15 minutes)

1. **Run dev server**: `npm run dev`
2. **Check each component** visually in the browser:
   - [ ] Card renders correctly in all dashboards
   - [ ] Badge colors match design system
   - [ ] Buttons have correct styling and hover states
   - [ ] Theme toggle works (click to switch themes)
   - [ ] Form inputs work in modals
3. **Compare to original** if visual changes noticed
4. **Test on mobile** if possible (check responsive)

---

## File-by-File Checklist

```
✓ Card.jsx
  - [ ] Replace .card class with card-base
  - [ ] Test in dashboard
  - [ ] Verify dark mode

✓ Badge.jsx
  - [ ] Use badge-* utilities
  - [ ] Test all 5 variants
  - [ ] Verify colors

✓ Button Component (create or update)
  - [ ] 4 variants working
  - [ ] Hover/focus states
  - [ ] Disabled state

✓ ThemeToggle.jsx
  - [ ] Replace inline styles
  - [ ] Test toggle functionality
  - [ ] Verify persistence

✓ FormInput.jsx (if creating)
  - [ ] All props supported
  - [ ] Error display
  - [ ] Focus states

✓ Testing
  - [ ] All components render
  - [ ] Dark mode switching works
  - [ ] No console errors
  - [ ] Visual looks correct
```

---

## Common Issues & Solutions

### Issue: Badge colors don't show in dark mode
**Solution**: Ensure `dark:` variants are in badge utility classes in `src/main.css`

### Issue: Button hover state doesn't work
**Solution**: Check that `hover:` prefix is in the button utility classes

### Issue: Theme toggle doesn't persist
**Solution**: Verify localStorage is enabled and ThemeToggle runs toggle code

### Issue: Card background doesn't change with theme
**Solution**: Ensure `card-base` utility uses CSS variables: `bg-card dark:bg-panel`

### Issue: Form input focus ring not visible
**Solution**: Check that focus-ring class is applied and `ring-*` utilities are present

---

## Commands During Phase 1

```bash
# Start development server
npm run dev

# Build to test
npm run build

# Check for console errors
# Open browser DevTools → Console tab
```

---

## Success Criteria for Phase 1

- [x] All base components converted to Tailwind
- [x] No visual regressions from original design
- [x] Dark mode switching works seamlessly
- [x] All components accessible via keyboard
- [x] No console warnings or errors
- [x] Build completes without issues
- [x] CSS bundle size acceptable (< 50KB gzipped)

---

## Next Steps After Phase 1

Once Phase 1 is complete:
1. ✅ Phase 1 Base Components (you are here)
2. → Phase 2: Layout Components (TopBar, Sidebar, RoleLayout)
3. → Phase 3: Dashboard Components (8 dashboards)
4. → Phase 4: Modal Components (11 modals)
5. → Phase 5: Testing & Polish

---

## Reference Materials

- **Conversion Patterns**: See `CONVERSION_PATTERNS.md` for inline-to-Tailwind mappings
- **Design System**: Colors and tokens in `tailwind.config.js`
- **Component Patterns**: Pre-defined utilities in `src/main.css` under `@layer components`
- **Setup Details**: See `SETUP_COMPLETE.md` for verification

---

**Ready to start Phase 1? Let's convert these base components!** 🚀

**Time estimate**: 2-3 hours  
**Impact**: High (these components are used everywhere)  
**Difficulty**: Low to Medium

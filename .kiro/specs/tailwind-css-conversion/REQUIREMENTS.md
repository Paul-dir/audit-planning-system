# Tailwind CSS Conversion - Requirements

**Feature**: Tailwind CSS Conversion for AP Cluster Frontend  
**Status**: Requirements Phase  
**Last Updated**: July 2026

---

## Executive Summary

Convert the entire AP Cluster Frontend project from a mixed styling approach (inline styles + CSS variables) to **Tailwind CSS utility-first framework**. The conversion maintains the existing dark/light theme system, implements a cohesive design system based on provided color palette, and improves maintainability across 8 dashboards, 11 modals, and 40+ specialized views.

**Design Reference**: Audit Planning Workspace (Tailwind mockup provided)
**Current State**: ~800 lines of CSS variables + 2000+ lines of inline styles across components
**Target State**: Tailwind utilities + minimal custom CSS

---

## Business Requirements

### BR-1: Maintain Visual Consistency
- All components must render identically to current state (pixel-perfect where possible)
- Dark mode toggle must work seamlessly with no visual artifacts
- Theme persistence via localStorage must continue working
- No cumulative layout shift (CLS) during theme transitions

### BR-2: Implement Design System Colors
The project must use the provided color palette:
- **Primary**: Gold (#C9A356) for accents and warnings
- **Success**: Teal (#4FA893) for approvals and success states
- **Danger**: Coral (#D9724F) for errors and rejections
- **Secondary**: Blue (#5B8FBF) for secondary actions
- **Backgrounds**: Ink (#0F1417), Panel (#161D22)
- **Borders**: #26313A
- **Text**: Text-Hi (#EDEFF0), Text-Mid (#9AA5AC)

### BR-3: Support All Current User Roles
All 8 role-based dashboards must function identically:
- Audit Team
- Audit Director
- Regional Director
- Tax Center Manager
- Cascade Audit Team
- Team Leader
- Auditor
- Senior Management

### BR-4: Preserve Component Functionality
- All modals, forms, and interactive elements must work identically
- No JavaScript behavior changes
- All existing features must remain functional
- Form submissions and validations unchanged

### BR-5: Improve Developer Experience
- Reduce codebase complexity (fewer inline styles)
- Standardize spacing and sizing
- Enable faster component development
- Reduce CSS file maintenance

### BR-6: Performance Requirements
- Bundle size <= 50KB gzipped (typical Tailwind CSS)
- Build time increase minimal (< 500ms additional)
- No runtime performance degradation
- Dark mode switching remains instant (< 100ms)

### BR-7: Responsive Design Compatibility
- Mobile-first approach (0px base)
- Tablet support (640px+)
- Desktop (1024px+)
- Ultra-wide (1280px+)
- No horizontal scrolling on any breakpoint

---

## Functional Requirements

### FR-1: Base Components Tailwind Implementation
**Components**: Card, Badge, Button variants, Input elements

**Acceptance Criteria**:
- [ ] Card component renders with correct padding, borders, shadows
- [ ] Badge displays all status variants (approved, pending, rejected, info)
- [ ] Button variants work (primary, secondary, danger, outline, small)
- [ ] Input/form elements styled consistently
- [ ] All components respond to dark mode changes

### FR-2: Layout Components Tailwind Implementation
**Components**: Sidebar, TopBar, RoleLayout

**Acceptance Criteria**:
- [ ] Sidebar renders with navigation items, user card, stats, footer
- [ ] TopBar displays title, user info, theme toggle, logout
- [ ] Layout responsive: sidebar collapses on mobile, visible on tablet+
- [ ] Navigation items highlight active state
- [ ] User info displays with avatar and role badge

### FR-3: Dashboard Components Tailwind Implementation
**Components**: All 8 role-based dashboards

**Acceptance Criteria**:
- [ ] AuditTeamDashboard renders metric cards, pipeline, stats
- [ ] AuditDirectorDashboard renders review queue and approval workflow
- [ ] RegionalDirectorDashboard renders allocation and feedback
- [ ] TaxCenterManagerDashboard renders feedback and assignment cards
- [ ] CascadeTeamDashboard renders case prioritization
- [ ] TeamLeaderDashboard renders team progress tracking
- [ ] AuditorDashboard renders case execution
- [ ] SeniorManagementDashboard renders approval metrics
- [ ] All grid layouts responsive at breakpoints
- [ ] All metric cards display colored left borders correctly

### FR-4: Modal Components Tailwind Implementation
**Components**: All 11 modals (CreatePlan, Feedback, CaseDetails, etc.)

**Acceptance Criteria**:
- [ ] All modals display with overlay and centered content
- [ ] Form fields styled consistently with labels, inputs, validation
- [ ] Modal header and footer render correctly
- [ ] Action buttons aligned properly
- [ ] Responsive: full width on mobile, fixed width on desktop
- [ ] Scrolling works correctly for tall content

### FR-5: Theme System Integration
**Requirements**: Dark/Light mode switching

**Acceptance Criteria**:
- [ ] Dark class applied/removed from HTML element when toggling
- [ ] CSS variables update when theme changes
- [ ] All Tailwind dark: variants apply correctly
- [ ] Theme preference persists in localStorage
- [ ] System preference fallback works
- [ ] No FOUC (Flash of Unstyled Content) on page load

### FR-6: Design Token Configuration
**File**: tailwind.config.js

**Acceptance Criteria**:
- [ ] Color palette defined in theme.extend.colors
- [ ] All 8+ design colors available as utilities (text-gold, bg-teal, etc.)
- [ ] CSS variable references maintained for backward compatibility
- [ ] Spacing scale follows 4px base unit
- [ ] Border radius values consistent (8px, 12px, 14px)
- [ ] Shadow definitions match current system
- [ ] Dark mode configuration set to 'class'

### FR-7: Responsive Design Coverage
**Breakpoints**: Mobile, Tablet, Desktop, Ultra-wide

**Acceptance Criteria**:
- [ ] Mobile layout (< 640px): single column, full-width modals
- [ ] Tablet layout (640px - 1024px): 2-3 column grids
- [ ] Desktop layout (1024px - 1280px): 3-4 column grids
- [ ] Ultra-wide layout (> 1280px): 4+ column grids
- [ ] Navigation responsive (sidebar hidden/visible appropriately)
- [ ] Tables/grids stack appropriately on smaller screens

### FR-8: Zero Breaking Changes
**Requirement**: Maintain all existing functionality

**Acceptance Criteria**:
- [ ] All imports remain valid
- [ ] Component props unchanged
- [ ] Event handlers unchanged
- [ ] Router navigation unchanged
- [ ] API calls and data flow unchanged
- [ ] Authentication system unchanged

---

## Non-Functional Requirements

### NFR-1: Code Quality
- CSS reduced by 80%+ (from 800 lines to ~150 lines)
- Inline styles reduced by 90%+ (from 2000+ lines to < 200 lines)
- Consistent code formatting across all files
- JSDoc comments maintained
- No console warnings or errors

### NFR-2: Performance
- Build time increase < 500ms
- CSS bundle size < 50KB gzipped
- No runtime performance regression
- Dark mode toggle < 100ms latency
- Page load time unchanged or improved

### NFR-3: Browser Compatibility
- Chrome/Edge 90+ (latest 2 versions)
- Firefox 88+ (latest 2 versions)
- Safari 14+ (latest 2 versions)
- Mobile browsers (iOS Safari 14+, Chrome Android)
- CSS Grid and Flex support required

### NFR-4: Maintainability
- Single source of truth for design tokens
- Reusable utility classes via @apply
- Clear class naming conventions
- Component-scoped styling where appropriate
- Documentation of design system

### NFR-5: Accessibility
- All text contrast ratios >= 4.5:1 (WCAG AA)
- Focus states clearly visible
- No color-only information encoding
- Keyboard navigation unaffected
- Screen reader compatibility maintained

### NFR-6: Developer Experience
- Intellisense support for Tailwind classes
- Hot reload working during development
- Clear error messages for misspelled classes
- Consistent class naming across project
- Easy to add new components

---

## Design System Specification

### Color Palette

**Primary Colors**:
| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| Ink | #0F1417 | 15, 20, 23 | Very dark backgrounds |
| Panel | #161D22 | 22, 29, 34 | Card/panel backgrounds |
| Border | #26313A | 38, 49, 58 | Border/divider lines |

**Text Colors**:
| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| Text-Hi | #EDEFF0 | 237, 239, 240 | Primary text (high contrast) |
| Text-Mid | #9AA5AC | 154, 165, 172 | Secondary text |

**Accent Colors**:
| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| Gold | #C9A356 | 201, 163, 86 | Accents, warnings, highlights |
| Teal | #4FA893 | 79, 168, 147 | Success, approvals |
| Coral | #D9724F | 217, 114, 79 | Danger, rejections, errors |
| Blue | #5B8FBF | 91, 143, 191 | Primary actions, secondary info |

**Semantic Mapping**:
- Success state: Teal (#4FA893)
- Warning/Pending: Gold (#C9A356)
- Danger/Error: Coral (#D9724F)
- Info: Blue (#5B8FBF)

### Typography

**Font Stack**:
- Primary: 'Inter', sans-serif (400, 500, 600, 700)
- Serif (branding): 'Fraunces', serif (400, 500, 600, 700)
- Monospace (code): 'JetBrains Mono', monospace (400, 500)

**Sizing**:
- Base: 16px
- Small: 12-13px
- Large: 18-20px
- XL: 24px+
- Headings: 29-40px

### Spacing System

**Base Unit**: 4px (inherited from current system)

| Token | Value | Tailwind Class |
|-------|-------|---|
| xs | 4px | space-x-1 |
| sm | 8px | space-x-2 |
| md | 12px | space-x-3 |
| lg | 16px | space-x-4 |
| xl | 24px | space-x-6 |
| 2xl | 32px | space-x-8 |

### Border Radius

| Size | Value | Usage |
|------|-------|-------|
| sm | 8px | Subtle, small elements |
| md | 12px | Standard elements |
| lg | 14px | Cards, modals |
| full | 9999px | Badges, pills |

### Shadows

| Level | Value | Tailwind |
|-------|-------|----------|
| sm | 0 1px 2px rgba(0,0,0,0.05) | shadow-sm |
| md | 0 4px 8px rgba(0,0,0,0.08) | shadow |
| lg | 0 4px 18px rgba(0,0,0,0.12) | shadow-lg |

### Component Patterns

#### Card Pattern
```
bg-panel border border-border rounded-lg p-6 shadow-sm
dark: applies automatically via @media prefers-color-scheme
```

#### Button Primary Pattern
```
bg-blue text-white px-4 py-2 rounded-md font-semibold
hover:bg-blue/90 focus:ring-2 focus:ring-blue/40
transition-all duration-200
disabled:opacity-50 disabled:cursor-not-allowed
```

#### Badge Approved Pattern
```
bg-teal/20 text-teal px-2.5 py-1 rounded-full text-xs font-medium
```

#### Badge Pending Pattern
```
bg-gold/20 text-gold px-2.5 py-1 rounded-full text-xs font-medium
```

#### Badge Danger Pattern
```
bg-coral/20 text-coral px-2.5 py-1 rounded-full text-xs font-medium
```

---

## Constraints & Assumptions

### Constraints
1. **Build Tool**: Must use Vite (project already configured)
2. **Framework**: React 19.x (no framework changes)
3. **Node Version**: 16+ (Tailwind requirement)
4. **Browser Support**: Modern browsers with CSS Grid/Flex support
5. **Timeline**: 12-18 hours estimated effort
6. **No External Style Libraries**: Only Tailwind CSS

### Assumptions
1. All current CSS variables will map to Tailwind tokens
2. Dark mode toggle behavior remains client-side (no server changes)
3. No new components will be added during conversion
4. All tests will be visual regression tests (no unit tests currently)
5. Form validations and business logic unchanged
6. Current authentication system unchanged

### Known Risks
1. **Risk**: Migrating 40+ components simultaneously could introduce visual regressions
   - **Mitigation**: Phase approach (foundation → components → dashboards → modals)
2. **Risk**: Inline styles are scattered throughout components
   - **Mitigation**: Systematic file-by-file conversion with visual verification
3. **Risk**: Custom CSS classes not documented
   - **Mitigation**: Map all existing classes before migration
4. **Risk**: Dark mode class application timing
   - **Mitigation**: Preserve existing ThemeToggle logic, only update styling

---

## Success Criteria

### Code Quality Metrics
- [ ] CSS file size reduced by 80%+ (< 160 lines in main.css)
- [ ] Average inline style objects per component < 2
- [ ] Zero unused Tailwind utilities generated
- [ ] Build time within 500ms of current

### Visual Testing
- [ ] All 8 dashboards render pixel-perfect
- [ ] Dark/light mode toggle works without visual artifacts
- [ ] All modals display correctly
- [ ] All forms functional
- [ ] Responsive design verified at 5+ breakpoints

### Functional Testing
- [ ] All role-based navigation works
- [ ] All modals open/close correctly
- [ ] Theme persistence works across page reloads
- [ ] No console errors or warnings
- [ ] All existing features operational

### Performance Metrics
- [ ] CSS bundle <= 50KB gzipped
- [ ] Build time < 10 seconds (from 5-10 second baseline)
- [ ] No CLS (Cumulative Layout Shift) during theme toggle
- [ ] Dark mode switch latency < 100ms

### User Acceptance
- [ ] Visual consistency maintained
- [ ] No degradation in user experience
- [ ] All features work as before
- [ ] Performance acceptable

---

## Out of Scope

- Adding new components or features
- Changing component functionality
- Modifying business logic
- Adding unit tests
- Changing project structure
- Updating authentication system
- Modifying API calls
- Database schema changes

---

## Next Steps

1. **Design Review**: Stakeholder approval of design system colors
2. **Requirements Review**: Confirm all requirements are acceptable
3. **Design Phase**: Create detailed technical design with component patterns
4. **Implementation Planning**: Break design into implementation tasks
5. **Implementation**: Execute phased migration
6. **Testing & Verification**: Visual regression and functional testing
7. **Deployment**: Merge to main branch

---

## Document Status

- **Status**: DRAFT - Ready for Requirements Review
- **Last Updated**: July 2026
- **Created by**: Kiro
- **Next Review**: After design document completion

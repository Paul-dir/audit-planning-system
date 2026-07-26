# Planning Team Pages Redesign Plan

**Objective:** Apply the exact design pattern from AuditPlanningView to all Planning Team role pages

**Pages to Redesign:**
1. ✅ **AuditPlanningView** - Already done (reference template)
2. ⏳ **RiskEngineView** - Risk analysis at national/regional/tax center levels
3. ⏳ **ConfigurationManagementView** - System configuration with tabs
4. ⏳ **FeedbackReviewView** - Review and amend regional feedback
5. ⏳ **CreateAnnualPlanModal** - Plan creation wizard

---

## PLANNING TEAM PAGES STRUCTURE

### Page 1: AuditPlanningView ✅ (COMPLETED - REFERENCE)
**Current Status:** Modern design applied ✅
**Content:**
- Page Header + Blue Accent Bar
- 7 KPI Cards (7-column responsive grid)
- Section Header with create button
- Data table of audit plans
- MOR Analysis view
- Regional breakdown view

**Pattern Template:** See DESIGN_TEMPLATE_PATTERN.md

---

### Page 2: RiskEngineView ⏳ (NEEDS REDESIGN)

**Current Content:**
- National-level risk overview (MOR)
- Regional risk analysis
- Tax center details
- Taxpayer-level analysis
- Region selector for navigation

**To Redesign:**
1. **National View (renderNationalView)**
   - Replace inline styles with Tailwind classes
   - Apply page header pattern with blue accent bar
   - Convert cards to metric card pattern
   - Convert tables to dark table pattern
   - Apply KPI grid (4-6 cards)

2. **Regional View (renderRegionalView)**
   - Apply same header pattern
   - Convert cards to metric card pattern
   - Use responsive table layout
   - Add proper spacing and borders

3. **Tax Center View (renderTaxCenterView)**
   - Convert to metric card display
   - Apply table styling

4. **Taxpayer View (renderTaxpayerDetailsView)**
   - Apply data table styling
   - Add proper spacing

**Design Elements to Apply:**
- `<div className="space-y-6 p-8 bg-neutral-900 min-h-screen">` - Page wrapper
- Blue accent bars (w-1 h-8 bg-primary-600) on all headers
- Metric cards with colored left borders
- Dark table styling (bg-neutral-800, border-neutral-700)
- Responsive grids
- Proper spacing and typography

---

### Page 3: ConfigurationManagementView ⏳ (NEEDS REDESIGN)

**Current Content:**
- Tabbed interface (8 tabs)
  - Audit Types
  - Skills
  - Risk Levels
  - Effort Calculation
  - Allocation Rules
  - Validation Rules
  - Regions & Capacity
  - Risk Distribution

**To Redesign:**
1. **Header Section**
   - Apply blue accent bar pattern
   - Use serif font for title
   - Apply dark background

2. **Tab Navigation**
   - Maintain tab structure but restyle
   - Use dark backgrounds
   - Add proper hover states

3. **Tab Content**
   - For each tab, apply metric card pattern where applicable
   - Convert tables to dark table style
   - Apply proper spacing throughout
   - Use responsive grids for content cards

**Specific Changes by Tab:**
1. **Audit Types Tab:**
   - Header with accent bar
   - Table with dark styling

2. **Skills Tab:**
   - Header with accent bar
   - Grid of skill cards with metric styling

3. **Risk Levels Tab:**
   - Header with accent bar
   - Grid of risk level cards

4. **Effort Calculation Tab:**
   - Header with accent bar
   - Grid of metric cards for values

5. **Allocation Rules Tab:**
   - Header with accent bar
   - Chart/progress bars with dark styling

6. **Validation Rules Tab:**
   - Header with accent bar
   - Dark table

7. **Regions & Capacity Tab:**
   - Header with accent bar
   - Dark table

8. **Risk Distribution Tab:**
   - Header with accent bar
   - Metric cards with percentages

**Design Elements to Apply:**
- Page header with accent bar
- Section headers with accent bars
- Metric cards (dark-800 background, colored left border)
- Dark tables (bg-neutral-800, border-neutral-700)
- Responsive grids
- Proper spacing

---

### Page 4: FeedbackReviewView ⏳ (NEEDS REDESIGN)

**Current Content:**
- List of plans with feedback
- Plan feedback review/amendment interface
- Editable capacity adjustment table

**To Redesign:**
1. **Main List View**
   - Apply page header pattern
   - Add KPI cards for statistics
   - Convert table to dark table style
   - Apply proper spacing

2. **Plan Amendment View**
   - Apply page header pattern
   - Add KPI cards (regions, version, status)
   - For each region:
     - Apply section header with accent bar
     - Convert feedback summary to styled box
     - Apply table styling for capacity adjustment

**Design Elements to Apply:**
- Page header with accent bar (font-serif title)
- KPI metric cards (4-5 cards in grid)
- Colored boxes for status/summary (using semantic colors)
- Dark tables with proper styling
- Responsive grid layout
- Proper spacing and typography

---

### Bonus: CreateAnnualPlanModal ⏳ (NEEDS REDESIGN)

**Current Content:**
- 4-step wizard modal
- Form inputs for plan basics
- Audit type selector
- Regional distribution
- Review summary

**To Redesign:**
1. **Modal Container**
   - Dark background for modal
   - Proper spacing
   - White/light text

2. **Step Indicators**
   - Visual progress stepper
   - Current step highlighting

3. **Form Content**
   - Dark input fields
   - Proper labels
   - Validation messages

4. **Buttons**
   - Semantic button colors
   - Proper hover states

**Design Elements to Apply:**
- Dark modal background (#1E293B)
- Dark input fields
- Semantic button colors
- Proper spacing
- Typography matching other pages

---

## IMPLEMENTATION PRIORITY

**Phase 1 (Focus on Planning Team):**
1. ✅ AuditPlanningView (DONE)
2. ⏳ RiskEngineView (START HERE - high complexity, many views)
3. ⏳ ConfigurationManagementView (medium complexity, needs tab styling)
4. ⏳ FeedbackReviewView (medium complexity, needs amendment UI)

**Phase 2 (After Planning Team Complete):**
5. CreateAnnualPlanModal (bonus - modal styling)

---

## DESIGN PATTERN CHECKLIST FOR EACH PAGE

### ✅ Page Header Section
- [ ] Blue accent bar (w-1 h-8 bg-primary-600)
- [ ] Serif font for title (font-serif text-3xl)
- [ ] Subtitle text (text-neutral-400 text-sm)
- [ ] Proper spacing (flex items-center gap-3)

### ✅ Metric Cards
- [ ] Dark background (bg-neutral-800)
- [ ] Colored left border (border-l-4 border-l-[color]-600)
- [ ] Small uppercase label (text-xs uppercase tracking-wider)
- [ ] Large metric number (text-4xl font-bold)
- [ ] Icon on right (text-2xl text-neutral-400 opacity-75)
- [ ] Hover effect (hover:shadow-md transition-all)

### ✅ Data Tables
- [ ] Dark container (bg-neutral-800 border-neutral-700)
- [ ] Uppercase headers (text-xs uppercase tracking-wider)
- [ ] Row hover effect (hover:bg-neutral-700/50)
- [ ] Proper text alignment (left for text, right for numbers)
- [ ] Row dividers (divide-y divide-neutral-700)
- [ ] Proper padding (px-6 py-4)

### ✅ Responsive Grids
- [ ] Mobile first (grid-cols-1)
- [ ] Tablet (md:grid-cols-3 or md:grid-cols-2)
- [ ] Desktop (lg:grid-cols-7 or lg:grid-cols-6)
- [ ] Proper gap (gap-4 or gap-6)

### ✅ Spacing & Typography
- [ ] Page wrapper (space-y-6 p-8)
- [ ] Dark background (bg-neutral-900)
- [ ] Semantic colors for text
- [ ] Proper margins between sections
- [ ] Consistent button styling

---

## CONTENT PRESERVATION

**IMPORTANT:** Only change the STYLING, not the CONTENT or LOGIC

For each page:
1. Keep all data calculations the same
2. Keep all state management the same
3. Keep all event handlers the same
4. Keep all navigation logic the same
5. ONLY change the CSS/Tailwind classes and HTML structure

---

## NEXT STEPS

1. Start with RiskEngineView (most complex, good test)
2. Convert all inline styles to Tailwind classes
3. Apply metric card pattern for KPI displays
4. Apply table pattern for data tables
5. Test build after each page
6. Move to ConfigurationManagementView
7. Move to FeedbackReviewView
8. Finish with CreateAnnualPlanModal (if time)

---

## TESTING CHECKLIST

After each page redesign:
- [ ] Build completes without errors
- [ ] No console errors
- [ ] Page renders correctly
- [ ] All navigation works
- [ ] All forms function
- [ ] All data displays correctly
- [ ] Responsive design works (mobile, tablet, desktop)
- [ ] Colors match specification
- [ ] Spacing looks consistent
- [ ] Typography is correct


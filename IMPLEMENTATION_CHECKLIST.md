# Implementation Checklist - Planning Team Pages

**Created:** July 26, 2026  
**Strategy:** Apply standard modern enterprise pattern to all remaining pages  
**Exception:** CreateAnnualPlanModal stays colorful (already complete ✅)

---

## Planning Team Pages - Priority 1

### 1. ConfigurationManagementView
**Status:** ⏳ Ready to Start  
**File:** `src/components/views/ConfigurationManagementView.jsx`

**Tasks:**
- [ ] Read current file and analyze 8 tabs
- [ ] Convert Tab 1: Audit Types Configuration
  - [ ] Add page wrapper (space-y-6 p-8 bg-neutral-900 min-h-screen)
  - [ ] Add page header with blue accent bar
  - [ ] Convert table to standard pattern styling
  - [ ] Update form inputs to dark theme
- [ ] Convert Tab 2: Skills Configuration
  - [ ] Apply same pattern
- [ ] Convert Tab 3: Risk Levels Configuration
  - [ ] Apply same pattern
- [ ] Convert Tab 4: Effort Calculation
  - [ ] Apply same pattern
- [ ] Convert Tabs 5-8 (if they exist)
- [ ] Update buttons with semantic colors
- [ ] Add icons to tabs for visual interest (but subtle)
- [ ] Test build
- [ ] Verify all functionality preserved

**Design Rules:**
- Use standard pattern ONLY
- Dark backgrounds (#0F172A, #1E293B)
- Semantic colors only (primary, info, success, warning, danger)
- Icons for clarity, not decoration
- No gradients except header bars
- No rainbow effects
- Professional appearance

---

### 2. FeedbackReviewView
**Status:** ⏳ Ready to Start  
**File:** `src/components/views/FeedbackReviewView.jsx`

**Tasks:**
- [ ] Read current file and understand structure
- [ ] Add page wrapper with proper spacing
- [ ] Add page header with blue accent bar
- [ ] Design plan amendment UI
- [ ] Update form styling to dark theme
- [ ] Add tables with standard pattern
- [ ] Update buttons with semantic colors
- [ ] Test build
- [ ] Verify all functionality preserved

**Design Rules:**
- Follow DESIGN_TEMPLATE_PATTERN.md
- Use standard modern enterprise design
- No colorful enhancements

---

## Other Role Pages - Priority 2+

### Dashboard Pages (8 total)
Each dashboard should be reviewed and updated with the modern design pattern:

1. **AuditDirectorDashboard**
   - [ ] Status: Review needed
   - [ ] File: `src/components/dashboards/AuditDirectorDashboard.jsx`

2. **AuditorDashboard**
   - [ ] Status: Review needed
   - [ ] File: `src/components/dashboards/AuditorDashboard.jsx`

3. **AuditTeamDashboard**
   - [ ] Status: Review needed
   - [ ] File: `src/components/dashboards/AuditTeamDashboard.jsx`

4. **CascadeTeamDashboard**
   - [ ] Status: Review needed
   - [ ] File: `src/components/dashboards/CascadeTeamDashboard.jsx`

5. **RegionalDirectorDashboard**
   - [ ] Status: Review needed
   - [ ] File: `src/components/dashboards/RegionalDirectorDashboard.jsx`

6. **SeniorManagementDashboard**
   - [ ] Status: Review needed
   - [ ] File: `src/components/dashboards/SeniorManagementDashboard.jsx`

7. **TaxCenterManagerDashboard**
   - [ ] Status: Review needed
   - [ ] File: `src/components/dashboards/TaxCenterManagerDashboard.jsx`

8. **TeamLeaderDashboard**
   - [ ] Status: Review needed
   - [ ] File: `src/components/dashboards/TeamLeaderDashboard.jsx`

---

## Reference Files

**Use these as guides for standard pattern:**
1. `DESIGN_TEMPLATE_PATTERN.md` - Complete pattern documentation
2. `src/components/views/AuditPlanningView.jsx` - Reference implementation (already done)
3. `src/components/views/RiskEngineView.jsx` - Reference implementation (already done)

**Use this as the EXCEPTION (colorful):**
- `src/components/modals/CreateAnnualPlanModal.jsx` - NOT a pattern to follow

---

## Standard Pattern Quick Reference

### Page Wrapper
```jsx
<div className="space-y-6 p-8 bg-neutral-900 min-h-screen">
```

### Page Header
```jsx
<div>
  <div className="flex items-center gap-3 mb-2">
    <div className="w-1 h-8 bg-primary-600 rounded-sm"></div>
    <h1 className="text-3xl font-serif font-bold text-neutral-50">Title</h1>
  </div>
  <p className="text-neutral-400 text-sm">Subtitle</p>
</div>
```

### Metric Card
```jsx
<div className="bg-neutral-800 border border-neutral-700 border-l-4 border-l-primary-600 rounded-lg p-6 shadow-sm">
  <h3 className="text-xs uppercase font-semibold tracking-wider text-neutral-400 mb-2">Title</h3>
  <div className="text-4xl font-bold text-neutral-50">{value}</div>
  <i className="fas fa-icon text-2xl text-neutral-400 opacity-75"></i>
</div>
```

### Table
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
        <tr className="hover:bg-neutral-700/50">
          <td className="px-6 py-4 text-sm text-neutral-50">Data</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

### Form Input
```jsx
<input
  type="text"
  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-neutral-50 font-medium focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20"
/>
```

### Button
```jsx
<button className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-neutral-50 font-semibold rounded-lg transition-colors">
  Button
</button>
```

---

## Color Usage Guidelines

### Semantic Colors
- **Primary (#2563EB):** Main actions, drafts, planning
- **Info (#3B82F6):** Information, secondary metrics
- **Success (#10B981):** Approved, completed, finalized
- **Warning (#F59E0B):** Pending, in revision, warnings
- **Danger (#F87171):** Errors, rejections, critical

### Text Colors
- **text-neutral-50:** Primary text (bright white)
- **text-neutral-300:** Headers, secondary labels
- **text-neutral-400:** Subtitles, muted text
- **text-neutral-600:** Icons, very muted

### Background Colors
- **bg-neutral-900:** Page background
- **bg-neutral-800:** Cards, panels
- **bg-neutral-700:** Hover states, borders

---

## Dos and Don'ts

### ✅ DO

- [ ] Follow DESIGN_TEMPLATE_PATTERN.md exactly
- [ ] Use dark theme consistently
- [ ] Apply semantic colors for meaning
- [ ] Add professional icons for clarity
- [ ] Use proper spacing and typography
- [ ] Add hover effects for interactivity
- [ ] Preserve all business logic
- [ ] Test build after changes
- [ ] Use null checks: `(value || 0).toLocaleString()`

### ❌ DON'T

- [ ] Add rainbow gradients (except in CreateAnnualPlanModal)
- [ ] Use multiple colors on single cards
- [ ] Add unnecessary animations
- [ ] Deviate from established pattern
- [ ] Use inline styles
- [ ] Change semantic meaning of colors
- [ ] Forget responsive design
- [ ] Remove any functionality
- [ ] Mix light and dark themes

---

## Verification Checklist

After each page redesign, verify:

- [ ] Build passes with zero errors
- [ ] CSS file size reasonable (11-13 KB gzipped)
- [ ] All functionality works correctly
- [ ] Dark theme applied consistently
- [ ] Typography matches pattern
- [ ] Spacing follows system
- [ ] Colors used semantically
- [ ] Icons placed appropriately
- [ ] Responsive design works
- [ ] No regressions in functionality

---

## Build Command

```bash
npm run build
```

Expected output:
- ✅ 110 modules transformed
- ✅ 11-13 KB CSS gzipped
- ✅ ~3-7s build time
- ✅ Zero errors

---

## Notes

1. **CreateAnnualPlanModal is the exception** - It's colorful and that's intentional
2. **Other pages use standard pattern** - Professional, clean, consistent
3. **Start with Planning Team pages** - Complete ConfigurationManagementView and FeedbackReviewView first
4. **Then move to other roles** - Update remaining dashboards systematically
5. **Use reference files** - AuditPlanningView and RiskEngineView show what done looks like

---

## Status Tracking

| Page | Status | Notes |
|------|--------|-------|
| CreateAnnualPlanModal | ✅ Done | Colorful, beautiful - keep as is |
| ConfigurationManagementView | ⏳ Next | 8 tabs - use standard pattern |
| FeedbackReviewView | ⏳ Next | Plan amendments - use standard pattern |
| AuditDirectorDashboard | ⏳ Todo | Standard pattern |
| AuditorDashboard | ⏳ Todo | Standard pattern |
| AuditTeamDashboard | ⏳ Todo | Standard pattern |
| CascadeTeamDashboard | ⏳ Todo | Standard pattern |
| RegionalDirectorDashboard | ⏳ Todo | Standard pattern |
| SeniorManagementDashboard | ⏳ Todo | Standard pattern |
| TaxCenterManagerDashboard | ⏳ Todo | Standard pattern |
| TeamLeaderDashboard | ⏳ Todo | Standard pattern |

---

**Ready to begin Phase 2:** ConfigurationManagementView redesign ✅

**Current Build Status:** ✅ Successful (12.34 KB CSS, 110 modules, 3.73s)

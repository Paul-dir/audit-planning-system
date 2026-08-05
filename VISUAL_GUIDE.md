# Planning Configuration Panel - Visual Guide

**Complete visual walkthrough of the Planning Configuration Panel**

---

## 🎬 User Interface Overview

### Desktop Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Planning Dashboard - Audit Plans  [Risk Analysis]          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐  ┌──────────────────────────────────┐ │
│  │  PLANNING CONFIG │  │                                  │ │
│  │  (planning only) │  │   AUDIT PLANS DASHBOARD          │ │
│  │                  │  │                                  │ │
│  │ ▼ Audit Types   │  │   📊 Stats                       │ │
│  │ ───────────────  │  │   • Total Plans: 12              │ │
│  │                  │  │   • Draft: 3                     │ │
│  │ ┌──────────────┐ │  │   • Pending: 5                   │ │
│  │ │ Desk Audit   │ │  │   • Finalized: 4                 │ │
│  │ │ 40h   Low    │ │  │                                  │ │
│  │ │ ✎ ✗          │ │  │   📋 Plans Table                 │ │
│  │ └──────────────┘ │  │                                  │ │
│  │                  │  │   [Create Plan] [Risk Analysis] │ │
│  │ ┌──────────────┐ │  │                                  │ │
│  │ │ Field Audit  │ │  │   Plan ID | Name   | Cases|Stat  │ │
│  │ │ 120h Medium  │ │  │   ─────────────────────────────  │ │
│  │ │ ✎ ✗          │ │  │   P001    | FY2026 | 500  Draft  │ │
│  │ └──────────────┘ │  │   P002    | FY2026 | 320  Apprvd │ │
│  │                  │  │   P003    | FY2026 | 150  Feedbk │ │
│  │ [+ Add Type]     │  │                                  │ │
│  │                  │  │                                  │ │
│  │ ▶ Skills    [4]  │  │                                  │ │
│  │                  │  │                                  │ │
│  │ ℹ️ Planning Only  │  │                                  │ │
│  │   No other roles │  │                                  │ │
│  │   affected       │  │                                  │ │
│  └──────────────────┘  └──────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Mobile Layout

```
┌────────────────────────────────┐
│ ≡  Planning Dashboard [Risk]   │
├────────────────────────────────┤
│                                │
│  📊 Stats                      │
│  • Total: 12                   │
│  • Draft: 3                    │
│                                │
│  📋 Plans Table                │
│  [Create Plan] [Risk Analysis] │
│                                │
│  Scroll down for more          │
│                                │
│           ⚙️ Config Panel      │
│          (toggle button)       │
│          bottom-right corner   │
│                                │
│                                │
│  [When clicked: full overlay]  │
│  ┌──────────────────────────┐  │
│  │ PLANNING CONFIG    [✕]   │  │
│  │                          │  │
│  │ ▼ Audit Types      [4]   │  │
│  │ • Desk Audit             │  │
│  │   40h Low                │  │
│  │   [✎] [✗]               │  │
│  │                          │  │
│  │ ▼ Skills           [6]   │  │
│  │ • Basic Analysis         │  │
│  │   Foundation             │  │
│  │   [✎] [✗]               │  │
│  │                          │  │
│  │ ℹ️ Planning Only          │  │
│  └──────────────────────────┘  │
└────────────────────────────────┘
```

---

## 📝 Step-by-Step Workflows

### Workflow 1: Add New Audit Type

**View Mode** (Before Click):
```
┌────────────────────────────────┐
│ ▼ Audit Types            [6]   │
├────────────────────────────────┤
│                                │
│ ┌──────────────────────────┐   │
│ │ Desk Audit               │   │
│ │ 40h    Low               │   │
│ │              [✎] [✗]     │   │
│ └──────────────────────────┘   │
│                                │
│ ┌──────────────────────────┐   │
│ │ Field Audit              │   │
│ │ 120h   Medium            │   │
│ │              [✎] [✗]     │   │
│ └──────────────────────────┘   │
│                                │
│ ┌──────────────────────────┐   │
│ │ [+ Add Audit Type]       │   │
│ └──────────────────────────┘   │
│         ↑ Click Here            │
└────────────────────────────────┘
```

**Edit Mode** (After Click):
```
┌────────────────────────────────┐
│ ▼ Audit Types            [7]   │
├────────────────────────────────┤
│                                │
│ ┌──────────────────────────┐   │
│ │ New Audit Type           │   │ ← Edit Mode
│ │                          │   │
│ │ Name:                    │   │
│ │ [Custom Audit Type       ]   │
│ │                          │   │
│ │ Hours:  [150]            │   │
│ │ Complexity: [High ▼]     │   │
│ │                          │   │
│ │ [✓ Save]  [✗ Cancel]    │   │
│ └──────────────────────────┘   │
│                                │
│ [+ Add Audit Type]             │
└────────────────────────────────┘
```

**Result** (After Save):
```
✅ New audit type added to list
✅ Appears in audit type selector when creating plan
✅ Configuration saved in component state
✅ Resets on page refresh
```

---

### Workflow 2: Edit Existing Audit Type

**Click Edit Button**:
```
Step 1: See current item
┌──────────────────────────┐
│ Desk Audit               │
│ 40h    Low               │
│              [✎] ← Click │
│                [✗]       │
└──────────────────────────┘

        ↓

Step 2: Enter edit mode
┌──────────────────────────┐
│ Name: [Desk Audit    ]   │
│ Hours: [40]              │
│ Complexity: [Low ▼]      │
│ [✓ Save] [✗ Cancel]     │
└──────────────────────────┘

        ↓

Step 3: Make changes & save
┌──────────────────────────┐
│ Name: [Desk Audit    ]   │
│ Hours: [50] ← Changed    │
│ Complexity: [Low ▼]      │
│ [✓ Save] ← Click        │
│ [✗ Cancel]              │
└──────────────────────────┘

        ↓

Step 4: Updated in list
┌──────────────────────────┐
│ Desk Audit               │
│ 50h    Low   ✓ Updated  │
│              [✎] [✗]     │
└──────────────────────────┘
```

---

### Workflow 3: Delete Audit Type

**Simple One-Click Delete**:
```
Before:
┌──────────────────────────┐
│ Issue Audit              │
│ 50h    Medium            │
│              [✎] [✗]     │
│                  ↓ Click │
└──────────────────────────┘

        ↓

Instant Removal:
┌──────────────────────────┐
│ ✓ Issue Audit deleted    │
│                          │
│ Item removed from list   │
│ Count updates: 6 → 5     │
└──────────────────────────┘
```

---

### Workflow 4: Skills Management

Similar to audit types:

**Add Skill**:
```
[+ Add Skill] → [Edit Form] → [Save] → [Appears in List]
```

**Edit Skill**:
```
[✎ Edit] → [Edit Form] → [Save] → [Updates in List]
```

**Delete Skill**:
```
[✗ Delete] → [Instant Removal] → [Count Updates]
```

---

## 🎨 Color & Visual Reference

### Complexity Level Colors

```
Low Complexity:
┌─────────────────┐
│ Low             │ Green: ✓ Simple
│ 🟢 Low          │        Easy to manage
└─────────────────┘

Medium Complexity:
┌─────────────────┐
│ Medium          │ Yellow: ⚠️ Standard
│ 🟡 Medium       │        Normal effort
└─────────────────┘

High Complexity:
┌─────────────────┐
│ High            │ Orange: ⚠️ Complex
│ 🟠 High         │        Senior required
└─────────────────┘

Very High Complexity:
┌─────────────────┐
│ Very High       │ Red: 🚨 Expert Only
│ 🔴 Very High    │      Highest effort
└─────────────────┘
```

### Skill Levels

```
Foundation Level:
┌─────────────────────────────┐
│ Basic Analysis              │
│ Foundation (Level 1)        │ ① Entry-level
│ Category: Foundation        │    Basic knowledge
└─────────────────────────────┘

Advanced Level:
┌─────────────────────────────┐
│ Fieldwork                   │
│ Advanced (Level 2)          │ ② Intermediate
│ Category: Execution         │    Some expertise
└─────────────────────────────┘

Expert Level:
┌─────────────────────────────┐
│ Senior Auditor              │
│ Expert (Level 3)            │ ③ Advanced
│ Category: Leadership        │    High expertise
└─────────────────────────────┘
```

---

## 🔄 Expandable Sections

### Collapsed State

```
┌─ Audit Types            [6] ─┐
│  ▶ (closed)                  │  ← Click to expand
├──────────────────────────────┤
│                              │
│ ┌─ Skills                [4] ┐
│ │  ▶ (closed)               │  ← Click to expand
│ └──────────────────────────── ┘
│                              │
└──────────────────────────────┘
```

### Expanded State

```
┌─ Audit Types            [6] ─┐
│  ▼ (open)                    │  ← Click to collapse
├──────────────────────────────┤
│ ┌──────────────────────────┐ │
│ │ Desk Audit               │ │
│ │ 40h    Low               │ │
│ │            [✎] [✗]       │ │
│ └──────────────────────────┘ │
│                              │
│ ┌──────────────────────────┐ │
│ │ Field Audit              │ │
│ │ 120h   Medium            │ │
│ │            [✎] [✗]       │ │
│ └──────────────────────────┘ │
│                              │
│ [+ Add Audit Type]           │
│                              │
└──────────────────────────────┘
```

---

## 📱 Responsive Behavior

### Desktop (1024px+)

```
[Sidebar]────────[Main Content]
Fixed          Flexible
280px          Remaining space
Always visible Always visible
```

### Tablet (768px-1023px)

```
[Main Content]
Full width

[≡ Config]  ← Toggle button appears
            Click to overlay sidebar
```

### Mobile (<768px)

```
[Main Content]
Full width

[⚙️]  ← Toggle button
bottom-right corner
Fixed position

Click → Overlay panel
       Full width
       Dark background
       Click outside to close
```

---

## 🎯 Interactive Elements

### Buttons & Icons

**Edit Button**:
```
┌─────────────────────────┐
│ Desk Audit              │
│ 40h    Low              │
│         [✎] ← Pencil   │
│         [✗]   Icon     │
└─────────────────────────┘

Hover: Changes color to blue
Click: Enters edit mode
```

**Delete Button**:
```
┌─────────────────────────┐
│ Desk Audit              │
│ 40h    Low              │
│         [✎]             │
│         [✗] ← Trash    │
└─────────────────────────┘

Hover: Changes color to red
Click: Deletes item instantly
```

**Add Button**:
```
[+ Add Audit Type]

Hover: Changes to blue background
Click: Creates new item, enters edit mode
```

**Save Button**:
```
[✓ Save]

Hover: Highlights in green
Click: Saves changes, updates list
```

**Cancel Button**:
```
[✗ Cancel]

Hover: Highlights in gray
Click: Discards changes, exits edit
```

---

## 📊 Data Visualization

### Item Count Badge

```
▼ Audit Types            [6]
                         ↑
                    Count badge
                    Shows number
                    of items
```

### Status Indicators

**Edit Mode Active**:
```
┌─────────────────────────┐
│ Name: [Draft Audit   ]  │
│ Hours: [50]             │  ← Blue highlight
│ Complexity: [Medium ▼]  │    Indicates edit mode
│ [✓ Save] [✗ Cancel]    │    User knows they're
└─────────────────────────┘    in edit state
```

**Information Box**:
```
ℹ️ Planning Configuration

Configuration is local to Planning
page only. Changes don't affect other
roles or system-wide settings.

← Blue info box at bottom
  Reminds users of scope
```

---

## 🔌 Integration Points

### Navigation Menu Integration

```
┌─ Planning Team Sidebar ─┐
│                         │
│ Overview                │
│ ├─ Dashboard            │
│                         │
│ Planning                │
│ ├─ Create plan          │
│ ├─ My plans             │
│ ├─ 🆕 Configuration     │ ← New menu item
│ ├─ Amend plans          │
│ └─ Cascade cases        │
│                         │
│ Analysis                │
│ ├─ Risk engine          │
│ ├─ Feedback             │
│ ├─ Plan Journey         │
│ └─ Reports              │
│                         │
└─────────────────────────┘

Icon: ⚙️ (fas fa-sliders-h)
Position: Third in Planning section
Clickable: Opens PlanningDashboard
```

---

## 🎬 Animation & Transitions

### Section Expand/Collapse

```
Initial: ▶ Audit Types
         0ms

Expanding...
50ms:    ↗ (chevron rotating)
100ms:   ↘
150ms:   ▼ Audit Types (open)
         Items appearing with fade-in

Result: Smooth 150ms transition
        Chevron rotates
        Items fade in
```

### Edit Mode Transition

```
Clicked [✎]:
┌──────────────────┐
│ Desk Audit       │  View mode
│ 40h   Low        │
│ [✎] [✗]         │
└──────────────────┘
       ↓
    200ms

┌──────────────────┐
│ [Desk Audit   ]  │  Edit mode
│ [40] [Low ▼]     │  Smooth transition
│ [✓] [✗]         │  Border highlight
└──────────────────┘
```

---

## 📋 Form Layouts

### Audit Type Form

```
┌─────────────────────────────┐
│ Audit Type Editor           │
├─────────────────────────────┤
│                             │
│ Name:                       │
│ [Default Audit Type     ]   │
│                             │
│ Effort Hours:   [80]        │
│ Complexity:     [Medium ▼]  │
│                             │
│ [✓ Save]  [✗ Cancel]       │
│                             │
└─────────────────────────────┘
```

### Skill Form

```
┌─────────────────────────────┐
│ Skill Editor                │
├─────────────────────────────┤
│                             │
│ Name:                       │
│ [New Skill              ]   │
│                             │
│ Level:      [Advanced ▼]    │
│ Category:   [Custom     ]   │
│                             │
│ [✓ Save]  [✗ Cancel]       │
│                             │
└─────────────────────────────┘
```

---

## ✨ Summary

This visual guide shows:
- ✅ Desktop & mobile layouts
- ✅ Step-by-step workflows
- ✅ Color coding & visual hierarchy
- ✅ Interactive elements
- ✅ Responsive behavior
- ✅ Animation & transitions
- ✅ Integration with navigation
- ✅ Form layouts

**All features are visually intuitive and user-friendly!**


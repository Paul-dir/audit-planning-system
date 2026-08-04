# 📋 COMPLETE PLAN JOURNEY GUIDE

## Overview

The new **Plan Journey View** shows the complete workflow of an audit plan from creation to execution, with all details visible at each stage:

1. **Plan Created** ✅ - Initial creation by Audit Planning Team
2. **Director Review** 🔄 - Director's initial approval decision
3. **Submit to Regions** 📤 - Director sends to Regional Directors
4. **Regional Feedback** 💬 - Regions collect tax center feedback
5. **Planning Team Amendment** ✏️ - Team reviews feedback and amends
6. **Director Amendment Review** ✅ - Director approves amendments
7. **Senior Management Review** 🎯 - Final executive approval
8. **Regional Deployment** 🚀 - Director deploys to regions for execution

---

## What's Shown in Plan Journey View

### 📊 1. Plan Information Summary
- **Plan ID**: Unique identifier
- **Fiscal Year**: Which year the plan covers
- **Total Cases**: Total audit cases allocated
- **Current Status**: What stage the plan is currently in

### 📈 2. Workflow Timeline
Visual timeline showing:
- ✅ **COMPLETED** steps (green with checkmark)
- 🟠 **ACTIVE** steps (orange, pulsing)
- ⏳ **PENDING** steps (gray)

Each step shows:
- Title (what happens in this step)
- Description (who does it and why)
- Status (completed/active/pending)
- Date (when it was completed)
- Icon (visual representation)

### 🎯 3. National Audit Type Allocations
Table showing:
- **Audit Type**: desk_audit, field_audit, joint_audit, etc.
- **Count**: How many cases allocated to each type
- **% of Total**: Percentage of total plan

### 🗺️ 4. Regional Allocations
Table showing how the plan is distributed:
- **Region**: Each region name
- **Per Audit Type**: Number of cases per audit type per region
- **Total**: Total cases allocated to that region

Example:
```
Region          | Desk | Field | Joint | Transfer | Complex | Issue | Total
North           |  500 |   200 |   100 |     50   |    50   |  100  | 1000
South           |  450 |   180 |    90 |     45   |    45   |   90  |  900
East            |  400 |   160 |    80 |     40   |    40   |   80  |  800
West            |  350 |   140 |    70 |     35   |    35   |   70  |  700
Central         |  300 |   120 |    60 |     30   |    30   |   60  |  600
---             | 2000 |   800 |   400 |    200   |   200   |  400  | 4000
```

### 💬 5. Regional Feedback Status
Shows for each region:
- ✅ **Status**: Whether feedback received or awaiting
- **Regional Feedback**: Comments from regional director
- **Tax Center Feedback**: Individual feedback from each tax center in the region
- **Received Date**: When the feedback was submitted

Example:
```
North Region
✅ Feedback Received
Regional Feedback: "Allocation is acceptable but need more resources..."
Tax Center Feedback:
  - Tax Center A: "Field audit allocation needs review"
  - Tax Center B: "Desk audit numbers are realistic"
Received: 2026-08-15 10:30 AM
```

### 📝 6. Approval History
Complete audit trail showing:
- **Action**: What was done (APPROVED, REJECTED, AMENDED, etc.)
- **By**: Who did it
- **Date/Time**: When it happened
- **Notes**: Any comments or reasons

---

## How to Use Plan Journey View

### For Audit Planning Team
1. Go to **Analysis → Plan Journey** in sidebar
2. Select a plan from the list
3. See the complete history of the plan
4. Review feedback from all regions
5. Understand where the plan is in the workflow

### For Audit Director
1. Go to **Review → Plan Journey** in sidebar
2. Select a plan
3. See all regional feedback collected
4. Review how the plan progressed through approvals
5. Check tax center feedback details

### For Senior Management
1. Go to **Approvals → Plan Journey** in sidebar
2. Select a plan under review
3. See the complete journey so far
4. Review all amendments and feedback
5. Make informed approval decision

---

## Complete Workflow Example

### Step 1️⃣: Plan Creation
- Audit Planning Team creates plan with:
  - Fiscal Year: 2026
  - Total Cases: 4,000
  - Audit Types: desk_audit (2000), field_audit (800), joint_audit (400), transfer_pricing (200), comprehensive (200), issue_audit (400)
  - Regional Distribution: Cases split across 5 regions
- Status: `DRAFT` → `SUBMITTED_TO_DIRECTOR`
- Timeline shows: ✅ Plan Created

### Step 2️⃣: Director Review
- Director reviews initial plan
- Makes decision: ✅ Approve and send to regions
- Status changes to: `AWAITING_REGIONAL_FEEDBACK`
- Timeline shows: ✅ Plan Created, ✅ Director Review

### Step 3️⃣: Submit to Regions
- Director sends plan to Regional Directors
- Each region receives allocation:
  - North: 1,000 cases
  - South: 900 cases
  - East: 800 cases
  - West: 700 cases
  - Central: 600 cases
- Status: `AWAITING_REGIONAL_FEEDBACK`
- Timeline shows: ✅ Plan Created, ✅ Director Review, ✅ Submit to Regions

### Step 4️⃣: Regional Feedback Collection
- Each Regional Director collects feedback from tax centers
- Example North Region feedback:
  - Tax Center A: "Field audit allocation needs increase, requesting 250 instead of 200"
  - Tax Center B: "Desk audit numbers acceptable as-is"
  - Regional Director Summary: "Field audits need 50 more cases, reallocate from issue audits"
- Status: `FEEDBACK_COLLECTED`
- Timeline shows: All previous + ✅ Regional Feedback

### Step 5️⃣: Planning Team Amendment
- Director sends plan with feedback to Planning Team
- Status changes to: `REVISION_REQUESTED`
- Timeline shows: 🟠 Planning Team Amendment (ACTIVE)
- Planning Team reviews all regional feedback:
  - Increases field audits by 50 from North feedback
  - Adjusts other regions proportionally
  - New allocation:
    - desk_audit: 1,950 (was 2,000)
    - field_audit: 850 (was 800)
    - joint_audit: 400 (unchanged)
    - transfer_pricing: 200 (unchanged)
    - comprehensive: 200 (unchanged)
    - issue_audit: 400 (unchanged)
- Planning Team resubmits with amendment notes
- Status changes to: `RESUBMITTED_TO_DIRECTOR`

### Step 6️⃣: Director Amendment Review
- Director reviews amended plan
- Compares with original and regional feedback
- Approves amendments
- Status changes to: `DIRECTOR_APPROVED`
- Timeline shows: 🟠 Director Amendment Review (ACTIVE)

### Step 7️⃣: Senior Management Review
- Director sends amended plan to Senior Management
- Status changes to: `SUBMITTED_TO_SENIOR_MANAGEMENT`
- Timeline shows: 🟠 Senior Management Review (ACTIVE)
- Senior Management reviews:
  - Original allocation vs. amended allocation
  - All regional feedback
  - Director's approval notes
- Makes final decision: ✅ APPROVE
- Status changes to: `SENIOR_MANAGEMENT_APPROVED`

### Step 8️⃣: Regional Deployment
- Director deploys approved plan to each region
- Status changes to: `DEPLOYED_TO_REGIONS`
- Timeline shows: ✅ All steps COMPLETED

---

## Key Features of Plan Journey View

### ✅ Complete Visibility
See every step of the plan's journey with dates and who took action

### 📊 Data Consistency
All allocations, feedback, and history displayed consistently

### 🔍 Transparency
Clear understanding of:
- What changed (amendments)
- Why it changed (feedback reasons)
- Who approved it (approval history)

### 📱 Responsive Design
- Works on desktop and mobile
- Scrollable tables for region details
- Organized in logical sections

### 🎯 Role-Specific Views
- Audit Team: Sees full journey including their amendments
- Director: Sees all feedback and approvals
- Senior Management: Sees complete context for decision-making

---

## Status Values & Timeline Mapping

| Timeline Step | Status Value | What Happens |
|---|---|---|
| Plan Created | DRAFT → SUBMITTED_TO_DIRECTOR | Audit Team creates plan |
| Director Review | SUBMITTED_TO_DIRECTOR | Director reviews & decides |
| Submit to Regions | AWAITING_REGIONAL_FEEDBACK | Plan sent to Regional Directors |
| Regional Feedback | AWAITING_REGIONAL_FEEDBACK → FEEDBACK_COLLECTED | Regions collect tax center feedback |
| Planning Amendment | REVISION_REQUESTED | Director sends back for amendments |
| Amendment Review | RESUBMITTED_TO_DIRECTOR → DIRECTOR_APPROVED | Director reviews amendments |
| Senior Review | SUBMITTED_TO_SENIOR_MANAGEMENT | Sent to Senior Management |
| Deployment | SENIOR_MANAGEMENT_APPROVED → DEPLOYED_TO_REGIONS | Director deploys approved plan |

---

## Regional Feedback Details

The Plan Journey View shows exactly what each region's tax centers said:

```
North Region
├─ Tax Center A
│  ├─ Status: Feedback Received
│  ├─ Comment: "Field audit allocation needs review"
│  └─ Date: 2026-08-15 10:00 AM
│
├─ Tax Center B
│  ├─ Status: Feedback Received
│  ├─ Comment: "Desk audit numbers are realistic"
│  └─ Date: 2026-08-15 10:15 AM
│
└─ Regional Director Summary
   ├─ Overall: "Allocation is acceptable but need more resources..."
   └─ Recommendation: "Increase field audits by 50 cases"
```

---

## Accessing Plan Journey View

### From Audit Team Role
1. Click **Analysis** in sidebar
2. Click **Plan Journey**
3. Select plan from list

### From Director Role
1. Click **Review** in sidebar
2. Click **Plan Journey**
3. Select plan from list

### From Senior Management Role
1. Click **Approvals** in sidebar
2. Click **Plan Journey**
3. Select plan from list

---

## What Information Is NOT in Plan Journey

Plan Journey shows the workflow history but NOT:
- Individual case assignments (see Cases view)
- Auditor availability (see Configuration)
- Risk analysis details (see Risk Engine)
- Tax payer details (see Risk Engine)

For those details, navigate to the relevant sections.

---

## Example Use Cases

### Use Case 1: "Why did the plan change?"
1. Open Plan Journey
2. Look at Approval History
3. See all amendments with reasons
4. Understand the complete context

### Use Case 2: "What feedback did Tax Center A give?"
1. Open Plan Journey
2. Scroll to Regional Feedback Status
3. Expand North Region (if Tax Center A is there)
4. Read Tax Center A's feedback

### Use Case 3: "Where is this plan in the workflow?"
1. Open Plan Journey
2. Look at Timeline
3. See which step is 🟠 ACTIVE
4. See what steps are ✅ COMPLETED

### Use Case 4: "Has this plan been approved by Senior Management?"
1. Open Plan Journey
2. Check Status (top section)
3. Check Timeline (Step 7 status)
4. Look at Approval History (should have APPROVED_BY_SENIOR_MANAGEMENT entry)

---

## Technical Notes

- **Data Source**: All data from local storage (loadData)
- **Real-time Updates**: Refreshes when you navigate to the page
- **No External Calls**: All display logic is local
- **Audit Trail**: Based on `approvalHistory` and `regionFeedbackStatus` fields
- **Dates**: Formatted using browser locale settings

---

## Summary

The **Plan Journey View** provides complete visibility into:
- ✅ How the plan was created
- 📤 Where it's been sent
- 💬 What feedback was received
- ✏️ How it was amended
- ✅ Who approved it
- 🚀 When it's deployed

All critical details in one place for informed decision-making!

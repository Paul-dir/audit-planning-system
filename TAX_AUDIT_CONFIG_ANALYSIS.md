# Tax Audit Module - Comprehensive Configuration Analysis
## Based on Functional Requirements (FR-04.0 & FR-04.1)

**Document Version:** 1.0  
**Date:** July 2026  
**Status:** DEVELOPMENT READY  
**Purpose:** Identify all configurable parameters, data structures, roles, permissions, workflows, and reports needed for Tax Audit Module implementation

---

## EXECUTIVE SUMMARY

This document provides a detailed technical analysis of the Tax Audit Module based on functional requirements FR-04.0 (Create Audit Plan) and FR-04.1 (Audit Case Selection & Assignment). It identifies:

- **40+ configurable parameters** across 8 configuration categories
- **14 core data structures** with validation rules and relationships
- **7 distinct user roles** with granular permission sets
- **9 workflow states** for audit case progression
- **5 approval hierarchies** at different organizational levels
- **12 dynamic plan creation rules** with auto-calculation logic
- **8 report & analytics requirements** per role

---

## 1. CONFIGURABLE PARAMETERS

### 1.1 Audit Case Types Configuration

**Requirement Source:** FR-04.1-01, FR-04.1-04

#### Parameters:

```
Configuration: AUDIT_CASE_TYPES

├─ Desk Audit
│  ├─ Code: DESK_AUDIT
│  ├─ Description: Audit conducted at tax office premises
│  ├─ Risk Indicators: VAT mismatch, late filing, under-reporting
│  ├─ Estimated Duration (days): 5-10 [CONFIGURABLE]
│  ├─ Effort Estimate (hours): 40-50 [CONFIGURABLE]
│  ├─ Risk Scoring Factor: 0.8 [CONFIGURABLE]
│  ├─ Applicable Taxpayer Segments: LTO, MTO, STO [CONFIGURABLE]
│  ├─ Skill Requirements: Basic Tax Knowledge, CIT Specialist [CONFIGURABLE]
│  ├─ Complexity Level: Low [CONFIGURABLE: Low/Medium/High]
│  ├─ Revenue Impact Factor: 0.5 [CONFIGURABLE]
│  └─ Is Active: true
│
├─ Field Audit
│  ├─ Code: FIELD_AUDIT
│  ├─ Description: Audit at taxpayer premises
│  ├─ Estimated Duration (days): 15-25 [CONFIGURABLE]
│  ├─ Effort Estimate (hours): 120-150 [CONFIGURABLE]
│  ├─ Risk Scoring Factor: 1.0 [CONFIGURABLE]
│  ├─ Applicable Taxpayer Segments: LTO, MTO [CONFIGURABLE]
│  ├─ Skill Requirements: Senior Auditor, Industry Expert [CONFIGURABLE]
│  ├─ Complexity Level: Medium [CONFIGURABLE]
│  ├─ Revenue Impact Factor: 1.0 [CONFIGURABLE]
│  └─ Is Active: true
│
├─ Joint Audit
│  ├─ Code: JOINT_AUDIT
│  ├─ Description: Multiple auditors/agencies
│  ├─ Estimated Duration (days): 20-30 [CONFIGURABLE]
│  ├─ Effort Estimate (hours): 200-250 [CONFIGURABLE]
│  ├─ Risk Scoring Factor: 1.2 [CONFIGURABLE]
│  ├─ Applicable Taxpayer Segments: LTO [CONFIGURABLE]
│  ├─ Skill Requirements: Lead Auditor, Coordinating Officer [CONFIGURABLE]
│  ├─ Complexity Level: High [CONFIGURABLE]
│  ├─ Revenue Impact Factor: 1.5 [CONFIGURABLE]
│  └─ Is Active: true
│
├─ Transfer Pricing Audit
│  ├─ Code: TRANSFER_PRICING
│  ├─ Description: Transfer pricing and international transaction audit
│  ├─ Estimated Duration (days): 30-45 [CONFIGURABLE]
│  ├─ Effort Estimate (hours): 300-400 [CONFIGURABLE]
│  ├─ Risk Scoring Factor: 1.5 [CONFIGURABLE]
│  ├─ Applicable Taxpayer Segments: LTO [CONFIGURABLE]
│  ├─ Skill Requirements: Transfer Pricing Specialist, Legal [CONFIGURABLE]
│  ├─ Complexity Level: High [CONFIGURABLE]
│  ├─ Revenue Impact Factor: 2.0 [CONFIGURABLE]
│  └─ Is Active: true
│
├─ Comprehensive Audit
│  ├─ Code: COMPREHENSIVE
│  ├─ Description: Full audit of all tax types and compliance areas
│  ├─ Estimated Duration (days): 40-60 [CONFIGURABLE]
│  ├─ Effort Estimate (hours): 400-500 [CONFIGURABLE]
│  ├─ Risk Scoring Factor: 1.3 [CONFIGURABLE]
│  ├─ Applicable Taxpayer Segments: LTO [CONFIGURABLE]
│  ├─ Skill Requirements: Lead Auditor, Multiple Specialists [CONFIGURABLE]
│  ├─ Complexity Level: High [CONFIGURABLE]
│  ├─ Revenue Impact Factor: 2.5 [CONFIGURABLE]
│  └─ Is Active: true
│
└─ Single Issue Audit
   ├─ Code: SINGLE_ISSUE
   ├─ Description: Audit of specific tax issue
   ├─ Estimated Duration (days): 3-7 [CONFIGURABLE]
   ├─ Effort Estimate (hours): 20-30 [CONFIGURABLE]
   ├─ Risk Scoring Factor: 0.6 [CONFIGURABLE]
   ├─ Applicable Taxpayer Segments: STO, MTO [CONFIGURABLE]
   ├─ Skill Requirements: Issue Specialist [CONFIGURABLE]
   ├─ Complexity Level: Low [CONFIGURABLE]
   ├─ Revenue Impact Factor: 0.3 [CONFIGURABLE]
   └─ Is Active: true
```

### 1.2 Risk Parameters & Scoring Configuration

**Requirement Source:** FR-04.1-01, FR-04.1-04

#### Parameters:

```
Configuration: RISK_PARAMETERS

Risk Scoring Model:
├─ Risk Score Calculation Method
│  ├─ Method Type: WEIGHTED_SUM [CONFIGURABLE: WEIGHTED_SUM, MACHINE_LEARNING, RULES_ENGINE]
│  ├─ Minimum Score: 0 [CONFIGURABLE]
│  └─ Maximum Score: 100 [CONFIGURABLE]
│
├─ Risk Indicators (Configurable List)
│  ├─ Late Filing
│  │  ├─ Weight: 0.15 [CONFIGURABLE]
│  │  ├─ Threshold Days: 30 [CONFIGURABLE]
│  │  ├─ Scoring Formula: days_late / threshold_days * weight [CONFIGURABLE]
│  │  └─ Is Active: true
│  │
│  ├─ Late Payment
│  │  ├─ Weight: 0.20 [CONFIGURABLE]
│  │  ├─ Threshold Days: 45 [CONFIGURABLE]
│  │  ├─ Scoring Formula: amount_late / total_liability * weight [CONFIGURABLE]
│  │  └─ Is Active: true
│  │
│  ├─ VAT Mismatch
│  │  ├─ Weight: 0.18 [CONFIGURABLE]
│  │  ├─ Threshold Percentage: 10% [CONFIGURABLE]
│  │  ├─ Scoring Formula: mismatch_percentage * weight [CONFIGURABLE]
│  │  └─ Is Active: true
│  │
│  ├─ Import vs Sales Variance
│  │  ├─ Weight: 0.17 [CONFIGURABLE]
│  │  ├─ Threshold Percentage: 25% [CONFIGURABLE]
│  │  ├─ Scoring Formula: variance_percentage * weight [CONFIGURABLE]
│  │  └─ Is Active: true
│  │
│  ├─ Continuous Losses
│  │  ├─ Weight: 0.15 [CONFIGURABLE]
│  │  ├─ Threshold Years: 3 [CONFIGURABLE]
│  │  ├─ Scoring Formula: consecutive_loss_years / threshold_years * weight [CONFIGURABLE]
│  │  └─ Is Active: true
│  │
│  ├─ Under-Reporting Pattern
│  │  ├─ Weight: 0.15 [CONFIGURABLE]
│  │  ├─ Threshold Percentage: 15% [CONFIGURABLE]
│  │  ├─ Scoring Formula: underreporting_percentage * weight [CONFIGURABLE]
│  │  └─ Is Active: true
│  │
│  └─ [Additional Configurable Indicators...]
│     ├─ Custom Indicator Name [CONFIGURABLE]
│     ├─ Weight [CONFIGURABLE]
│     ├─ Threshold [CONFIGURABLE]
│     └─ Scoring Formula [CONFIGURABLE]
│
├─ Risk Thresholds (Category Boundaries)
│  ├─ Low Risk: 0-25 [CONFIGURABLE]
│  ├─ Medium Risk: 26-50 [CONFIGURABLE]
│  ├─ High Risk: 51-75 [CONFIGURABLE]
│  └─ Critical Risk: 76-100 [CONFIGURABLE]
│
├─ Risk Profile Adjustments
│  ├─ Industry Risk Multiplier: 0.8-1.5 [CONFIGURABLE per industry]
│  ├─ Geographic Risk Multiplier: 0.9-1.3 [CONFIGURABLE per region]
│  ├─ Taxpayer Segment Multiplier: 0.7-1.2 [CONFIGURABLE per segment]
│  └─ Tax Type Multiplier: 0.8-1.4 [CONFIGURABLE per tax type]
│
└─ Historical Adjustment Factors
   ├─ Previous Audit Finding Boost: +10 [CONFIGURABLE]
   ├─ Previous Adjustment Amount Boost: +0.05 [CONFIGURABLE per ETB]
   ├─ Compliance History Discount: -0.05 [CONFIGURABLE]
   └─ Time Decay Factor: 0.9 per year [CONFIGURABLE]
```

### 1.3 Skill Categories & Expertise Levels Configuration

**Requirement Source:** FR-04.1-06

#### Parameters:

```
Configuration: SKILL_CATEGORIES

Skill Type Hierarchy:
├─ Tax Specialists
│  ├─ CIT Specialist
│  │  ├─ Skill Code: CIT_SPECIALIST
│  │  ├─ Expertise Levels:
│  │  │  ├─ Entry Level (0-2 years) [CONFIGURABLE]
│  │  │  ├─ Intermediate (2-5 years) [CONFIGURABLE]
│  │  │  ├─ Advanced (5-10 years) [CONFIGURABLE]
│  │  │  └─ Expert (10+ years) [CONFIGURABLE]
│  │  ├─ Min Cases per Year: 10 [CONFIGURABLE]
│  │  ├─ Max Cases per Year: 35 [CONFIGURABLE]
│  │  ├─ Applicable Audit Types: [DESK_AUDIT, FIELD_AUDIT, JOINT_AUDIT, COMPREHENSIVE]
│  │  ├─ Revenue Threshold: 50M ETB [CONFIGURABLE]
│  │  └─ Industry Focus: Manufacturing, Wholesale [CONFIGURABLE]
│  │
│  ├─ VAT Specialist
│  │  ├─ Skill Code: VAT_SPECIALIST
│  │  ├─ Expertise Levels: [Entry, Intermediate, Advanced, Expert]
│  │  ├─ Min Cases: 15, Max Cases: 40 [CONFIGURABLE]
│  │  ├─ Applicable Audit Types: [DESK_AUDIT, FIELD_AUDIT, COMPREHENSIVE]
│  │  ├─ Revenue Threshold: 30M ETB [CONFIGURABLE]
│  │  └─ Industry Focus: Retail, Services [CONFIGURABLE]
│  │
│  ├─ Transfer Pricing Specialist
│  │  ├─ Skill Code: TP_SPECIALIST
│  │  ├─ Expertise Levels: [Entry, Intermediate, Advanced, Expert]
│  │  ├─ Min Cases: 3, Max Cases: 10 [CONFIGURABLE]
│  │  ├─ Applicable Audit Types: [TRANSFER_PRICING, JOINT_AUDIT]
│  │  ├─ Revenue Threshold: 500M ETB [CONFIGURABLE]
│  │  └─ Geographic Focus: Border regions [CONFIGURABLE]
│  │
│  └─ [Additional Skill Categories...]
│
├─ Auditor Levels
│  ├─ Junior Auditor
│  │  ├─ Level Code: JUNIOR_AUDITOR
│  │  ├─ Max Concurrent Cases: 5 [CONFIGURABLE]
│  │  ├─ Max Case Complexity: Low-Medium [CONFIGURABLE]
│  │  ├─ Required Supervision: Lead Auditor [CONFIGURABLE]
│  │  └─ Training Hours Required: 40 [CONFIGURABLE]
│  │
│  ├─ Senior Auditor
│  │  ├─ Level Code: SENIOR_AUDITOR
│  │  ├─ Max Concurrent Cases: 8 [CONFIGURABLE]
│  │  ├─ Max Case Complexity: Medium-High [CONFIGURABLE]
│  │  ├─ Can Lead: Junior Auditors [CONFIGURABLE]
│  │  └─ Training Hours Required: 80 [CONFIGURABLE]
│  │
│  └─ Lead Auditor / Team Leader
│     ├─ Level Code: LEAD_AUDITOR
│     ├─ Max Concurrent Cases: 10 [CONFIGURABLE]
│     ├─ Max Case Complexity: All [CONFIGURABLE]
│     ├─ Can Lead Teams: Yes [CONFIGURABLE]
│     └─ Training Hours Required: 120 [CONFIGURABLE]
│
└─ Seniority & Knowledge Attributes
   ├─ Years of Experience [CONFIGURABLE per level]
   ├─ Previous Cases Closed [CONFIGURABLE threshold]
   ├─ Audit Adjustments Made [CONFIGURABLE threshold]
   ├─ Taxpayer Segments Handled [CONFIGURABLE]
   └─ Geographic Regions Worked [CONFIGURABLE]
```


### 1.4 Workload Capacity Rules Configuration

**Requirement Source:** FR-04.1-04, FR-04.1-06, FR-04.1-10

#### Parameters:

```
Configuration: WORKLOAD_CAPACITY_RULES

Auditor Capacity Model:
├─ Annual Capacity Planning
│  ├─ Working Days per Year: 220 [CONFIGURABLE]
│  ├─ Average Hours per Day: 8 [CONFIGURABLE]
│  ├─ Training Hours Deduction: 40 [CONFIGURABLE]
│  ├─ Leave Hours Deduction: 160 [CONFIGURABLE]
│  ├─ Admin Hours Deduction: 80 [CONFIGURABLE]
│  └─ Available Billable Hours: 752 hours/year [AUTO-CALCULATED]
│
├─ Case Allocation Capacity Rules
│  ├─ Max Concurrent Cases per Auditor: 5 [CONFIGURABLE]
│  ├─ Max Concurrent Cases per Senior Auditor: 8 [CONFIGURABLE]
│  ├─ Max Concurrent Cases per Lead Auditor: 10 [CONFIGURABLE]
│  ├─ Case Overlap Percentage: 20% [CONFIGURABLE - allows staggered endings]
│  ├─ Min Days Between Case Closing & New Assignment: 2 [CONFIGURABLE]
│  └─ Cooldown Period After Complex Case: 5 days [CONFIGURABLE]
│
├─ Workload Balancing Rules
│  ├─ Equal Distribution Method: ROUND_ROBIN [CONFIGURABLE: ROUND_ROBIN, LOAD_BALANCED, SKILL_MATCHED]
│  ├─ Uneven Distribution Tolerance: ±15% [CONFIGURABLE]
│  ├─ Skill Utilization Target: 80% [CONFIGURABLE]
│  ├─ Specialty Hours Reservation: 20% [CONFIGURABLE]
│  └─ Generalist Hours Reservation: 15% [CONFIGURABLE]
│
├─ Tax Center Level Capacity
│  ├─ Total Auditors: [PER TAX CENTER - CONFIGURABLE]
│  ├─ Skill Distribution Target:
│  │  ├─ CIT Specialists: 30% [CONFIGURABLE]
│  │  ├─ VAT Specialists: 30% [CONFIGURABLE]
│  │  ├─ Transfer Pricing: 10% [CONFIGURABLE]
│  │  ├─ General Auditors: 30% [CONFIGURABLE]
│  │  └─ Lead Auditors: 10% [CONFIGURABLE]
│  ├─ Supervision Ratio: 1 Lead per 4 Junior [CONFIGURABLE]
│  └─ Annual Cases per TC: [CALCULATED based on capacity]
│
├─ Workload Alerts & Thresholds
│  ├─ Overload Alert Threshold: 90% [CONFIGURABLE]
│  ├─ Underutilization Alert Threshold: 40% [CONFIGURABLE]
│  ├─ Skill Gap Alert: If required skill unavailable [CONFIGURABLE]
│  └─ Burnout Risk Alert: >200 hours/month for 3+ months [CONFIGURABLE]
│
└─ Capacity Adjustment Factors
   ├─ Productivity Factor by Region: 0.8-1.1 [CONFIGURABLE]
   ├─ Learning Curve Adjustment: 0.7-1.0 [CONFIGURABLE]
   ├─ Case Complexity Impact: 0.8-1.3 [CONFIGURABLE]
   └─ Team Cohesion Bonus: +5-10% [CONFIGURABLE]
```

### 1.5 Case Allocation Rules by Taxpayer Classification

**Requirement Source:** FR-04.1-10

#### Parameters:

```
Configuration: CASE_ALLOCATION_RULES

Taxpayer Classification Rules:
├─ Large Taxpayer Organization (LTO)
│  ├─ Classification Code: LTO
│  ├─ Criteria:
│  │  ├─ Annual Revenue Threshold: >500M ETB [CONFIGURABLE]
│  │  ├─ Tax Payment: >50M ETB annually [CONFIGURABLE]
│  │  ├─ Employees: >500 [CONFIGURABLE]
│  │  └─ Tax Types: Multiple (CIT, VAT, Payroll, Custom) [CONFIGURABLE]
│  │
│  ├─ Allocation Rules:
│  │  ├─ Audit Type Distribution:
│  │  │  ├─ Desk Audit: 10% [CONFIGURABLE]
│  │  │  ├─ Field Audit: 40% [CONFIGURABLE]
│  │  │  ├─ Comprehensive: 25% [CONFIGURABLE]
│  │  │  ├─ Transfer Pricing: 15% [CONFIGURABLE]
│  │  │  ├─ Joint Audit: 8% [CONFIGURABLE]
│  │  │  └─ Single Issue: 2% [CONFIGURABLE]
│  │  │
│  │  ├─ Assigned Auditor Level: Senior Auditor or Lead [CONFIGURABLE]
│  │  ├─ Team Size Requirement: 2-4 auditors [CONFIGURABLE]
│  │  ├─ Lead Auditor Mandatory: true [CONFIGURABLE]
│  │  ├─ Min Audit Frequency: Once every 2 years [CONFIGURABLE]
│  │  ├─ Preferred Auditor Skills: [CIT_SPECIALIST, TP_SPECIALIST, etc.] [CONFIGURABLE]
│  │  ├─ Geographic Allocation: Prefer same region as TC [CONFIGURABLE]
│  │  ├─ Industry-Specific Auditor: Required [CONFIGURABLE]
│  │  ├─ Continuity Rule: Same team leads if possible [CONFIGURABLE]
│  │  └─ Risk Scoring Boost: +15% [CONFIGURABLE]
│  │
│  └─ Escalation Rules:
│     ├─ If findings >100M ETB → Escalate to Director [CONFIGURABLE]
│     ├─ If TP issues detected → Escalate to TP Specialist [CONFIGURABLE]
│     └─ If fraud suspected → Escalate to Intelligence Unit [CONFIGURABLE]
│
├─ Medium Taxpayer Organization (MTO)
│  ├─ Classification Code: MTO
│  ├─ Criteria:
│  │  ├─ Annual Revenue Threshold: 50M - 500M ETB [CONFIGURABLE]
│  │  ├─ Tax Payment: 5M - 50M ETB [CONFIGURABLE]
│  │  ├─ Employees: 50-500 [CONFIGURABLE]
│  │  └─ Tax Types: 2+ types [CONFIGURABLE]
│  │
│  ├─ Allocation Rules:
│  │  ├─ Audit Type Distribution:
│  │  │  ├─ Desk Audit: 30% [CONFIGURABLE]
│  │  │  ├─ Field Audit: 40% [CONFIGURABLE]
│  │  │  ├─ Comprehensive: 15% [CONFIGURABLE]
│  │  │  ├─ Transfer Pricing: 5% [CONFIGURABLE]
│  │  │  ├─ Single Issue: 10% [CONFIGURABLE]
│  │  │  └─ Joint Audit: 0% [CONFIGURABLE]
│  │  │
│  │  ├─ Assigned Auditor Level: Senior Auditor [CONFIGURABLE]
│  │  ├─ Team Size Requirement: 1-2 auditors [CONFIGURABLE]
│  │  ├─ Lead Auditor Mandatory: false [CONFIGURABLE]
│  │  ├─ Min Audit Frequency: Once every 3-4 years [CONFIGURABLE]
│  │  ├─ Preferred Auditor Skills: [VAT_SPECIALIST, CIT_SPECIALIST] [CONFIGURABLE]
│  │  ├─ Continuity Rule: Prefer same auditor if possible [CONFIGURABLE]
│  │  └─ Risk Scoring Boost: +5% [CONFIGURABLE]
│  │
│  └─ Escalation Rules:
│     ├─ If findings >20M ETB → Escalate to Tax Center Manager [CONFIGURABLE]
│     └─ If fraud suspected → Escalate to Investigation [CONFIGURABLE]
│
├─ Small Taxpayer Organization (STO)
│  ├─ Classification Code: STO
│  ├─ Criteria:
│  │  ├─ Annual Revenue Threshold: <50M ETB [CONFIGURABLE]
│  │  ├─ Tax Payment: <5M ETB [CONFIGURABLE]
│  │  ├─ Employees: <50 [CONFIGURABLE]
│  │  └─ Tax Types: Single or minimal [CONFIGURABLE]
│  │
│  ├─ Allocation Rules:
│  │  ├─ Audit Type Distribution:
│  │  │  ├─ Desk Audit: 70% [CONFIGURABLE]
│  │  │  ├─ Field Audit: 20% [CONFIGURABLE]
│  │  │  ├─ Single Issue: 10% [CONFIGURABLE]
│  │  │  └─ Others: 0% [CONFIGURABLE]
│  │  │
│  │  ├─ Assigned Auditor Level: Junior or Senior Auditor [CONFIGURABLE]
│  │  ├─ Team Size Requirement: 1 auditor [CONFIGURABLE]
│  │  ├─ Lead Auditor Mandatory: false [CONFIGURABLE]
│  │  ├─ Min Audit Frequency: Random sampling [CONFIGURABLE]
│  │  ├─ Preferred Auditor Skills: [VAT_SPECIALIST] [CONFIGURABLE]
│  │  └─ Risk Scoring Boost: 0% [CONFIGURABLE]
│  │
│  └─ Escalation Rules:
│     ├─ If findings >5M ETB → Escalate to Senior Auditor [CONFIGURABLE]
│     └─ If multiple issues → Convert to Comprehensive [CONFIGURABLE]
│
├─ Geographic Risk Profile Rules
│  ├─ Region: Addis Ababa
│  │  ├─ Risk Multiplier: 1.2 [CONFIGURABLE]
│  │  ├─ Preferred Audit Types: Field Audit, Comprehensive [CONFIGURABLE]
│  │  ├─ Industry Focus: Services, Finance [CONFIGURABLE]
│  │  └─ Special Rules: Large enterprise concentration [CONFIGURABLE]
│  │
│  └─ [Additional Regions with similar structure...]
│
└─ Industry Risk Profile Rules
   ├─ Manufacturing
   │  ├─ Risk Multiplier: 1.3 [CONFIGURABLE]
   │  ├─ Preferred Audit Types: Field, Comprehensive [CONFIGURABLE]
   │  ├─ Common Risk Indicators: Import variance, Transfer pricing [CONFIGURABLE]
   │  ├─ Required Skills: CIT, TP Specialist [CONFIGURABLE]
   │  └─ Audit Frequency: Annual for LTO [CONFIGURABLE]
   │
   └─ [Additional Industries...]
```

### 1.6 Approval Workflows & Thresholds Configuration

**Requirement Source:** FR-04.0-02, FR-04.0-04, FR-04.0-05

#### Parameters:

```
Configuration: APPROVAL_WORKFLOWS

Approval Hierarchy Levels:
├─ Level 1: Audit Team Lead Approval
│  ├─ Threshold Amount: 0 - 1M ETB [CONFIGURABLE]
│  ├─ Required Approval: Team Lead [CONFIGURABLE]
│  ├─ Approval Time SLA: 2 business days [CONFIGURABLE]
│  ├─ Auto-Escalate if Exceeds: 7 days [CONFIGURABLE]
│  ├─ Notification Recipients: [Team Lead, Manager] [CONFIGURABLE]
│  └─ Documentation Required: Case summary [CONFIGURABLE]
│
├─ Level 2: Tax Center Manager Approval
│  ├─ Threshold Amount: 1M - 10M ETB [CONFIGURABLE]
│  ├─ Required Approval: Tax Center Manager [CONFIGURABLE]
│  ├─ Approval Time SLA: 3 business days [CONFIGURABLE]
│  ├─ Auto-Escalate if Exceeds: 10 days [CONFIGURABLE]
│  ├─ Notification Recipients: [Manager, Regional Director] [CONFIGURABLE]
│  └─ Documentation Required: [Case summary, Audit evidence] [CONFIGURABLE]
│
├─ Level 3: Regional Director Approval
│  ├─ Threshold Amount: 10M - 50M ETB [CONFIGURABLE]
│  ├─ Required Approval: Regional Director [CONFIGURABLE]
│  ├─ Approval Time SLA: 5 business days [CONFIGURABLE]
│  ├─ Auto-Escalate if Exceeds: 15 days [CONFIGURABLE]
│  ├─ Notification Recipients: [Regional Director, Audit Director] [CONFIGURABLE]
│  └─ Documentation Required: [Full case file] [CONFIGURABLE]
│
├─ Level 4: Audit Director Approval
│  ├─ Threshold Amount: 50M - 200M ETB [CONFIGURABLE]
│  ├─ Required Approval: Audit Director [CONFIGURABLE]
│  ├─ Approval Time SLA: 7 business days [CONFIGURABLE]
│  ├─ Auto-Escalate if Exceeds: 20 days [CONFIGURABLE]
│  ├─ Notification Recipients: [Director, Senior Management] [CONFIGURABLE]
│  └─ Documentation Required: [Complete file + legal review] [CONFIGURABLE]
│
└─ Level 5: Senior Management / Risk Committee Approval
   ├─ Threshold Amount: >200M ETB [CONFIGURABLE]
   ├─ Required Approval: Senior Management Committee [CONFIGURABLE]
   ├─ Approval Time SLA: 10 business days [CONFIGURABLE]
   ├─ Auto-Escalate if Exceeds: 25 days [CONFIGURABLE]
   ├─ Notification Recipients: [All senior management] [CONFIGURABLE]
   ├─ Documentation Required: [Complete file + strategic review] [CONFIGURABLE]
   └─ Committee Member Count Required: 2 of 3 [CONFIGURABLE]

Approval Decision Rules:
├─ Approval Conditions
│  ├─ All supporting documentation attached: Mandatory [CONFIGURABLE]
│  ├─ Risk assessment completed: Mandatory [CONFIGURABLE]
│  ├─ Skill availability confirmed: Mandatory [CONFIGURABLE]
│  ├─ Budget allocation confirmed: Mandatory [CONFIGURABLE]
│  ├─ No conflicting cases: Mandatory [CONFIGURABLE]
│  └─ Audit team availability: Mandatory [CONFIGURABLE]
│
├─ Rejection Reasons
│  ├─ Insufficient documentation [CONFIGURABLE]
│  ├─ Inadequate audit team skills [CONFIGURABLE]
│  ├─ Conflicting priorities [CONFIGURABLE]
│  ├─ Budget constraints [CONFIGURABLE]
│  └─ [Additional reasons...]
│
├─ Remand/Revision Triggers
│  ├─ Minor issues: Return for revision (7 days) [CONFIGURABLE]
│  ├─ Missing information: Request supplement (5 days) [CONFIGURABLE]
│  ├─ Significant concerns: Reject and resubmit (14 days) [CONFIGURABLE]
│  └─ Policy non-compliance: Mandatory rejection [CONFIGURABLE]
│
└─ Notification Configuration
   ├─ Approval granted notification: To all parties [CONFIGURABLE]
   ├─ Approval rejected notification: To submitter + escalation [CONFIGURABLE]
   ├─ Revision requested notification: To submitter + deadline [CONFIGURABLE]
   ├─ Reminder notifications: 1, 3, 5 days before deadline [CONFIGURABLE]
   └─ Escalation notifications: Hourly after auto-escalate [CONFIGURABLE]
```


### 1.7 Geographic & Industry Risk Profiles Configuration

**Requirement Source:** FR-04.1-01, FR-04.1-04

#### Parameters:

```
Configuration: GEOGRAPHIC_INDUSTRY_RISK_PROFILES

Geographic Risk Profiles:
├─ Region: Addis Ababa
│  ├─ Region Code: AA
│  ├─ Risk Category: HIGH [CONFIGURABLE]
│  ├─ Risk Multiplier: 1.3 [CONFIGURABLE]
│  ├─ Registered Taxpayers: 1,200,000 [DATA]
│  ├─ Revenue at Risk: 4.8B ETB [CALCULATED]
│  ├─ Priority Industries: Services, Finance, Import/Export [CONFIGURABLE]
│  ├─ Predominant Audit Types: Field, Comprehensive, TP [CONFIGURABLE]
│  ├─ Tax Center Count: 15 [DATA]
│  ├─ Available Auditors: 250 [DATA]
│  ├─ Auditor Distribution:
│  │  ├─ Senior Auditors: 60% [CONFIGURABLE]
│  │  ├─ Junior Auditors: 30% [CONFIGURABLE]
│  │  ├─ Specialists: 10% [CONFIGURABLE]
│  │  └─ Lead Auditors: 12% [CONFIGURABLE]
│  │
│  ├─ Special Rules:
│  │  ├─ Minimum case complexity: Medium [CONFIGURABLE]
│  │  ├─ Must include TP review if revenue >100M ETB [CONFIGURABLE]
│  │  ├─ Random sampling rate: 5% [CONFIGURABLE]
│  │  ├─ Annual audit target: 800 cases [CONFIGURABLE]
│  │  └─ Risk alert threshold: Risk score >70 [CONFIGURABLE]
│  │
│  └─ Capacity Constraints:
│     ├─ Max concurrent cases: 350 [CONFIGURABLE]
│     ├─ Max cases per auditor: 8 [CONFIGURABLE]
│     └─ Min rest days between audits: 3 [CONFIGURABLE]
│
├─ Region: Oromia
│  ├─ Region Code: OR
│  ├─ Risk Category: MEDIUM [CONFIGURABLE]
│  ├─ Risk Multiplier: 1.0 [CONFIGURABLE]
│  ├─ Registered Taxpayers: 900,000 [DATA]
│  ├─ Revenue at Risk: 3.2B ETB [CALCULATED]
│  ├─ Priority Industries: Agriculture, Manufacturing, Trade [CONFIGURABLE]
│  ├─ Predominant Audit Types: Field, Desk, Single Issue [CONFIGURABLE]
│  ├─ [Similar structure to Addis Ababa...]
│
├─ [Additional Regions: Amhara, SNNPR, Tigray, etc.]
│  ├─ [Similar structure for each region...]
│  └─ [All configurable parameters...]
│
└─ Geographic Cross-Region Rules
   ├─ Multi-regional Companies: Allocated to lead tax center [CONFIGURABLE]
   ├─ Audit Coordination Required: If operations in >2 regions [CONFIGURABLE]
   ├─ Regional Auditor Assignment: Prefer local expertise [CONFIGURABLE]
   └─ Cross-region TP coordination: Mandatory [CONFIGURABLE]

Industry Risk Profiles:
├─ Industry: Manufacturing
│  ├─ Industry Code: MANUFACTURING
│  ├─ Risk Category: HIGH [CONFIGURABLE]
│  ├─ Risk Multiplier: 1.3 [CONFIGURABLE]
│  ├─ Typical Revenue Range: 100M - 2B ETB [CONFIGURABLE]
│  ├─ Common Risk Indicators:
│  │  ├─ Import vs Sales variance [CONFIGURABLE]
│  │  ├─ VAT input credit misuse [CONFIGURABLE]
│  │  ├─ Transfer pricing issues [CONFIGURABLE]
│  │  ├─ Under-reporting of production [CONFIGURABLE]
│  │  └─ Continuous losses despite production [CONFIGURABLE]
│  │
│  ├─ Recommended Audit Types: Field, Comprehensive, TP [CONFIGURABLE]
│  ├─ Required Auditor Skills: [CIT, TP, Industry Expert] [CONFIGURABLE]
│  ├─ Min Audit Frequency: 2-3 years [CONFIGURABLE]
│  ├─ Typical Audit Duration: 25-35 days [CONFIGURABLE]
│  ├─ Estimated Revenue Yield: 0.8-1.2M ETB per audit [CONFIGURABLE]
│  ├─ Common Sub-sectors:
│  │  ├─ Textiles: Risk Multiplier 1.2 [CONFIGURABLE]
│  │  ├─ Food & Beverage: Risk Multiplier 1.1 [CONFIGURABLE]
│  │  ├─ Chemicals: Risk Multiplier 1.4 [CONFIGURABLE]
│  │  ├─ Metals: Risk Multiplier 1.3 [CONFIGURABLE]
│  │  └─ Cement & Construction Materials: Risk Multiplier 1.2 [CONFIGURABLE]
│  │
│  └─ Special Requirements:
│     ├─ Site inspection mandatory [CONFIGURABLE]
│     ├─ Inventory verification required [CONFIGURABLE]
│     ├─ Production records review [CONFIGURABLE]
│     └─ Third-party data matching [CONFIGURABLE]
│
├─ Industry: Services
│  ├─ Industry Code: SERVICES
│  ├─ Risk Category: MEDIUM [CONFIGURABLE]
│  ├─ Risk Multiplier: 1.0 [CONFIGURABLE]
│  ├─ Typical Revenue Range: 10M - 500M ETB [CONFIGURABLE]
│  ├─ Common Risk Indicators: [See pattern above...]
│  ├─ [Complete structure similar to Manufacturing...]
│
├─ Industry: Import/Export
│  ├─ Industry Code: IMPORT_EXPORT
│  ├─ Risk Category: VERY_HIGH [CONFIGURABLE]
│  ├─ Risk Multiplier: 1.5 [CONFIGURABLE]
│  ├─ Typical Revenue Range: 200M - 5B ETB [CONFIGURABLE]
│  ├─ Common Risk Indicators:
│  │  ├─ Transfer pricing on international transactions [CONFIGURABLE]
│  │  ├─ Customs duty misclassification [CONFIGURABLE]
│  │  ├─ Invoice manipulation [CONFIGURABLE]
│  │  ├─ Phantom imports [CONFIGURABLE]
│  │  └─ Over-invoicing / Under-invoicing [CONFIGURABLE]
│  │
│  ├─ Required Audit Types: Transfer Pricing, Joint Audit, Comprehensive [CONFIGURABLE]
│  ├─ Required Auditor Skills: [TP Specialist, Customs Expert, Forensic] [CONFIGURABLE]
│  ├─ [Complete structure...]
│
├─ [Additional Industries: Retail, Finance, Agriculture, Construction, etc.]
│  ├─ [Complete configurable structure for each...]
│
└─ Industry-Region Cross Profile
   ├─ High-risk industry in high-risk region: Multiplier ×1.5 [CONFIGURABLE]
   ├─ High-risk industry in low-risk region: Multiplier ×1.2 [CONFIGURABLE]
   ├─ Low-risk industry in high-risk region: Multiplier ×1.1 [CONFIGURABLE]
   ├─ Low-risk industry in low-risk region: Multiplier ×1.0 [CONFIGURABLE]
   └─ [Complete cross-profile matrix...]
```

### 1.8 Risk Engine Calculation Configuration

**Requirement Source:** FR-04.1-01 (Risk profiling & indicators)

#### Parameters:

```
Configuration: RISK_ENGINE_CONFIG

Third-Party Data Source Matching:
├─ Match Data Sources (Configurable List)
│  ├─ Customs Authority Data
│  │  ├─ Data Source Code: CUSTOMS_DATA
│  │  ├─ Sync Frequency: Daily [CONFIGURABLE]
│  │  ├─ Match Fields: [TIN, Import Amount, Product Code] [CONFIGURABLE]
│  │  ├─ Variance Threshold: ±10% [CONFIGURABLE]
│  │  ├─ Risk Score Adjustment: +0.15 if variance [CONFIGURABLE]
│  │  └─ Alert on Mismatch: Yes [CONFIGURABLE]
│  │
│  ├─ Banking Authority Data
│  │  ├─ Data Source Code: BANKING_DATA
│  │  ├─ Sync Frequency: Monthly [CONFIGURABLE]
│  │  ├─ Match Fields: [TIN, Transaction Amount] [CONFIGURABLE]
│  │  ├─ Variance Threshold: ±15% [CONFIGURABLE]
│  │  ├─ Risk Score Adjustment: +0.10 if variance [CONFIGURABLE]
│  │  └─ Alert on Mismatch: Yes [CONFIGURABLE]
│  │
│  ├─ Industry Statistics Database
│  │  ├─ Data Source Code: INDUSTRY_STATS
│  │  ├─ Sync Frequency: Quarterly [CONFIGURABLE]
│  │  ├─ Match Fields: [Industry, Revenue, Expenses Ratio] [CONFIGURABLE]
│  │  ├─ Variance Threshold: ±20% [CONFIGURABLE]
│  │  ├─ Risk Score Adjustment: +0.08 if variance [CONFIGURABLE]
│  │  └─ Alert on Mismatch: Yes [CONFIGURABLE]
│  │
│  └─ [Additional Data Sources...]
│
├─ Pattern Recognition Models
│  ├─ Under-Reporting Pattern Detection
│  │  ├─ Model Type: STATISTICAL [CONFIGURABLE: STATISTICAL, ML, RULES]
│  │  ├─ Detection Period: 3 years [CONFIGURABLE]
│  │  ├─ Threshold: >15% consistent under-reporting [CONFIGURABLE]
│  │  ├─ Risk Score Boost: +0.20 [CONFIGURABLE]
│  │  ├─ Confidence Level Required: 80% [CONFIGURABLE]
│  │  └─ Alert Level: HIGH [CONFIGURABLE]
│  │
│  ├─ Revenue Risk Pattern Detection
│  │  ├─ Model Type: STATISTICAL [CONFIGURABLE]
│  │  ├─ Detection Method: Comparison to industry benchmarks [CONFIGURABLE]
│  │  ├─ Threshold: <5th percentile or >95th percentile [CONFIGURABLE]
│  │  ├─ Risk Score Boost: +0.15 [CONFIGURABLE]
│  │  └─ Alert Level: MEDIUM [CONFIGURABLE]
│  │
│  └─ [Additional Pattern Models...]
│
├─ Forensic Modeling Rules
│  ├─ Non-Submission of Returns Analysis
│  │  ├─ Trigger: No return filed for >90 days past deadline [CONFIGURABLE]
│  │  ├─ Risk Score: 85-100 [CONFIGURABLE]
│  │  ├─ Action Required: Automatic investigation flag [CONFIGURABLE]
│  │  ├─ Alert Level: CRITICAL [CONFIGURABLE]
│  │  └─ Escalation Required: Immediate [CONFIGURABLE]
│  │
│  ├─ Continuous Loss Analysis
│  │  ├─ Trigger: Losses in 3+ consecutive years [CONFIGURABLE]
│  │  ├─ Analysis: Revenue vs declared expenses [CONFIGURABLE]
│  │  ├─ Risk Score Boost: +0.20 [CONFIGURABLE]
│  │  ├─ Investigation Type: Review cost allocation [CONFIGURABLE]
│  │  └─ Threshold for Adjustment: >50% loss variance [CONFIGURABLE]
│  │
│  └─ [Additional Forensic Models...]
│
└─ Risk Score Persistence & Aging
   ├─ Historical Risk Scores: Keep 3-5 years [CONFIGURABLE]
   ├─ Score Recalculation Frequency: Monthly [CONFIGURABLE]
   ├─ Time Decay Factor: 0.9 per year [CONFIGURABLE]
   ├─ Recent Audit Discount: -0.10 if audited <2 years [CONFIGURABLE]
   ├─ Compliance History Improvement: -0.05 per year if clean [CONFIGURABLE]
   └─ Forensic Flag Persistence: Keep indefinitely [CONFIGURABLE]
```

---

## 2. DATA STRUCTURES FOR EACH CONFIGURATION

### 2.1 Audit Case Type Data Structure

```json
{
  "id": "uuid",
  "code": "DESK_AUDIT",
  "name": "Desk Audit",
  "description": "Audit conducted at tax office premises",
  "isActive": true,
  "createdDate": "2026-01-15T10:30:00Z",
  "lastModifiedDate": "2026-07-20T14:45:00Z",
  "createdBy": "admin@tax.gov.et",
  "modifiedBy": "admin@tax.gov.et",
  
  "auditCharacteristics": {
    "estimatedDurationDays": {
      "minimum": 5,
      "typical": 8,
      "maximum": 10
    },
    "effortEstimate": {
      "minimumHours": 40,
      "typicalHours": 45,
      "maximumHours": 50
    },
    "riskScoringFactor": 0.8,
    "complexityLevel": "LOW",
    "revenueImpactFactor": 0.5
  },
  
  "applicableSegments": ["LTO", "MTO", "STO"],
  "applicableIndustries": ["MANUFACTURING", "SERVICES", "RETAIL"],
  "applicableRegions": ["AA", "OR", "AM", "SNNPR", "TG", "DD"],
  
  "skillRequirements": [
    {
      "skillCode": "CIT_SPECIALIST",
      "expertise": "Intermediate",
      "mandatory": true
    },
    {
      "skillCode": "VAT_SPECIALIST",
      "expertise": "Entry",
      "mandatory": false
    }
  ],
  
  "workflowSteps": [
    "CASE_ASSIGNMENT",
    "CASE_OPENING",
    "EVIDENCE_GATHERING",
    "PRELIMINARY_FINDINGS",
    "DISCUSSION_WITH_TAXPAYER",
    "FINAL_ASSESSMENT",
    "APPROVAL",
    "CLOSURE"
  ],
  
  "riskParameters": {
    "focusAreas": [
      "VAT_RECONCILIATION",
      "FILING_COMPLIANCE",
      "DOCUMENTATION"
    ],
    "targetIndicators": [
      "LATE_FILING",
      "LATE_PAYMENT",
      "VAT_MISMATCH"
    ]
  },
  
  "validation": {
    "estimatedDurationDays": "number, >=3, <=60",
    "effortEstimate": "number, >=20, <=500",
    "riskScoringFactor": "number, >=0, <=2",
    "skillRequirements": "array, min 1 item",
    "code": "string, unique, alphanumeric"
  },
  
  "relationships": {
    "linkedAuditPlans": ["plan_id_1", "plan_id_2"],
    "linkedCases": ["case_id_1", "case_id_2"],
    "linkedSkillCategories": ["skill_id_1", "skill_id_2"]
  },
  
  "audit": {
    "version": 2,
    "changeLog": [
      {
        "version": 1,
        "changedDate": "2026-01-15T10:30:00Z",
        "changedBy": "admin",
        "changes": "Initial creation"
      },
      {
        "version": 2,
        "changedDate": "2026-07-20T14:45:00Z",
        "changedBy": "config_manager",
        "changes": "Updated effort estimate from 40-45 to 40-50"
      }
    ]
  }
}
```


### 2.2 Risk Parameter Data Structure

```json
{
  "id": "uuid",
  "code": "RISK_PARAM_001",
  "name": "Risk Scoring Configuration",
  "description": "System-wide risk scoring model and parameters",
  "isActive": true,
  "effectiveDate": "2026-01-01T00:00:00Z",
  "expiryDate": null,
  
  "scoringModel": {
    "type": "WEIGHTED_SUM",
    "minScore": 0,
    "maxScore": 100,
    "calculationMethod": "SUM(indicator_score * weight)",
    "roundingMethod": "ROUND_TO_NEAREST_INTEGER"
  },
  
  "riskIndicators": [
    {
      "indicatorId": "uuid",
      "code": "LATE_FILING",
      "name": "Late Filing",
      "description": "Taxpayer files returns after deadline",
      "weight": 0.15,
      "thresholdDays": 30,
      "scoringFormula": "(days_late / threshold_days) * weight",
      "isActive": true,
      "applicableAuditTypes": ["DESK_AUDIT", "FIELD_AUDIT", "COMPREHENSIVE"],
      "dataSource": "FILING_SYSTEM"
    },
    {
      "indicatorId": "uuid",
      "code": "LATE_PAYMENT",
      "name": "Late Payment",
      "description": "Taxpayer makes payment after due date",
      "weight": 0.20,
      "thresholdDays": 45,
      "scoringFormula": "(amount_late / total_liability) * weight",
      "isActive": true,
      "applicableAuditTypes": ["DESK_AUDIT", "FIELD_AUDIT", "COMPREHENSIVE"],
      "dataSource": "PAYMENT_SYSTEM"
    },
    {
      "indicatorId": "uuid",
      "code": "VAT_MISMATCH",
      "name": "VAT Mismatch",
      "description": "VAT output vs input variance",
      "weight": 0.18,
      "thresholdPercentage": 10.0,
      "scoringFormula": "mismatch_percentage * weight",
      "isActive": true,
      "applicableAuditTypes": ["DESK_AUDIT", "FIELD_AUDIT"],
      "dataSource": "TAX_DECLARATION"
    }
  ],
  
  "riskThresholds": {
    "low": {
      "min": 0,
      "max": 25,
      "category": "LOW_RISK",
      "auditFrequency": "NONE",
      "defaultAuditType": "DESK_AUDIT"
    },
    "medium": {
      "min": 26,
      "max": 50,
      "category": "MEDIUM_RISK",
      "auditFrequency": "EVERY_5_YEARS",
      "defaultAuditType": "DESK_AUDIT"
    },
    "high": {
      "min": 51,
      "max": 75,
      "category": "HIGH_RISK",
      "auditFrequency": "EVERY_3_YEARS",
      "defaultAuditType": "FIELD_AUDIT"
    },
    "critical": {
      "min": 76,
      "max": 100,
      "category": "CRITICAL_RISK",
      "auditFrequency": "ANNUAL",
      "defaultAuditType": "COMPREHENSIVE"
    }
  },
  
  "riskAdjustmentFactors": {
    "industryMultipliers": {
      "MANUFACTURING": 1.3,
      "SERVICES": 1.0,
      "RETAIL": 1.1,
      "IMPORT_EXPORT": 1.5,
      "AGRICULTURE": 0.9
    },
    "geographicMultipliers": {
      "AA": 1.2,
      "OR": 1.0,
      "AM": 0.95,
      "SNNPR": 0.9,
      "TG": 1.1,
      "DD": 0.85
    },
    "taxpayerSegmentMultipliers": {
      "LTO": 1.2,
      "MTO": 1.0,
      "STO": 0.7
    }
  },
  
  "historicalAdjustments": {
    "previousAuditFindingBoost": 10,
    "previousAdjustmentAmountBoost": 0.05,
    "complianceHistoryDiscount": -0.05,
    "timDecayFactor": 0.9,
    "maxLookbackYears": 5
  },
  
  "validation": {
    "minScore": "number, >=0",
    "maxScore": "number, >minScore, <=1000",
    "indicatorWeights": "array, SUM(weights) = 1.0 ±0.05",
    "thresholds": "ordered asc: low < medium < high < critical",
    "multipliers": "number, >=0.5, <=2.0"
  },
  
  "audit": {
    "version": 1,
    "createdDate": "2026-01-01T00:00:00Z",
    "createdBy": "system_admin",
    "lastModifiedDate": "2026-07-20T14:45:00Z",
    "lastModifiedBy": "config_manager"
  }
}
```

### 2.3 Skill Category Data Structure

```json
{
  "id": "uuid",
  "code": "CIT_SPECIALIST",
  "name": "CIT Specialist",
  "description": "Corporate Income Tax specialization",
  "category": "TAX_SPECIALIST",
  "isActive": true,
  
  "expertiseLevels": [
    {
      "level": "ENTRY",
      "name": "Entry Level",
      "yearsRequired": 0,
      "yearsExperience": "0-2",
      "casesCompletedRequired": 0,
      "certifications": [],
      "capabilities": [
        "Basic tax reconciliation",
        "Routine compliance review",
        "Documentation verification"
      ],
      "limitations": [
        "Cannot lead audits",
        "Max simple cases only",
        "Requires supervision"
      ]
    },
    {
      "level": "INTERMEDIATE",
      "name": "Intermediate",
      "yearsRequired": 2,
      "yearsExperience": "2-5",
      "casesCompletedRequired": 15,
      "certifications": ["CIT_INTERMEDIATE"],
      "capabilities": [
        "Complex tax issues",
        "Transfer pricing basics",
        "Management discussion"
      ]
    },
    {
      "level": "ADVANCED",
      "name": "Advanced",
      "yearsRequired": 5,
      "yearsExperience": "5-10",
      "casesCompletedRequired": 50,
      "certifications": ["CIT_ADVANCED"],
      "capabilities": [
        "Lead audits",
        "Mentor others",
        "Policy interpretation"
      ]
    },
    {
      "level": "EXPERT",
      "name": "Expert",
      "yearsRequired": 10,
      "yearsExperience": "10+",
      "casesCompletedRequired": 100,
      "certifications": ["CIT_EXPERT", "LAW_DEGREE"],
      "capabilities": [
        "Lead complex cases",
        "Review other auditors",
        "Policy development"
      ]
    }
  ],
  
  "caseAllocationRules": {
    "minCasesPerYear": 10,
    "maxCasesPerYear": 35,
    "maxConcurrentCases": 5,
    "preferredAuditTypes": ["DESK_AUDIT", "FIELD_AUDIT", "COMPREHENSIVE"],
    "revenueThreshold": 50000000,
    "industryFocus": ["MANUFACTURING", "WHOLESALE"],
    "preferredRegions": []
  },
  
  "qualifications": {
    "educationRequired": ["Bachelor's Degree (Accounting, Business, Law)"],
    "certifications": ["CIT Specialist Certification"],
    "trainingHours": 80,
    "onTheJobTraining": "3-6 months",
    "mentorshipRequired": true
  },
  
  "performanceMetrics": {
    "averageCaseDuration": 15,
    "casesClosedPerYear": 25,
    "findingsPerCase": 2.5,
    "revenueYieldPerCase": 750000,
    "qualityScore": 0.85
  },
  
  "validation": {
    "code": "string, unique, alphanumeric",
    "expertiseLevels": "array, min 1, ordered asc",
    "maxConcurrentCases": "number, >=1, <=15",
    "preferredAuditTypes": "array, non-empty",
    "revenueThreshold": "number, >0"
  },
  
  "relationships": {
    "linkedAuditors": ["auditor_id_1", "auditor_id_2"],
    "linkedCases": ["case_id_1", "case_id_2"],
    "linkedAuditTypes": ["audit_type_id_1"]
  },
  
  "audit": {
    "version": 2,
    "changeLog": [
      {
        "version": 1,
        "date": "2026-01-15T10:30:00Z",
        "changedBy": "admin",
        "changes": "Initial creation"
      }
    ]
  }
}
```

### 2.4 Case Allocation Rule Data Structure

```json
{
  "id": "uuid",
  "code": "ALLOC_RULE_LTO_001",
  "name": "LTO Allocation Rule",
  "description": "Allocation rules for Large Taxpayer Organizations",
  "isActive": true,
  "priority": 1,
  
  "classification": {
    "taxpayerSegment": "LTO",
    "criteria": {
      "revenueThresholdMin": 500000000,
      "revenueThresholdMax": null,
      "taxPaymentMin": 50000000,
      "taxPaymentMax": null,
      "employeeCountMin": 500,
      "employeeCountMax": null,
      "taxTypesCount": "2+",
      "applicableIndustries": [],
      "applicableRegions": []
    }
  },
  
  "allocationRules": {
    "auditTypeDistribution": {
      "DESK_AUDIT": {
        "percentage": 10,
        "casesPerYear": 15,
        "minTeamSize": 1,
        "maxTeamSize": 2
      },
      "FIELD_AUDIT": {
        "percentage": 40,
        "casesPerYear": 60,
        "minTeamSize": 2,
        "maxTeamSize": 4
      },
      "COMPREHENSIVE": {
        "percentage": 25,
        "casesPerYear": 37,
        "minTeamSize": 3,
        "maxTeamSize": 5
      },
      "TRANSFER_PRICING": {
        "percentage": 15,
        "casesPerYear": 22,
        "minTeamSize": 2,
        "maxTeamSize": 3
      },
      "JOINT_AUDIT": {
        "percentage": 8,
        "casesPerYear": 12,
        "minTeamSize": 4,
        "maxTeamSize": 6
      },
      "SINGLE_ISSUE": {
        "percentage": 2,
        "casesPerYear": 3,
        "minTeamSize": 1,
        "maxTeamSize": 2
      }
    },
    
    "auditorAssignment": {
      "requiredLevel": "SENIOR_AUDITOR",
      "canLeadAudit": true,
      "leadAuditorMandatory": true,
      "preferredSkills": ["CIT_SPECIALIST", "TP_SPECIALIST"],
      "minExperience": "5 years",
      "maxCasesPerAuditor": 8
    },
    
    "teamRequirements": {
      "minTeamSize": 2,
      "maxTeamSize": 4,
      "minLeadAuditors": 1,
      "minSpecialists": 1,
      "continuityPreferred": true
    },
    
    "frequencyAndPriority": {
      "minAuditFrequency": "EVERY_2_YEARS",
      "maxAuditFrequency": "ANNUAL",
      "priorityScore": 100,
      "riskBoost": 0.15
    },
    
    "geographicRules": {
      "preferSameRegion": true,
      "preferSameTaxCenter": false,
      "multiRegionalCoordination": true
    }
  },
  
  "escalationRules": [
    {
      "trigger": "finding_amount > 100000000",
      "action": "ESCALATE_TO_DIRECTOR",
      "notificationRecipients": ["director", "regional_director"],
      "autoReview": true
    },
    {
      "trigger": "transfer_pricing_issue_detected",
      "action": "ESCALATE_TO_TP_SPECIALIST",
      "notificationRecipients": ["tp_specialist", "manager"],
      "autoReview": true
    },
    {
      "trigger": "fraud_suspected",
      "action": "ESCALATE_TO_INTELLIGENCE_UNIT",
      "notificationRecipients": ["intelligence_director"],
      "autoReview": true
    }
  ],
  
  "validation": {
    "revenueThresholds": "number, min < max (if max exists)",
    "percentages": "SUM(percentages) = 100 ±2%",
    "teamSizes": "minTeamSize <= maxTeamSize",
    "skills": "array, non-empty",
    "trigger_conditions": "valid logical expressions"
  },
  
  "relationships": {
    "linkedAuditTypes": ["desk_audit_id", "field_audit_id"],
    "linkedSkills": ["cit_specialist_id", "tp_specialist_id"],
    "linkedCases": ["case_id_1", "case_id_2"]
  },
  
  "audit": {
    "version": 1,
    "createdDate": "2026-01-15T10:30:00Z",
    "lastModifiedDate": "2026-07-20T14:45:00Z"
  }
}
```



---

## 3. ROLES & PERMISSIONS MATRIX

### 3.1 Role Definitions

```
ROLE: 01_AUDIT_TEAM (Audit Team/Planning Team)
├─ Description: Create and manage annual audit plans
├─ Hierarchy Level: Operational
├─ Reports To: Audit Director
├─ Access Level: NATIONAL_LEVEL
│
├─ Permissions:
│  ├─ VIEW
│  │  ├─ ✓ Risk Engine (National view only)
│  │  ├─ ✓ Audit Case Types (all)
│  │  ├─ ✓ Risk Parameters (read-only)
│  │  ├─ ✓ Skill Categories (read-only)
│  │  ├─ ✓ Workload Capacity Rules (read-only)
│  │  ├─ ✓ Case Allocation Rules (read-only)
│  │  ├─ ✓ Geographic/Industry Profiles (read-only)
│  │  └─ ✓ Approval Workflows (read-only)
│  │
│  ├─ CREATE
│  │  ├─ ✓ Audit Plans (draft)
│  │  ├─ ✓ Plan Versions
│  │  └─ ✓ Audit Distribution Tables
│  │
│  ├─ EDIT
│  │  ├─ ✓ Own Audit Plans (before submission)
│  │  ├─ ✓ Audit Plan Distribution
│  │  ├─ ✓ Case Volume by Type
│  │  └─ ✓ Regional Allocations
│  │
│  ├─ SUBMIT
│  │  └─ ✓ Audit Plans to Director
│  │
│  ├─ RECEIVE_FEEDBACK
│  │  ├─ ✓ Director feedback on plans
│  │  ├─ ✓ Regional feedback on allocations
│  │  └─ ✓ Amendment requests
│  │
│  ├─ CONFIGURE (LIMITED)
│  │  ├─ ✗ Cannot change configurations
│  │  └─ └─ Must request through admin
│  │
│  └─ DELETE
│     └─ ✓ Own draft plans only (before submission)
│
├─ Approval Authority: None (creates, submits)
└─ Audit Trail: All actions logged


ROLE: 02_AUDIT_DIRECTOR (Director/Senior Audit Officer)
├─ Description: Review and approve audit plans
├─ Hierarchy Level: Senior Management
├─ Reports To: Senior Management / Risk Committee
├─ Access Level: NATIONAL_LEVEL
│
├─ Permissions:
│  ├─ VIEW
│  │  ├─ ✓ Risk Engine (National view)
│  │  ├─ ✓ All configurations (read-only)
│  │  ├─ ✓ Audit Plans (all versions)
│  │  ├─ ✓ Approval History
│  │  ├─ ✓ Regional Feedback
│  │  └─ ✓ Senior Management Reviews
│  │
│  ├─ REVIEW
│  │  ├─ ✓ Audit Plans from Planning Team
│  │  ├─ ✓ Regional feedback on plans
│  │  ├─ ✓ Amended plans from Planning Team
│  │  ├─ ✓ Compliance with risk distribution
│  │  └─ ✓ Skill availability
│  │
│  ├─ APPROVE / REJECT
│  │  ├─ ✓ Approve audit plans (with signature)
│  │  ├─ ✓ Reject plans (with reason)
│  │  ├─ ✓ Request revisions/amendments
│  │  └─ ✓ Send for Senior Management review
│  │
│  ├─ SEND_TO_REGIONS
│  │  ├─ ✓ Send approved plan to regions
│  │  ├─ ✓ Send bulk feedback to regions
│  │  ├─ ✓ Request specific feedback
│  │  └─ ✓ Track feedback receipt status
│  │
│  ├─ CONFIGURE (LIMITED)
│  │  ├─ ✓ Approve configuration changes
│  │  ├─ ✓ Override audit thresholds (with log)
│  │  └─ ✗ Cannot make permanent changes
│  │
│  └─ NOTIFICATIONS
│     ├─ ✓ Notify Planning Team of decisions
│     ├─ ✓ Notify Regional Directors
│     ├─ ✓ Notify Senior Management
│     └─ ✓ Receive escalations
│
├─ Approval Authority: Full authority over plans
└─ Audit Trail: All decisions with digital signature


ROLE: 03_REGIONAL_DIRECTOR (Regional Leadership)
├─ Description: Regional feedback on plans and allocations
├─ Hierarchy Level: Middle Management
├─ Reports To: Audit Director
├─ Access Level: REGION_SPECIFIC
│
├─ Permissions:
│  ├─ VIEW
│  │  ├─ ✓ Risk Engine (Own region only)
│  │  ├─ ✓ Audit Plans (own region section)
│  │  ├─ ✓ Configurations (read-only)
│  │  ├─ ✓ Regional allocation details
│  │  ├─ ✓ Tax center allocations
│  │  └─ ✓ Tax center feedback status
│  │
│  ├─ ALLOCATE_TO_TAX_CENTERS
│  │  ├─ ✓ Distribute regional audits to tax centers
│  │  ├─ ✓ Manually allocate by audit type
│  │  ├─ ✓ Adjust allocations based on feedback
│  │  ├─ ✓ Validate allocations against rules
│  │  └─ ✓ Send to tax centers
│  │
│  ├─ COLLECT_FEEDBACK
│  │  ├─ ✓ Request tax center feedback
│  │  ├─ ✓ View tax center feedback
│  │  ├─ ✓ Track feedback receipt
│  │  ├─ ✓ Consolidate feedback
│  │  └─ ✓ Send consolidated feedback to Director
│  │
│  ├─ PROVIDE_FEEDBACK
│  │  ├─ ✓ Provide feedback on allocations
│  │  ├─ ✓ Identify concerns/constraints
│  │  ├─ ✓ Propose adjustments
│  │  ├─ ✓ Submit to Director
│  │  └─ ✓ Receive amendment response
│  │
│  ├─ CONFIGURE
│  │  ├─ ✗ Cannot configure
│  │  └─ └─ Request through Director
│  │
│  └─ CANNOT_VIEW
│     ├─ ✗ Other regions' data
│     ├─ ✗ National data
│     └─ ✗ Configurations (except read-only)
│
├─ Approval Authority: Feedback authority only (no approval)
└─ Audit Trail: All feedback actions logged


ROLE: 04_TAX_CENTER_MANAGER (Tax Center / Branch Manager)
├─ Description: Provide feedback on tax center capacity
├─ Hierarchy Level: Operational Manager
├─ Reports To: Regional Director
├─ Access Level: TAX_CENTER_SPECIFIC
│
├─ Permissions:
│  ├─ VIEW
│  │  ├─ ✓ Own tax center allocation
│  │  ├─ ✓ Regional context (for transparency)
│  │  ├─ ✓ Audit types breakdown
│  │  ├─ ✓ Effort requirements
│  │  └─ ✓ Allocation history
│  │
│  ├─ PROVIDE_FEEDBACK
│  │  ├─ ✓ Review allocation feasibility
│  │  ├─ ✓ Assess resource availability
│  │  ├─ ✓ Identify skill gaps
│  │  ├─ ✓ Provide capacity concerns
│  │  ├─ ✓ Suggest modifications
│  │  ├─ ✓ Submit feedback to Regional Director
│  │  └─ ✓ Track submission status
│  │
│  ├─ CONFIGURE
│  │  ├─ ✗ Cannot configure
│  │  └─ └─ Request through Regional Director
│  │
│  └─ CANNOT_VIEW
│     ├─ ✗ Other tax centers
│     ├─ ✗ Other regions
│     └─ ✗ National data
│
├─ Approval Authority: Feedback authority only
└─ Audit Trail: All feedback actions logged


ROLE: 05_AUDITOR (Audit Officer / Auditor)
├─ Description: Execute audit cases
├─ Hierarchy Level: Operational
├─ Reports To: Tax Center Manager / Team Lead
├─ Access Level: ASSIGNED_CASES_ONLY
│
├─ Permissions:
│  ├─ VIEW
│  │  ├─ ✓ Assigned audit cases
│  │  ├─ ✓ Case details and evidence
│  │  ├─ ✓ Risk indicators for taxpayers
│  │  ├─ ✓ Audit type requirements
│  │  ├─ ✓ Case status and workflow
│  │  ├─ ✓ Team assignments
│  │  └─ ✓ Deadlines
│  │
│  ├─ MANAGE_CASES
│  │  ├─ ✓ Open assigned cases
│  │  ├─ ✓ Record work progress
│  │  ├─ ✓ Update case status
│  │  ├─ ✓ Attach audit evidence
│  │  ├─ ✓ Record daily work
│  │  ├─ ✓ Request case clarification
│  │  └─ ✓ Close cases (with approval)
│  │
│  ├─ CONFIGURE
│  │  ├─ ✗ Cannot configure
│  │  └─ └─ Must follow existing rules
│  │
│  └─ CANNOT_VIEW
│     ├─ ✗ Other auditor's cases
│     ├─ ✗ Unassigned cases
│     ├─ ✗ Plans
│     └─ ✗ Configurations
│
├─ Approval Authority: None (executes within assigned cases)
└─ Audit Trail: All work logged automatically


ROLE: 06_CONFIGURATION_MANAGER (System Administrator)
├─ Description: Manage system configurations
├─ Hierarchy Level: Technical/Administrative
├─ Reports To: IT Director / Chief Admin
├─ Access Level: FULL_SYSTEM
│
├─ Permissions:
│  ├─ VIEW
│  │  ├─ ✓ All configurations
│  │  ├─ ✓ Configuration history
│  │  ├─ ✓ All audit data (read-only)
│  │  └─ ✓ Audit trails
│  │
│  ├─ CREATE/EDIT
│  │  ├─ ✓ Audit Case Types
│  │  ├─ ✓ Risk Parameters
│  │  ├─ ✓ Skill Categories
│  │  ├─ ✓ Workload Capacity Rules
│  │  ├─ ✓ Case Allocation Rules
│  │  ├─ ✓ Geographic/Industry Profiles
│  │  ├─ ✓ Approval Workflows
│  │  ├─ ✓ Risk Thresholds
│  │  └─ ✓ System Parameters
│  │
│  ├─ VALIDATE
│  │  ├─ ✓ Configuration consistency
│  │  ├─ ✓ Impact analysis
│  │  ├─ ✓ Backward compatibility
│  │  └─ ✓ Data validation
│  │
│  ├─ PUBLISH
│  │  ├─ ✓ Version configurations
│  │  ├─ ✓ Set effective dates
│  │  ├─ ✓ Publish to production
│  │  ├─ ✓ Archive old versions
│  │  └─ ✓ Rollback if needed
│  │
│  ├─ AUDIT
│  │  ├─ ✓ View all change logs
│  │  ├─ ✓ Track changes by user
│  │  ├─ ✓ Justification review
│  │  └─ ✓ Audit trail export
│  │
│  └─ GOVERNANCE
│     ├─ ✓ Require approvals for changes
│     ├─ ✓ Enforce change windows
│     ├─ ✓ Maintain config backups
│     └─ ✓ Disaster recovery
│
├─ Approval Authority: All configuration changes (technical)
└─ Audit Trail: Complete audit trail maintained


ROLE: 07_SENIOR_MANAGEMENT / RISK_COMMITTEE
├─ Description: Strategic review and approval
├─ Hierarchy Level: Executive
├─ Reports To: Ministry Leadership
├─ Access Level: STRATEGIC_LEVEL
│
├─ Permissions:
│  ├─ VIEW
│  │  ├─ ✓ Risk Engine (National, aggregate view)
│  │  ├─ ✓ Audit Plans (strategic view)
│  │  ├─ ✓ Regional summaries
│  │  ├─ ✓ Strategic metrics
│  │  ├─ ✓ Approval status
│  │  └─ ✓ Historical comparisons
│  │
│  ├─ REVIEW
│  │  ├─ ✓ Audit plans from Director
│  │  ├─ ✓ Alignment with strategy
│  │  ├─ ✓ Risk coverage
│  │  ├─ ✓ Resource allocation
│  │  └─ ✓ Feasibility assessment
│  │
│  ├─ APPROVE
│  │  ├─ ✓ Final plan approval
│  │  ├─ ✓ Reject plans (with reason)
│  │  ├─ ✓ Request strategic changes
│  │  └─ ✓ Sign approval (digital signature)
│  │
│  ├─ CONFIGURE
│  │  ├─ ✗ Cannot directly configure
│  │  └─ └─ Must request through Config Manager
│  │
│  └─ NOTIFICATIONS
│     ├─ ✓ Receive finalized plans for approval
│     ├─ ✓ Receive escalations
│     └─ ✓ Receive strategic alerts
│
├─ Approval Authority: Final approval authority
└─ Audit Trail: All approvals with digital signature
```

### 3.2 Permission Matrix Summary

| Permission | Audit Team | Director | Regional Dir | TC Manager | Auditor | Config Mgr | Senior Mgmt |
|-----------|:----------:|:--------:|:----------:|:----------:|:-------:|:----------:|:----------:|
| View Plans | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ |
| Create Plans | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Edit Plans | ✓ (own) | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Submit Plans | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Approve Plans | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |
| View Configs | ✓ (RO) | ✓ (RO) | ✓ (RO) | ✗ | ✗ | ✓ | ✓ (RO) |
| Edit Configs | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| Allocate Cases | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Approve Cases | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Execute Cases | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ |
| View Risk Engine | ✓ (Natl) | ✓ (Natl) | ✓ (Reg) | ✗ | ✓ (assigned) | ✓ | ✓ (Natl) |

---

## 4. AUDIT CASE WORKFLOW STATES

### 4.1 Complete State Transition Diagram

```
INITIAL STATES:
├─ RISK_IDENTIFIED (from Risk Engine)
│  └─ ↓
├─ CASE_SELECTED (by Planning Team / Process Owner)
│  └─ ↓
└─ CASE_CREATED (in system)
   └─ ↓

ASSIGNMENT PHASE:
┌─ READY_FOR_ASSIGNMENT
│  ├─ Preconditions met:
│  │  ├─ Case details complete
│  │  ├─ Audit type determined
│  │  ├─ Skill requirements identified
│  │  ├─ Risk assessment complete
│  │  └─ Workload capacity available
│  │
│  └─ ↓ (Automated or manual allocation)
│
└─ CASE_ALLOCATED
   ├─ Allocation confirmed:
   │  ├─ Auditor assigned
   │  ├─ Team assigned (if needed)
   │  ├─ Start date set
   │  ├─ End date set
   │  ├─ Notifications sent
   │  └─ Case number generated
   │
   └─ ↓ (Auditor acknowledges)

EXECUTION PHASE:
┌─ CASE_OPENED
│  ├─ Actions:
│  │  ├─ Auditor creates case dossier
│  │  ├─ Case opening meeting scheduled
│  │  ├─ Taxpayer notified
│  │  ├─ Audit plan finalized
│  │  ├─ Evidence gathering begins
│  │  └─ Progress tracking started
│  │
│  └─ ↓ (Daily work logged)
│
├─ IN_PROGRESS
│  ├─ Status:
│  │  ├─ Work ongoing
│  │  ├─ Evidence collected
│  │  ├─ Issues identified
│  │  ├─ Progress tracked against timeline
│  │  └─ Adjustments made as needed
│  │
│  ├─ Can transition to:
│  │  ├─ SUSPENDED (if issues/delays)
│  │  ├─ ON_HOLD (if awaiting info)
│  │  ├─ ESCALATED (if serious issues)
│  │  └─ PRELIMINARY_FINDINGS (when ready)
│  │
│  └─ ↓
│
├─ ON_HOLD
│  ├─ Reason (one of):
│  │  ├─ Awaiting taxpayer information
│  │  ├─ Awaiting third-party data
│  │  ├─ Awaiting management decision
│  │  ├─ Legal review in progress
│  │  └─ Investigation pending
│  │
│  ├─ SLA: Max 30 days (configurable)
│  │  └─ Auto-escalate if exceeded
│  │
│  └─ ↓ (Issues resolved)
│
├─ SUSPENDED
│  ├─ Reason (one of):
│  │  ├─ Resource constraint
│  │  ├─ Auditor unavailable
│  │  ├─ Priority change
│  │  ├─ External audit priority
│  │  └─ Force majeure event
│  │
│  ├─ SLA: Max 60 days (configurable)
│  │  └─ Auto-escalate if exceeded
│  │
│  └─ ↓ (Resources available)
│
└─ ESCALATED
   ├─ Escalation reasons:
   │  ├─ Large adjustment amount (>threshold)
   │  ├─ Transfer pricing issue detected
   │  ├─ Fraud suspected
   │  ├─ Complex interpretation issue
   │  └─ Management review required
   │
   ├─ To: [Escalation level determined by rules]
   └─ ↓ (After escalation review)

REVIEW & APPROVAL PHASE:
┌─ PRELIMINARY_FINDINGS
│  ├─ Auditor:
│  │  ├─ Documents initial findings
│  │  ├─ Prepares preliminary report
│  │  ├─ Identifies proposed adjustments
│  │  ├─ Calculates estimated revenue impact
│  │  └─ Schedules discussion with taxpayer
│  │
│  └─ ↓ (Discussion conducted)
│
├─ DISCUSSION_WITH_TAXPAYER
│  ├─ Process:
│  │  ├─ Present findings
│  │  ├─ Discuss taxpayer position
│  │  ├─ Document taxpayer response
│  │  ├─ Record agreements/disagreements
│  │  ├─ Note additional info received
│  │  └─ Set timeline for final assessment
│  │
│  ├─ Can lead to:
│  │  ├─ Further investigation (back to IN_PROGRESS)
│  │  ├─ Revised findings
│  │  └─ Final assessment
│  │
│  └─ ↓ (Assessment complete)
│
├─ FINAL_ASSESSMENT
│  ├─ Auditor prepares:
│  │  ├─ Final audit report
│  │  ├─ Final adjustments (if any)
│  │  ├─ Final revenue impact calculation
│  │  ├─ Legal review (if required)
│  │  ├─ Management sign-off (if required)
│  │  └─ Submission for approval
│  │
│  └─ ↓ (Ready for approval)
│
└─ PENDING_APPROVAL (LEVEL_X)
   ├─ Approval levels (parallel processing):
   │  ├─ Level 1: Team Lead (if amount <1M ETB)
   │  ├─ Level 2: Tax Center Manager (1M-10M ETB)
   │  ├─ Level 3: Regional Director (10M-50M ETB)
   │  ├─ Level 4: Audit Director (50M-200M ETB)
   │  └─ Level 5: Senior Management (>200M ETB)
   │
   ├─ At each level:
   │  ├─ Review starts
   │  ├─ SLA timer starts
   │  ├─ Reviewer assigned
   │  ├─ Auto-escalate if SLA exceeded
   │  └─ Decision required
   │
   ├─ Possible decisions:
   │  ├─ APPROVED → CASE_CLOSED
   │  ├─ REJECTED → UNDER_REVISION
   │  ├─ REMANDED → UNDER_REVISION
   │  └─ REVISION_REQUESTED → UNDER_REVISION
   │
   └─ ↓ (Approval received)

CLOSURE PHASE:
┌─ CASE_CLOSED
│  ├─ Final status:
│  │  ├─ Closure date recorded
│  │  ├─ Final revenue impact confirmed
│  │  ├─ Case findings archived
│  │  ├─ Audit evidence stored
│  │  ├─ Audit trail complete
│  │  ├─ Performance metrics calculated
│  │  ├─ Quality review completed
│  │  └─ Taxpayer notified
│  │
│  └─ ↓ (Status final, can only view)
│
└─ ARCHIVED
   └─ Historical record maintained

REVISION/CORRECTIVE STATES:
┌─ UNDER_REVISION
│  ├─ Back to IN_PROGRESS or PRELIMINARY_FINDINGS
│  ├─ Issues identified during review:
│  │  ├─ Additional evidence needed
│  │  ├─ Methodology changes
│  │  ├─ Calculation corrections
│  │  ├─ Missing documentation
│  │  └─ Policy compliance issues
│  │
│  └─ ↓ (Revision completed)
│
└─ RESUBMITTED
   └─ ↓ (Goes back to PENDING_APPROVAL)
```

### 4.2 State Definitions with Rules

```
STATE: RISK_IDENTIFIED
├─ Entry: Automatic (from Risk Engine)
├─ Exit: Manual selection (Audit Team / Process Owner)
├─ Duration: Until selection decision
├─ Notifications: None
├─ Actions Allowed: View risk profile only
├─ AutoEscalate: None
└─ Workflow: Review → Decide → SELECT/SKIP

STATE: CASE_ALLOCATED
├─ Entry: Automatic allocation engine
├─ Exit: Auditor acknowledgment
├─ Duration: SLA 2 business days
├─ Notifications:
│  ├─ To: Auditor, Team Lead, Regional Director
│  └─ Content: Case details, deadline, requirements
├─ Actions Allowed: 
│  ├─ Accept allocation
│  ├─ Request reassignment (with reason)
│  └─ Request conflict check
├─ AutoEscalate: If not acknowledged in 2 days
└─ Workflow: Allocate → Notify → Acknowledge

STATE: IN_PROGRESS
├─ Entry: Auditor opens case and begins work
├─ Exit: Case reaches milestone (Hold/Escalate/Preliminary Findings)
├─ Duration: Planned duration (audit type dependent)
├─ Notifications:
│  ├─ Daily: Work logged (automated)
│  ├─ Weekly: Progress report (if delay)
│  ├─ If milestone: Status update
│  └─ If SLA warning: Escalation notice
├─ Actions Allowed:
│  ├─ Log work/evidence
│  ├─ Update progress
│  ├─ Request info from taxpayer
│  ├─ Request support from specialist
│  ├─ Request hold/suspension
│  ├─ Record issues/blockers
│  └─ Update estimated end date
├─ AutoEscalate: If 3+ days overdue
│  └─ Send escalation to Team Lead
└─ Workflow: Open → Work → Progress → Transition

STATE: ON_HOLD
├─ Entry: Manual transition (with reason)
├─ Exit: Blocker resolved + manual transition
├─ Duration: SLA 30 days (configurable)
├─ Notifications:
│  ├─ To: Team Lead, Regional Director
│  ├─ Reason for hold
│  └─ Expected resolution date
├─ Actions Allowed:
│  ├─ Update hold reason
│  ├─ Update expected resolution
│  └─ Request escalation if stuck
├─ AutoEscalate: If SLA exceeded
│  └─ Send to Regional Director
└─ Workflow: Wait → BlockerResolved → Resume/Close

STATE: PENDING_APPROVAL
├─ Entry: Case ready for approval (from FINAL_ASSESSMENT)
├─ Exit: Approval decision made
├─ Duration: SLA per approval level (2-10 days)
├─ Notifications:
│  ├─ To: Approver
│  ├─ Content: Case summary, findings, adjustments
│  └─ Include: Supporting documentation
├─ Actions Allowed (for approver):
│  ├─ APPROVE (with signature)
│  ├─ REJECT (with reason)
│  ├─ REQUEST_REVISION (with details)
│  └─ ASK_QUESTIONS (with timeline for response)
├─ AutoEscalate: If SLA exceeded
│  └─ To next level
├─ Reminders:
│  ├─ Day 1, 3, 5: Pending approval notices
│  └─ Day 6+: Escalation warnings
└─ Workflow: Submit → Review → Decide → Act

STATE: CASE_CLOSED
├─ Entry: Final approval granted
├─ Exit: Cannot transition (final state)
├─ Duration: Permanent
├─ Actions Allowed:
│  ├─ View case (read-only)
│  ├─ View audit trail
│  ├─ Download report
│  ├─ Archive
│  └─ Generate outcome metrics
├─ Notifications:
│  ├─ To: All stakeholders
│  ├─ Content: Case closure, final findings
│  └─ Include: Appeal timeline (if applicable)
└─ Workflow: Final → Archive
```



---

## 5. DYNAMIC PLAN CREATION PROCESS

### 5.1 Plan Creation Workflow with Validation Rules

**Requirement Source:** FR-04.0-01

```
STEP 1: PLAN INITIALIZATION
├─ Input Data:
│  ├─ Plan Name [REQUIRED]
│  ├─ Fiscal Year [REQUIRED]
│  ├─ Plan Duration (months) [REQUIRED, 12 months typical]
│  ├─ Audit Tactics [REQUIRED, >500 chars]
│  ├─ Strategic Objectives [OPTIONAL]
│  ├─ Budget Allocation [OPTIONAL but triggers capacity check]
│  └─ Risk Focus Areas [OPTIONAL]
│
├─ Validation Rules:
│  ├─ Plan Name: 5-200 characters, unique per year
│  ├─ Fiscal Year: Must be current or next year
│  ├─ Duration: 1-36 months (must divide year evenly)
│  ├─ Tactics: Must reference configurable audit types
│  └─ Auto-Check: Risk distribution available for year
│
├─ Auto-Population:
│  ├─ Current Risk Engine snapshot loaded
│  ├─ Default audit type distribution applied
│  ├─ Default regional allocation applied
│  ├─ Available capacity calculated
│  └─ Recommendation generated based on risk
│
└─ Output: Draft Plan created

STEP 2: AUDIT TYPE DISTRIBUTION PLANNING
├─ Current State:
│  ├─ National total cases available: [CALCULATED from risk]
│  ├─ Risk-based audit type candidates:
│  │  ├─ Desk Audit candidates: 55,000 [FROM RISK ENGINE]
│  │  ├─ Field Audit candidates: 35,000
│  │  ├─ Joint Audit candidates: 18,000
│  │  ├─ Transfer Pricing candidates: 7,500
│  │  ├─ Comprehensive candidates: 650
│  │  └─ Single Issue candidates: 300
│  └─ Total: 116,450 candidates
│
├─ Planning Team Input:
│  ├─ Decision: How many cases to audit?
│  │  └─ Input: 150 cases [USER INPUT]
│  │
│  ├─ Decision: Distribution by audit type?
│  │  ├─ Input Table:
│  │  │  ├─ Desk Audit: 40 cases (26.7%)
│  │  │  ├─ Field Audit: 60 cases (40.0%)
│  │  │  ├─ Joint Audit: 20 cases (13.3%)
│  │  │  ├─ Transfer Pricing: 15 cases (10.0%)
│  │  │  ├─ Comprehensive: 10 cases (6.7%)
│  │  │  ├─ Single Issue: 5 cases (3.3%)
│  │  │  └─ TOTAL: 150 cases [MUST MATCH]
│  │  └─ Validation: Percentages must match configurable targets ±10%
│  │
│  └─ Decision: Distribution by region?
│     ├─ Input Table (Manual allocation):
│     │  ├─ Addis Ababa: 40 cases (26.7%)
│     │  ├─ Oromia: 25 cases (16.7%)
│     │  ├─ Amhara: 20 cases (13.3%)
│     │  ├─ SNNPR: 30 cases (20.0%)
│     │  ├─ Tigray: 20 cases (13.3%)
│     │  ├─ Dire Dawa: 15 cases (10.0%)
│     │  └─ TOTAL: 150 cases [MUST MATCH]
│     └─ Validation:
│        ├─ No region exceeds capacity
│        ├─ Audit types in each region match constraints
│        ├─ Load balanced across regions
│        └─ Risk coverage meets thresholds
│
├─ Auto-Calculations:
│  ├─ For each region-audit type combination:
│  │  ├─ Required effort hours = cases × effort_per_case
│  │  ├─ Required auditors = effort_hours / auditor_capacity
│  │  ├─ Team requirements = based on audit type
│  │  ├─ Skill distribution = from allocation rules
│  │  └─ Risk coverage = regional risk score × cases
│  │
│  └─ Validation:
│     ├─ Available auditors >= required auditors
│     ├─ Required skills available in each region
│     ├─ No regional overload (>120% capacity)
│     ├─ All critical risk cases included
│     └─ Budget sufficient (if budget provided)
│
├─ Conflict Detection:
│  ├─ Already-running cases conflicts? [CHECK]
│  ├─ Auditor unavailability conflicts? [CHECK]
│  ├─ Resource constraints? [CHECK]
│  ├─ External audit priorities? [CHECK]
│  └─ If conflicts found: Flag for manual review
│
└─ Output: Distribution table completed

STEP 3: RISK ALIGNMENT VERIFICATION
├─ Checks Performed:
│  ├─ Are all critical-risk cases included? [MUST BE YES]
│  ├─ Are high-risk cases prioritized? [TARGET 80%]
│  ├─ Is audit type distribution reasonable? [CHECK RULES]
│  ├─ Is geographic distribution logical? [CHECK RULES]
│  └─ Does regional allocation match risk? [WARN IF >±25%]
│
├─ Risk Metrics Calculated:
│  ├─ Revenue at risk covered: [PERCENTAGE]
│  ├─ Case coverage by risk category:
│  │  ├─ Critical risk: [X of Y cases]
│  │  ├─ High risk: [X of Y cases]
│  │  ├─ Medium risk: [X of Y cases]
│  │  └─ Low risk: [X of Y cases]
│  │
│  ├─ Industry coverage: [% of priority industries]
│  ├─ Geographic balance: [% deviation from target]
│  └─ Capacity utilization: [% of available]
│
├─ Recommendations Generated:
│  ├─ If coverage <80%: Recommend increasing cases
│  ├─ If overload >120%: Recommend reducing region
│  ├─ If skill gap detected: Recommend training plan
│  ├─ If budget insufficient: Recommend revision
│  └─ If high-risk gap: Recommend rebalancing
│
└─ Output: Risk alignment report + recommendations

STEP 4: CAPACITY & FEASIBILITY CHECK
├─ National Level Capacity:
│  ├─ Total available auditors: [FROM CONFIG]
│  ├─ Auditors needed for plan: [CALCULATED]
│  ├─ Available hours this year: [CALCULATED]
│  ├─ Hours required for plan: [CALCULATED]
│  ├─ Utilization rate: [%]
│  └─ Acceptable range: 70-90% [CONFIGURABLE]
│
├─ Regional Level Capacity:
│  ├─ For each region:
│  │  ├─ Available auditors in region: [DATA]
│  │  ├─ Auditors needed for plan: [CALCULATED]
│  │  ├─ Available capacity hours: [CALCULATED]
│  │  ├─ Hours required: [CALCULATED]
│  │  ├─ Utilization rate: [%]
│  │  └─ Flag if >120% or <50%
│  │
│  └─ Output: Capacity table
│
├─ Skill Distribution Feasibility:
│  ├─ Required skills by type:
│  │  ├─ CIT Specialists needed: [CALCULATED]
│  │  ├─ Available in regions: [CHECKED]
│  │  ├─ VAT Specialists needed: [CALCULATED]
│  │  ├─ Available in regions: [CHECKED]
│  │  ├─ TP Specialists needed: [CALCULATED]
│  │  └─ Available in regions: [CHECKED]
│  │
│  └─ Gap Analysis: If gaps > 10%, flag for training
│
├─ Feasibility Decision:
│  ├─ All constraints met? → APPROVED TO PROCEED
│  ├─ Minor concerns? → APPROVED WITH NOTES
│  ├─ Major concerns? → REQUEST REVISION
│  └─ Critical issues? → CANNOT PROCEED
│
└─ Output: Feasibility assessment

STEP 5: AUDITOR ALLOCATION SIMULATION
├─ Purpose:
│  └─ Pre-allocate auditors to validate plan before submission
│
├─ Simulation Process:
│  ├─ For each region:
│  │  ├─ Apply allocation rules (taxpayer segment, industry, skill)
│  │  ├─ Apply load-balancing algorithm
│  │  ├─ Apply continuity preferences
│  │  ├─ Check conflicts with already-assigned cases
│  │  └─ Generate simulated allocation
│  │
│  └─ Output: Recommended allocation table
│
├─ Simulation Results:
│  ├─ Allocation possible? YES/NO
│  ├─ All critical cases allocatable? YES/NO
│  ├─ Skill requirements met? YES/NO
│  ├─ Overload cases: [LIST]
│  ├─ Underutilization cases: [LIST]
│  └─ Conflicts: [LIST]
│
├─ If Conflicts Found:
│  ├─ Recommend: Case redistribution
│  ├─ Recommend: Skill training needed
│  ├─ Recommend: External resource hire
│  └─ Recommend: Plan revision
│
└─ Output: Allocation feasibility report

STEP 6: DRAFT PLAN FINALIZATION
├─ Plan Document Contains:
│  ├─ Plan Header:
│  │  ├─ Plan Name, ID, Version
│  │  ├─ Fiscal Year, Duration
│  │  ├─ Created Date/By
│  │  ├─ Status: DRAFT
│  │  └─ Last Modified Date/By
│  │
│  ├─ Executive Summary:
│  │  ├─ Total cases planned
│  │  ├─ Total effort hours
│  │  ├─ Expected revenue impact
│  │  ├─ Geographic distribution
│  │  ├─ Audit type distribution
│  │  └─ Risk coverage metrics
│  │
│  ├─ Detailed Tables:
│  │  ├─ Audit type distribution by region
│  │  ├─ Regional allocation with effort
│  │  ├─ Capacity utilization summary
│  │  ├─ Skill requirements by region
│  │  ├─ Estimated allocations
│  │  └─ Risk coverage analysis
│  │
│  └─ Supporting Documents:
│     ├─ Risk Engine snapshot
│     ├─ Allocation recommendations
│     ├─ Feasibility assessment
│     ├─ Assumptions & constraints
│     └─ Audit trail of changes
│
├─ Validation Before Save:
│  ├─ All required fields populated? [CHECK]
│  ├─ All tables valid (totals match)? [CHECK]
│  ├─ No conflicts identified? [WARN IF FOUND]
│  ├─ Capacity feasible? [CHECK]
│  ├─ Risk coverage adequate? [CHECK]
│  └─ Auto-corrections applied? [YES/NO]
│
└─ Output: Draft plan saved, ready for review

STEP 7: PLANNING TEAM REVIEW & SUBMISSION
├─ Planning Team Can:
│  ├─ Review all plan details
│  ├─ Run what-if scenarios
│  ├─ Adjust distribution tables
│  ├─ Modify regional allocations
│  ├─ Save multiple versions
│  ├─ Generate reports
│  ├─ Add notes/justification
│  └─ Submit to Director
│
├─ Before Submission Checks:
│  ├─ Checklist Review:
│  │  ├─ ☐ Plan name and year specified
│  │  ├─ ☐ Audit tactics documented
│  │  ├─ ☐ Total cases specified
│  │  ├─ ☐ Audit type distribution complete
│  │  ├─ ☐ Regional distribution complete
│  │  ├─ ☐ All tables validated (totals match)
│  │  ├─ ☐ Capacity check passed
│  │  ├─ ☐ Risk alignment verified
│  │  ├─ ☐ Skill availability confirmed
│  │  └─ ☐ Supporting documents attached
│  │
│  ├─ Auto-Checks Run:
│  │  ├─ Audit type column totals = regional total ✓
│  │  ├─ Regional totals = national total ✓
│  │  ├─ No overallocation of auditors ✓
│  │  ├─ All critical risk cases included ✓
│  │  └─ All references valid ✓
│  │
│  └─ If any check fails → Submit blocked, errors shown
│
├─ Submission Process:
│  ├─ Click "Submit to Director"
│  ├─ Final confirmation dialog
│  ├─ Digital signature required (optional)
│  ├─ Submit timestamp recorded
│  ├─ Status changes to: SUBMITTED_TO_DIRECTOR
│  ├─ Notification sent to Director
│  └─ Audit trail entry created
│
└─ Output: Plan submitted, awaiting Director review
```

### 5.2 Dynamic Calculations During Plan Creation

```
CALCULATION 1: Effort Estimation
Purpose: Auto-calculate required effort hours

Formula:
├─ For each audit type in each region:
│  ├─ Cases in region for type: [USER INPUT]
│  ├─ Effort per case: [FROM CONFIG] hours/case
│  ├─ Total effort hours: Cases × EffortPerCase
│  ├─ Team effort hours: Total ÷ (Team members - 1)
│  ├─ Lead effort hours: Total × 0.10 (for oversight)
│  └─ Total team effort = Sum of all roles
│
└─ Output: Effort table by audit type and region


CALCULATION 2: Required Auditors
Purpose: Determine how many auditors needed

Formula:
├─ Available billable hours per auditor: [FROM CONFIG]
│  ├─ Working days: 220/year [CONFIG]
│  ├─ Hours per day: 8 [CONFIG]
│  ├─ Training hours: -40 [CONFIG]
│  ├─ Leave hours: -160 [CONFIG]
│  ├─ Admin hours: -80 [CONFIG]
│  └─ Billable hours: 752 hours/auditor/year
│
├─ Required auditors = Total effort hours / Available billable hours
│
├─ By expertise level (if specified):
│  ├─ Senior Auditors: 40% of total
│  ├─ Junior Auditors: 35% of total
│  ├─ Lead Auditors: 15% of total
│  └─ Specialists: 10% of total
│
└─ Output: Auditor count by level


CALCULATION 3: Revenue at Risk Coverage
Purpose: Calculate $ impact of plan

Formula:
├─ For each case in plan:
│  ├─ Case risk score: [FROM RISK ENGINE]
│  ├─ Case revenue exposure: [FROM TAXPAYER DATA]
│  ├─ Revenue at risk: Risk score × Revenue exposure
│  └─ Expected collection rate: [FROM CONFIG] per audit type
│
├─ Aggregations:
│  ├─ Total revenue at risk: Sum of all cases
│  ├─ Expected collections: Total × Collection rate
│  ├─ Coverage percentage: Collections / Total national
│  └─ ROI ratio: Collections / Audit cost
│
└─ Output: Revenue impact summary


CALCULATION 4: Capacity Utilization
Purpose: Calculate % of available capacity used

Formula:
├─ Total available capacity:
│  ├─ Total auditors in system: [DATA]
│  ├─ Available hours per auditor: 752 hours [CALCULATED]
│  ├─ Total national capacity: Count × Hours
│  └─ Multiplied by allocation constraints
│
├─ Planned utilization:
│  ├─ Total hours required: [CALCULATED above]
│  ├─ Planned utilization: Required / Available
│  ├─ Target utilization: 70-90% [CONFIG]
│  ├─ Acceptable range: ±5%
│  └─ Flag if outside acceptable range
│
├─ By region:
│  ├─ Regional capacity = Regional auditors × Hours
│  ├─ Regional usage = Regional plan hours
│  ├─ Regional utilization = Usage / Capacity
│  └─ Flag if >120% or <50%
│
└─ Output: Utilization chart


CALCULATION 5: Skill Distribution Feasibility
Purpose: Verify required skills available

Algorithm:
├─ For each skill required by allocation rules:
│  ├─ Identify required skill type: (CIT, VAT, TP, etc.)
│  ├─ Cases requiring skill: [FROM RULES]
│  ├─ Available specialists: [FROM DATA]
│  ├─ Max cases per specialist: [FROM CONFIG]
│  ├─ Capacity for skill: Available × Max cases
│  ├─ Skill gap: Required - Capacity
│  └─ If gap > 0: Flag for training/hiring
│
└─ Output: Skill gap analysis


CALCULATION 6: Risk Distribution Validation
Purpose: Ensure plan covers appropriate risk mix

Algorithm:
├─ Extract risk distribution from Risk Engine:
│  ├─ Critical risk cases: [COUNT]
│  ├─ High risk cases: [COUNT]
│  ├─ Medium risk cases: [COUNT]
│  └─ Low risk cases: [COUNT]
│
├─ Plan allocation analysis:
│  ├─ Critical risk cases included: [COUNT]
│  ├─ High risk cases included: [COUNT]
│  ├─ Medium risk cases included: [COUNT]
│  └─ Low risk cases included: [COUNT]
│
├─ Coverage ratios:
│  ├─ Critical risk coverage: [%] (Target: 100%)
│  ├─ High risk coverage: [%] (Target: 80%+)
│  ├─ Medium risk coverage: [%] (Target: 40%+)
│  └─ Low risk coverage: [%] (Target: 10-20%)
│
├─ Validation:
│  ├─ If Critical < 100%: ERROR - Must include all
│  ├─ If High < 80%: WARNING - Consider more
│  ├─ If Total < 70% of at-risk: WARNING - Limited coverage
│  └─ If Total > available capacity: ERROR - Cannot execute
│
└─ Output: Risk coverage report
```



---

## 6. REPORTS & ANALYTICS REQUIREMENTS

### 6.1 Reports by Role

#### 6.1.1 Audit Team (Planning Team) Reports

```
REPORT 1: PLAN CREATION SUMMARY
├─ Description: Overview of created plan before submission
├─ Access: Audit Team (read-only)
├─ Frequency: On-demand
├─ Contains:
│  ├─ Plan ID, Name, Fiscal Year
│  ├─ Total cases by audit type
│  ├─ Audit type distribution (%)
│  ├─ Regional allocation table
│  ├─ Total effort hours required
│  ├─ Required auditors by level
│  ├─ Capacity utilization (%)
│  ├─ Revenue at risk covered
│  ├─ Expected collections
│  └─ Risk coverage analysis
│
├─ Export Formats: PDF, Excel
└─ Drill-Down: Risk Engine snapshot, Allocation table

REPORT 2: WHAT-IF ANALYSIS
├─ Description: Scenario comparison (current vs. alternative)
├─ Access: Audit Team
├─ Frequency: On-demand
├─ Scenarios:
│  ├─ Scenario 1: Current plan
│  ├─ Scenario 2: Alternative distribution
│  ├─ Scenario 3: Increased volume
│  └─ Scenario 4: Risk-focused
│
├─ Comparison:
│  ├─ Total cases: [S1] vs [S2] vs [S3] vs [S4]
│  ├─ Audit type distribution differences
│  ├─ Regional allocation changes
│  ├─ Effort hours impact
│  ├─ Revenue impact
│  ├─ Capacity impact
│  └─ Risk coverage impact
│
├─ Recommendations: Which scenario best meets objectives?
└─ Export: PDF with charts

REPORT 3: REGIONAL CAPACITY REPORT
├─ Description: Capacity constraints by region
├─ Access: Audit Team
├─ Frequency: Monthly
├─ Table per region:
│  ├─ Region name & code
│  ├─ Available auditors (by level)
│  ├─ Available billable hours
│  ├─ Planned utilization (%)
│  ├─ Current utilization (%)
│  ├─ Spare capacity (hours)
│  ├─ Skill availability
│  ├─ Constraints/issues
│  └─ Recommendations
│
├─ Visualization: Gauge charts by region
└─ Drill-Down: Individual auditor workload

REPORT 4: RISK COVERAGE REPORT
├─ Description: How well plan covers identified risks
├─ Access: Audit Team
├─ Frequency: On-demand
├─ Analysis:
│  ├─ Critical risk cases: [Total] vs [Included]
│  ├─ High risk cases: [Total] vs [Included]
│  ├─ Medium risk cases: [Total] vs [Included]
│  ├─ Low risk cases: [Total] vs [Included]
│  ├─ Revenue at risk: [Total] vs [Covered]
│  ├─ Industry coverage: [Industries] [Coverage %]
│  ├─ Geographic coverage: [Regions] [Coverage %]
│  └─ Gaps & recommendations
│
├─ Visualization: Stacked bar charts, heatmaps
└─ Export: PDF, Excel with drill-down

REPORT 5: SUBMISSION CHECKLIST
├─ Description: Pre-submission validation report
├─ Access: Audit Team
├─ Frequency: Before each submission
├─ Checklist:
│  ├─ ✓/✗ All required fields filled
│  ├─ ✓/✗ All totals match (audit types, regions)
│  ├─ ✓/✗ Capacity feasible
│  ├─ ✓/✗ Risk coverage adequate
│  ├─ ✓/✗ Skill availability confirmed
│  ├─ ✓/✗ No conflicts detected
│  ├─ ✓/✗ Supporting documents attached
│  └─ Issues found: [LIST]
│
└─ Action: Submit / Correct Issues
```

#### 6.1.2 Audit Director Reports

```
REPORT 1: PLAN REVIEW REPORT
├─ Description: Comprehensive plan review document
├─ Access: Audit Director
├─ Frequency: Upon plan submission
├─ Contains:
│  ├─ Plan summary (name, year, total cases)
│  ├─ Audit type distribution analysis
│  ├─ Regional allocation analysis
│  ├─ Risk alignment assessment
│  ├─ Capacity assessment
│  ├─ Skill availability assessment
│  ├─ Comparison to previous year
│  ├─ Revenue impact projection
│  ├─ Issues / concerns / recommendations
│  └─ Approval readiness
│
├─ Decision Support: Go/No-go recommendation
└─ Includes: Audit trail of changes

REPORT 2: REGIONAL FEEDBACK SUMMARY
├─ Description: Consolidated feedback from all regions
├─ Access: Audit Director
├─ Frequency: Weekly during feedback period
├─ Shows:
│  ├─ Feedback receipt status (per region)
│  ├─ Feedback content (by region)
│  ├─ Common themes/issues
│  ├─ Regional concerns summary
│  ├─ Proposed amendments (by region)
│  ├─ Conflicts between regions
│  └─ Recommendations for amendment
│
├─ Actions:
│  ├─ Approve all feedback
│  ├─ Request additional feedback
│  ├─ Consolidate for amendments
│  └─ Send to Planning Team for revision
│
└─ Export: PDF with detailed regional comments

REPORT 3: AMENDMENT ANALYSIS REPORT
├─ Description: Analyze impact of proposed amendments
├─ Access: Audit Director
├─ Frequency: On-demand during amendments
├─ Analysis:
│  ├─ Original plan metrics
│  ├─ Proposed changes (by region)
│  ├─ New plan metrics (with changes)
│  ├─ Impact on capacity
│  ├─ Impact on risk coverage
│  ├─ Impact on revenue
│  └─ Feasibility assessment
│
├─ Decision: Accept / Reject / Counter-propose
└─ Creates new version with amendment log

REPORT 4: DIRECTOR DASHBOARD
├─ Description: Real-time plan approval status
├─ Access: Audit Director
├─ Frequency: Real-time
├─ Shows:
│  ├─ Plans awaiting approval (count)
│  ├─ Plans by status (SUBMITTED, UNDER_REVIEW, APPROVED, etc.)
│  ├─ SLA status (on-time, at-risk, overdue)
│  ├─ Regional feedback status (per region)
│  ├─ Recent approvals / rejections
│  ├─ Escalations pending
│  ├─ Alerts / notifications
│  └─ Quick actions
│
├─ Visualization: Dashboard with KPI cards
└─ Drill-Down: Detailed reports

REPORT 5: SENIOR MANAGEMENT SUBMISSION REPORT
├─ Description: Executive summary for Senior Mgt approval
├─ Access: Audit Director
├─ Frequency: Before Senior Management submission
├─ Contains:
│  ├─ Plan executive summary
│  ├─ Strategic alignment
│  ├─ Risk coverage achieved
│  ├─ Resource requirements
│  ├─ Revenue projection
│  ├─ Capacity assessment
│  ├─ Feasibility confirmation
│  ├─ Key risks / assumptions
│  └─ Recommendation
│
├─ Format: Professional business document
└─ Export: PDF with signature blocks
```

#### 6.1.3 Regional Director Reports

```
REPORT 1: REGIONAL ALLOCATION DETAIL
├─ Description: Regional plan breakdown by tax center
├─ Access: Regional Director (own region only)
├─ Frequency: Upon plan receipt from Director
├─ Contains:
│  ├─ Regional total cases by audit type
│  ├─ Distribution by tax center
│  ├─ Tax center allocation details:
│  │  ├─ Tax center name
│  │  ├─ Cases allocated (by type)
│  │  ├─ Effort hours required
│  │  ├─ Auditor requirements
│  │  ├─ Skill requirements
│  │  └─ Feasibility
│  │
│  ├─ Regional context:
│  │  ├─ Regional risk profile
│  │  ├─ Regional auditor capacity
│  │  ├─ Regional utilization (%)
│  │  └─ Regional constraints
│  │
│  └─ Feedback form (for input)
│
├─ Export: PDF, Excel
└─ Drill-Down: Tax center detail

REPORT 2: TAX CENTER FEEDBACK COLLECTION STATUS
├─ Description: Track feedback receipt from all tax centers
├─ Access: Regional Director
├─ Frequency: Daily during feedback period
├─ Shows:
│  ├─ Tax center name
│  ├─ Allocation status (RECEIVED, UNDER_REVIEW, FEEDBACK_PROVIDED)
│  ├─ Feedback received date
│  ├─ Feedback content preview
│  ├─ Concerns identified
│  └─ Recommended actions
│
├─ Status indicators: Green (OK) / Amber (Needs attention) / Red (Issues)
└─ Alerts: If feedback not received by SLA

REPORT 3: CONSOLIDATED FEEDBACK REPORT
├─ Description: Summary of all tax center feedback
├─ Access: Regional Director
├─ Frequency: After all tax centers submit feedback
├─ Analysis:
│  ├─ Feedback summary (per tax center)
│  ├─ Common issues/themes
│  ├─ Capacity concerns (by tax center)
│  ├─ Skill gaps identified
│  ├─ Resource constraints
│  ├─ Proposed amendments (consolidated)
│  └─ Overall feasibility assessment
│
├─ Recommendation: Feasible / Feasible with changes / Not feasible
└─ Ready to send to Director

REPORT 4: REGIONAL DIRECTOR FEEDBACK FORM
├─ Description: Template for providing feedback to Director
├─ Access: Regional Director
├─ Frequency: On-demand
├─ Sections:
│  ├─ Overall assessment: Feasible / With changes / Not feasible
│  ├─ Capacity assessment: Adequate / Constrained / Unable
│  ├─ Skill assessment: Available / Gaps / Critical
│  ├─ Resource constraints: None / Minor / Major
│  ├─ Specific concerns: [Open text]
│  ├─ Proposed amendments: [Detailed list]
│  ├─ Tax center feedback summary: [From tax centers]
│  ├─ Confidence level: High / Medium / Low
│  └─ Signature & date
│
└─ Submit: To Audit Director

REPORT 5: REGIONAL DASHBOARD
├─ Description: Real-time regional plan status
├─ Access: Regional Director
├─ Frequency: Real-time
├─ Shows:
│  ├─ Regional allocation received (status)
│  ├─ Tax center feedback status (per TC)
│  ├─ Regional capacity utilization (%)
│  ├─ Pending actions (with SLA)
│  ├─ Issues/alerts
│  └─ Quick actions
│
└─ Visualization: Dashboard with status indicators
```

#### 6.1.4 Senior Management Reports

```
REPORT 1: STRATEGIC PLAN SUMMARY
├─ Description: Executive-level plan overview
├─ Access: Senior Management
├─ Frequency: Upon plan submission for approval
├─ Contains:
│  ├─ Plan name, year, duration
│  ├─ Total cases planned
│  ├─ Audit type distribution (%)
│  ├─ Regional allocation (%)
│  ├─ Total effort (auditor-years equivalent)
│  ├─ Total budget required
│  ├─ Expected revenue impact
│  ├─ Risk coverage percentage
│  ├─ Revenue at risk covered
│  ├─ Strategic objectives alignment
│  └─ Key assumptions & risks
│
├─ Visualization: Executive dashboard
└─ Recommendation: Approve / Approve with conditions / Reject

REPORT 2: COMPARATIVE ANALYSIS
├─ Description: Comparison to previous years
├─ Access: Senior Management
├─ Frequency: Annual
├─ Comparison:
│  ├─ This year vs. last year:
│  │  ├─ Total cases (absolute & %)
│  │  ├─ Audit type mix (%)
│  │  ├─ Effort hours (absolute & %)
│  │  ├─ Budget (absolute & %)
│  │  ├─ Expected revenue (absolute & %)
│  │  └─ Trends
│  │
│  ├─ Variability analysis:
│  │  ├─ What changed? Why?
│  │  ├─ Justification for changes
│  │  └─ Risk implications
│  │
│  └─ Benchmark:
│     ├─ Industry benchmarks (if available)
│     ├─ How does our plan compare?
│     └─ Recommendations
│
├─ Visualization: Trend charts, comparison tables
└─ Export: PDF with detailed analysis

REPORT 3: RISK COVERAGE SCORECARD
├─ Description: How well plan addresses identified risks
├─ Access: Senior Management
├─ Frequency: Upon plan submission
├─ Scorecard:
│  ├─ Overall risk coverage: [Score 0-100]
│  ├─ Critical risk coverage: [%]
│  ├─ Revenue at risk coverage: [%]
│  ├─ Geographic coverage: [%]
│  ├─ Industry coverage: [%]
│  ├─ Taxpayer segment coverage: [%]
│  ├─ Tax type coverage: [%]
│  └─ Overall assessment: Excellent / Good / Adequate / Insufficient
│
├─ Visualization: Scorecard with color coding
└─ Gaps: What risks are not covered? Why?

REPORT 4: BUDGET & RESOURCE SUMMARY
├─ Description: Budget requirements and resource plans
├─ Access: Senior Management
├─ Frequency: Upon plan submission
├─ Contains:
│  ├─ Total auditor effort required (hours)
│  ├─ Equivalent to [X] full-time auditors for [Y] months
│  ├─ Total budget required
│  ├─ Budget breakdown (by region)
│  ├─ Training hours required
│  ├─ Resource constraints identified
│  ├─ Mitigation strategies
│  └─ Approval needed for budget
│
├─ Visualization: Budget breakdown charts
└─ Export: Finance-ready format

REPORT 5: SENIOR MANAGEMENT APPROVAL FORM
├─ Description: Formal approval document
├─ Access: Senior Management
├─ Frequency: Upon plan submission
├─ Sections:
│  ├─ Plan identification
│  ├─ Strategic alignment assessment
│  ├─ Risk coverage assessment
│  ├─ Resource assessment
│  ├─ Decision: APPROVED / REJECTED / APPROVED WITH CONDITIONS
│  ├─ Conditions (if applicable)
│  ├─ Digital signature
│  ├─ Date
│  └─ Comments
│
└─ Output: Approval record & notification
```

#### 6.1.5 Tax Center Manager Reports

```
REPORT 1: TAX CENTER ALLOCATION DETAIL
├─ Description: Allocation received from Regional Director
├─ Access: Tax Center Manager (own tax center only)
├─ Frequency: Upon allocation receipt
├─ Contains:
│  ├─ Tax center name & code
│  ├─ Total cases allocated
│  ├─ Audit type breakdown:
│  │  ├─ Desk Audit: [cases]
│  │  ├─ Field Audit: [cases]
│  │  ├─ etc.
│  │
│  ├─ Effort requirements (hours total)
│  ├─ Auditor requirements (by level)
│  ├─ Skill requirements
│  ├─ Expected timeline
│  ├─ Regional context (for transparency)
│  │  ├─ Regional total
│  │  ├─ Tax center's % of regional
│  │  ├─ Other tax centers' allocations
│  │  └─ Regional constraints
│  │
│  └─ Feedback form
│
├─ Export: PDF
└─ Analysis: Can we handle this allocation?

REPORT 2: CAPACITY ASSESSMENT REPORT
├─ Description: Feasibility analysis of allocation
├─ Access: Tax Center Manager
├─ Frequency: On-demand
├─ Analysis:
│  ├─ Available auditors (by level)
│  ├─ Available billable hours
│  ├─ Auditors required for allocation
│  ├─ Hours required for allocation
│  ├─ Capacity utilization (%)
│  ├─ Utilization acceptable? YES / NO
│  ├─ Skill match analysis
│  ├─ Resource constraints identified
│  └─ Risk areas
│
├─ If constrained:
│  ├─ Options: Defer / Reduce / Request help
│  ├─ Estimated impact of each option
│  └─ Recommendation
│
└─ Export: PDF

REPORT 3: TAX CENTER FEEDBACK FORM
├─ Description: Template for providing feedback
├─ Access: Tax Center Manager
├─ Frequency: One per allocation period
├─ Sections:
│  ├─ Feasibility assessment: Feasible / With changes / Not feasible
│  ├─ Capacity status: Adequate / Constrained / Unable
│  ├─ Skill status: Fully available / Gaps / Critical gaps
│  ├─ Resource needs: None / Minor / Major
│  ├─ Specific concerns: [Open text]
│  ├─ Proposed adjustments: [Detailed]
│  ├─ Timeline concerns: [If applicable]
│  ├─ Support needed: [If applicable]
│  ├─ Confidence level: High / Medium / Low
│  ├─ Prepared by: [Name, date]
│  └─ Digital signature
│
├─ Required fields marked
└─ Submit: To Regional Director

REPORT 4: TAX CENTER DASHBOARD
├─ Description: Real-time allocation status
├─ Access: Tax Center Manager
├─ Frequency: Real-time
├─ Shows:
│  ├─ Allocation received (status)
│  ├─ Review deadline (with SLA warning)
│  ├─ Capacity status (% utilization)
│  ├─ Key metrics (cases, hours, auditors)
│  ├─ Quick actions (provide feedback, request help)
│  └─ Status indicator (Green / Amber / Red)
│
└─ Drill-Down: Detailed allocation view
```

#### 6.1.6 Auditor Reports

```
REPORT 1: ASSIGNED CASES REPORT
├─ Description: List of assigned audit cases
├─ Access: Auditor (own cases only)
├─ Frequency: Daily
├─ Contains:
│  ├─ Case number
│  ├─ Taxpayer name & TIN
│  ├─ Audit type
│  ├─ Start date
│  ├─ End date (deadline)
│  ├─ Status
│  ├─ Days remaining
│  ├─ Work completed (%)
│  ├─ Effort hours used / remaining
│  ├─ Team members (if team audit)
│  ├─ Lead auditor (if applicable)
│  └─ Quick actions
│
├─ Sorting: By deadline / By status / By priority
└─ Export: PDF

REPORT 2: CASE PROGRESS REPORT
├─ Description: Detailed progress on specific case
├─ Access: Auditor
├─ Frequency: On-demand or daily auto-generated
├─ Contains:
│  ├─ Case identification
│  ├─ Taxpayer information
│  ├─ Risk profile
│  ├─ Plan (audit type, scope, timeline)
│  ├─ Progress to date:
│  │  ├─ Evidence gathered
│  │  ├─ Work completed (steps)
│  │  ├─ Hours used
│  │  ├─ Status
│  │  └─ Blockers (if any)
│  │
│  ├─ Next steps
│  ├─ Timeline (vs. plan)
│  ├─ Risks
│  └─ Support needed
│
├─ Visualization: Progress bar, Gantt chart
└─ Export: PDF

REPORT 3: PRODUCTIVITY REPORT
├─ Description: Auditor productivity metrics (optional)
├─ Access: Auditor (own) + Manager (team members)
├─ Frequency: Weekly / Monthly
├─ Metrics:
│  ├─ Cases started
│  ├─ Cases completed
│  ├─ Hours logged
│  ├─ Utilization rate
│  ├─ Adjustments made (if available)
│  ├─ Quality score (if available)
│  └─ Trends (vs. previous weeks/months)
│
└─ Export: PDF

REPORT 4: AUDITOR DASHBOARD
├─ Description: Real-time case status
├─ Access: Auditor
├─ Frequency: Real-time
├─ Shows:
│  ├─ Assigned cases (by status)
│  ├─ Cases overdue (with SLA warning)
│  ├─ Capacity (hours used / total)
│  ├─ Upcoming deadlines (next 7 days)
│  ├─ Blockers / Escalations
│  ├─ Team messages (if applicable)
│  └─ Quick actions
│
└─ Visualization: Card-based dashboard
```

---

## 7. IMPLEMENTATION PRIORITY & ROADMAP

### Phase 1: Core Infrastructure (Weeks 1-4)
- [ ] Database schema for all configurations
- [ ] Configuration management API
- [ ] Role-based access control (RBAC) implementation
- [ ] Audit trail logging
- [ ] Configuration versioning & change tracking

### Phase 2: Audit Type & Risk Configuration (Weeks 5-8)
- [ ] Audit case type configuration interface
- [ ] Risk parameter configuration interface
- [ ] Risk indicator management
- [ ] Risk scoring engine implementation
- [ ] Risk threshold configuration

### Phase 3: Skill & Capacity Management (Weeks 9-12)
- [ ] Skill category configuration
- [ ] Workload capacity rules configuration
- [ ] Capacity calculation engine
- [ ] Skill matching algorithm

### Phase 4: Case Allocation Rules (Weeks 13-16)
- [ ] Taxpayer classification rules
- [ ] Geographic & industry risk profiles
- [ ] Case allocation rules engine
- [ ] Allocation rule configuration interface

### Phase 5: Plan Creation & Workflows (Weeks 17-24)
- [ ] Plan creation workflow implementation
- [ ] Dynamic calculation engine
- [ ] Approval workflow engine
- [ ] Approval level configuration

### Phase 6: Reports & Analytics (Weeks 25-28)
- [ ] Report generation framework
- [ ] Dashboard framework
- [ ] Analytics queries
- [ ] Export functionality

### Phase 7: Testing & Deployment (Weeks 29-32)
- [ ] Integration testing
- [ ] UAT support
- [ ] Documentation
- [ ] Production deployment

---

## 8. KEY DEPENDENCIES & CONSTRAINTS

### Technical Dependencies
- Database supporting JSON documents (MongoDB preferred)
- API framework supporting complex calculations
- Workflow engine (e.g., Temporal, Kafka)
- Reporting engine (e.g., Jasper, SSRS)
- Authentication/Authorization system

### Configuration Dependencies
- All audit types must be defined before plan creation
- All risk parameters must be calibrated before risk scoring
- All skill categories must exist before allocation
- All allocation rules must reference existing configurations

### Data Dependencies
- Current risk distribution must be available in Risk Engine
- Auditor capacity data must be maintained
- Historical audit data (if using patterns)
- Taxpayer segment classifications

### External Dependencies
- Risk Directorate (provides risk data)
- Regional offices (provide feedback)
- Finance department (budget allocation)
- HR department (auditor availability)

---

## 9. TESTING STRATEGY

### Configuration Testing
- [ ] Test configuration CRUD operations
- [ ] Test configuration validation rules
- [ ] Test configuration versioning
- [ ] Test configuration change impact analysis

### Calculation Testing
- [ ] Test effort estimation accuracy
- [ ] Test capacity calculations
- [ ] Test skill matching logic
- [ ] Test risk scoring accuracy

### Workflow Testing
- [ ] Test plan creation workflow
- [ ] Test approval workflows
- [ ] Test status transitions
- [ ] Test SLA enforcement

### Integration Testing
- [ ] Test Risk Engine integration
- [ ] Test allocation rule execution
- [ ] Test notification system
- [ ] Test audit trail logging

### User Acceptance Testing (UAT)
- [ ] Test by Audit Team (plan creation)
- [ ] Test by Audit Director (review & approval)
- [ ] Test by Regional Directors (feedback)
- [ ] Test by Senior Management (final approval)

---

## 10. DOCUMENTATION REQUIREMENTS

### For Configuration Managers
- [ ] Configuration management guide
- [ ] How to add/edit audit types
- [ ] How to configure risk parameters
- [ ] How to manage skill categories
- [ ] How to set up capacity rules
- [ ] How to define allocation rules
- [ ] Troubleshooting guide

### For Administrators
- [ ] System administration guide
- [ ] User management guide
- [ ] Role-based access control setup
- [ ] Backup & recovery procedures
- [ ] System maintenance procedures

### For End Users
- [ ] User guide for each role
- [ ] Quick start guides
- [ ] Video tutorials
- [ ] FAQ & troubleshooting
- [ ] Report user guide

### For Developers
- [ ] API documentation
- [ ] Database schema documentation
- [ ] Calculation engine documentation
- [ ] Workflow engine documentation
- [ ] Integration guide

---

## 11. SUCCESS CRITERIA

### Functional Success
- [ ] All configurations can be created, edited, versioned
- [ ] Plan creation produces accurate allocations
- [ ] Approval workflows enforce required steps
- [ ] All reports generate correctly
- [ ] System handles edge cases gracefully

### Performance Success
- [ ] Plan creation completes in <5 seconds
- [ ] Report generation completes in <2 seconds
- [ ] Dashboard loads in <3 seconds
- [ ] System supports 100+ concurrent users

### User Success
- [ ] Users can complete tasks within documented time
- [ ] System provides clear guidance/validation
- [ ] Errors are handled with helpful messages
- [ ] All required reports available
- [ ] System meets accessibility standards

### Operational Success
- [ ] 99.5% system uptime
- [ ] <4 hour incident response time
- [ ] Complete audit trail maintained
- [ ] Configuration changes reversible

---

## CONCLUSION

This Tax Audit Module requires comprehensive configuration capabilities across 8 major areas with 40+ configurable parameters. The dynamic plan creation process integrates risk data, capacity constraints, skill matching, and approval workflows into a cohesive system.

Key implementation priorities are:
1. Solid configuration management infrastructure
2. Accurate calculation engines
3. Robust workflow enforcement
4. Comprehensive reporting

All configurable parameters should support:
- Real-time modification by authorized personnel
- Version control & change tracking
- Validation & constraint checking
- Impact analysis before changes
- Audit trail logging

This analysis provides the foundation for detailed technical design and development.

---

**Document Status:** READY FOR DEVELOPMENT  
**Approval Date:** [To be filled]  
**Version:** 1.0  
**Last Updated:** July 2026

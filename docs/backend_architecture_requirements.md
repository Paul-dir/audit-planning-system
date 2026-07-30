# End-to-End Backend Architecture & Integration Document

This document outlines the architectural requirements, domain models, state machines, and API endpoints necessary to build the actual production backend for the **Audit Planning and Case Management System**. The system currently runs as a sophisticated frontend-first React application using an in-memory/localStorage mock backend. 

The backend should follow **Domain-Driven Design (DDD)** and **Hexagonal Architecture** principles.

---

## 1. Domain Entities & Bounded Contexts

### 1.1 Organizational Context (Identity & Access)
This context maps real-world users, their roles, capacities, and organizational structure (Regions and Tax Centers).
*   **User Entity:**
    *   `id` (UUID), `fullName`, `email`, `role` (Enum), `status` (Enum).
    *   `org_context`: Embedded Value Object containing `assignedRegion`, `assignedTaxCenter`, `auditType`, and `teamId`.
*   **Capacity Metrics:**
    *   `currentWorkload` (Integer), `maxCapacity` (Integer).
    *   *Business Rule:* Auditors and Team Leaders have strict capacity limits. The backend must reject assignments if `currentWorkload >= maxCapacity` (unless overridden by a Process Owner).

### 1.2 Audit Planning Context
Manages the lifecycle of an annual/quarterly audit plan before cases are instantiated.
*   **AuditPlan Aggregate:**
    *   `planId`, `title`, `fiscalYear`, `region`, `taxCenter`.
    *   `taxpayers`: List of taxpayer entities assigned to this plan.
    *   `status`: `DRAFT` ➔ `REVIEW_PENDING` ➔ `APPROVED` ➔ `CASCADED`.
*   *Business Rule:* Once an Audit Plan reaches `APPROVED` and is accepted by the Tax Center Manager, a domain event (`PlanCascadedEvent`) must be fired to automatically generate individual Audit Cases in the Case Management Context.

### 1.3 Case Management Context (Core)
The core engine for routing, assigning, and executing an audit case.
*   **AuditCase Aggregate:**
    *   `id` (UUID), `tin`, `taxpayerName`, `auditType`, `riskLevel` (Enum), `riskScore` (Float), `revenueAtRisk` (Decimal), `estimatedHours` (Integer).
    *   `assignedTeamLeaderId`, `assignedAuditorId`.
    *   **State Machine (CRITICAL):**
        1.  `PENDING_PRIORITIZATION`: Case generated from plan, waiting for Tax Center Manager to prioritize.
        2.  `STORED_FOR_ASSIGNMENT`: Case prioritized, queued for assignment.
        3.  `ASSIGNED_TO_TEAM_LEADER`: Case assigned to TL. Workload updated.
        4.  `ASSIGNED_TO_AUDITOR`: Case assigned to specific Auditor. Workload updated.
        5.  `IN_PROGRESS`: Auditor has begun execution.
        6.  `CLOSED`: Case finalized.
*   **Assignment Entity:**
    *   A separate historical record tracking the chain of custody. Every status change in `AuditCase` must generate an immutable `Assignment` log containing `fromUser`, `toUser`, `transitionDate`, and `reason`.

---

## 2. API Endpoints & Workflows

### 2.1 Workflow 1: Cascading Plans to Cases
**Endpoint:** `POST /api/v1/plans/{planId}/cascade`
*   **Actor:** Tax Center Manager
*   **Action:** Reads the `taxpayers` array inside the approved plan. For each taxpayer, initializes a new `AuditCase` entity with `status = PENDING_PRIORITIZATION`.
*   **Response:** List of generated `AuditCase` objects.

### 2.2 Workflow 2: Prioritizing and Storing Cases
**Endpoint:** `POST /api/v1/cases/prioritize-store`
*   **Actor:** Tax Center Manager
*   **Payload:** Array of `caseIds`.
*   **Action:** Updates status of provided cases from `PENDING_PRIORITIZATION` to `STORED_FOR_ASSIGNMENT`. Updates audit trail.

### 2.3 Workflow 3: Assigning to Team Leaders (Intelligent Distribution)
**Endpoint:** `POST /api/v1/cases/distribute/team-leaders`
*   **Actor:** Tax Center Manager
*   **Payload:** `{ caseIds: [...], method: "AUTO" | "MANUAL", targetTeamLeaderId?: "UUID" }`
*   **Action (AUTO):** 
    1. Sort provided cases by `riskScore`.
    2. Group by `auditType`.
    3. Query DB for available Team Leaders matching `taxCenter` AND `auditType`.
    4. Validate `currentWorkload < maxCapacity`.
    5. Distribute cases evenly. Update `AuditCase` status to `ASSIGNED_TO_TEAM_LEADER`.
    6. Generate `Assignment` history records.
    7. Atomically increment Team Leader `currentWorkload`.
*   **Transactional Boundary:** The updates to the case status, the creation of assignment logs, and the incrementing of user workloads **MUST** happen within a single ACID transaction to prevent ghost workloads.

### 2.4 Workflow 4: Assigning to Auditors
**Endpoint:** `POST /api/v1/cases/distribute/auditors`
*   **Actor:** Team Leader
*   **Payload:** `{ caseIds: [...], method: "AUTO" | "MANUAL", targetAuditorId?: "UUID" }`
*   **Action:** 
    1. Verify cases belong to the requesting Team Leader.
    2. Verify target auditor belongs strictly to the Team Leader's `teamId`.
    3. Update `AuditCase` status to `ASSIGNED_TO_AUDITOR`.
    4. Generate `Assignment` history records.
    5. Atomically increment Auditor `currentWorkload`.

### 2.5 Workflow 5: Real-Time Tracking & Reporting
**Endpoint:** `GET /api/v1/cases/tracking?taxCenter=X&region=Y`
*   **Actor:** Process Owner, Manager, or Director
*   **Action:** Returns a projection/DTO containing case counts grouped by `status` (STORED, ASSIGNED_TO_TL, ASSIGNED_TO_AUDITOR, IN_PROGRESS, CLOSED).
*   *Note:* The frontend currently relies on filtering a giant array. The backend should use SQL `GROUP BY` aggregations for performance.

---

## 3. Infrastructure & Architecture Requirements

### 3.1 Hexagonal Architecture (Ports and Adapters)
*   **Domain Layer:** Contains pure business logic. `AuditCase.distributeTo(TeamLeader)` should be a domain function that inherently checks capacity constraints.
*   **Application Services:** Orchestrates the use cases (e.g., `CaseAssignmentService`).
*   **Ports:** Interfaces like `AuditCaseRepository`, `UserRepository`, `AssignmentLogRepository`.
*   **Adapters:** 
    *   **Inbound:** REST Controllers (Spring Web / Express router).
    *   **Outbound:** JPA/Hibernate (Spring Data) or Prisma for database access.

### 3.2 Database Schema Highlights (Relational)
*   `users` table (FK to `org_units`).
*   `audit_plans` table.
*   `audit_cases` table (FK to `audit_plans`, FK to `users` for assigned TL and Auditor).
*   `assignment_history` table (FK to `audit_cases`, records transition timestamps and actors).

### 3.3 Event-Driven Communication
When a case is closed (`CLOSED`), the backend should ideally publish a domain event (e.g., to Kafka/RabbitMQ) so that external systems (like the Risk Engine) can absorb the final audit findings (revenue recovered vs expected) to retrain the risk assessment models for future planning.

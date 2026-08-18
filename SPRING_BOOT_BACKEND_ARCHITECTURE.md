# MOR Audit Planning System - Spring Boot Backend Architecture

**Version:** 1.0  
**Status:** Architecture & Implementation Guide  
**Framework:** Spring Boot 3.x  
**Database:** PostgreSQL  
**API Style:** RESTful JSON  
**Authentication:** JWT (JSON Web Tokens)  

---

## TABLE OF CONTENTS

1. [Project Overview](#project-overview)
2. [Common Rules & Patterns](#common-rules--patterns)
3. [Project Structure](#project-structure)
4. [Entity Models](#entity-models)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Spring Boot Configuration](#spring-boot-configuration)
8. [Service Layer](#service-layer)
9. [Repository Layer](#repository-layer)
10. [Authentication & Security](#authentication--security)
11. [Error Handling](#error-handling)
12. [Frontend Integration](#frontend-integration)
13. [Current Sprint Implementation](#current-sprint-implementation)
14. [Testing Strategy](#testing-strategy)

---

## PROJECT OVERVIEW

**Backend Purpose:**
- Provide REST APIs for the React frontend
- Manage audit planning workflows
- Persist data to PostgreSQL database
- Handle authentication and authorization
- Enforce business logic and validations

**Technology Stack:**
- Java 17+
- Spring Boot 3.x
- Spring Data JPA
- Spring Security + JWT
- PostgreSQL
- Maven
- JUnit 5 + Mockito

**Integration Points:**
- React frontend consumes REST APIs
- JWT tokens for authentication
- JSON request/response format
- CORS enabled for frontend domain

---

## COMMON RULES & PATTERNS

### Naming Conventions

**Java Classes:**
```
Entity:      Plan, Case, User, Region, TaxCenter
Repository:  PlanRepository, CaseRepository, UserRepository
Service:     PlanService, CaseService, UserService
Controller:  PlanController, CaseController, UserController
DTO:         PlanDTO, CaseDTO, UserDTO
```

**Database:**
```
Tables:      plans, cases, users, regions, tax_centers, timelines
Columns:     snake_case (created_at, plan_id, audit_type)
IDs:         UUID or Long with @GeneratedValue
Timestamps:  created_at, updated_at (LocalDateTime)
```

**API Endpoints:**
```
GET    /api/v1/plans              List all plans
GET    /api/v1/plans/{id}         Get single plan
POST   /api/v1/plans              Create plan
PUT    /api/v1/plans/{id}         Update plan
DELETE /api/v1/plans/{id}         Delete plan
POST   /api/v1/plans/{id}/submit  Action endpoints
```

**Error Responses:**
```json
{
  "status": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "planName",
      "message": "Plan name is required"
    }
  ],
  "timestamp": "2024-08-14T10:30:00Z"
}
```

### Status Handling

**Plan Statuses (Enum):**
```java
public enum PlanStatus {
    DRAFT,
    SUBMITTED_TO_DIRECTOR,
    REVISION_REQUESTED,
    DIRECTOR_APPROVED,
    AWAITING_REGIONAL_FEEDBACK,
    FEEDBACK_COLLECTED,
    AMENDMENT_REQUIRED,
    SUBMITTED_TO_SENIOR_MGMT,
    SENIOR_MGMT_APPROVED,
    SENIOR_MGMT_REJECTED,
    APPROVED_TO_REGIONS,
    FINALIZED
}
```

**Case Statuses (Enum):**
```java
public enum CaseStatus {
    PENDING,
    ASSIGNED,
    IN_PROGRESS,
    COMPLETED,
    CLOSED
}
```

**User Roles (Enum):**
```java
public enum UserRole {
    PLANNING_TEAM,
    AUDIT_DIRECTOR,
    REGIONAL_DIRECTOR,
    TAX_CENTER_MANAGER,
    TEAM_LEADER,
    AUDITOR,
    SENIOR_MANAGEMENT,
    ADMIN
}
```

### Data Consistency Rules

1. **Immutable IDs**: Never change entity IDs
2. **Audit Trail**: Every status change logged to timeline
3. **Soft Deletes**: Never physically delete data (use deleted_at flag)
4. **Timestamps**: All entities have created_at and updated_at
5. **Relationships**: Maintain referential integrity
6. **Validation**: Server-side validation mandatory
7. **Transactions**: Complex operations wrapped in @Transactional

---

## PROJECT STRUCTURE

```
audit-planning-system-backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/mor/audit/
│   │   │       ├── AuditPlanningSystemApplication.java
│   │   │       ├── config/
│   │   │       │   ├── SecurityConfig.java
│   │   │       │   ├── CorsConfig.java
│   │   │       │   ├── JpaConfig.java
│   │   │       │   └── ApplicationProperties.java
│   │   │       ├── controller/
│   │   │       │   ├── PlanController.java
│   │   │       │   ├── CaseController.java
│   │   │       │   ├── UserController.java
│   │   │       │   ├── AuthController.java
│   │   │       │   ├── RegionController.java
│   │   │       │   ├── TaxCenterController.java
│   │   │       │   └── ExceptionHandlerController.java
│   │   │       ├── dto/
│   │   │       │   ├── PlanDTO.java
│   │   │       │   ├── CaseDTO.java
│   │   │       │   ├── UserDTO.java
│   │   │       │   ├── LoginRequest.java
│   │   │       │   ├── LoginResponse.java
│   │   │       │   ├── ErrorResponse.java
│   │   │       │   └── TimelineEntryDTO.java
│   │   │       ├── entity/
│   │   │       │   ├── Plan.java
│   │   │       │   ├── Case.java
│   │   │       │   ├── User.java
│   │   │       │   ├── Region.java
│   │   │       │   ├── TaxCenter.java
│   │   │       │   ├── Timeline.java
│   │   │       │   ├── RegionalFeedback.java
│   │   │       │   └── BaseEntity.java (abstract)
│   │   │       ├── repository/
│   │   │       │   ├── PlanRepository.java
│   │   │       │   ├── CaseRepository.java
│   │   │       │   ├── UserRepository.java
│   │   │       │   ├── RegionRepository.java
│   │   │       │   └── TaxCenterRepository.java
│   │   │       ├── service/
│   │   │       │   ├── PlanService.java
│   │   │       │   ├── CaseService.java
│   │   │       │   ├── UserService.java
│   │   │       │   ├── AuthService.java
│   │   │       │   ├── RegionService.java
│   │   │       │   ├── EmailService.java (optional)
│   │   │       │   └── impl/
│   │   │       │       ├── PlanServiceImpl.java
│   │   │       │       ├── CaseServiceImpl.java
│   │   │       │       ├── UserServiceImpl.java
│   │   │       │       └── ... (other implementations)
│   │   │       ├── security/
│   │   │       │   ├── JwtTokenProvider.java
│   │   │       │   ├── JwtAuthenticationFilter.java
│   │   │       │   ├── CustomUserDetailsService.java
│   │   │       │   └── SecurityUtil.java
│   │   │       ├── exception/
│   │   │       │   ├── ResourceNotFoundException.java
│   │   │       │   ├── ValidationException.java
│   │   │       │   ├── UnauthorizedException.java
│   │   │       │   ├── ForbiddenException.java
│   │   │       │   └── BusinessException.java
│   │   │       ├── util/
│   │   │       │   ├── DateUtil.java
│   │   │       │   ├── ValidationUtil.java
│   │   │       │   └── MappingUtil.java
│   │   │       └── listener/
│   │   │           └── EntityAuditListener.java
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── application-dev.properties
│   │       ├── application-prod.properties
│   │       ├── db/migration/
│   │       │   ├── V1__initial_schema.sql
│   │       │   ├── V2__seed_data.sql
│   │       │   └── V3__create_indexes.sql
│   │       └── logback-spring.xml
│   └── test/
│       ├── java/com/mor/audit/
│       │   ├── controller/
│       │   │   ├── PlanControllerTest.java
│       │   │   └── CaseControllerTest.java
│       │   ├── service/
│       │   │   ├── PlanServiceTest.java
│       │   │   └── CaseServiceTest.java
│       │   └── integration/
│       │       └── PlanIntegrationTest.java
│       └── resources/
│           └── application-test.properties
├── pom.xml
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## ENTITY MODELS

### 1. User Entity

```java
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String passwordHash;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;
    
    // Organizational context
    @Column(name = "region_id")
    private String regionId;
    
    @Column(name = "tax_center_id")
    private String taxCenterId;
    
    // Role-specific fields
    @Column(name = "audit_type")
    private String auditType;
    
    @Column(name = "team_leader_id")
    private String teamLeaderId;
    
    @Column(name = "is_joint_committee")
    private Boolean isJointCommittee;
    
    // Active flag
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "region_id", insertable = false, updatable = false)
    private Region region;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tax_center_id", insertable = false, updatable = false)
    private TaxCenter taxCenter;
}
```

### 2. Plan Entity

```java
@Entity
@Table(name = "plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Plan extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private Integer year;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PlanStatus status;
    
    @Column(name = "created_by")
    private String createdBy;
    
    // Distribution: JSON structure
    @Column(columnDefinition = "jsonb")
    private String distribution; // { "addis_ababa": { "desk_audit": 100, ... }, ... }
    
    // Feedback from regions
    @Column(columnDefinition = "jsonb")
    private String regionalFeedback; // { "addis_ababa": { allocations, comments, ... }, ... }
    
    // Director comment
    @Column(columnDefinition = "TEXT")
    private String directorComment;
    
    // Amendment comment
    @Column(columnDefinition = "TEXT")
    private String amendmentComment;
    
    // Senior management comment
    @Column(columnDefinition = "TEXT")
    private String seniorComment;
    
    // Deployment tracking
    @Column(columnDefinition = "jsonb")
    private String regionalDeployments; // { "addis_ababa": { deployedAt, deployedBy, ... }, ... }
    
    // Revisions tracking
    @Column(columnDefinition = "jsonb")
    private String revisions; // Array of revision records
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    
    // Relationships
    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Case> cases = new ArrayList<>();
    
    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Timeline> timeline = new ArrayList<>();
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", insertable = false, updatable = false)
    private User creator;
}
```

### 3. Case Entity

```java
@Entity
@Table(name = "cases")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Case extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(name = "plan_id", nullable = false)
    private String planId;
    
    @Column(nullable = false)
    private String region;
    
    @Column(name = "tax_center_id", nullable = false)
    private String taxCenterId;
    
    @Column(name = "audit_type", nullable = false)
    private String auditType;
    
    // Taxpayer information
    @Column(nullable = false)
    private String taxpayerName;
    
    @Column(nullable = false)
    private String tin;
    
    private String sector;
    
    @Column(name = "annual_revenue")
    private Long annualRevenue;
    
    private Integer employees;
    
    // Risk assessment
    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level", nullable = false)
    private RiskLevel riskLevel; // CRITICAL, HIGH, MEDIUM, LOW
    
    @Column(name = "risk_score", nullable = false)
    private Integer riskScore; // 0-100
    
    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    private CasePriority priority; // HIGH, MEDIUM, NORMAL, LOW
    
    // Status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CaseStatus status;
    
    // Assignment chain
    @Column(name = "assigned_team_leader_id")
    private String assignedTeamLeaderId;
    
    @Column(name = "assigned_auditor_id")
    private String assignedAuditorId;
    
    @Column(name = "start_date")
    private LocalDateTime startDate;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", insertable = false, updatable = false)
    private Plan plan;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_team_leader_id", insertable = false, updatable = false)
    private User teamLeader;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_auditor_id", insertable = false, updatable = false)
    private User auditor;
    
    @OneToMany(mappedBy = "auditCase", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Timeline> timeline = new ArrayList<>();
}
```

### 4. Region & TaxCenter Entities

```java
@Entity
@Table(name = "regions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Region {
    
    @Id
    private String id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false, length = 10)
    private String code;
    
    @OneToMany(mappedBy = "region", cascade = CascadeType.ALL)
    private List<TaxCenter> taxCenters = new ArrayList<>();
}

@Entity
@Table(name = "tax_centers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaxCenter {
    
    @Id
    private String id;
    
    @Column(name = "region_id", nullable = false)
    private String regionId;
    
    @Column(nullable = false)
    private String name;
    
    @Column(name = "short_name")
    private String shortName;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "region_id", insertable = false, updatable = false)
    private Region region;
}
```

### 5. Timeline Entity

```java
@Entity
@Table(name = "timelines")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Timeline {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "plan_id")
    private String planId;
    
    @Column(name = "case_id")
    private String caseId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private String status;
    
    @Column(name = "actor_id")
    private String actorId;
    
    @Column(columnDefinition = "TEXT")
    private String comment;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", insertable = false, updatable = false)
    private Plan plan;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", insertable = false, updatable = false)
    private Case auditCase;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id", insertable = false, updatable = false)
    private User actor;
}
```

### 6. Base Entity (Abstract)

```java
@MappedSuperclass
@Data
public abstract class BaseEntity {
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now(ZoneId.of("UTC"));
        updatedAt = LocalDateTime.now(ZoneId.of("UTC"));
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now(ZoneId.of("UTC"));
    }
}
```

---

## DATABASE SCHEMA

### Initial Migration (V1__initial_schema.sql)

```sql
-- Regions
CREATE TABLE regions (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE
);

-- Tax Centers
CREATE TABLE tax_centers (
    id VARCHAR(50) PRIMARY KEY,
    region_id VARCHAR(50) NOT NULL REFERENCES regions(id),
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(50),
    UNIQUE(region_id, name)
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    region_id VARCHAR(50) REFERENCES regions(id),
    tax_center_id VARCHAR(50) REFERENCES tax_centers(id),
    audit_type VARCHAR(50),
    team_leader_id UUID REFERENCES users(id),
    is_joint_committee BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Plans
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    year INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    distribution JSONB,
    regional_feedback JSONB,
    director_comment TEXT,
    amendment_comment TEXT,
    senior_comment TEXT,
    regional_deployments JSONB,
    revisions JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Cases (Audit Cases)
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES plans(id),
    region VARCHAR(50) NOT NULL,
    tax_center_id VARCHAR(50) NOT NULL REFERENCES tax_centers(id),
    audit_type VARCHAR(50) NOT NULL,
    taxpayer_name VARCHAR(255) NOT NULL,
    tin VARCHAR(20) NOT NULL UNIQUE,
    sector VARCHAR(100),
    annual_revenue DECIMAL(15, 2),
    employees INTEGER,
    risk_level VARCHAR(20) NOT NULL,
    risk_score INTEGER NOT NULL,
    priority VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL,
    assigned_team_leader_id UUID REFERENCES users(id),
    assigned_auditor_id UUID REFERENCES users(id),
    start_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Timeline (Audit Trail)
CREATE TABLE timelines (
    id BIGSERIAL PRIMARY KEY,
    plan_id UUID REFERENCES plans(id),
    case_id UUID REFERENCES cases(id),
    status VARCHAR(50) NOT NULL,
    actor_id UUID REFERENCES users(id),
    comment TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_tax_center ON users(tax_center_id);
CREATE INDEX idx_plans_status ON plans(status);
CREATE INDEX idx_plans_year ON plans(year);
CREATE INDEX idx_plans_created_by ON plans(created_by);
CREATE INDEX idx_cases_plan ON cases(plan_id);
CREATE INDEX idx_cases_tax_center ON cases(tax_center_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_auditor ON cases(assigned_auditor_id);
CREATE INDEX idx_cases_team_leader ON cases(assigned_team_leader_id);
CREATE INDEX idx_timeline_plan ON timelines(plan_id);
CREATE INDEX idx_timeline_case ON timelines(case_id);
```

---

## API ENDPOINTS

### Current Sprint Endpoints

#### Authentication

```
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh-token
GET    /api/v1/auth/me
```

#### Plans

```
GET    /api/v1/plans                        List all plans (paginated, filtered)
GET    /api/v1/plans/{id}                   Get plan details with timeline
POST   /api/v1/plans                        Create new plan
PUT    /api/v1/plans/{id}                   Update plan (DRAFT status only)
DELETE /api/v1/plans/{id}                   Delete plan (DRAFT status only)

POST   /api/v1/plans/{id}/submit-director  Submit to Director
POST   /api/v1/plans/{id}/approve          Director approve
POST   /api/v1/plans/{id}/revise            Request revision
POST   /api/v1/plans/{id}/send-regions      Send to regions (AUTO after approve)

POST   /api/v1/plans/{id}/feedback          Submit regional feedback
POST   /api/v1/plans/{id}/override-feedback Regional override

POST   /api/v1/plans/{id}/amendment         Send for amendment
POST   /api/v1/plans/{id}/edit-amendment    Edit amendment (AMENDMENT_REQUIRED)

POST   /api/v1/plans/{id}/senior-submit     Submit to senior mgmt
POST   /api/v1/plans/{id}/senior-approve    Senior approve
POST   /api/v1/plans/{id}/senior-reject     Senior reject

POST   /api/v1/plans/{id}/deploy            Regional deploy to tax centers
```

#### Cases

```
GET    /api/v1/cases                        List all cases (paginated, filtered)
GET    /api/v1/cases/{id}                   Get case details
POST   /api/v1/cases                        Create case (system only)
PUT    /api/v1/cases/{id}                   Update case

PUT    /api/v1/cases/{id}/status            Update status
PUT    /api/v1/cases/{id}/priority          Update priority
PUT    /api/v1/cases/{id}/assign-auditor    Assign to auditor
```

#### Users

```
GET    /api/v1/users                        List all users (paginated)
GET    /api/v1/users/{id}                   Get user details
POST   /api/v1/users                        Create user (admin only)
PUT    /api/v1/users/{id}                   Update user
DELETE /api/v1/users/{id}                   Soft delete user

GET    /api/v1/users/by-role/{role}         Get users by role
GET    /api/v1/users/by-tax-center/{tcId}   Get users by tax center
```

#### Regions & Tax Centers

```
GET    /api/v1/regions                      List all regions
GET    /api/v1/regions/{id}                 Get region details
GET    /api/v1/regions/{id}/tax-centers     Get tax centers for region

GET    /api/v1/tax-centers                  List all tax centers
GET    /api/v1/tax-centers/{id}             Get tax center details
```

---

## SPRING BOOT CONFIGURATION

### pom.xml (Dependencies)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.mor</groupId>
    <artifactId>audit-planning-system</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <name>MOR Audit Planning System</name>
    <description>National Audit Planning System</description>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
        <relativePath/>
    </parent>

    <properties>
        <java.version>17</java.version>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <!-- Spring Boot Web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Spring Data JPA -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <!-- Spring Security -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>

        <!-- JWT -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.12.3</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.12.3</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.12.3</version>
            <scope>runtime</scope>
        </dependency>

        <!-- PostgreSQL Driver -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <version>42.7.1</version>
            <scope>runtime</scope>
        </dependency>

        <!-- Flyway (Database Migrations) -->
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
            <version>9.22.3</version>
        </dependency>

        <!-- Validation -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- ModelMapper -->
        <dependency>
            <groupId>org.modelmapper</groupId>
            <artifactId>modelmapper</artifactId>
            <version>3.1.1</version>
        </dependency>

        <!-- Jackson (JSON) -->
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
        </dependency>
        <dependency>
            <groupId>com.fasterxml.jackson.datatype</groupId>
            <artifactId>jackson-datatype-jsr310</artifactId>
        </dependency>

        <!-- Logging -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-logging</artifactId>
        </dependency>

        <!-- Testing -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

### application.properties

```properties
# Server
server.port=8080
server.servlet.context-path=/api

# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/audit_planning
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.jdbc.batch_size=20

# Flyway
spring.flyway.locations=classpath:db/migration
spring.flyway.schemas=public
spring.flyway.baselineOnMigrate=true

# JWT
app.jwt.secret=your-super-secret-key-change-in-production-min-32-chars
app.jwt.expiration=86400000
app.jwt.refresh-expiration=604800000

# CORS
app.cors.allowed-origins=http://localhost:5173,http://localhost:3000
app.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
app.cors.allowed-headers=*

# Logging
logging.level.root=INFO
logging.level.com.mor.audit=DEBUG
logging.level.org.springframework.security=DEBUG

# Timezone
spring.jackson.time-zone=UTC
spring.jackson.serialization.write-dates-as-timestamps=false
```

---

## SERVICE LAYER

### Plan Service Interface

```java
public interface PlanService {
    
    // CRUD
    PlanDTO createPlan(CreatePlanRequest request, String userId);
    PlanDTO getPlanById(String planId);
    List<PlanDTO> getAllPlans(int page, int size, PlanStatus status);
    PlanDTO updatePlan(String planId, UpdatePlanRequest request);
    void deletePlan(String planId);
    
    // Workflow Actions
    PlanDTO submitToDirector(String planId, String userId);
    PlanDTO approvePlan(String planId, String comment, String userId);
    PlanDTO requestRevision(String planId, String comment, String userId);
    PlanDTO sendToRegions(String planId, String userId);
    
    // Regional Feedback
    PlanDTO submitRegionalFeedback(String planId, String regionId, 
                                   RegionalFeedbackRequest feedback, String userId);
    PlanDTO overrideRegionalFeedback(String planId, String regionId, 
                                     OverrideFeedbackRequest override, String userId);
    
    // Amendment
    PlanDTO sendForAmendment(String planId, String comment, String userId);
    PlanDTO editAmendment(String planId, EditAmendmentRequest request, String userId);
    
    // Senior Management
    PlanDTO submitToSeniorMgmt(String planId, String userId);
    PlanDTO approveSeniorMgmt(String planId, String userId);
    PlanDTO rejectSeniorMgmt(String planId, String comment, String userId);
    
    // Deployment
    PlanDTO deployToTaxCenters(String planId, String regionId, String userId);
}
```

### Case Service Interface

```java
public interface CaseService {
    
    // CRUD
    CaseDTO getCaseById(String caseId);
    List<CaseDTO> getCasesByPlan(String planId);
    List<CaseDTO> getCasesByTaxCenter(String taxCenterId);
    List<CaseDTO> getCasesByAuditor(String auditorId);
    List<CaseDTO> getAllCases(int page, int size);
    
    // Case Assignment
    CaseDTO assignToTeamLeader(String caseId, String teamLeaderId, String userId);
    CaseDTO assignToAuditor(String caseId, String auditorId, String userId);
    List<CaseDTO> bulkAssignToTeamLeaders(List<String> caseIds, String teamLeaderId, String userId);
    
    // Case Management
    CaseDTO updateCaseStatus(String caseId, CaseStatus newStatus, String notes, String userId);
    CaseDTO updateCasePriority(String caseId, CasePriority priority, String userId);
    
    // Generation
    void generateCasesFromPlan(String planId);
}
```

---

## REPOSITORY LAYER

### Plan Repository

```java
@Repository
public interface PlanRepository extends JpaRepository<Plan, String> {
    
    List<Plan> findByStatus(PlanStatus status);
    List<Plan> findByCreatedBy(String userId);
    List<Plan> findByYear(Integer year);
    List<Plan> findByStatusOrderByCreatedAtDesc(PlanStatus status);
    Optional<Plan> findByIdAndDeletedAtIsNull(String id);
    
    @Query("SELECT p FROM Plan p WHERE p.status = :status AND p.deletedAt IS NULL " +
           "ORDER BY p.createdAt DESC")
    Page<Plan> findActiveByStatus(@Param("status") PlanStatus status, Pageable pageable);
}
```

---

## AUTHENTICATION & SECURITY

### JWT Token Provider

```java
@Component
public class JwtTokenProvider {
    
    @Value("${app.jwt.secret}")
    private String jwtSecret;
    
    @Value("${app.jwt.expiration}")
    private long jwtExpiration;
    
    public String generateToken(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);
        
        return Jwts.builder()
            .subject(userDetails.getUsername())
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(SignatureAlgorithm.HS512, jwtSecret)
            .compact();
    }
    
    public String getUserEmailFromToken(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(jwtSecret)
            .build()
            .parseClaimsJws(token)
            .getBody()
            .getSubject();
    }
    
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(jwtSecret)
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
```

### Security Configuration

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .cors().and()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/api/v1/regions/**").permitAll()
                .requestMatchers("/api/v1/tax-centers/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) 
        throws Exception {
        return config.getAuthenticationManager();
    }
    
    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter();
    }
}
```

---

## ERROR HANDLING

### Custom Exceptions

```java
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}

public class ValidationException extends RuntimeException {
    public ValidationException(String message) {
        super(message);
    }
}

public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}

public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}
```

### Exception Handler

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
        ResourceNotFoundException ex, HttpServletRequest request) {
        
        ErrorResponse error = ErrorResponse.builder()
            .status(HttpStatus.NOT_FOUND.value())
            .message(ex.getMessage())
            .timestamp(LocalDateTime.now(ZoneId.of("UTC")))
            .path(request.getRequestURI())
            .build();
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
    
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
        ValidationException ex, HttpServletRequest request) {
        
        ErrorResponse error = ErrorResponse.builder()
            .status(HttpStatus.BAD_REQUEST.value())
            .message(ex.getMessage())
            .timestamp(LocalDateTime.now(ZoneId.of("UTC")))
            .path(request.getRequestURI())
            .build();
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}
```

---

## FRONTEND INTEGRATION

### API Base URL Configuration

**Frontend (.env):**
```
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_JWT_STORAGE_KEY=auth_token
```

### Fetch Interceptor Pattern

```javascript
// Frontend - API utility
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### API Usage in React

```javascript
// Create plan
const createPlan = async (planData) => {
  const response = await api.post('/v1/plans', planData);
  return response.data;
};

// Submit to director
const submitPlan = async (planId) => {
  const response = await api.post(`/v1/plans/${planId}/submit-director`, {});
  return response.data;
};

// Get filtered cases
const getCases = async (filters) => {
  const response = await api.get('/v1/cases', { params: filters });
  return response.data;
};
```

---

## CURRENT SPRINT IMPLEMENTATION

### Sprint 1: Foundation & Authentication

**Tasks:**

1. **Setup Spring Boot Project**
   - Initialize Maven project
   - Add dependencies
   - Configure properties files
   - Setup database connection

2. **Database Schema**
   - Run Flyway migrations
   - Create all tables
   - Add indexes

3. **Entity Models**
   - User, Plan, Case, Region, TaxCenter
   - Timeline for audit trail
   - Base entity for common fields

4. **Authentication**
   - JWT token provider
   - Login endpoint
   - Security configuration
   - CORS setup

5. **Basic CRUD**
   - User repository & service
   - Plan repository & service
   - Case repository & service
   - CRUD endpoints

**Dependencies:**
- Database must be ready
- Entities must be defined
- Security config required

**Not in Sprint 1:**
- Complex workflow actions
- Regional feedback logic
- Amendment management
- Case generation logic

---

## TESTING STRATEGY

### Unit Tests

```java
@ExtendWith(MockitoExtension.class)
class PlanServiceTest {
    
    @Mock
    private PlanRepository planRepository;
    
    @InjectMocks
    private PlanServiceImpl planService;
    
    @Test
    void testCreatePlan() {
        // Arrange
        CreatePlanRequest request = new CreatePlanRequest();
        request.setName("FY2024 Audit Plan");
        
        // Act
        PlanDTO result = planService.createPlan(request, "user-1");
        
        // Assert
        assertNotNull(result);
        assertEquals("FY2024 Audit Plan", result.getName());
    }
}
```

### Integration Tests

```java
@SpringBootTest
@AutoConfigureMockMvc
class PlanIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void testCreatePlanEndpoint() throws Exception {
        String payload = """
        {
            "name": "FY2024 Plan",
            "year": 2024
        }
        """;
        
        mockMvc.perform(post("/api/v1/plans")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").exists());
    }
}
```

---

## DEPLOYMENT

### Docker Setup

**Dockerfile:**
```dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/audit-planning-system-1.0.0.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: audit_planning
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: .
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/audit_planning
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: postgres
    ports:
      - "8080:8080"
    depends_on:
      - db

volumes:
  postgres_data:
```

---

## NEXT STEPS

1. **Initialize Spring Boot project** with Maven
2. **Setup database** and run migrations
3. **Implement entity models**
4. **Create repositories** and basic services
5. **Setup JWT authentication**
6. **Implement CRUD endpoints**
7. **Test integration** with frontend
8. **Deploy** with Docker

---

**Document Version:** 1.0  
**Last Updated:** August 14, 2026  
**Next Phase:** Workflow Actions Implementation


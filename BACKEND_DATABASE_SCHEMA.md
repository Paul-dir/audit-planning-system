# Backend Database Schema & Implementation Guide
**Version:** 1.0  
**Purpose:** Detailed database design and backend implementation patterns

---

## 1. DATABASE SCHEMA (PostgreSQL)

### Users Table
```sql
CREATE TABLE users (
  id VARCHAR(20) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- audit_team, audit_director, regional_director, etc.
  status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, SUSPENDED
  seniority VARCHAR(20) DEFAULT 'Mid', -- Senior, Mid, Junior
  years_experience INTEGER,
  certifications JSON, -- ["CPA", "CIA"]
  
  -- Organization Context (denormalized for performance)
  org_context JSONB NOT NULL DEFAULT '{}',
  -- {
  --   "assignedRegion": "Addis Ababa",
  --   "assignedRegionCode": "AA",
  --   "assignedTaxCenter": "Addis Ababa TC1",
  --   "assignedTaxCenterCode": "AA-TC1",
  --   "teamId": "TEAM-AA-001",
  --   "teamName": "Desk Audit Team 1",
  --   "auditType": "desk_audit",
  --   "level": "tax_center",
  --   "managerOf": "TEAM-AA-001" (optional for team leads)
  -- }
  
  -- Workload Tracking
  workload JSONB DEFAULT '{"currentCases": 0, "maxCapacity": 12, "activeAudits": 0, "completedAudits": 0}',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,
  
  CONSTRAINT role_check CHECK (role IN ('audit_team', 'audit_director', 'regional_director', 
    'tax_center_manager', 'team_leader', 'auditor', 'senior_management', 
    'directorate_requester', 'external_stakeholder'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_region ON users USING GIN(org_context);
CREATE INDEX idx_users_tax_center ON users USING GIN(org_context);
```

### Audit Plans Table
```sql
CREATE TABLE audit_plans (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  fiscal_year INTEGER NOT NULL,
  version INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'DRAFT',
  -- Statuses: DRAFT, PENDING_APPROVAL, APPROVED, FINALIZED, ARCHIVED
  
  -- Regional Allocation: {"Addis Ababa": {"desk_audit": 50, "field_audit": 30, ...}, ...}
  region_allocation JSONB NOT NULL DEFAULT '{}',
  
  -- Allocation Status Tracking
  allocation_status JSONB DEFAULT '{}',
  -- {
  --   "Addis Ababa": {
  --     "status": "SENT|PENDING|RECEIVED",
  --     "sentDate": "2026-04-15T09:00:00Z",
  --     "sentBy": "USR-0003",
  --     "taxCenterReceipts": {
  --       "Addis Ababa TC1": {"status": "RECEIVED", "receivedDate": "...", "receivedBy": "..."}
  --     }
  --   }
  -- }
  
  submitted_to_tax_centers JSONB DEFAULT '{}',
  -- {"Addis Ababa-tc1": {"status": "ACCEPTED", "acceptedDate": "...", "acceptedBy": "..."}}
  
  created_by VARCHAR(20) NOT NULL,
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  submitted_date TIMESTAMP,
  submitted_by VARCHAR(20),
  
  approved_by VARCHAR(20),
  approved_date TIMESTAMP,
  approval_notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id),
  CONSTRAINT status_check CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'FINALIZED', 'ARCHIVED'))
);

CREATE INDEX idx_plans_status ON audit_plans(status);
CREATE INDEX idx_plans_fiscal_year ON audit_plans(fiscal_year);
CREATE INDEX idx_plans_created_by ON audit_plans(created_by);
```

### Audit Cases Table
```sql
CREATE TABLE audit_cases (
  id VARCHAR(20) PRIMARY KEY,
  tin VARCHAR(20) UNIQUE NOT NULL,
  taxpayer_name VARCHAR(255) NOT NULL,
  sector VARCHAR(100),
  
  audit_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'STORED',
  -- STORED, PENDING_PROCESS_OWNER, ASSIGNED_TO_TEAM_LEADER, ASSIGNED_TO_AUDITOR, IN_EXECUTION, COMPLETED, REALLOCATED
  
  region VARCHAR(100) NOT NULL,
  tax_center VARCHAR(100) NOT NULL,
  
  -- Assignment References
  assigned_team_leader_id VARCHAR(20),
  assigned_auditor_id VARCHAR(20),
  
  -- Risk Assessment
  risk_level VARCHAR(20), -- Critical, High, Medium, Low
  risk_score INTEGER DEFAULT 0, -- 0-100
  
  -- Planning
  estimated_hours INTEGER,
  priority VARCHAR(20), -- High, Medium, Low
  
  -- Case Details
  case_details JSONB DEFAULT '{}',
  -- {
  --   "previousAuditDate": "2024-06-15",
  --   "previousFindings": "VAT compliance issues",
  --   "businessType": "Retail & Wholesale",
  --   "revenue": 5000000,
  --   "employees": 45,
  --   "contactPerson": "John Doe",
  --   "contactPhone": "+251911234567"
  -- }
  
  -- Timeline
  timeline JSONB DEFAULT '{}',
  -- {
  --   "assignedToTLDate": "2026-05-01T10:00:00Z",
  --   "assignedToAuditorDate": "2026-05-05T14:30:00Z",
  --   "startDate": null,
  --   "targetCompletionDate": "2026-06-30",
  --   "actualCompletionDate": null
  -- }
  
  -- Execution Details (filled during audit)
  execution_details JSONB DEFAULT '{}',
  -- {
  --   "findings": "No material issues found",
  --   "recommendations": ["Improve documentation", "Update VAT procedures"],
  --   "hoursSpent": 38,
  --   "issues": []
  -- }
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (assigned_team_leader_id) REFERENCES users(id),
  FOREIGN KEY (assigned_auditor_id) REFERENCES users(id),
  CONSTRAINT status_check CHECK (status IN ('STORED', 'PENDING_PROCESS_OWNER', 'ASSIGNED_TO_TEAM_LEADER', 
    'ASSIGNED_TO_AUDITOR', 'IN_EXECUTION', 'COMPLETED', 'REALLOCATED'))
);

CREATE INDEX idx_cases_status ON audit_cases(status);
CREATE INDEX idx_cases_region_tax_center ON audit_cases(region, tax_center);
CREATE INDEX idx_cases_assigned_tl ON audit_cases(assigned_team_leader_id);
CREATE INDEX idx_cases_assigned_auditor ON audit_cases(assigned_auditor_id);
CREATE INDEX idx_cases_risk_level ON audit_cases(risk_level);
CREATE INDEX idx_cases_audit_type ON audit_cases(audit_type);
```

### Assignments Table
```sql
CREATE TABLE assignments (
  id VARCHAR(20) PRIMARY KEY,
  case_id VARCHAR(20) NOT NULL UNIQUE,
  
  current_state VARCHAR(50) NOT NULL,
  current_owner VARCHAR(20) NOT NULL,
  current_owner_role VARCHAR(50) NOT NULL, -- TEAM_LEADER, AUDITOR
  
  -- Full state history
  state_history JSONB NOT NULL DEFAULT '[]',
  -- [
  --   {
  --     "state": "STORED",
  --     "timestamp": "2026-04-25T08:00:00Z",
  --     "owner": "SYSTEM",
  --     "ownerRole": "SYSTEM",
  --     "reason": "Case created from plan"
  --   },
  --   {
  --     "state": "ASSIGNED_TO_TEAM_LEADER",
  --     "timestamp": "2026-05-01T10:00:00Z",
  --     "owner": "USR-0004",
  --     "ownerRole": "TAX_CENTER_MANAGER",
  --     "reason": "Assigned by Tax Center Manager"
  --   }
  -- ]
  
  transitions JSONB DEFAULT '{"lastTransitionDate": null, "totalTransitions": 0}',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (case_id) REFERENCES audit_cases(id) ON DELETE CASCADE,
  FOREIGN KEY (current_owner) REFERENCES users(id),
  CONSTRAINT state_check CHECK (current_state IN ('STORED', 'ASSIGNED_TO_TEAM_LEADER', 
    'ASSIGNED_TO_AUDITOR', 'IN_EXECUTION', 'COMPLETED', 'REALLOCATED'))
);

CREATE INDEX idx_assignments_state ON assignments(current_state);
CREATE INDEX idx_assignments_owner ON assignments(current_owner);
CREATE INDEX idx_assignments_case ON assignments(case_id);
```

### Audit Types Configuration Table
```sql
CREATE TABLE audit_types (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  estimated_duration INTEGER, -- minutes
  required_team_size INTEGER DEFAULT 1,
  
  -- Required skills for this audit type
  skills_required JSON DEFAULT '[]',
  
  -- Risk factors considered
  risk_factors JSON DEFAULT '[]',
  
  -- Default settings
  default_settings JSONB DEFAULT '{}',
  -- {
  --   "maxCasesPerAuditor": 6,
  --   "priority": "Medium",
  --   "requiresTeamLead": true
  -- }
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT id_check CHECK (id IN ('desk_audit', 'field_audit', 'joint_audit', 
    'transfer_pricing', 'comprehensive', 'single_issue', 'forensic'))
);
```

### Teams Table
```sql
CREATE TABLE teams (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  team_leader_id VARCHAR(20) NOT NULL,
  audit_type VARCHAR(50) NOT NULL,
  region VARCHAR(100) NOT NULL,
  tax_center VARCHAR(100) NOT NULL,
  
  status VARCHAR(20) DEFAULT 'ACTIVE',
  max_capacity INTEGER DEFAULT 12,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (team_leader_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (audit_type) REFERENCES audit_types(id)
);

CREATE INDEX idx_teams_region_tax_center ON teams(region, tax_center);
CREATE INDEX idx_teams_team_leader ON teams(team_leader_id);
CREATE INDEX idx_teams_audit_type ON teams(audit_type);
```

### Audit Logs Table (for compliance & auditing)
```sql
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(20) NOT NULL,
  action VARCHAR(100) NOT NULL, -- CREATE, UPDATE, DELETE, APPROVE, ASSIGN, etc.
  resource_type VARCHAR(50) NOT NULL, -- audit_plan, audit_case, assignment, etc.
  resource_id VARCHAR(50) NOT NULL,
  
  old_value JSONB, -- Previous state (for updates)
  new_value JSONB, -- New state
  details JSONB,
  
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
```

---

## 2. IMPLEMENTATION PATTERNS

### 2.1 Service Layer Pattern

```java
// UserService.java
@Service
public class UserService {
  
  // Get user by ID with full org context
  public UserDTO getUserById(String userId) {
    User user = userRepository.findById(userId)
      .orElseThrow(() -> new UserNotFoundException(userId));
    return mapToDTO(user);
  }
  
  // Get all team members for a team leader
  public List<UserDTO> getTeamMembers(String teamLeaderId) {
    User teamLeader = getUserById(teamLeaderId);
    if (!teamLeader.getRole().equals("team_leader")) {
      throw new UnauthorizedException("User is not a team leader");
    }
    
    String teamId = teamLeader.getOrgContext().getTeamId();
    return userRepository.findByOrgContextTeamId(teamId)
      .stream()
      .filter(u -> u.getRole().equals("auditor"))
      .map(this::mapToDTO)
      .collect(Collectors.toList());
  }
  
  // Update user workload
  public UserDTO updateWorkload(String userId, WorkloadUpdate update) {
    User user = userRepository.findById(userId)
      .orElseThrow(() -> new UserNotFoundException(userId));
    
    Workload workload = user.getWorkload();
    workload.setCurrentCases(update.getCurrentCases());
    workload.setMaxCapacity(update.getMaxCapacity());
    
    user.setWorkload(workload);
    user.setUpdatedAt(LocalDateTime.now());
    userRepository.save(user);
    
    auditLogService.log(getCurrentUser().getId(), "UPDATE_WORKLOAD", "user", userId,
      null, workload, "Workload updated");
    
    return mapToDTO(user);
  }
}
```

### 2.2 Assignment State Machine

```java
// AssignmentStateMachine.java
@Service
public class AssignmentStateMachine {
  
  // Define valid transitions
  private static final Map<AssignmentState, Set<AssignmentState>> VALID_TRANSITIONS = Map.ofEntries(
    Map.entry(AssignmentState.STORED, Set.of(AssignmentState.ASSIGNED_TO_TEAM_LEADER)),
    Map.entry(AssignmentState.ASSIGNED_TO_TEAM_LEADER, Set.of(AssignmentState.ASSIGNED_TO_AUDITOR)),
    Map.entry(AssignmentState.ASSIGNED_TO_AUDITOR, Set.of(AssignmentState.IN_EXECUTION)),
    Map.entry(AssignmentState.IN_EXECUTION, Set.of(AssignmentState.COMPLETED)),
    Map.entry(AssignmentState.COMPLETED, Set.of(AssignmentState.REALLOCATED))
  );
  
  // Execute state transition with validation
  public Assignment executeTransition(String assignmentId, AssignmentState newState,
                                     TransitionContext context) {
    Assignment assignment = assignmentRepository.findById(assignmentId)
      .orElseThrow(() -> new AssignmentNotFoundException(assignmentId));
    
    // Validate transition
    if (!isValidTransition(assignment.getCurrentState(), newState)) {
      throw new InvalidTransitionException(
        String.format("Cannot transition from %s to %s", 
          assignment.getCurrentState(), newState));
    }
    
    // Validate preconditions based on transition type
    validateTransitionPreconditions(assignment, newState, context);
    
    // Record state change
    StateHistory stateEntry = StateHistory.builder()
      .state(newState)
      .timestamp(LocalDateTime.now())
      .owner(context.getActorId())
      .ownerRole(context.getActorRole())
      .reason(context.getReason())
      .build();
    
    assignment.getStateHistory().add(stateEntry);
    assignment.setCurrentState(newState);
    assignment.setCurrentOwner(context.getNewOwnerId());
    assignment.setCurrentOwnerRole(context.getNewOwnerRole());
    assignment.setUpdatedAt(LocalDateTime.now());
    
    assignmentRepository.save(assignment);
    auditLogService.log(context.getActorId(), "STATE_TRANSITION", "assignment", 
      assignmentId, null, assignment, context.getReason());
    
    return assignment;
  }
  
  private boolean isValidTransition(AssignmentState from, AssignmentState to) {
    Set<AssignmentState> validNext = VALID_TRANSITIONS.get(from);
    return validNext != null && validNext.contains(to);
  }
  
  private void validateTransitionPreconditions(Assignment assignment, 
                                               AssignmentState newState, 
                                               TransitionContext context) {
    switch(newState) {
      case ASSIGNED_TO_TEAM_LEADER:
        User teamLeader = userService.getUserById(context.getNewOwnerId());
        if (!teamLeader.getRole().equals("team_leader")) {
          throw new ValidationException("Owner must be a team leader");
        }
        break;
        
      case ASSIGNED_TO_AUDITOR:
        User auditor = userService.getUserById(context.getNewOwnerId());
        if (!auditor.getRole().equals("auditor")) {
          throw new ValidationException("Owner must be an auditor");
        }
        
        // Check auditor capacity
        if (auditor.getWorkload().getCurrentCases() >= auditor.getWorkload().getMaxCapacity()) {
          throw new ValidationException("Auditor is at capacity");
        }
        
        // Check team membership
        String teamLeaderId = context.getActorId();
        if (!auditor.getOrgContext().getTeamId().equals(
            userService.getUserById(teamLeaderId).getOrgContext().getTeamId())) {
          throw new ValidationException("Auditor not in team leader's team");
        }
        break;
        
      case IN_EXECUTION:
        // Auditor must have accepted the assignment (can add audit_acceptance table if needed)
        break;
        
      case COMPLETED:
        if (context.getFindings() == null || context.getFindings().isEmpty()) {
          throw new ValidationException("Findings are required for completion");
        }
        break;
    }
  }
}
```

### 2.3 Case Assignment Service

```java
// CaseAssignmentService.java
@Service
@Transactional
public class CaseAssignmentService {
  
  // Assign case to team leader
  public CaseDTO assignToTeamLeader(String caseId, String teamLeaderId) {
    AuditCase auditCase = caseRepository.findById(caseId)
      .orElseThrow(() -> new CaseNotFoundException(caseId));
    
    User teamLeader = userService.getUserById(teamLeaderId);
    if (!teamLeader.getRole().equals("team_leader")) {
      throw new ValidationException("User must be a team leader");
    }
    
    auditCase.setStatus(CaseStatus.ASSIGNED_TO_TEAM_LEADER);
    auditCase.setAssignedTeamLeaderId(teamLeaderId);
    auditCase.setUpdatedAt(LocalDateTime.now());
    
    caseRepository.save(auditCase);
    
    // Update assignment state machine
    Assignment assignment = assignmentService.getOrCreateAssignment(caseId);
    stateMachine.executeTransition(assignment.getId(), 
      AssignmentState.ASSIGNED_TO_TEAM_LEADER,
      new TransitionContext(getCurrentUser().getId(), "tax_center_manager", 
        teamLeaderId, "team_leader", "Assigned by Tax Center Manager"));
    
    return mapToDTO(auditCase);
  }
  
  // Intelligent bulk assignment using workload balancing
  public List<CaseDTO> bulkAssignToAuditors(String teamLeaderId, List<String> caseIds) {
    User teamLeader = userService.getUserById(teamLeaderId);
    if (!teamLeader.getRole().equals("team_leader")) {
      throw new ValidationException("User must be a team leader");
    }
    
    String teamId = teamLeader.getOrgContext().getTeamId();
    
    // Get all auditors in this team, sorted by current workload (ascending)
    List<User> auditors = userService.getTeamMembers(teamLeaderId)
      .stream()
      .sorted(Comparator.comparingInt(u -> u.getWorkload().getCurrentCases()))
      .collect(Collectors.toList());
    
    if (auditors.isEmpty()) {
      throw new ValidationException("No auditors available in team");
    }
    
    List<CaseDTO> assignedCases = new ArrayList<>();
    int auditorIndex = 0;
    
    for (String caseId : caseIds) {
      // Round-robin assignment to balance workload
      User selectedAuditor = auditors.get(auditorIndex % auditors.size());
      
      AuditCase auditCase = assignCaseToAuditor(caseId, selectedAuditor.getId(), teamLeaderId);
      assignedCases.add(mapToDTO(auditCase));
      
      // Increment selected auditor workload
      selectedAuditor.getWorkload().setCurrentCases(
        selectedAuditor.getWorkload().getCurrentCases() + 1);
      
      auditorIndex++;
    }
    
    return assignedCases;
  }
  
  private AuditCase assignCaseToAuditor(String caseId, String auditorId, String teamLeaderId) {
    AuditCase auditCase = caseRepository.findById(caseId)
      .orElseThrow(() -> new CaseNotFoundException(caseId));
    
    User auditor = userService.getUserById(auditorId);
    if (!auditor.getRole().equals("auditor")) {
      throw new ValidationException("User must be an auditor");
    }
    
    // Check capacity
    if (auditor.getWorkload().getCurrentCases() >= auditor.getWorkload().getMaxCapacity()) {
      throw new ValidationException("Auditor at capacity");
    }
    
    auditCase.setStatus(CaseStatus.ASSIGNED_TO_AUDITOR);
    auditCase.setAssignedAuditorId(auditorId);
    auditCase.setUpdatedAt(LocalDateTime.now());
    
    caseRepository.save(auditCase);
    
    // Update assignment
    Assignment assignment = assignmentService.getOrCreateAssignment(caseId);
    stateMachine.executeTransition(assignment.getId(), 
      AssignmentState.ASSIGNED_TO_AUDITOR,
      new TransitionContext(teamLeaderId, "team_leader", auditorId, "auditor",
        String.format("Auto-assigned by Team Leader %s", teamLeaderId)));
    
    // Update auditor workload
    userService.updateWorkload(auditorId, new WorkloadUpdate(
      auditor.getWorkload().getCurrentCases() + 1,
      auditor.getWorkload().getMaxCapacity()));
    
    return auditCase;
  }
}
```

### 2.4 Request Validation & Error Handling

```java
// GlobalExceptionHandler.java
@RestControllerAdvice
public class GlobalExceptionHandler {
  
  @ExceptionHandler(ValidationException.class)
  public ResponseEntity<?> handleValidationException(ValidationException ex, HttpServletRequest request) {
    ErrorResponse error = ErrorResponse.builder()
      .success(false)
      .error(ErrorDetails.builder()
        .code("VALIDATION_ERROR")
        .message(ex.getMessage())
        .timestamp(LocalDateTime.now())
        .build())
      .build();
    
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
  }
  
  @ExceptionHandler(UnauthorizedException.class)
  public ResponseEntity<?> handleUnauthorizedException(UnauthorizedException ex) {
    ErrorResponse error = ErrorResponse.builder()
      .success(false)
      .error(ErrorDetails.builder()
        .code("UNAUTHORIZED")
        .message(ex.getMessage())
        .timestamp(LocalDateTime.now())
        .build())
      .build();
    
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
  }
  
  @ExceptionHandler(InvalidTransitionException.class)
  public ResponseEntity<?> handleInvalidTransitionException(InvalidTransitionException ex) {
    ErrorResponse error = ErrorResponse.builder()
      .success(false)
      .error(ErrorDetails.builder()
        .code("INVALID_TRANSITION")
        .message(ex.getMessage())
        .timestamp(LocalDateTime.now())
        .build())
      .build();
    
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
  }
}
```

---

## 3. API IMPLEMENTATION EXAMPLES

### Spring Boot Controller Pattern
```java
@RestController
@RequestMapping("/api/cases")
@RequiredArgsConstructor
public class CaseController {
  
  private final CaseService caseService;
  private final CaseAssignmentService assignmentService;
  
  @GetMapping
  public ResponseEntity<?> getCases(
    @RequestParam(required = false) String status,
    @RequestParam(required = false) String region,
    @RequestParam(required = false) String taxCenter) {
    
    List<CaseDTO> cases = caseService.getCasesByCriteria(status, region, taxCenter);
    
    return ResponseEntity.ok(ApiResponse.builder()
      .success(true)
      .data(cases)
      .build());
  }
  
  @PostMapping("/{caseId}/assign-auditor")
  public ResponseEntity<?> assignToAuditor(
    @PathVariable String caseId,
    @RequestBody AssignAuditorRequest request) {
    
    try {
      CaseDTO assignedCase = assignmentService.assignCaseToAuditor(
        caseId, request.getAuditorId(), getCurrentUserId());
      
      return ResponseEntity.ok(ApiResponse.builder()
        .success(true)
        .data(assignedCase)
        .message("Case assigned to auditor successfully")
        .build());
    } catch (Exception e) {
      return ResponseEntity.badRequest().body(ErrorResponse.builder()
        .success(false)
        .error(ErrorDetails.builder()
          .code("ASSIGNMENT_ERROR")
          .message(e.getMessage())
          .build())
        .build());
    }
  }
}
```

---

## 4. PERFORMANCE OPTIMIZATION

### Database Query Optimization
- Use proper indexes on frequently queried columns (status, region, tax_center)
- Use JSONB indexes for org_context queries
- Implement query result caching with Redis
- Use pagination for list endpoints (default 20, max 100 items)

### Connection Pooling
```java
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
```

### Caching Strategy
```java
@Service
@CacheConfig(cacheNames = "users")
public class UserService {
  
  @Cacheable(key = "#userId")
  public UserDTO getUserById(String userId) {
    // Database query
  }
  
  @CacheEvict(key = "#userId")
  public UserDTO updateUser(String userId, UserUpdate update) {
    // Update and evict cache
  }
}
```


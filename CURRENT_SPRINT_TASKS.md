# Current Sprint Tasks - Sprint 1: Foundation & Authentication

**Sprint Duration:** 2 weeks  
**Target:** Complete backend foundation with authentication  
**Status:** Ready to Start  
**Priority:** CRITICAL - Blocks all other work  

---

## SPRINT OVERVIEW

This sprint establishes the foundational backend infrastructure required for all subsequent development. Focus is on:

1. **Project Setup** - Spring Boot project initialization
2. **Database Infrastructure** - PostgreSQL schema and migrations
3. **Entity Models** - Define all JPA entities
4. **Authentication** - JWT-based authentication system
5. **Basic CRUD** - Foundational CRUD operations
6. **Integration** - Connect with React frontend

**Not In This Sprint:**
- ❌ Complex workflow actions (submit, approve, reject)
- ❌ Regional feedback logic
- ❌ Amendment management
- ❌ Case generation
- ❌ Advanced queries/filters
- ❌ Business logic validations

---

## TASK BREAKDOWN

### TASK 1: Project Setup (2 days)

**Objective:** Initialize Spring Boot project with all necessary dependencies

**Subtasks:**

#### 1.1 Create Maven Project
```bash
mvn archetype:generate \
  -DgroupId=com.mor \
  -DartifactId=audit-planning-system \
  -DarchetypeArtifactId=maven-archetype-quickstart
```

**Deliverable:** Working Maven project structure

#### 1.2 Add Dependencies
- Add spring-boot-starter-web
- Add spring-boot-starter-data-jpa
- Add spring-boot-starter-security
- Add JWT libraries (jjwt)
- Add PostgreSQL driver
- Add Flyway for migrations
- Add Lombok for code generation
- Add ModelMapper for DTOs

**Deliverable:** pom.xml with all dependencies

#### 1.3 Configure Application Properties
- Create application.properties (dev)
- Create application-prod.properties (production)
- Create application-test.properties (testing)
- Configure database connection
- Configure JWT secrets
- Configure CORS
- Configure logging

**Deliverable:** application.properties files ready for environment

#### 1.4 Setup Package Structure
```
com.mor.audit
├── config/
├── controller/
├── dto/
├── entity/
├── repository/
├── service/
├── exception/
├── security/
├── util/
└── listener/
```

**Deliverable:** Empty package structure ready for code

**Definition of Done:**
- ✅ Project builds successfully
- ✅ All dependencies resolve
- ✅ Application starts without errors
- ✅ Properties files configured
- ✅ Package structure in place

---

### TASK 2: Database Setup (1.5 days)

**Objective:** Initialize PostgreSQL database with schema

**Subtasks:**

#### 2.1 Install PostgreSQL
```bash
# Local development
docker run --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=audit_planning \
  -p 5432:5432 \
  -d postgres:15
```

**Deliverable:** Running PostgreSQL container

#### 2.2 Create Flyway Migration Structure
```
src/main/resources/db/migration/
├── V1__initial_schema.sql
├── V2__seed_data.sql
└── V3__create_indexes.sql
```

**Deliverable:** Migration files created

#### 2.3 Write V1__initial_schema.sql
Create tables:
- `regions`
- `tax_centers`
- `users`
- `plans`
- `cases`
- `timelines`

**Deliverable:** All tables created with relationships

#### 2.4 Write V3__create_indexes.sql
Create indexes on:
- users.email
- users.role
- plans.status
- plans.year
- cases.plan_id
- cases.status
- cases.auditor_id
- timelines.plan_id

**Deliverable:** Indexes created for performance

#### 2.5 Verify Schema
- Connect with DBeaver/pgAdmin
- Verify all tables exist
- Verify relationships
- Verify indexes

**Deliverable:** Database ready for testing

**Definition of Done:**
- ✅ PostgreSQL running
- ✅ All migrations run successfully
- ✅ Schema verified
- ✅ Indexes created
- ✅ No constraint violations

---

### TASK 3: Entity Models (3 days)

**Objective:** Define all JPA entities matching our data model

**Subtasks:**

#### 3.1 Create BaseEntity Abstract Class
```java
@MappedSuperclass
public abstract class BaseEntity {
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist / @PreUpdate methods
}
```

**Deliverable:** BaseEntity class with timestamps

#### 3.2 Create Enum Classes
- `PlanStatus.java` (12 statuses)
- `CaseStatus.java` (5 statuses)
- `UserRole.java` (8 roles)
- `RiskLevel.java` (CRITICAL, HIGH, MEDIUM, LOW)
- `CasePriority.java` (HIGH, MEDIUM, NORMAL, LOW)

**Deliverable:** All enums defined

#### 3.3 Create User Entity
```java
@Entity
@Table(name = "users")
public class User extends BaseEntity {
    - id (UUID)
    - name
    - email (unique)
    - passwordHash
    - role
    - regionId
    - taxCenterId
    - auditType
    - teamLeaderId
    - isJointCommittee
    - isActive
    - deletedAt
}
```

**Deliverable:** User entity with relationships

#### 3.4 Create Plan Entity
```java
@Entity
@Table(name = "plans")
public class Plan extends BaseEntity {
    - id (UUID)
    - name
    - description
    - year
    - status
    - createdBy (FK User)
    - distribution (JSONB)
    - regionalFeedback (JSONB)
    - directorComment
    - amendmentComment
    - seniorComment
    - regionalDeployments (JSONB)
    - revisions (JSONB)
}
```

**Deliverable:** Plan entity with JSON fields

#### 3.5 Create Case Entity
```java
@Entity
@Table(name = "cases")
public class Case extends BaseEntity {
    - id (UUID)
    - planId (FK Plan)
    - region
    - taxCenterId (FK TaxCenter)
    - auditType
    - taxpayerName
    - tin
    - sector
    - annualRevenue
    - employees
    - riskLevel
    - riskScore
    - priority
    - status
    - assignedTeamLeaderId (FK User)
    - assignedAuditorId (FK User)
    - startDate
}
```

**Deliverable:** Case entity with all fields

#### 3.6 Create Region & TaxCenter Entities
```java
@Entity
@Table(name = "regions")
public class Region {
    - id
    - name
    - code
    - taxCenters (OneToMany)
}

@Entity
@Table(name = "tax_centers")
public class TaxCenter {
    - id
    - regionId (FK Region)
    - name
    - shortName
}
```

**Deliverable:** Region and TaxCenter entities

#### 3.7 Create Timeline Entity
```java
@Entity
@Table(name = "timelines")
public class Timeline {
    - id (auto-generated)
    - planId (FK)
    - caseId (FK)
    - status
    - actorId (FK User)
    - comment
    - timestamp
}
```

**Deliverable:** Timeline entity for audit trail

#### 3.8 Verify Relationships
- One-to-many relationships work
- Foreign keys valid
- Lazy loading configured
- Cascade options correct

**Deliverable:** All entities tested with relationships

**Definition of Done:**
- ✅ All entities created
- ✅ All relationships defined
- ✅ Entities map to database schema
- ✅ Enums properly defined
- ✅ No compilation errors
- ✅ Unit tests pass

---

### TASK 4: DTOs & Mappers (2 days)

**Objective:** Create Data Transfer Objects for API communication

**Subtasks:**

#### 4.1 Create Request DTOs
- `CreatePlanRequest.java`
- `UpdatePlanRequest.java`
- `CreateUserRequest.java`
- `LoginRequest.java`
- `CreateCaseRequest.java`

**Deliverable:** All request DTOs

#### 4.2 Create Response DTOs
- `PlanDTO.java`
- `CaseDTO.java`
- `UserDTO.java`
- `LoginResponse.java`
- `ErrorResponse.java`
- `TimelineEntryDTO.java`

**Deliverable:** All response DTOs

#### 4.3 Setup ModelMapper
```java
@Configuration
public class MapperConfig {
    @Bean
    public ModelMapper modelMapper() {
        ModelMapper mapper = new ModelMapper();
        mapper.getConfiguration()
            .setMatchingStrategy(MatchingStrategies.STRICT);
        return mapper;
    }
}
```

**Deliverable:** ModelMapper bean configured

#### 4.4 Create Mapper Utilities
```java
public class PlanMapper {
    public static PlanDTO toDTO(Plan entity) { }
    public static Plan toEntity(PlanDTO dto) { }
    public static Plan toEntity(CreatePlanRequest request) { }
}
```

**Deliverable:** Mapper utilities for each entity

**Definition of Done:**
- ✅ All DTOs created
- ✅ ModelMapper configured
- ✅ Mappings tested
- ✅ No circular dependencies

---

### TASK 5: Repositories (1.5 days)

**Objective:** Create Spring Data JPA repositories

**Subtasks:**

#### 5.1 Create PlanRepository
```java
@Repository
public interface PlanRepository extends JpaRepository<Plan, String> {
    List<Plan> findByStatus(PlanStatus status);
    List<Plan> findByCreatedBy(String userId);
    List<Plan> findByYear(Integer year);
    Optional<Plan> findByIdAndDeletedAtIsNull(String id);
    
    @Query("SELECT p FROM Plan p WHERE p.status = :status " +
           "AND p.deletedAt IS NULL ORDER BY p.createdAt DESC")
    Page<Plan> findActiveByStatus(@Param("status") PlanStatus status, Pageable pageable);
}
```

**Deliverable:** PlanRepository with custom queries

#### 5.2 Create CaseRepository
```java
@Repository
public interface CaseRepository extends JpaRepository<Case, String> {
    List<Case> findByPlanId(String planId);
    List<Case> findByAssignedAuditorId(String auditorId);
    List<Case> findByTaxCenterId(String taxCenterId);
    List<Case> findByStatus(CaseStatus status);
    Optional<Case> findByTin(String tin);
}
```

**Deliverable:** CaseRepository with custom queries

#### 5.3 Create UserRepository
```java
@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    List<User> findByRole(UserRole role);
    List<User> findByTaxCenterId(String taxCenterId);
    List<User> findByTeamLeaderId(String teamLeaderId);
    List<User> findByRoleAndTaxCenterId(UserRole role, String taxCenterId);
}
```

**Deliverable:** UserRepository with custom queries

#### 5.4 Create Other Repositories
- `RegionRepository`
- `TaxCenterRepository`
- `TimelineRepository`

**Deliverable:** All repositories created

#### 5.5 Test Repositories
- Write repository tests
- Test custom queries
- Test pagination
- Test relationships

**Deliverable:** All repository tests passing

**Definition of Done:**
- ✅ All repositories created
- ✅ Custom queries working
- ✅ Repository tests pass
- ✅ Pagination tested

---

### TASK 6: Security & JWT (3 days)

**Objective:** Implement JWT authentication system

**Subtasks:**

#### 6.1 Create JwtTokenProvider
```java
@Component
public class JwtTokenProvider {
    public String generateToken(Authentication authentication) { }
    public String getUserEmailFromToken(String token) { }
    public boolean validateToken(String token) { }
}
```

**Deliverable:** JWT token provider working

#### 6.2 Create JwtAuthenticationFilter
```java
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response,
                                   FilterChain filterChain) { }
}
```

**Deliverable:** JWT filter processing tokens

#### 6.3 Create CustomUserDetailsService
```java
@Service
public class CustomUserDetailsService implements UserDetailsService {
    @Override
    public UserDetails loadUserByUsername(String email) { }
}
```

**Deliverable:** Custom user details service

#### 6.4 Create SecurityConfig
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) { }
    
    @Bean
    public PasswordEncoder passwordEncoder() { }
    
    @Bean
    public AuthenticationManager authenticationManager() { }
}
```

**Deliverable:** Security configuration complete

#### 6.5 Create CorsConfig
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:5173")
            .allowedMethods("GET", "POST", "PUT", "DELETE");
    }
}
```

**Deliverable:** CORS configured for frontend

#### 6.6 Test Authentication
- Test JWT generation
- Test token validation
- Test token expiration
- Test authorization headers

**Deliverable:** Authentication system tested

**Definition of Done:**
- ✅ JWT tokens generated correctly
- ✅ Token validation working
- ✅ CORS configured
- ✅ Security tests pass
- ✅ Integration with frontend tested

---

### TASK 7: Basic Controllers (3 days)

**Objective:** Implement REST endpoints for basic CRUD operations

**Subtasks:**

#### 7.1 Create AuthController
```java
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) { }
    
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() { }
    
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() { }
}
```

**Deliverable:** Authentication endpoints working

#### 7.2 Create UserController
```java
@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    @GetMapping
    public ResponseEntity<Page<UserDTO>> getAllUsers(Pageable pageable) { }
    
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable String id) { }
    
    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody CreateUserRequest request) { }
    
    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable String id,
                                              @RequestBody UpdateUserRequest request) { }
}
```

**Deliverable:** User endpoints working

#### 7.3 Create PlanController (Basic CRUD)
```java
@RestController
@RequestMapping("/api/v1/plans")
public class PlanController {
    @GetMapping
    public ResponseEntity<Page<PlanDTO>> getAllPlans(Pageable pageable) { }
    
    @GetMapping("/{id}")
    public ResponseEntity<PlanDTO> getPlanById(@PathVariable String id) { }
    
    @PostMapping
    public ResponseEntity<PlanDTO> createPlan(@RequestBody CreatePlanRequest request) { }
    
    @PutMapping("/{id}")
    public ResponseEntity<PlanDTO> updatePlan(@PathVariable String id,
                                              @RequestBody UpdatePlanRequest request) { }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlan(@PathVariable String id) { }
}
```

**Deliverable:** Plan CRUD endpoints

#### 7.4 Create CaseController (Basic CRUD)
```java
@RestController
@RequestMapping("/api/v1/cases")
public class CaseController {
    @GetMapping
    public ResponseEntity<Page<CaseDTO>> getAllCases(Pageable pageable) { }
    
    @GetMapping("/{id}")
    public ResponseEntity<CaseDTO> getCaseById(@PathVariable String id) { }
    
    @PostMapping
    public ResponseEntity<CaseDTO> createCase(@RequestBody CreateCaseRequest request) { }
    
    @PutMapping("/{id}")
    public ResponseEntity<CaseDTO> updateCase(@PathVariable String id,
                                              @RequestBody UpdateCaseRequest request) { }
}
```

**Deliverable:** Case CRUD endpoints

#### 7.5 Create RegionController
```java
@RestController
@RequestMapping("/api/v1/regions")
public class RegionController {
    @GetMapping
    public ResponseEntity<List<RegionDTO>> getAllRegions() { }
    
    @GetMapping("/{id}")
    public ResponseEntity<RegionDTO> getRegionById(@PathVariable String id) { }
    
    @GetMapping("/{id}/tax-centers")
    public ResponseEntity<List<TaxCenterDTO>> getTaxCentersForRegion(@PathVariable String id) { }
}
```

**Deliverable:** Region endpoints

#### 7.6 Test All Endpoints
- Use Postman/Insomnia
- Test authentication
- Test CRUD operations
- Test error responses
- Test pagination

**Deliverable:** All endpoints tested manually

**Definition of Done:**
- ✅ All CRUD endpoints working
- ✅ Authentication required
- ✅ Pagination working
- ✅ Error responses proper
- ✅ Manual testing passed

---

### TASK 8: Service Layer (2 days)

**Objective:** Implement business logic services

**Subtasks:**

#### 8.1 Create PlanService Interface
```java
public interface PlanService {
    PlanDTO createPlan(CreatePlanRequest request, String userId);
    PlanDTO getPlanById(String planId);
    List<PlanDTO> getAllPlans(int page, int size);
    PlanDTO updatePlan(String planId, UpdatePlanRequest request);
    void deletePlan(String planId);
}
```

**Deliverable:** PlanService interface

#### 8.2 Implement PlanServiceImpl
```java
@Service
@Transactional
public class PlanServiceImpl implements PlanService {
    @Override
    public PlanDTO createPlan(CreatePlanRequest request, String userId) {
        // Validate input
        // Create entity
        // Save to repository
        // Add timeline entry
        // Return DTO
    }
}
```

**Deliverable:** PlanService implementation

#### 8.3 Create CaseService
Similar pattern for Case operations

**Deliverable:** CaseService implementation

#### 8.4 Create UserService
Similar pattern for User operations

**Deliverable:** UserService implementation

#### 8.5 Test Services
- Unit tests for all services
- Mock repositories
- Test business logic
- Test error cases

**Deliverable:** Service tests passing

**Definition of Done:**
- ✅ All services implemented
- ✅ Business logic correct
- ✅ Service tests pass
- ✅ Error handling working

---

### TASK 9: Exception Handling (1 day)

**Objective:** Implement centralized error handling

**Subtasks:**

#### 9.1 Create Custom Exceptions
- `ResourceNotFoundException`
- `ValidationException`
- `UnauthorizedException`
- `ForbiddenException`
- `BusinessException`

**Deliverable:** Exception classes

#### 9.2 Create ExceptionHandler
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(...) { }
    
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(...) { }
    
    // ... other handlers
}
```

**Deliverable:** Global exception handler

#### 9.3 Test Exception Handling
- Test 404 responses
- Test 400 validation errors
- Test 401 unauthorized
- Test 403 forbidden

**Deliverable:** Exception handling tested

**Definition of Done:**
- ✅ All exceptions handled
- ✅ Consistent error format
- ✅ Proper HTTP status codes
- ✅ Tests pass

---

### TASK 10: Integration Testing (2 days)

**Objective:** Verify frontend-backend integration

**Subtasks:**

#### 10.1 Integration Test Suite
- Start backend server
- Test login flow
- Test create plan
- Test get plan
- Test update plan
- Test list operations

**Deliverable:** Integration tests passing

#### 10.2 Frontend-Backend Testing
- Update frontend to use backend APIs
- Test authentication flow
- Test plan creation
- Test data retrieval
- Test error handling

**Deliverable:** Frontend-backend working together

#### 10.3 Performance Testing
- Load test endpoints
- Check response times
- Monitor database queries
- Check for N+1 problems

**Deliverable:** Performance baseline

**Definition of Done:**
- ✅ Integration tests pass
- ✅ Frontend-backend working
- ✅ Performance acceptable
- ✅ No critical bugs

---

## DEPENDENCIES & BLOCKERS

### Dependencies Between Tasks

```
Task 1 (Setup)
    ↓
Task 2 (Database)
    ↓
Task 3 (Entities)
    ├→ Task 4 (DTOs)
    ├→ Task 5 (Repositories)
    └→ Task 6 (Security)
        ↓
Task 7 (Controllers)
    ↓
Task 8 (Services)
    ↓
Task 9 (Exception Handling)
    ↓
Task 10 (Integration Testing)
```

### Critical Path

**Minimum Required for Frontend Connection:**
1. Task 1: Project Setup
2. Task 2: Database Setup
3. Task 3: Entity Models
4. Task 6: Security & JWT
5. Task 7: Controllers (Auth, Plan, Case)
6. Task 10: Integration Testing

**Estimated Timeline:** 10-12 days

---

## COMPLETION CRITERIA

### Definition of Done (Overall Sprint)

- ✅ Project builds successfully
- ✅ All tests pass (unit + integration)
- ✅ Database migrations run without errors
- ✅ JWT authentication working
- ✅ All CRUD endpoints functional
- ✅ Frontend can login and create plans
- ✅ Frontend can fetch plans and cases
- ✅ Error handling working properly
- ✅ CORS configured correctly
- ✅ Code reviewed and merged

### Testing Checklist

- ✅ Unit tests: >80% coverage
- ✅ Integration tests: All endpoints tested
- ✅ Manual testing: Smoke tests pass
- ✅ Frontend integration: Basic workflows work
- ✅ Error scenarios: All error paths tested

---

## RISKS & MITIGATION

### Risk 1: Database Connection Issues
**Likelihood:** Medium  
**Impact:** Blocks entire sprint  
**Mitigation:** Use Docker for PostgreSQL, test connection early

### Risk 2: JWT Token Expiration
**Likelihood:** Low  
**Impact:** Login flow breaks  
**Mitigation:** Implement refresh token logic, test thoroughly

### Risk 3: Relationship Mapping Issues
**Likelihood:** Medium  
**Impact:** Data retrieval problems  
**Mitigation:** Early relationship testing, use lazy loading

### Risk 4: CORS Configuration
**Likelihood:** Medium  
**Impact:** Frontend cannot call backend  
**Mitigation:** Test with frontend early, enable all headers initially

### Risk 5: Performance Issues
**Likelihood:** Low  
**Impact:** Slow queries  
**Mitigation:** Create indexes, monitor query performance

---

## DELIVERABLES SUMMARY

### Code Artifacts
- ✅ Spring Boot project structure
- ✅ 8 Entity classes
- ✅ 6 DTO classes
- ✅ 6 Repository interfaces
- ✅ 4 Service implementations
- ✅ 6 Controller classes
- ✅ Security configuration
- ✅ Exception handlers

### Database Artifacts
- ✅ PostgreSQL schema (6 tables)
- ✅ Flyway migrations
- ✅ Indexes for performance
- ✅ Data relationships verified

### Documentation
- ✅ API documentation
- ✅ Code comments
- ✅ Setup instructions
- ✅ Testing guide

### Tests
- ✅ Unit tests for all services
- ✅ Repository tests
- ✅ Integration tests
- ✅ Controller tests

---

## TEAM ALLOCATION

**Backend Developer:** 1 person
**Frontend Developer:** 0.5 person (integration testing)
**DevOps/DBA:** 0.5 person (database setup, Docker)
**QA:** 0.5 person (testing)

---

## SUCCESS METRICS

1. **Code Quality:** 0 critical bugs, <5 warnings
2. **Test Coverage:** >80% unit test coverage
3. **Performance:** API response time <500ms
4. **Integration:** Frontend-backend communication working
5. **Documentation:** All code documented

---

**Sprint Start Date:** [TO BE DETERMINED]  
**Sprint End Date:** [TO BE DETERMINED]  
**Sprint Review Date:** [TO BE DETERMINED]


# Backend Quick Start Guide
**Purpose:** Fast reference for backend setup and development

---

## 1. QUICK SETUP (5 minutes)

### Prerequisites
```bash
# Install required tools
- Java 17+ (https://adoptopenjdk.net/)
- Maven 3.8+ (https://maven.apache.org/)
- PostgreSQL 14+ (https://www.postgresql.org/)
- Redis 7+ (https://redis.io/)
- Docker & Docker Compose (optional but recommended)
```

### Start Backend with Docker Compose
```bash
# Clone backend repository
git clone https://github.com/yourorg/cluster-ap-backend.git
cd cluster-ap-backend

# Start all services (PostgreSQL, Redis, Backend)
docker-compose up -d

# Wait for services to be healthy (30-40 seconds)
docker-compose ps

# Backend will be available at: http://localhost:8080/api
# API Documentation: http://localhost:8080/api/swagger-ui.html
```

### Start Backend Without Docker
```bash
# Install PostgreSQL
# Install Redis
# Create database
createdb cluster_ap

# Build and run
mvn clean package
java -jar target/cluster-ap-backend-1.0.0.jar
```

---

## 2. KEY API ENDPOINTS QUICK REFERENCE

### Authentication
```bash
# Login
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "user@mor.gov.et",
  "password": "password123"
}

# Response
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": { ... },
  "expiresIn": 86400
}
```

### Cases
```bash
# Get all cases
GET http://localhost:8080/api/cases
Authorization: Bearer {accessToken}

# Get cases by status
GET http://localhost:8080/api/cases?status=ASSIGNED_TO_TEAM_LEADER
Authorization: Bearer {accessToken}

# Assign case to auditor
POST http://localhost:8080/api/cases/CASE-2027-0001/assign-auditor
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "auditorId": "USR-0005",
  "teamLeaderId": "USR-0001"
}
```

### Users
```bash
# Get all users
GET http://localhost:8080/api/users
Authorization: Bearer {accessToken}

# Get organization structure
GET http://localhost:8080/api/org-structure?region=Addis%20Ababa
Authorization: Bearer {accessToken}
```

---

## 3. TEST USERS

### Development/Demo Users
| Email | Role | Region | Tax Center | Password |
|-------|------|--------|-----------|----------|
| audit_team@mor.gov.et | audit_team | N/A | N/A | demo123 |
| director@mor.gov.et | audit_director | N/A | N/A | demo123 |
| regional@mor.gov.et | regional_director | Addis Ababa | N/A | demo123 |
| tax_center_mgr@mor.gov.et | tax_center_manager | Addis Ababa | Addis Ababa TC1 | demo123 |
| team_lead@mor.gov.et | team_leader | Addis Ababa | Addis Ababa TC1 | demo123 |
| auditor@mor.gov.et | auditor | Addis Ababa | Addis Ababa TC1 | demo123 |

---

## 4. COMMON DEVELOPMENT TASKS

### Add New API Endpoint
```java
// 1. Create controller
@RestController
@RequestMapping("/api/endpoint")
public class EndpointController {
  
  @PostMapping
  public ResponseEntity<?> createEndpoint(@RequestBody Request request) {
    // Implementation
    return ResponseEntity.ok(...);
  }
}

// 2. Create service
@Service
public class EndpointService {
  public EndpointDTO create(Request request) {
    // Business logic
  }
}

// 3. Create DTO
@Data
@Builder
public class EndpointDTO {
  // Fields
}
```

### Add Database Audit
```java
// 1. Add annotation
@Component
@Aspect
public class AuditLoggingAspect {
  
  @Before("@annotation(AuditLog)")
  public void logAudit(JoinPoint joinPoint, AuditLog auditLog) {
    auditLogService.log(getCurrentUser().getId(), auditLog.action(), 
      joinPoint.getArgs()[0]);
  }
}

// 2. Use on method
@AuditLog(action = "CREATE_CASE")
public CaseDTO createCase(CaseRequest request) {
  // Implementation
}
```

### Run Tests
```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=UserServiceTest

# Run tests with coverage
mvn test jacoco:report
```

---

## 5. ENVIRONMENT VARIABLES

```bash
# Database
DB_PASSWORD=your_secure_password
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/cluster_ap

# JWT
JWT_SECRET=your-super-secret-key-min-32-characters
JWT_EXPIRATION=86400000

# Redis
SPRING_REDIS_HOST=localhost
SPRING_REDIS_PORT=6379

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000

# Deployment
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8080
```

---

## 6. DEBUGGING

### Enable Debug Logging
```yaml
# application-debug.yml
logging:
  level:
    root: DEBUG
    org.springframework.security: DEBUG
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE
```

```bash
java -jar app.jar --spring.profiles.active=debug
```

### Database Connection Issues
```bash
# Check PostgreSQL connection
psql -h localhost -U postgres -d cluster_ap

# Check Redis connection
redis-cli ping
# Should return: PONG

# Check Spring Boot logs
docker-compose logs -f backend
```

### API Health Check
```bash
# Check application health
curl http://localhost:8080/api/actuator/health

# Check metrics
curl http://localhost:8080/api/actuator/metrics

# Check all available actuator endpoints
curl http://localhost:8080/api/actuator
```

---

## 7. PERFORMANCE TUNING

### Database Query Optimization
```bash
# Check slow queries
sudo tail -f /var/log/postgresql/postgresql.log | grep "duration:"

# Enable query logging in application.yml
spring:
  jpa:
    properties:
      hibernate.generate_statistics: true
      hibernate.use_sql_comments: true

# View Hibernate statistics
curl http://localhost:8080/api/actuator/metrics/hibernate
```

### Cache Optimization
```bash
# Monitor Redis
redis-cli
> info stats
> dbsize
> keys *

# Clear cache if needed
> FLUSHDB
```

---

## 8. DEPLOYMENT QUICK COMMANDS

### Build Docker Image
```bash
docker build -t cluster-ap:latest .
```

### Run Docker Container
```bash
docker run -d \
  --name cluster-ap \
  -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/cluster_ap \
  -e JWT_SECRET=your-secret \
  cluster-ap:latest
```

### Deploy to Production
```bash
# Build
mvn clean package -DskipTests

# Create Docker image
docker build -t registry.example.com/cluster-ap:1.0.0 .

# Push to registry
docker push registry.example.com/cluster-ap:1.0.0

# Deploy with Kubernetes
kubectl set image deployment/cluster-ap \
  cluster-ap=registry.example.com/cluster-ap:1.0.0 \
  -n production
```

---

## 9. FRONTEND INTEGRATION CHECKLIST

- [ ] Backend API running on http://localhost:8080/api
- [ ] CORS configured to allow frontend origin (http://localhost:3000)
- [ ] JWT tokens working and being set correctly
- [ ] Login endpoint returns user with org_context
- [ ] Case assignment endpoints returning correct data
- [ ] User workload updating correctly
- [ ] State machine transitions enforced on backend
- [ ] Error messages consistent with frontend expectations
- [ ] Audit logging capturing all state changes

---

## 10. USEFUL LINKS & RESOURCES

### Documentation
- Spring Boot: https://spring.io/projects/spring-boot
- Spring Security: https://spring.io/projects/spring-security
- PostgreSQL: https://www.postgresql.org/docs/
- JWT: https://jwt.io/
- Redis: https://redis.io/documentation

### Tools
- Postman: https://www.postman.com/
- pgAdmin: https://www.pgadmin.org/
- Redis Desktop Manager: https://redis.com/redis-enterprise/redis-insight/

### Monitoring
- Spring Actuator: http://localhost:8080/api/actuator
- Prometheus: http://localhost:9090 (if configured)
- Grafana: http://localhost:3000 (if configured)

---

## 11. TROUBLESHOOTING QUICK FIXES

### Issue: Port 8080 already in use
```bash
# Find and kill process
lsof -i :8080
kill -9 <PID>

# Or use different port
java -jar app.jar --server.port=8081
```

### Issue: Database connection refused
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Check with docker-compose
docker-compose ps postgres
```

### Issue: JWT token invalid
```bash
# Check JWT_SECRET is set correctly
# Make sure token expiration isn't too short
# Verify token format: Bearer <token>
```

### Issue: CORS errors
```bash
# Check CORS_ALLOWED_ORIGINS environment variable
# Verify frontend is calling correct API URL
# Check browser console for CORS error details
```


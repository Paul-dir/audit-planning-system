# Backend Deployment & Integration Guide
**Version:** 1.0  
**Purpose:** Production deployment, DevOps, and integration patterns

---

## 1. TECHNOLOGY STACK COMPARISON

### Option A: Spring Boot (Java) - RECOMMENDED
**Pros:**
- Enterprise-grade, production-ready
- Strong ecosystem for security, transactions, audit logging
- Excellent support for PostgreSQL JSONB queries
- Built-in AOP for cross-cutting concerns (logging, auditing)
- Spring Security for role-based access control
- Spring Data JPA for data persistence
- Spring Actuator for monitoring

**Cons:**
- Larger memory footprint
- Steeper learning curve

**Stack:**
- Framework: Spring Boot 3.3+
- ORM: Spring Data JPA + Hibernate
- Security: Spring Security 6.x + JWT
- Database: PostgreSQL 14+
- Build: Maven/Gradle
- Testing: JUnit 5, Mockito, TestContainers

### Option B: Node.js/Express - LIGHTWEIGHT
**Pros:**
- Lightweight, fast startup
- JavaScript across stack
- Good for microservices
- Excellent real-time capabilities

**Cons:**
- Less mature ecosystem for enterprise patterns
- Requires more manual implementation of audit/logging
- Transaction management less straightforward

---

## 2. PROJECT STRUCTURE (Spring Boot Example)

```
cluster-ap-backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── et/
│   │   │       └── gov/
│   │   │           └── mor/
│   │   │               └── audit/
│   │   │                   ├── AuditPlanningApplication.java
│   │   │                   ├── config/
│   │   │                   │   ├── SecurityConfig.java
│   │   │                   │   ├── JwtConfig.java
│   │   │                   │   └── CorsConfig.java
│   │   │                   ├── domain/
│   │   │                   │   ├── model/
│   │   │                   │   │   ├── User.java
│   │   │                   │   │   ├── AuditPlan.java
│   │   │                   │   │   ├── AuditCase.java
│   │   │                   │   │   └── Assignment.java
│   │   │                   │   └── dto/
│   │   │                   │       ├── UserDTO.java
│   │   │                   │       ├── AuditCaseDTO.java
│   │   │                   │       └── ...
│   │   │                   ├── infrastructure/
│   │   │                   │   ├── repository/
│   │   │                   │   │   ├── UserRepository.java
│   │   │                   │   │   ├── CaseRepository.java
│   │   │                   │   │   └── AssignmentRepository.java
│   │   │                   │   ├── persistence/
│   │   │                   │   │   └── JpaUserRepository.java
│   │   │                   │   └── cache/
│   │   │                   │       └── RedisCacheConfig.java
│   │   │                   ├── application/
│   │   │                   │   ├── service/
│   │   │                   │   │   ├── UserService.java
│   │   │                   │   │   ├── CaseService.java
│   │   │                   │   │   ├── AssignmentService.java
│   │   │                   │   │   ├── AssignmentStateMachine.java
│   │   │                   │   │   └── AuditLogService.java
│   │   │                   │   └── usecase/
│   │   │                   │       ├── AssignCaseToTeamLeaderUseCase.java
│   │   │                   │       ├── AssignCaseToAuditorUseCase.java
│   │   │                   │       └── BulkAssignCasesUseCase.java
│   │   │                   ├── presentation/
│   │   │                   │   ├── controller/
│   │   │                   │   │   ├── AuthController.java
│   │   │                   │   │   ├── PlanController.java
│   │   │                   │   │   ├── CaseController.java
│   │   │                   │   │   ├── AssignmentController.java
│   │   │                   │   │   └── UserController.java
│   │   │                   │   ├── dto/
│   │   │                   │   │   ├── ApiResponse.java
│   │   │                   │   │   ├── ErrorResponse.java
│   │   │                   │   │   └── ErrorDetails.java
│   │   │                   │   ├── exception/
│   │   │                   │   │   ├── GlobalExceptionHandler.java
│   │   │                   │   │   └── CustomExceptions.java
│   │   │                   │   └── filter/
│   │   │                   │       ├── JwtAuthenticationFilter.java
│   │   │                   │       ├── AuditLoggingFilter.java
│   │   │                   │       └── CorsFilter.java
│   │   │                   └── security/
│   │   │                       ├── JwtTokenProvider.java
│   │   │                       ├── CustomUserDetailsService.java
│   │   │                       └── AuthenticationProvider.java
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       ├── application-prod.yml
│   │       └── db/
│   │           └── migration/
│   │               ├── V001__initial_schema.sql
│   │               ├── V002__add_audit_logs.sql
│   │               └── V003__add_indexes.sql
│   ├── test/
│   │   ├── java/
│   │   │   └── et/gov/mor/audit/
│   │   │       ├── service/
│   │   │       ├── controller/
│   │   │       └── integration/
│   │   └── resources/
│   │       └── application-test.yml
│   └── docker/
│       ├── Dockerfile
│       └── docker-compose.yml
├── pom.xml
├── README.md
└── .gitignore
```

---

## 3. MAVEN CONFIGURATION (pom.xml)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  
  <groupId>et.gov.mor.audit</groupId>
  <artifactId>cluster-ap-backend</artifactId>
  <version>1.0.0-SNAPSHOT</version>
  <name>Cluster AP Backend</name>
  
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.3.0</version>
  </parent>
  
  <properties>
    <java.version>17</java.version>
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
    
    <!-- PostgreSQL Driver -->
    <dependency>
      <groupId>org.postgresql</groupId>
      <artifactId>postgresql</artifactId>
      <version>42.6.0</version>
      <scope>runtime</scope>
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
    
    <!-- Redis -->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-data-redis</artifactId>
    </dependency>
    
    <!-- Flyway for Migrations -->
    <dependency>
      <groupId>org.flywaydb</groupId>
      <artifactId>flyway-core</artifactId>
    </dependency>
    
    <!-- Lombok for boilerplate -->
    <dependency>
      <groupId>org.projectlombok</groupId>
      <artifactId>lombok</artifactId>
      <optional>true</optional>
    </dependency>
    
    <!-- Validation -->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    
    <!-- Actuator -->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
    
    <!-- Testing -->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-test</artifactId>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>org.testcontainers</groupId>
      <artifactId>testcontainers</artifactId>
      <version>1.19.0</version>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>org.testcontainers</groupId>
      <artifactId>postgresql</artifactId>
      <version>1.19.0</version>
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

---

## 4. APPLICATION CONFIGURATION (application.yml)

```yaml
spring:
  application:
    name: cluster-ap-backend
    version: 1.0.0
  
  # Database
  datasource:
    url: jdbc:postgresql://localhost:5432/cluster_ap
    username: postgres
    password: ${DB_PASSWORD:postgres}
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
  
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate.dialect: org.hibernate.dialect.PostgreSQL10Dialect
      hibernate.format_sql: false
      hibernate.jdbc.batch_size: 25
      hibernate.order_inserts: true
      hibernate.order_updates: true
    show-sql: false
  
  # Redis
  redis:
    host: localhost
    port: 6379
    database: 0
    timeout: 2000ms
    jedis:
      pool:
        max-active: 8
        max-idle: 8
        min-idle: 0
  
  cache:
    type: redis
    redis:
      time-to-live: 600000 # 10 minutes
  
  # Security
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: ${JWT_ISSUER_URI:http://localhost:8080}
          jwk-set-uri: ${JWT_JWK_SET_URI:http://localhost:8080/.well-known/jwks.json}

# JWT Configuration
jwt:
  secret: ${JWT_SECRET:your-super-secret-key-change-in-production}
  expiration: 86400000 # 24 hours in milliseconds
  refreshExpiration: 2592000000 # 30 days

# Server
server:
  port: 8080
  servlet:
    context-path: /api
  error:
    include-message: always
    include-stacktrace: on_param
    include-exception: false

# Logging
logging:
  level:
    root: INFO
    et.gov.mor.audit: DEBUG
    org.springframework.security: DEBUG
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
  file:
    name: logs/cluster-ap.log
    max-size: 10MB
    max-history: 30

# Actuator
management:
  endpoints:
    web:
      exposure:
        include: health,metrics,info,prometheus
  endpoint:
    health:
      show-details: when-authorized
  metrics:
    export:
      prometheus:
        enabled: true

# CORS
cors:
  allowed-origins: ${CORS_ALLOWED_ORIGINS:http://localhost:3000}
  allowed-methods: GET,POST,PUT,DELETE,OPTIONS
  allowed-headers: "*"
  allow-credentials: true
  max-age: 3600
```

---

## 5. DOCKER DEPLOYMENT

### Dockerfile
```dockerfile
# Build stage
FROM maven:3.9.4-eclipse-temurin-17 AS builder
WORKDIR /build
COPY . .
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /build/target/cluster-ap-backend-1.0.0.jar app.jar

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/actuator/health || exit 1

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "-Xmx512m", "app.jar"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: cluster_ap
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7.2-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend Service
  backend:
    build:
      context: .
      dockerfile: docker/Dockerfile
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/cluster_ap
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD:-postgres}
      SPRING_REDIS_HOST: redis
      SPRING_REDIS_PORT: 6379
      JWT_SECRET: ${JWT_SECRET:-your-secret-key-change-in-prod}
      CORS_ALLOWED_ORIGINS: http://localhost:3000
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/api/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Frontend Service (optional)
  frontend:
    build:
      context: ../Complete\ AP\ Cluster\ Frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      VITE_API_URL: http://localhost:8080/api
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
```

---

## 6. FRONTEND-BACKEND INTEGRATION

### API Client Configuration
```javascript
// frontend/src/api/apiClient.js
import axios from 'axios';

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });
        
        localStorage.setItem('accessToken', response.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Service Integration
```javascript
// frontend/src/services/caseService.js
import apiClient from '../api/apiClient';

export const caseService = {
  // Get cases with filtering
  getCases: async (filters) => {
    const response = await apiClient.get('/cases', { params: filters });
    return response.data;
  },
  
  // Assign case to team leader
  assignToTeamLeader: async (caseId, teamLeaderId) => {
    const response = await apiClient.post(`/cases/${caseId}/assign-team-leader`, {
      teamLeaderId,
    });
    return response.data;
  },
  
  // Assign case to auditor
  assignToAuditor: async (caseId, auditorId, teamLeaderId) => {
    const response = await apiClient.post(`/cases/${caseId}/assign-auditor`, {
      auditorId,
      teamLeaderId,
    });
    return response.data;
  },
  
  // Bulk assign cases
  bulkAssign: async (teamLeaderId, caseIds) => {
    const response = await apiClient.post('/cases/bulk-assign', {
      teamLeaderId,
      caseIds,
    });
    return response.data;
  },
};
```

---

## 7. PRODUCTION DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] All tests passing (unit, integration, e2e)
- [ ] Code review completed
- [ ] Security scan completed
- [ ] Database migration tested on staging
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Monitoring and alerting configured
- [ ] Backup strategy verified
- [ ] Disaster recovery tested
- [ ] Performance load tested

### Deployment Steps
1. Build Docker image
2. Push to registry
3. Update Kubernetes manifests (if using K8s)
4. Run database migrations
5. Deploy new version
6. Verify health checks
7. Run smoke tests
8. Monitor error rates and performance

### Post-Deployment
- [ ] Monitor application logs
- [ ] Check error rates < 0.1%
- [ ] Verify response times
- [ ] Check database performance
- [ ] Monitor resource utilization
- [ ] Test critical user workflows
- [ ] Verify backups completed

---

## 8. CI/CD PIPELINE

### GitHub Actions Example
```yaml
name: Build and Deploy

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up JDK 17
      uses: actions/setup-java@v3
      with:
        java-version: '17'
        distribution: 'temurin'
        cache: maven
    
    - name: Build with Maven
      run: mvn clean package
    
    - name: Run tests
      run: mvn test
    
    - name: SonarQube Scan
      uses: sonarsource/sonarqube-scan-action@master
      env:
        SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
        SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
    
    - name: Build Docker image
      run: docker build -t cluster-ap:${{ github.sha }} .
    
    - name: Push to registry
      run: |
        echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
        docker push cluster-ap:${{ github.sha }}
    
    - name: Deploy to staging
      if: github.ref == 'refs/heads/develop'
      run: kubectl set image deployment/cluster-ap cluster-ap=cluster-ap:${{ github.sha }} -n staging
    
    - name: Deploy to production
      if: github.ref == 'refs/heads/main'
      run: kubectl set image deployment/cluster-ap cluster-ap=cluster-ap:${{ github.sha }} -n production
```

---

## 9. MONITORING & LOGGING

### Key Metrics to Monitor
- Response time (p50, p95, p99)
- Error rate (target < 0.1%)
- Database query performance
- Cache hit ratio
- User authentication failures
- Assignment state transitions

### Logging Best Practices
```java
@Aspect
@Component
public class AuditLoggingAspect {
  
  @Around("@annotation(AuditLog)")
  public Object auditLog(ProceedingJoinPoint joinPoint, AuditLog auditLog) throws Throwable {
    String user = getCurrentUser().getId();
    String action = auditLog.action();
    Object[] args = joinPoint.getArgs();
    
    try {
      Object result = joinPoint.proceed();
      auditLogService.log(user, action, "SUCCESS", args, result);
      return result;
    } catch (Exception e) {
      auditLogService.log(user, action, "FAILURE", args, e.getMessage());
      throw e;
    }
  }
}
```

---

## 10. TROUBLESHOOTING GUIDE

### Common Issues

#### Issue: Slow case assignment
**Solution:**
- Check database indexes
- Monitor Redis cache hit ratio
- Check org_context JSONB query performance
- Add database connection pool monitoring

#### Issue: JWT token expiry issues
**Solution:**
- Verify token expiration settings
- Implement refresh token rotation
- Add token refresh logic to API client

#### Issue: Database connection exhaustion
**Solution:**
- Check HikariCP pool settings
- Monitor active connections
- Close database connections properly in code


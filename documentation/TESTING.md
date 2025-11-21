# Testing Guide

## Overview

This guide covers testing strategies for the authentication module including unit tests, integration tests, and end-to-end testing.

---

## Test Structure

```
backend/src/test/java/com/medhelp/backend/
├── service/
│   ├── AuthenticationServiceTest.java
│   ├── TokenServiceTest.java
│   ├── TwoFactorServiceTest.java
│   ├── EmailServiceTest.java
│   ├── RateLimitServiceTest.java
│   └── ...
├── controller/
│   ├── AuthenticationControllerTest.java
│   ├── MfaControllerTest.java
│   └── UserManagementControllerTest.java
├── security/
│   ├── JwtUtilsTest.java
│   └── JwtAuthenticationFilterTest.java
└── integration/
    ├── AuthFlowIntegrationTest.java
    ├── TwoFactorFlowIntegrationTest.java
    └── DeviceTrackingIntegrationTest.java
```

---

## Unit Tests

### Running Unit Tests
```bash
cd backend
mvn test
```

### Example: TokenService Test
```java
@SpringBootTest
@ActiveProfiles("test")
class TokenServiceTest {

    @Autowired
    private TokenService tokenService;

    @MockBean
    private RefreshTokenRepository refreshTokenRepository;

    @Test
    void createRefreshToken_ShouldHashAndStoreToken() {
        // Given
        User user = createTestUser();
        String deviceFingerprint = "test-device";
        String ipAddress = "192.168.1.1";
        String userAgent = "Test Browser";

        // When
        String token = tokenService.createRefreshToken(
            user, deviceFingerprint, ipAddress, userAgent
        );

        // Then
        assertNotNull(token);
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    void validateAndRotate_WithExpiredToken_ShouldReturnEmpty() {
        // Given
        String expiredToken = "expired-token";
        RefreshToken dbToken = RefreshToken.builder()
            .tokenHash(hashToken(expiredToken))
            .expiresAt(LocalDateTime.now().minusDays(1))
            .build();

        when(refreshTokenRepository.findByTokenHash(any()))
            .thenReturn(Optional.of(dbToken));

        // When
        Optional<RefreshToken> result = 
            tokenService.validateAndRotate(expiredToken);

        // Then
        assertTrue(result.isEmpty());
        verify(refreshTokenRepository).delete(dbToken);
    }
}
```

### Example: RateLimitService Test
```java
@SpringBootTest
@ActiveProfiles("test")
class RateLimitServiceTest {

    @Autowired
    private RateLimitService rateLimitService;

    @MockBean
    private LoginAttemptRepository loginAttemptRepository;

    @Test
    void isEmailRateLimited_WithFiveFailures_ShouldReturnTrue() {
        // Given
        String email = "test@example.com";
        LocalDateTime now = LocalDateTime.now();
        
        when(loginAttemptRepository.countByEmailAndSuccessAndTimestampAfter(
            eq(email), eq(false), any()
        )).thenReturn(5L);

        // When
        boolean result = rateLimitService.isEmailRateLimited(email);

        // Then
        assertTrue(result);
    }
}
```

---

## Integration Tests

### Running Integration Tests
```bash
mvn verify -P integration-tests
```

### Configuration

**`application-test.properties`:**
```properties
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driver-class-name=org.h2.Driver
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect

spring.mail.host=localhost
spring.mail.port=3025

application.jwt.private-key-path=classpath:test-keys/private_key.pem
application.jwt.public-key-path=classpath:test-keys/public_key.pem
```

### Example: Auth Flow Integration Test
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@AutoConfigureMockMvc
class AuthFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    @Transactional
    void completeAuthFlow_RegisterLoginRefresh_ShouldWork() throws Exception {
        // 1. Register
        RegisterRequest registerRequest = RegisterRequest.builder()
            .email("test@example.com")
            .username("testuser")
            .password("Test123!@#")
            .roleId(2L)
            .userType(UserType.INTERNAL)
            .build();

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.user.email").value("test@example.com"))
            .andExpect(jsonPath("$.user.emailVerified").value(false));

        // 2. Verify email (manually set for test)
        User user = userRepository.findByEmail("test@example.com").orElseThrow();
        user.verifyEmail();
        userRepository.save(user);

        // 3. Login
        LoginRequest loginRequest = LoginRequest.builder()
            .email("test@example.com")
            .password("Test123!@#")
            .deviceFingerprint("test-device")
            .build();

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.accessToken").exists())
            .andExpect(cookie().exists("refreshToken"))
            .andReturn();

        String accessToken = JsonPath.read(
            loginResult.getResponse().getContentAsString(), 
            "$.accessToken"
        );

        // 4. Access protected endpoint
        mockMvc.perform(get("/api/v1/auth/me")
                .header("Authorization", "Bearer " + accessToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("test@example.com"));

        // 5. Refresh token
        Cookie refreshCookie = loginResult.getResponse().getCookie("refreshToken");
        
        mockMvc.perform(post("/api/v1/auth/refresh")
                .cookie(refreshCookie))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.accessToken").exists())
            .andExpect(cookie().exists("refreshToken"));
    }
}
```

### Example: 2FA Flow Integration Test
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@AutoConfigureMockMvc
class TwoFactorFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TwoFactorService twoFactorService;

    @Test
    @WithMockUser(username = "test@example.com")
    void enable2FA_CompleteFlow_ShouldWork() throws Exception {
        // 1. Setup 2FA
        MvcResult setupResult = mockMvc.perform(get("/api/v1/mfa/setup"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.qrCodeUri").exists())
            .andExpect(jsonPath("$.backupCodes").isArray())
            .andReturn();

        // 2. Generate valid TOTP code
        String qrUri = JsonPath.read(
            setupResult.getResponse().getContentAsString(), 
            "$.qrCodeUri"
        );
        String secret = extractSecretFromQrUri(qrUri);
        String validCode = generateTOTP(secret);

        // 3. Enable 2FA with code
        mockMvc.perform(post("/api/v1/mfa/enable")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"code\":\"" + validCode + "\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.message")
                .value("2FA enabled successfully"));

        // 4. Verify status
        mockMvc.perform(get("/api/v1/mfa/status"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.enabled").value(true));
    }
}
```

---

## E2E Testing

### Manual Testing Checklist

#### Registration Flow
- [ ] Register with valid data
- [ ] Receive welcome email
- [ ] Receive verification email
- [ ] Click verification link
- [ ] Account becomes active

#### Login Flow
- [ ] Login with unverified email → Error
- [ ] Login with wrong password → Error
- [ ] 5 failed attempts → Account locked
- [ ] Wait 30 minutes → Account unlocked
- [ ] Login with correct credentials → Success
- [ ] Refresh token in cookie
- [ ] Access token in response

#### 2FA Flow
- [ ] Setup 2FA → Get QR code
- [ ] Scan QR code with authenticator app
- [ ] Enable 2FA with valid code
- [ ] Login → Requires 2FA code
- [ ] Enter valid code → Success
- [ ] Try backup code → Success (code consumed)

#### Token Refresh Flow
- [ ] Use refresh token → Get new access token
- [ ] Old refresh token revoked
- [ ] Use expired refresh token → Error

#### Password Reset Flow
- [ ] Request reset → Email sent
- [ ] Click reset link → Valid
- [ ] Set new password → Success
- [ ] Try old password → Fails
- [ ] Try new password → Success

#### Device Tracking
- [ ] Login from new device → Email alert
- [ ] View devices list
- [ ] Trust device
- [ ] Remove device

---

## Performance Testing

### Load Testing with Apache JMeter

**Test Scenarios:**
1. **Login Load**: 100 concurrent logins
2. **Token Refresh**: 200 requests/sec for 5 minutes
3. **Rate Limiting**: Verify lockout after excessive failures

**Sample JMeter Test Plan:**
```xml
<!-- See jmeter-test-plan.jmx in testing/ directory -->
```

### Expected Performance
- Login: < 200ms (95th percentile)
- Token Refresh: < 100ms (95th percentile)
- Protected Endpoints: < 50ms (95th percentile)

---

## Security Testing

### OWASP Top 10 Checklist

- [ ] **SQL Injection**: Parameterized queries used
- [ ] **XSS**: HttpOnly cookies, CSP headers
- [ ] **CSRF**: SameSite cookies
- [ ] **Broken Authentication**: JWT RS256, token rotation
- [ ] **Sensitive Data Exposure**: Passwords hashed with BCrypt
- [ ] **Broken Access Control**: Role-based permissions
- [ ] **Security Misconfiguration**: Security headers enabled
- [ ] **Using Components with Known Vulnerabilities**: Dependencies updated
- [ ] **Insufficient Logging**: Audit trail implemented
- [ ] **Insecure Deserialization**: Input validation

### Penetration Testing

Recommended tools:
- **OWASP ZAP**: Automated vulnerability scanning
- **Burp Suite**: Manual testing
- **SQLMap**: SQL injection testing
- **Postman**: API security testing

---

## Test Coverage

### Current Coverage Goals
- Services: 80% line coverage
- Controllers: 70% line coverage
- Security Components: 90% line coverage

### Running Coverage Report
```bash
mvn clean test jacoco:report
```

View report: `target/site/jacoco/index.html`

---

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
      - name: Run tests
        run: mvn test
      - name: Run coverage
        run: mvn jacoco:report
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Mocking External Services

### Email Service Mock
```java
@TestConfiguration
static class TestConfig {
    @Bean
    @Primary
    public JavaMailSender mockMailSender() {
        return new MockMailSender();
    }
}
```

### Time Mocking
```java
@MockBean
private Clock clock;

// In test
when(clock.instant()).thenReturn(fixedInstant);
```

---

## Next Steps

1. Write unit tests for all services
2. Add integration tests for critical flows
3. Set up CI/CD pipeline
4. Perform security audit
5. Load testing before production

---

## Resources

- [JUnit 5 Documentation](https://junit.org/junit5/docs/current/user-guide/)
- [Spring Boot Testing](https://spring.io/guides/gs/testing-web/)
- [MockMvc Reference](https://docs.spring.io/spring-framework/reference/testing/spring-mvc-test-framework.html)

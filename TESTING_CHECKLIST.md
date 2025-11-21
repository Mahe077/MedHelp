# Testing Checklist

## ✅ Prerequisites
- [x] RSA keys generated (`backend/src/main/resources/keys/`)
- [x] Docker services running
- [x] Postman collection created

## 🧪 API Testing with cURL

### 1. Health Check
```bash
curl http://localhost:8080/actuator/health
```

### 2. User Registration
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "SecurePass123!",
    "roleId": 2,
    "userType": "INTERNAL"
  }'
```

### 3. User Login
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "deviceFingerprint": "curl-test-device"
  }'
```

### 4. Get Current User (with access token)
```bash
# Save access token from login response
ACCESS_TOKEN="<token_from_login>"

curl -X GET http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### 5. Refresh Token
```bash
curl -X POST http://localhost:8080/api/v1/auth/refresh \
  -b cookies.txt \
  -c cookies.txt
```

### 6. Logout
```bash
curl -X POST http://localhost:8080/api/v1/auth/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -b cookies.txt
```

## 📋 Manual Test Scenarios

### Scenario 1: Complete Registration Flow
1. Register new user
2. Check email for verification link
3. Click verification link
4. Login with verified account
5. Verify access token received

###  Scenario 2: 2FA Setup
1. Login to account
2. Navigate to `/api/v1/mfa/setup`
3. Scan QR code with authenticator app
4. Enable 2FA with code
5. Save backup codes
6. Logout and login again (should require 2FA)

### Scenario 3: Password Reset
1. Request password reset
2. Check email for reset link
3. Click link and set new password
4. Login with new password

### Scenario 4: Rate Limiting
1. Make 10 failed login attempts
2. Verify account gets locked
3. Check email for lockout notification
4. Wait for lockout to expire OR manually unlock

### Scenario 5: Device Management
1. Login from multiple "devices" (different fingerprints)
2. List active devices
3. Trust a device
4. Remove a device
5. Logout from all devices

## 🔐 Security Testing

### Test Cases
- [ ] SQL Injection in login
- [ ] XSS in registration fields
- [ ] CSRF token validation
- [ ] JWT tampering
- [ ] Expired token handling
- [ ] Revoked token handling
- [ ] Rate limit bypass attempts

## 📊 Performance Testing

Run with Apache Bench or similar:
```bash
# 100 requests, 10 concurrent
ab -n 100 -c 10 -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/v1/auth/me
```

## 🎯 Next Steps
1. Import Postman collection
2. Test all endpoints manually  
3. Write integration tests
4. Set up CI/CD pipeline with automated testing

# Authentication API Documentation

## Base URL
- **Development**: `http://localhost:8080/api/v1`
- **Production**: `https://api.yourdom ain.com/api/v1`

## Authentication

All protected endpoints require a valid JWT access token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

Refresh tokens are stored in HttpOnly cookies (`refreshToken`).

---

## Endpoints

### Public Endpoints (No Authentication Required)

#### 1. Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePassword123!",
  "roleId": 2,
  "branchId": 1,
  "userType": "INTERNAL"
}
```

**Response:** `200 OK`
```json
{
  "accessToken": null,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "roles": ["USER"],
    "permissions": ["READ_PRODUCTS"],
    "branchName": "Main Branch",
    "userType": "INTERNAL",
    "emailVerified": false,
    "mfaEnabled": false
  },
  "mfaRequired": false
}
```

**Notes:**
- User account is disabled until email is verified
- Verification email is sent automatically
- Welcome email is also sent

---

#### 2. Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "deviceFingerprint": "unique-device-id"
}
```

**Response (No 2FA):** `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "roles": ["USER"],
    "permissions": ["READ_PRODUCTS", "CREATE_ORDERS"],
    "branchName": "Main Branch",
    "userType": "INTERNAL",
    "emailVerified": true,
    "mfaEnabled": false
  },
  "mfaRequired": false
}
```

**Response (2FA Required):** `200 OK`
```json
{
  "accessToken": null,
  "user": null,
  "mfaRequired": true,
  "sessionId": "temp-session-uuid"
}
```

**Cookies Set:**
- `refreshToken` (HttpOnly, Secure, SameSite=Strict, 7 days)

**Error Responses:**
- `400 Bad Request`: Invalid credentials
- `401 Unauthorized`: Account locked
- `403 Forbidden`: Email not verified
- `429 Too Many Requests`: Rate limited

---

#### 3. Verify 2FA Code
```http
POST /auth/verify-2fa
```

**Request Body:**
```json
{
  "sessionId": "temp-session-uuid",
  "code": "123456"
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiJ9...",
  "user": { /* user object */ },
  "mfaRequired": false
}
```

**Cookies Set:**
- `refreshToken` (HttpOnly, Secure, SameSite=Strict, 7 days)

---

#### 4. Refresh Access Token
```http
POST /auth/refresh
```

**Cookies Required:**
- `refreshToken`

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiJ9...",
  "user": { /* user object */ },
  "mfaRequired": false
}
```

**Cookies Updated:**
- `refreshToken` (new token due to rotation)

**Notes:**
- Old refresh token is automatically revoked
- Token rotation prevents replay attacks

---

#### 5. Verify Email
```http
POST /auth/verify-email
```

**Request Body:**
```json
{
  "token": "verification-token-from-email"
}
```

**Response:** `200 OK`
```json
{
  "message": "Email verified successfully"
}
```

**Error:** `400 Bad Request`
```json
{
  "message": "Invalid or expired token"
}
```

---

#### 6. Resend Verification Email
```http
POST /auth/resend-verification
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`
```json
{
  "message": "Verification email sent"
}
```

---

#### 7. Forgot Password
```http
POST /auth/forgot-password
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`
```json
{
  "message": "If the email exists, a password reset link has been sent"
}
```

**Notes:**
- Response is intentionally vague to prevent email enumeration
- Reset token expires in 1 hour

---

#### 8. Reset Password
```http
POST /auth/reset-password
```

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password reset successfully"
}
```

**Error:** `400 Bad Request`
```json
{
  "message": "Invalid or expired token"
}
```

**Notes:**
- All refresh tokens are revoked after password reset
- Confirmation email is sent
- Account lockout is cleared

---

### Protected Endpoints (Authentication Required)

#### 9. Get Current User
```http
GET /auth/me
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "johndoe",
  "roles": ["USER", "PHARMACIST"],
  "permissions": ["READ_PRODUCTS", "CREATE_ORDERS", "DISPENSE_MEDICATION"],
  "branchName": "Main Branch",
  "userType": "INTERNAL",
  "emailVerified": true,
  "mfaEnabled": true
}
```

---

#### 10. Change Password
```http
POST /auth/change-password
```

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password changed successfully"
}
```

**Notes:**
- All refresh tokens (all devices) are revoked
- Confirmation email is sent

---

#### 11. Logout (Current Device)
```http
POST /auth/logout
```

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

**Cookies Cleared:**
- `refreshToken`

---

#### 12. Logout All Devices
```http
POST /auth/logout-all
```

**Response:** `200 OK`
```json
{
  "message": "Logged out from all devices"
}
```

**Notes:**
- Revokes all refresh tokens for the user
- Useful after password change or security incident

---

### 2FA Management Endpoints

#### 13. Setup 2FA
```http
GET /mfa/setup
```

**Response:** `200 OK`
```json
{
  "qrCodeUri": "otpauth://totp/MedHelp:user@example.com?secret=JBSWY3DP...",
  "backupCodes": [
    "12345678",
    "87654321",
    // ... 8 more codes
  ]
}
```

**Notes:**
- QR code URI can be used to generate QR code image on frontend
- Backup codes should be displayed once and stored securely by user
- 2FA is not enabled until verified

---

#### 14. Enable 2FA
```http
POST /mfa/enable
```

**Request Body:**
```json
{
  "code": "123456"
}
```

**Response:** `200 OK`
```json
{
  "message": "2FA enabled successfully"
}
```

**Error:** `400 Bad Request`
```json
{
  "message": "Invalid code"
}
```

---

#### 15. Disable 2FA
```http
POST /mfa/disable
```

**Response:** `200 OK`
```json
{
  "message": "2FA disabled successfully"
}
```

---

#### 16. Get 2FA Status
```http
GET /mfa/status
```

**Response:** `200 OK`
```json
{
  "enabled": true
}
```

---

#### 17. Get Backup Codes
```http
GET /mfa/backup-codes
```

**Response:** `200 OK`
```json
{
  "codes": [
    "12345678",
    "87654321",
    // ... remaining codes
  ]
}
```

---

#### 18. Regenerate Backup Codes
```http
POST /mfa/backup-codes/regenerate
```

**Response:** `200 OK`
```json
{
  "codes": [
    "98765432",
    "23456789",
    // ... 8 more new codes
  ]
}
```

**Notes:**
- Old backup codes are invalidated
- New codes should be stored securely by user

---

### Device Management Endpoints

#### 19. List Devices
```http
GET /user/devices
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "deviceName": "Chrome Browser",
    "lastIp": "192.168.1.100",
    "lastSeen": "2025-11-21T18:30:00",
    "firstSeen": "2025-11-20T10:15:00",
    "isTrusted": true
  },
  {
    "id": 2,
    "deviceName": "iPhone",
    "lastIp": "192.168.1.101",
    "lastSeen": "2025-11-21T09:00:00",
    "firstSeen": "2025-11-15T14:20:00",
    "isTrusted": false
  }
]
```

---

#### 20. Trust Device
```http
POST /user/devices/{deviceId}/trust
```

**Response:** `200 OK` (No body)

---

#### 21. Remove Device
```http
DELETE /user/devices/{deviceId}
```

**Response:** `200 OK` (No body)

**Notes:**
- Removes device from tracking
- Does not revoke active sessions (use logout-all for that)

---

## Security Features

### Rate Limiting
- **Email-based**: 5 failed attempts per 15 minutes
- **IP-based**: 10 failed attempts per 15 minutes
- **Account Lockout**: After 5 failed attempts, locked for 30 minutes
- **Response**: `429 Too Many Requests`

### Token Lifetimes
- **Access Token**: 15 minutes
- **Refresh Token**: 7 days (stored in HttpOnly cookie)
- **Email Verification**: 24 hours
- **Password Reset**: 1 hour
- **2FA Session**: 5 minutes

### Device Tracking
- New device logins trigger email alerts
- Device fingerprinting for enhanced security
- Trusted device management

### Email Notifications
- Welcome email
- Email verification
- Password reset
- New device login alert
- Account locked notification
- Password changed confirmation

---

## Error Codes

| Code | Description |
|------|-------------|
| `400` | Bad Request - Invalid input or expired token |
| `401` | Unauthorized - Invalid credentials or missing authentication |
| `403` | Forbidden - Email not verified or insufficient permissions |
| `404` | Not Found - Resource doesn't exist |
| `429` | Too Many Requests - Rate limit exceeded |
| `500` | Internal Server Error - Server-side error |

---

## JWT Claims

Access tokens contain the following claims:

```json
{
  "sub": "user@example.com",
  "iat": 1700000000,
  "exp": 1700000900,
  "roles": ["USER", "PHARMACIST"],
  "permissions": ["READ_PRODUCTS", "CREATE_ORDERS", "DISPENSE_MEDICATION"]
}
```

- **sub**: User email (subject)
- **iat**: Issued at (Unix timestamp)
- **exp**: Expiration (Unix timestamp)
- **roles**: User roles
- **permissions**: Aggregated permissions from all roles

---

## Best Practices

### Frontend Integration

1. **Store Access Token in Memory**: Never in localStorage (XSS vulnerability)
2. **Refresh Token in HttpOnly Cookie**: Backend sets it automatically
3. **Auto-Refresh**: Implement token refresh before expiration
4. **Device Fingerprinting**: Use libraries like FingerprintJS
5. **Logout on 401**: Redirect to login page

### Security

1. **HTTPS Only**: Always use HTTPS in production
2. **CORS Configuration**: Configure allowed origins properly
3. **Password Requirements**: Enforce strong passwords (min 8 chars, mixed case, numbers, symbols)
4. **2FA for Admins**: Strongly recommend 2FA for admin accounts
5. **Monitor Failed Logins**: Set up alerts for suspicious activity

---

## Testing with Postman

See [Postman Collection](./POSTMAN_COLLECTION.md) for pre-configured requests.

Quick test flow:
1. Register user
2. Check email for verification link
3. Verify email
4. Login
5. Use access token for protected endpoints
6. Refresh token when needed

---

## Support

For issues or questions, contact: support@medhelp.com

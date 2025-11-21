# Authentication Setup Guide

## Prerequisites

- Java 17+
- Maven 3.9+
- PostgreSQL 16+
- Node.js 18+ (for frontend)
- Docker & Docker Compose (optional)

---

## Backend Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd Medhelp/backend
```

### 2. Generate RSA Keys for JWT
```bash
chmod +x generate-keys.sh
./generate-keys.sh
```

This creates:
- `src/main/resources/keys/private_key.pem`
- `src/main/resources/keys/public_key.pem`

**⚠️ Important**: Add `keys/` to `.gitignore`

### 3. Configure Environment Variables

Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

Update with your values:
```env
# Database
DB_URL=jdbc:postgresql://localhost:5432/medhelp
DB_USERNAME=postgres
DB_PASSWORD=your_password

# Email (Gmail example)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Frontend
FRONTEND_URL=http://localhost:3000

# CORS
ALLOWED_ORIGINS=http://localhost:3000

# Security
LOCK_DURATION_MINUTES=30
MAX_FAILED_ATTEMPTS=5
```

### 4. Setup PostgreSQL Database
```bash
# Create database
createdb medhelp

# Or using psql
psql -U postgres
CREATE DATABASE medhelp;
\q
```

### 5. Run Backend
```bash
# Build
mvn clean install -DskipTests

# Run
mvn spring-boot:run
```

Backend will start on: `http://localhost:8080`

### 6. Verify Migration

Flyway will automatically run migrations on startup. Check logs for:
```
Flyway: Successfully applied 1 migration to schema "public"
```

---

## Frontend Setup

### 1. Navigate to Frontend
```bash
cd ../frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env.local
```

Update `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

### 4. Run Frontend
```bash
npm run dev
```

Frontend will start on: `http://localhost:3000`

---

## Docker Setup (Recommended for Development)

### 1. Navigate to Docker Directory
```bash
cd docker
```

### 2. Generate RSA Keys First
```bash
cd ../backend
./generate-keys.sh
cd ../docker
```

### 3. Configure Environment
```bash
cp .env.example .env
```

### 4. Start All Services
```bash
docker-compose -f docker.compose.dev.yml up --build
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Backend (port 8080)
- Frontend (port 3000)

### 5. Stop Services
```bash
docker-compose -f docker.compose.dev.yml down
```

---

## Email Setup (Gmail)

### 1. Enable 2-Step Verification
1. Go to Google Account settings
2. Security → 2-Step Verification
3. Enable it

### 2. Generate App Password
1. Security → App passwords
2. Select "Mail" and "Other (Custom name)"
3. Name it "MedHelp" and generate
4. Copy the 16-character password
5. Use this as `MAIL_PASSWORD` in `.env`

### 3. Test Email
Register a new user and check your inbox for verification email.

---

## Testing the API

### Using cURL

#### 1. Register
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Test123!@#",
    "roleId": 2,
    "userType": "INTERNAL"
  }'
```

#### 2. Login
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "deviceFingerprint": "test-device"
  }'
```

#### 3. Access Protected Endpoint
```bash
curl -X GET http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer <access_token>" \
  -b cookies.txt
```

### Using Postman

1. Import the collection: `documentation/POSTMAN_COLLECTION.json` (to be created)
2. Set environment variable `BASE_URL` = `http://localhost:8080/api/v1`
3. Run requests in order

---

## Troubleshooting

### Backend Won't Start

**Error**: `Keys not found`
```bash
cd backend
./generate-keys.sh
```

**Error**: `Connection refused to PostgreSQL`
```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL
brew services start postgresql  # macOS
sudo systemctl start postgresql # Linux
```

**Error**: `Flyway migration failed`
```bash
# Drop and recreate database
dropdb medhelp && createdb medhelp
```

### Email Not Sending

**Check**:
1. SMTP credentials are correct
2. Gmail App Password (not regular password)
3. Check application logs for email errors
4. Verify `FRONTEND_URL` is correct (for email links)

### Docker Build Fails

**Error**: Maven dependencies download slowly
```bash
# Use local Maven cache
docker-compose -f docker.compose.dev.yml up --build
# Maven cache is mounted at ~/.m2
```

**Error**: Database connection refused
```bash
# Wait for PostgreSQL to be ready
docker-compose logs postgres
```

---

## Database Schema

The system creates 15 tables:
- Core: `users`, `roles`, `permissions`, `branches`
- Auth: `refresh_tokens`, `email_verification_tokens`, `password_reset_tokens`
- Security: `mfa_settings`, `oauth_providers`, `auth_devices`, `login_attempts`
- Relationships: `user_roles`, `role_permissions`, `user_branches`

View the complete schema: [`backend/src/main/resources/db/migration/V1__initial_auth_schema.sql`](../backend/src/main/resources/db/migration/V1__initial_auth_schema.sql)

---

## Default Roles & Permissions

Created automatically on first migration:

| Role | Permissions |
|------|-------------|
| ADMIN | Full system access |
| USER | Basic access |
| PHARMACIST | Dispense medication, manage inventory |
| CASHIER | Process payments, view orders |

---

## Security Checklist

Before deploying to production:

- [ ] Generate new RSA keys (don't use development keys)
- [ ] Use strong database passwords
- [ ] Enable HTTPS only
- [ ] Configure proper CORS origins
- [ ] Set secure session cookies
- [ ] Enable rate limiting
- [ ] Set up email alerts for security events
- [ ] Regular database backups
- [ ] Enable audit logging
- [ ] Review and update security headers

---

## Next Steps

1. **Testing**: See [TESTING.md](./TESTING.md)
2. **API Docs**: See [API_AUTHENTICATION.md](./API_AUTHENTICATION.md)
3. **Frontend Integration**: See [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md)
4. **Deployment**: See [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## Support

For issues: [GitHub Issues](repository-url/issues)  
For questions: support@medhelp.com

# Pharmacy System - Multi-Environment Setup

A comprehensive pharmacy management system with production, staging, and development environments built using a monorepo structure with Docker and GitHub Actions.

## 🏗️ Project Structure

```
pharmacy-system/
├── .github/
|    └── workflows/            # CI/CD pipelines
|        ├── deploy-production.yml
|        ├── deploy-staging.yml
|        └── deploy-development.yml
├── docker/                     # Docker configurations
|    ├── docker-compose.prod.yml
│    ├── docker-compose.staging.yml
│    ├── docker-compose.dev.yml
│    └── nginx/
│        ├── nginx.conf
│        └── ssl/
├── frontend/                   # React/Next.js frontend
|    ├── Dockerfile.dev
│    ├── Dockerfile.prod
│    └── ...
├── backend/                    # Java backend API
|    ├── Dockerfile.dev
│    ├── Dockerfile.prod
│    └── ...
├── .env.production.example
├── .env.staging.example
├── .env.development.example                  
├── scripts/                    # Utility scripts
└── documentation/              # Additional docs
```

## 🌳 Branch Strategy

| Branch | Environment | URL | Purpose |
|--------|-------------|-----|---------|
| `main` | Production | `pharmacy.com` | Live customer-facing environment |
| `staging` | Staging | `staging.pharmacy.com` | Pre-production testing |
| `develop` | Development | `dev.pharmacy.com` | Integration testing |
| `feature/*` | Feature | Preview URLs | New feature development |

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Java 17+ (for local development)
- Next.js
- Git

### Development Environment

```bash
# Clone the repository
git clone https://github.com/your-org/pharmacy-system.git
cd pharmacy-system

# Switch to develop branch
git checkout develop

# Setup environment (creates .env files from examples)
chmod +x scripts/setup.sh
./scripts/setup.sh

# Edit environment variables
nano .env.development

# Start development environment
docker-compose -f docker/docker-compose.dev.yml up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# Database: localhost:5432
```

### Staging Environment

```bash
git checkout staging
docker-compose -f docker/docker-compose.staging.yml up -d
# Access: http://staging.pharmacy.com
```

### Production Environment

```bash
git checkout main
docker-compose -f docker/docker-compose.prod.yml up -d
# Access: https://pharmacy.com
```

## ⚙️ Configuration

### Environment Variables

Copy and configure environment files for each environment:

```bash
# Development
cp .env.development.example .env.development

# Staging  
cp .env.staging.example .env.staging

# Production
cp .env.production.example .env.production
```

**Key Configuration Areas:**
- Database credentials
- JWT secrets
- Domain names and URLs
- SSL certificates
- API keys and external services

### Docker Configuration

Each environment has its own Docker Compose file:

- `docker-compose.dev.yml` - Development with hot reload
- `docker-compose.staging.yml` - Staging with production-like settings
- `docker-compose.prod.yml` - Production with SSL and optimizations

## 🔄 Deployment

### Automated Deployments (CI/CD)

| Action | Trigger | Environment |
|--------|---------|-------------|
| `deploy-development.yml` | Push to `develop` | Development |
| `deploy-staging.yml` | Push to `staging` | Staging |
| `deploy-production.yml` | Tag push (`v*`) to `main` | Production |

### Manual Deployment

```bash
# Development
docker-compose -f docker/docker-compose.dev.yml down
docker-compose -f docker/docker-compose.dev.yml up -d --build

# Staging
docker-compose -f docker/docker-compose.staging.yml down
docker-compose -f docker/docker-compose.staging.yml up -d --build

# Production
docker-compose -f docker/docker-compose.prod.yml down
docker-compose -f docker/docker-compose.prod.yml up -d --build
```

## 🐳 Docker Services

Each environment includes:

- **PostgreSQL** - Primary database
- **Redis** - Caching and sessions
- **Backend API** - Java application
- **Frontend** - React/Next.js application
- **Nginx** - Reverse proxy and SSL termination

### Service Ports

| Service | Development | Staging | Production |
|---------|-------------|---------|------------|
| Frontend | 3000 | 80 | 443 (SSL) |
| Backend | 3001 | 3000 | 3000 |
| PostgreSQL | 5432 | Internal | Internal |
| Redis | 6379 | Internal | Internal |

## 📊 Health Checks

All services include health monitoring:

```bash
# Check application health
curl http://localhost:3000/health

# Check backend API health  
curl http://localhost:3001/health

# Database connection check
docker-compose exec postgres-dev pg_isready
```

## 🔒 Security Features

- **SSL/TLS** in production with automatic HTTP to HTTPS redirect
- **Security headers** (CSP, X-Frame-Options, etc.)
- **JWT authentication** with environment-specific secrets
- **Non-root users** in Docker containers
- **Network isolation** between environments
- **Secret management** via environment variables

## 🗄️ Database Management

### Migrations

```bash
# Development
docker-compose -f docker/docker-compose.dev.yml exec backend-dev npm run migrate

# Staging
docker-compose -f docker/docker-compose.staging.yml exec backend-staging npm run migrate

# Production
docker-compose -f docker/docker-compose.prod.yml exec backend-prod npm run migrate
```

### Backups

```bash
# Manual backup
docker-compose -f docker/docker-compose.prod.yml exec postgres-prod pg_dump -U pharmacy_user pharmacy_prod > backup.sql

# Restore
docker-compose -f docker/docker-compose.prod.yml exec -T postgres-prod psql -U pharmacy_user pharmacy_prod < backup.sql
```

## 🛠️ Development Workflow

### Feature Development

```bash
# Create feature branch
git checkout -b feature/new-medication-management

# Develop locally with hot reload
docker-compose -f docker/docker-compose.dev.yml up

# Test and commit changes
git add .
git commit -m "Add new medication management feature"

# Push for review
git push origin feature/new-medication-management
```

### Code Promotion

1. **Feature → Develop**: Merge via Pull Request
2. **Develop → Staging**: Automated on push to staging
3. **Staging → Production**: Tag release on main branch

## 📈 Monitoring & Logs

### View Logs

```bash
# Development logs
docker-compose -f docker/docker-compose.dev.yml logs -f

# Specific service logs
docker-compose -f docker/docker-compose.dev.yml logs -f backend-dev

# Production logs
docker-compose -f docker/docker-compose.prod.yml logs -f
```

### Performance Monitoring

- **Nginx access logs** - HTTP request monitoring
- **Application logs** - Business logic and errors
- **Database logs** - Query performance
- **Docker metrics** - Container resource usage

## 🚨 Troubleshooting

### Common Issues

**Service won't start:**
```bash
# Check Docker logs
docker-compose logs [service-name]

# Verify environment variables
docker-compose config

# Restart services
docker-compose down && docker-compose up -d
```

**Database connection issues:**
```bash
# Check if database is running
docker-compose ps postgres-dev

# Test connection
docker-compose exec postgres-dev pg_isready
```

**Port conflicts:**
```bash
# Find what's using a port
lsof -i :3000

# Use different ports in .env file
```

### Reset Environments

```bash
# Development reset (includes database)
docker-compose -f docker/docker-compose.dev.yml down -v
docker-compose -f docker/docker-compose.dev.yml up -d

# Staging reset (preserves data)
docker-compose -f docker/docker-compose.staging.yml down
docker-compose -f docker/docker-compose.staging.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- Follow existing code style and patterns
- Include environment-specific configurations
- Update documentation for new features
- Add tests where applicable
- Ensure all services start correctly in all environments

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- **Development Issues**: Create an issue in GitHub
- **Production Emergencies**: Contact DevOps team
- **Database Issues**: DBA team
- **Infrastructure**: Cloud operations team

---

**Maintenance Notes:**
- Regularly update dependencies in all environments
- Monitor SSL certificate expiration
- Review and rotate secrets quarterly
- Backup databases daily
- Update this documentation with environment changes

# Development Setup - Tuberise Analytics

## 🚀 Quick Start

This guide will help you set up the Tuberise Analytics development environment quickly and efficiently.

## 📋 Prerequisites

### **Required Software**

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **Git** (v2.30.0 or higher)
- **PostgreSQL** (v14.0 or higher)
- **Redis** (v6.0 or higher)

### **Recommended Tools**

- **VS Code** - Code editor with extensions
- **Docker Desktop** - For containerized development
- **Postman** - API testing
- **TablePlus** - Database management

## 🔧 Installation Steps

### **1. Clone the Repository**

```bash
git clone https://github.com/your-org/tuberise-analytics.git
cd tuberise-analytics
```

### **2. Install Dependencies**

```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm run install:all
```

### **3. Environment Configuration**

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

### **4. Database Setup**

```bash
# Start PostgreSQL and Redis (using Docker)
docker-compose up -d postgres redis

# Run database migrations
npm run db:migrate

# Seed development data
npm run db:seed
```

### **5. Start Development Servers**

```bash
# Start all services in development mode
npm run dev

# Or start services individually
npm run dev:frontend    # Frontend on http://localhost:3000
npm run dev:backend     # Backend on http://localhost:3001
```

## 🐳 Docker Development Environment

### **Using Docker Compose**

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### **Docker Services**

- **Frontend** - Next.js development server
- **Backend** - Node.js API server
- **PostgreSQL** - Database server
- **Redis** - Cache and session store
- **Nginx** - Reverse proxy (optional)

## 🔑 Environment Variables

### **Required Variables**

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/tuberise_dev"
REDIS_URL="redis://localhost:6379"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
JWT_SECRET="your-jwt-secret"

# APIs
YOUTUBE_API_KEY="your-youtube-api-key"
NOTION_API_KEY="your-notion-api-key"
OPENAI_API_KEY="your-openai-api-key"

# Services
STRIPE_SECRET_KEY="your-stripe-secret-key"
SENDGRID_API_KEY="your-sendgrid-api-key"
```

### **Development Variables**

```bash
# Development
NODE_ENV="development"
DEBUG="tuberise:*"
LOG_LEVEL="debug"

# Frontend
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Backend
PORT=3001
CORS_ORIGIN="http://localhost:3000"
```

## 🛠️ Development Workflow

### **Daily Development**

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install any new dependencies
npm install

# 3. Run database migrations
npm run db:migrate

# 4. Start development servers
npm run dev

# 5. Run tests (in another terminal)
npm run test:watch
```

### **Feature Development**

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes and test
npm run test
npm run lint
npm run type-check

# 3. Commit changes
git add .
git commit -m "feat: add new feature"

# 4. Push and create PR
git push origin feature/new-feature
```

## 🧪 Testing

### **Running Tests**

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run specific test suite
npm run test:frontend
npm run test:backend
npm run test:shared

# Run tests with coverage
npm run test:coverage
```

### **Test Structure**

```
tests/
├── unit/                    # Unit tests
├── integration/             # Integration tests
├── e2e/                     # End-to-end tests
└── fixtures/                # Test data
```

## 🔍 Code Quality

### **Linting and Formatting**

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type checking
npm run type-check
```

### **Pre-commit Hooks**

```bash
# Install pre-commit hooks
npm run prepare

# Manual pre-commit check
npm run pre-commit
```

## 📊 Database Management

### **Migrations**

```bash
# Create new migration
npm run db:migration:create -- --name="add-user-table"

# Run migrations
npm run db:migrate

# Rollback migration
npm run db:rollback

# Reset database
npm run db:reset
```

### **Seeding**

```bash
# Seed development data
npm run db:seed

# Seed specific data
npm run db:seed:users
npm run db:seed:channels
```

### **Database Access**

```bash
# Connect to database
npm run db:connect

# Open database GUI
npm run db:gui
```

## 🔌 API Development

### **API Testing**

```bash
# Start API server
npm run dev:backend

# Run API tests
npm run test:api

# Test API endpoints
curl http://localhost:3001/api/health
```

### **API Documentation**

```bash
# Generate API docs
npm run docs:api

# View API docs
npm run docs:api:serve
```

## 🎨 Frontend Development

### **Component Development**

```bash
# Start Storybook
npm run storybook

# Build components
npm run build:ui

# Test components
npm run test:components
```

### **Styling**

```bash
# Watch CSS changes
npm run css:watch

# Build CSS
npm run css:build

# Purge unused CSS
npm run css:purge
```

## 🚀 Building and Deployment

### **Build Commands**

```bash
# Build all packages
npm run build

# Build specific package
npm run build:frontend
npm run build:backend
npm run build:shared

# Build for production
npm run build:prod
```

### **Deployment**

```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:prod

# Rollback deployment
npm run deploy:rollback
```

## 🐛 Debugging

### **Frontend Debugging**

```bash
# Enable debug mode
DEBUG=tuberise:* npm run dev:frontend

# Use React DevTools
# Install React DevTools browser extension
```

### **Backend Debugging**

```bash
# Enable debug mode
DEBUG=tuberise:* npm run dev:backend

# Use Node.js debugger
node --inspect src/server.ts
```

### **Database Debugging**

```bash
# Enable query logging
DEBUG=prisma:query npm run dev:backend

# View database logs
docker-compose logs postgres
```

## 📱 Mobile Development

### **React Native Setup**

```bash
# Install React Native CLI
npm install -g @react-native-community/cli

# Setup mobile development
npm run mobile:setup

# Start Metro bundler
npm run mobile:start

# Run on iOS
npm run mobile:ios

# Run on Android
npm run mobile:android
```

## 🔧 Troubleshooting

### **Common Issues**

#### **Port Already in Use**

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

#### **Database Connection Issues**

```bash
# Check database status
docker-compose ps postgres

# Restart database
docker-compose restart postgres

# Check database logs
docker-compose logs postgres
```

#### **Node Modules Issues**

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### **TypeScript Errors**

```bash
# Clear TypeScript cache
rm -rf .tsbuildinfo

# Restart TypeScript server
# In VS Code: Ctrl+Shift+P > "TypeScript: Restart TS Server"
```

### **Performance Issues**

```bash
# Profile application
npm run profile

# Check bundle size
npm run analyze

# Monitor memory usage
npm run monitor
```

## 📚 Additional Resources

### **Documentation**

- [Project Overview](../docs/PROJECT-OVERVIEW.md)
- [Tech Stack](../docs/TECH-STACK.md)
- [API Documentation](../docs/API-DOCUMENTATION.md)
- [Deployment Guide](../docs/DEPLOYMENT-GUIDE.md)

### **External Resources**

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [Node.js Documentation](https://nodejs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Redis Documentation](https://redis.io/documentation)

### **Community**

- [GitHub Issues](https://github.com/your-org/tuberise-analytics/issues)
- [Discord Server](https://discord.gg/tuberise)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/tuberise-analytics)

---

**Document Version:** 1.0
**Last Updated:** October 5, 2025
**Next Review:** October 12, 2025
**Maintained By:** Engineering Team

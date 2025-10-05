# File Structure - Tuberise Analytics

## 📁 Project Structure Overview

Tuberise Analytics follows a monorepo structure with clear separation of concerns, making it easy to navigate, maintain, and scale.

## 🏗️ Root Directory Structure

```
tuberise/
├── 📁 apps/                          # Application packages
│   ├── 📁 frontend/                  # Next.js frontend application
│   └── 📁 backend/                   # Node.js backend application
├── 📁 packages/                      # Shared packages and libraries
│   ├── 📁 shared/                    # Shared utilities and types
│   ├── 📁 ui/                        # Reusable UI components
│   └── 📁 database/                  # Database schema and models
├── 📁 docs/                          # Project documentation
├── 📁 scripts/                       # Build and deployment scripts
├── 📁 .github/                       # GitHub workflows and templates
├── 📄 package.json                   # Root package.json with workspaces
├── 📄 turbo.json                     # Turborepo configuration
├── 📄 tsconfig.json                  # Root TypeScript configuration
├── 📄 .gitignore                     # Git ignore rules
├── 📄 .env.example                   # Environment variables template
└── 📄 README.md                      # Project overview and setup
```

## 📱 Frontend Application (`apps/frontend/`)

### **Structure**

```
apps/frontend/
├── 📁 src/
│   ├── 📁 app/                       # Next.js App Router
│   │   ├── 📁 (auth)/               # Auth route group
│   │   │   ├── 📁 login/
│   │   │   └── 📁 register/
│   │   ├── 📁 dashboard/
│   │   ├── 📁 analytics/
│   │   ├── 📁 settings/
│   │   ├── 📁 layout.tsx            # Root layout
│   │   ├── 📁 page.tsx              # Home page
│   │   ├── 📁 loading.tsx           # Global loading UI
│   │   ├── 📁 error.tsx             # Global error UI
│   │   └── 📁 not-found.tsx         # 404 page
│   ├── 📁 components/               # React components
│   │   ├── 📁 ui/                   # Base UI components
│   │   ├── 📁 analytics/            # Analytics-specific components
│   │   ├── 📁 auth/                 # Authentication components
│   │   ├── 📁 dashboard/            # Dashboard components
│   │   └── 📁 forms/                # Form components
│   ├── 📁 lib/                      # Utility functions
│   │   ├── 📁 auth.ts               # Authentication utilities
│   │   ├── 📁 api.ts                # API client utilities
│   │   ├── 📁 utils.ts              # General utilities
│   │   └── 📁 validations.ts        # Form validation schemas
│   ├── 📁 hooks/                    # Custom React hooks
│   │   ├── 📁 useAuth.ts            # Authentication hook
│   │   ├── 📁 useAnalytics.ts       # Analytics data hook
│   │   └── 📁 useLocalStorage.ts    # Local storage hook
│   ├── 📁 stores/                   # State management
│   │   ├── 📁 authStore.ts          # Authentication state
│   │   ├── 📁 analyticsStore.ts     # Analytics state
│   │   └── 📁 uiStore.ts            # UI state
│   ├── 📁 types/                    # TypeScript type definitions
│   │   ├── 📁 auth.ts               # Authentication types
│   │   ├── 📁 analytics.ts          # Analytics types
│   │   └── 📁 api.ts                # API response types
│   └── 📁 styles/                   # Global styles
│       ├── 📁 globals.css           # Global CSS
│       └── 📁 components.css        # Component-specific styles
├── 📁 public/                       # Static assets
│   ├── 📁 images/                   # Image assets
│   ├── 📁 icons/                    # Icon assets
│   └── 📄 favicon.ico               # Favicon
├── 📄 package.json                  # Frontend dependencies
├── 📄 tsconfig.json                 # Frontend TypeScript config
├── 📄 next.config.js                # Next.js configuration
├── 📄 tailwind.config.js            # Tailwind CSS configuration
└── 📄 postcss.config.js             # PostCSS configuration
```

### **Key Features**

- **App Router** - Next.js 14 App Router for modern routing
- **Component Organization** - Logical grouping by feature and purpose
- **Type Safety** - Full TypeScript coverage with strict typing
- **State Management** - Zustand for client state, TanStack Query for server state
- **Styling** - Tailwind CSS with component-based architecture

## 🔧 Backend Application (`apps/backend/`)

### **Structure**

```
apps/backend/
├── 📁 src/
│   ├── 📁 routes/                   # API route handlers
│   │   ├── 📁 auth/                 # Authentication routes
│   │   │   ├── 📁 login.ts
│   │   │   ├── 📁 register.ts
│   │   │   ├── 📁 refresh.ts
│   │   │   └── 📁 logout.ts
│   │   ├── 📁 analytics/            # Analytics routes
│   │   │   ├── 📁 channels.ts
│   │   │   ├── 📁 videos.ts
│   │   │   └── 📁 insights.ts
│   │   ├── 📁 users/                # User management routes
│   │   ├── 📁 integrations/         # Third-party integrations
│   │   │   ├── 📁 youtube.ts
│   │   │   ├── 📁 notion.ts
│   │   │   └── 📁 webhooks.ts
│   │   └── 📁 admin/                # Admin-only routes
│   ├── 📁 middleware/               # Express middleware
│   │   ├── 📁 auth.ts               # Authentication middleware
│   │   ├── 📁 validation.ts         # Request validation
│   │   ├── 📁 rateLimit.ts          # Rate limiting
│   │   ├── 📁 cors.ts               # CORS configuration
│   │   └── 📁 errorHandler.ts       # Error handling
│   ├── 📁 services/                 # Business logic services
│   │   ├── 📁 authService.ts        # Authentication service
│   │   ├── 📁 analyticsService.ts   # Analytics processing
│   │   ├── 📁 youtubeService.ts     # YouTube API integration
│   │   ├── 📁 notionService.ts      # Notion API integration
│   │   ├── 📁 aiService.ts          # AI/ML services
│   │   └── 📁 emailService.ts       # Email services
│   ├── 📁 models/                   # Data models
│   │   ├── 📁 User.ts               # User model
│   │   ├── 📁 Channel.ts            # Channel model
│   │   ├── 📁 Video.ts              # Video model
│   │   └── 📁 Analytics.ts          # Analytics model
│   ├── 📁 utils/                    # Utility functions
│   │   ├── 📁 logger.ts             # Logging utilities
│   │   ├── 📁 crypto.ts             # Cryptographic utilities
│   │   ├── 📁 validation.ts         # Validation utilities
│   │   └── 📁 helpers.ts            # General helpers
│   ├── 📁 types/                    # TypeScript type definitions
│   │   ├── 📁 auth.ts               # Authentication types
│   │   ├── 📁 api.ts                # API types
│   │   ├── 📁 database.ts           # Database types
│   │   └── 📁 external.ts           # External API types
│   ├── 📁 config/                   # Configuration files
│   │   ├── 📁 database.ts           # Database configuration
│   │   ├── 📁 redis.ts              # Redis configuration
│   │   ├── 📁 auth.ts               # Authentication configuration
│   │   └── 📁 integrations.ts       # Third-party integrations
│   ├── 📁 jobs/                     # Background jobs
│   │   ├── 📁 analyticsSync.ts      # Analytics synchronization
│   │   ├── 📁 emailNotifications.ts # Email notifications
│   │   └── 📁 dataCleanup.ts        # Data cleanup jobs
│   └── 📁 server.ts                 # Main server file
├── 📁 tests/                        # Test files
│   ├── 📁 unit/                     # Unit tests
│   ├── 📁 integration/              # Integration tests
│   └── 📁 fixtures/                 # Test fixtures
├── 📄 package.json                  # Backend dependencies
├── 📄 tsconfig.json                 # Backend TypeScript config
├── 📄 jest.config.js                # Jest test configuration
└── 📄 .env.example                  # Environment variables template
```

### **Key Features**

- **RESTful APIs** - Clean, well-documented API endpoints
- **Middleware Architecture** - Modular middleware for cross-cutting concerns
- **Service Layer** - Business logic separated from route handlers
- **Background Jobs** - Asynchronous task processing
- **Comprehensive Testing** - Unit and integration test coverage

## 📦 Shared Packages (`packages/`)

### **Shared Package (`packages/shared/`)**

```
packages/shared/
├── 📁 src/
│   ├── 📁 types/                    # Shared type definitions
│   │   ├── 📁 auth.ts               # Authentication types
│   │   ├── 📁 analytics.ts          # Analytics types
│   │   ├── 📁 user.ts               # User types
│   │   └── 📁 api.ts                # API types
│   ├── 📁 utils/                    # Shared utility functions
│   │   ├── 📁 date.ts               # Date utilities
│   │   ├── 📁 format.ts             # Formatting utilities
│   │   ├── 📁 validation.ts         # Validation utilities
│   │   └── 📁 constants.ts          # Application constants
│   ├── 📁 api-client/               # API client utilities
│   │   ├── 📁 client.ts             # Base API client
│   │   ├── 📁 endpoints.ts          # API endpoints
│   │   └── 📁 types.ts              # API client types
│   ├── 📁 hooks/                    # Shared React hooks
│   │   ├── 📁 useApi.ts             # API data fetching hook
│   │   ├── 📁 useDebounce.ts        # Debounce hook
│   │   └── 📁 useLocalStorage.ts    # Local storage hook
│   └── 📄 index.ts                  # Package exports
├── 📄 package.json                  # Package dependencies
├── 📄 tsconfig.json                 # Package TypeScript config
└── 📄 README.md                     # Package documentation
```

### **UI Package (`packages/ui/`)**

```
packages/ui/
├── 📁 src/
│   ├── 📁 components/               # Reusable UI components
│   │   ├── 📁 Button/               # Button component
│   │   │   ├── 📄 Button.tsx        # Component implementation
│   │   │   ├── 📄 Button.test.tsx   # Component tests
│   │   │   ├── 📄 Button.stories.tsx # Storybook stories
│   │   │   └── 📄 index.ts          # Component exports
│   │   ├── 📁 Input/                # Input component
│   │   ├── 📁 Modal/                # Modal component
│   │   ├── 📁 Chart/                # Chart components
│   │   ├── 📁 Table/                # Table components
│   │   └── 📁 Layout/               # Layout components
│   ├── 📁 styles/                   # Component styles
│   │   ├── 📁 globals.css           # Global styles
│   │   └── 📁 components.css        # Component-specific styles
│   ├── 📁 hooks/                    # UI-specific hooks
│   │   ├── 📁 useModal.ts           # Modal management hook
│   │   ├── 📁 useToast.ts           # Toast notification hook
│   │   └── 📁 useTheme.ts           # Theme management hook
│   ├── 📁 utils/                    # UI utility functions
│   │   ├── 📁 cn.ts                 # Class name utility
│   │   ├── 📁 variants.ts           # Component variants
│   │   └── 📁 animations.ts         # Animation utilities
│   └── 📄 index.ts                  # Package exports
├── 📄 package.json                  # Package dependencies
├── 📄 tsconfig.json                 # Package TypeScript config
└── 📄 README.md                     # Package documentation
```

### **Database Package (`packages/database/`)**

```
packages/database/
├── 📁 src/
│   ├── 📁 schema/                   # Database schema
│   │   ├── 📁 prisma/               # Prisma schema files
│   │   │   ├── 📄 schema.prisma     # Main Prisma schema
│   │   │   └── 📄 migrations/       # Database migrations
│   │   └── 📁 types/                # Database types
│   ├── 📁 models/                   # Data models
│   │   ├── 📁 User.ts               # User model
│   │   ├── 📁 Channel.ts            # Channel model
│   │   ├── 📁 Video.ts              # Video model
│   │   └── 📁 Analytics.ts          # Analytics model
│   ├── 📁 services/                 # Database services
│   │   ├── 📁 userService.ts        # User database operations
│   │   ├── 📁 channelService.ts     # Channel database operations
│   │   ├── 📁 videoService.ts       # Video database operations
│   │   └── 📁 analyticsService.ts   # Analytics database operations
│   ├── 📁 migrations/               # Database migrations
│   │   ├── 📁 001_initial.sql       # Initial migration
│   │   ├── 📁 002_users.sql         # Users table migration
│   │   └── 📁 003_analytics.sql     # Analytics tables migration
│   └── 📄 index.ts                  # Package exports
├── 📄 package.json                  # Package dependencies
├── 📄 tsconfig.json                 # Package TypeScript config
├── 📄 .env.example                  # Database environment variables
└── 📄 README.md                     # Package documentation
```

## 📚 Documentation (`docs/`)

### **Structure**

```
docs/
├── 📄 README.md                     # Documentation index
├── 📁 project/                      # Project documentation
│   ├── 📄 PROJECT-REQUIREMENTS.md   # Project requirements
│   ├── 📄 PROJECT-OVERVIEW.md       # Project overview
│   └── 📄 PROJECT-TIMELINE.md       # Development timeline
├── 📁 architecture/                 # Architecture documentation
│   ├── 📄 BACKEND-ARCHITECTURE.md   # Backend architecture
│   ├── 📄 FRONTEND-ARCHITECTURE.md  # Frontend architecture
│   ├── 📄 DATABASE-DESIGN.md        # Database design
│   └── 📄 API-DESIGN.md             # API design
├── 📁 development/                  # Development documentation
│   ├── 📄 TECH-STACK.md             # Technology stack
│   ├── 📄 DEVELOPMENT-SETUP.md      # Development setup
│   ├── 📄 FILE-STRUCTURE.md         # File structure (this file)
│   └── 📄 CODING-STANDARDS.md       # Coding standards
├── 📁 user/                         # User documentation
│   ├── 📄 USER-GUIDE.md             # User guide
│   ├── 📄 API-DOCUMENTATION.md      # API documentation
│   └── 📄 TROUBLESHOOTING.md        # Troubleshooting guide
└── 📁 deployment/                   # Deployment documentation
    ├── 📄 DEPLOYMENT-GUIDE.md       # Deployment guide
    ├── 📄 ENVIRONMENT-CONFIG.md     # Environment configuration
    └── 📄 MAINTENANCE-GUIDE.md      # Maintenance guide
```

## 🔧 Configuration Files

### **Root Configuration**

```
tuberise/
├── 📄 package.json                  # Root package.json with workspaces
├── 📄 turbo.json                    # Turborepo configuration
├── 📄 tsconfig.json                 # Root TypeScript configuration
├── 📄 .gitignore                    # Git ignore rules
├── 📄 .env.example                  # Environment variables template
├── 📄 .eslintrc.js                  # ESLint configuration
├── 📄 .prettierrc                   # Prettier configuration
├── 📄 jest.config.js                # Jest test configuration
└── 📄 docker-compose.yml            # Docker development environment
```

### **Package Configuration**

Each package has its own configuration files:

- `package.json` - Package dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `jest.config.js` - Test configuration (where applicable)
- `.env.example` - Environment variables template (where applicable)

## 🧪 Testing Structure

### **Test Organization**

```
tuberise/
├── 📁 apps/frontend/tests/          # Frontend tests
│   ├── 📁 __mocks__/                # Test mocks
│   ├── 📁 components/               # Component tests
│   ├── 📁 hooks/                    # Hook tests
│   ├── 📁 pages/                    # Page tests
│   └── 📁 utils/                    # Utility tests
├── 📁 apps/backend/tests/           # Backend tests
│   ├── 📁 unit/                     # Unit tests
│   ├── 📁 integration/              # Integration tests
│   ├── 📁 fixtures/                 # Test fixtures
│   └── 📁 __mocks__/                # Test mocks
├── 📁 packages/shared/tests/        # Shared package tests
├── 📁 packages/ui/tests/            # UI package tests
└── 📁 packages/database/tests/      # Database package tests
```

## 🚀 Build & Deployment

### **Build Configuration**

```
tuberise/
├── 📁 .github/                      # GitHub Actions workflows
│   ├── 📁 workflows/                # CI/CD workflows
│   │   ├── 📄 ci.yml                # Continuous integration
│   │   ├── 📄 deploy.yml            # Deployment workflow
│   │   └── 📄 release.yml           # Release workflow
│   └── 📁 templates/                # GitHub issue/PR templates
├── 📁 scripts/                      # Build and deployment scripts
│   ├── 📄 build.sh                  # Build script
│   ├── 📄 deploy.sh                 # Deployment script
│   ├── 📄 test.sh                   # Test script
│   └── 📄 lint.sh                   # Linting script
└── 📄 docker-compose.yml            # Docker development environment
```

## 📝 Naming Conventions

### **File Naming**

- **Components:** PascalCase (e.g., `UserProfile.tsx`)
- **Utilities:** camelCase (e.g., `formatDate.ts`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)
- **Types:** PascalCase (e.g., `UserTypes.ts`)
- **Tests:** `.test.ts` or `.spec.ts` suffix
- **Stories:** `.stories.tsx` suffix

### **Directory Naming**

- **Components:** kebab-case (e.g., `user-profile/`)
- **Utilities:** kebab-case (e.g., `date-utils/`)
- **Pages:** kebab-case (e.g., `user-settings/`)
- **Assets:** kebab-case (e.g., `user-avatars/`)

### **Import/Export Conventions**

```typescript
// Default exports for components
export default UserProfile;

// Named exports for utilities
export { formatDate, parseDate };

// Barrel exports from index files
export * from './components';
export * from './utils';
```

## 🔍 File Organization Principles

### **Separation of Concerns**

- **Components** - UI logic and presentation
- **Services** - Business logic and data processing
- **Utils** - Pure utility functions
- **Types** - TypeScript type definitions
- **Constants** - Application constants and configuration

### **Feature-Based Organization**

- Group related files together by feature
- Keep components close to their related utilities
- Separate shared code from feature-specific code
- Maintain clear boundaries between packages

### **Scalability Considerations**

- **Modular Architecture** - Easy to add new features
- **Clear Dependencies** - Explicit import/export relationships
- **Consistent Structure** - Predictable file organization
- **Documentation** - Clear documentation for complex structures

---

**Document Version:** 1.0
**Last Updated:** October 5, 2025
**Next Review:** October 12, 2025
**Maintained By:** Engineering Team

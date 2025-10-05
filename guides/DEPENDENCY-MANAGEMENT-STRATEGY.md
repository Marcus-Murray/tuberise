# Dependency Management Strategy
## Vertical Slice Implementation Plan

**Document Version:** 1.0
**Date:** December 2024
**Purpose:** Address dependency challenges in vertical slice development
**Approach:** Proactive dependency mapping and management

---

## 🎯 **Dependency Analysis**

### **Critical Dependencies Identified**

#### **1. Infrastructure Dependencies**
```
Slice 1 (Auth) → Slice 2-12 (All slices)
├── User authentication system
├── Database connection
├── Express server setup
└── Basic security middleware
```

#### **2. Data Model Dependencies**
```
Slice 1 (Auth) → User model
Slice 2 (Channels) → YouTubeChannel model (depends on User)
Slice 3 (Analytics) → YouTubeAnalytics model (depends on YouTubeChannel)
Slice 4 (Notion) → NotionDatabase model (depends on User)
Slice 5 (Sync) → SyncLog model (depends on User, YouTubeChannel, NotionDatabase)
```

#### **3. Service Dependencies**
```
Slice 2 (Channels) → YouTubeService (depends on AuthService)
Slice 3 (Analytics) → AnalyticsService (depends on YouTubeService)
Slice 4 (Notion) → NotionService (depends on AuthService)
Slice 5 (Sync) → SyncService (depends on AnalyticsService, NotionService)
Slice 7 (Automation) → SchedulerService (depends on SyncService)
```

#### **4. API Dependencies**
```
Slice 2 (Channels) → YouTube Data API v3
Slice 3 (Analytics) → YouTube Analytics API (depends on YouTube Data API)
Slice 4 (Notion) → Notion API
Slice 5 (Sync) → Both YouTube and Notion APIs
```

---

## 🛠️ **Dependency Management Solutions**

### **Strategy 1: Layered Architecture with Clear Interfaces**

#### **Core Infrastructure Layer (Slice 1)**
```typescript
// Establish foundational services that all other slices depend on
interface IAuthService {
  authenticate(token: string): Promise<User>;
  authorize(userId: string, resource: string): Promise<boolean>;
}

interface IDatabaseService {
  getConnection(): Promise<PrismaClient>;
  migrate(): Promise<void>;
}

interface ILoggingService {
  info(message: string, metadata?: any): void;
  error(message: string, error?: Error): void;
}

// Mock implementations for testing
class MockAuthService implements IAuthService {
  async authenticate(token: string): Promise<User> {
    return mockUser;
  }

  async authorize(userId: string, resource: string): Promise<boolean> {
    return true;
  }
}
```

#### **Service Layer (Slices 2-5)**
```typescript
// Each service implements clear interfaces and can be mocked
interface IYouTubeService {
  connectChannel(userId: string, channelId: string): Promise<YouTubeChannel>;
  getChannelData(channelId: string): Promise<ChannelData>;
  getAnalyticsData(channelId: string, dateRange: DateRange): Promise<AnalyticsData>;
}

interface INotionService {
  connectWorkspace(userId: string, workspaceId: string): Promise<void>;
  createDatabase(workspaceId: string, schema: DatabaseSchema): Promise<NotionDatabase>;
  updateDatabase(databaseId: string, data: any[]): Promise<void>;
}
```

### **Strategy 2: Dependency Injection Container**

#### **Service Container Setup**
```typescript
// Dependency injection container for managing service dependencies
class ServiceContainer {
  private services = new Map<string, any>();
  private factories = new Map<string, () => any>();

  register<T>(name: string, factory: () => T): void {
    this.factories.set(name, factory);
  }

  resolve<T>(name: string): T {
    if (!this.services.has(name)) {
      const factory = this.factories.get(name);
      if (!factory) {
        throw new Error(`Service ${name} not registered`);
      }
      this.services.set(name, factory());
    }
    return this.services.get(name);
  }

  // For testing - replace services with mocks
  mock<T>(name: string, mockService: T): void {
    this.services.set(name, mockService);
  }
}

// Container configuration
const container = new ServiceContainer();

// Register services with their dependencies
container.register('authService', () => new AuthService(container.resolve('databaseService')));
container.register('youtubeService', () => new YouTubeService(container.resolve('authService')));
container.register('notionService', () => new NotionService(container.resolve('authService')));
container.register('syncService', () => new SyncService(
  container.resolve('youtubeService'),
  container.resolve('notionService')
));
```

### **Strategy 3: Progressive Database Schema Evolution**

#### **Schema Versioning Strategy**
```sql
-- Slice 1: Core user schema
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  google_id VARCHAR(255) UNIQUE NOT NULL,
  subscription_tier VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Slice 2: Add YouTube channels (depends on users)
CREATE TABLE youtube_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel_id VARCHAR(255) UNIQUE NOT NULL,
  channel_title VARCHAR(500),
  subscriber_count INTEGER DEFAULT 0,
  view_count BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Slice 3: Add analytics (depends on youtube_channels)
CREATE TABLE youtube_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES youtube_channels(id) ON DELETE CASCADE,
  video_id VARCHAR(255) NOT NULL,
  title VARCHAR(500),
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  upload_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Slice 4: Add Notion integration (depends on users)
CREATE TABLE notion_workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workspace_id VARCHAR(255) NOT NULL,
  access_token_encrypted TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Slice 5: Add sync functionality (depends on all previous)
CREATE TABLE sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES youtube_channels(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES notion_workspaces(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  records_imported INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### **Migration Strategy**
```typescript
// Progressive migration system
class MigrationManager {
  private migrations = new Map<string, Migration>();

  registerMigration(version: string, migration: Migration): void {
    this.migrations.set(version, migration);
  }

  async migrateToVersion(targetVersion: string): Promise<void> {
    const currentVersion = await this.getCurrentVersion();
    const sortedMigrations = Array.from(this.migrations.entries())
      .filter(([version]) => this.isVersionAfter(version, currentVersion))
      .sort(([a], [b]) => this.compareVersions(a, b));

    for (const [version, migration] of sortedMigrations) {
      await migration.up();
      await this.setVersion(version);
    }
  }

  async rollbackToVersion(targetVersion: string): Promise<void> {
    const currentVersion = await this.getCurrentVersion();
    const sortedMigrations = Array.from(this.migrations.entries())
      .filter(([version]) => this.isVersionAfter(currentVersion, version))
      .sort(([a], [b]) => this.compareVersions(b, a));

    for (const [version, migration] of sortedMigrations) {
      await migration.down();
      await this.setVersion(version);
    }
  }
}

// Migration definitions
const migrations = {
  '1.0.0': {
    up: async () => {
      // Create users table
      await db.execute('CREATE TABLE users (...)');
    },
    down: async () => {
      await db.execute('DROP TABLE users');
    }
  },
  '2.0.0': {
    up: async () => {
      // Create youtube_channels table
      await db.execute('CREATE TABLE youtube_channels (...)');
    },
    down: async () => {
      await db.execute('DROP TABLE youtube_channels');
    }
  }
  // ... more migrations
};
```

### **Strategy 4: Mock Services for Independent Development**

#### **Mock Service Factory**
```typescript
// Factory for creating mock services for testing and development
class MockServiceFactory {
  static createYouTubeService(): IYouTubeService {
    return {
      connectChannel: jest.fn().mockResolvedValue(mockChannel),
      getChannelData: jest.fn().mockResolvedValue(mockChannelData),
      getAnalyticsData: jest.fn().mockResolvedValue(mockAnalyticsData),
      disconnectChannel: jest.fn().mockResolvedValue(undefined)
    };
  }

  static createNotionService(): INotionService {
    return {
      connectWorkspace: jest.fn().mockResolvedValue(undefined),
      createDatabase: jest.fn().mockResolvedValue(mockNotionDatabase),
      updateDatabase: jest.fn().mockResolvedValue(undefined),
      deleteDatabase: jest.fn().mockResolvedValue(undefined)
    };
  }

  static createAuthService(): IAuthService {
    return {
      authenticate: jest.fn().mockResolvedValue(mockUser),
      authorize: jest.fn().mockResolvedValue(true),
      refreshToken: jest.fn().mockResolvedValue(mockToken),
      revokeToken: jest.fn().mockResolvedValue(undefined)
    };
  }
}

// Usage in slice development
describe('Slice 5: Data Sync', () => {
  let syncService: SyncService;
  let mockYouTubeService: IYouTubeService;
  let mockNotionService: INotionService;

  beforeEach(() => {
    mockYouTubeService = MockServiceFactory.createYouTubeService();
    mockNotionService = MockServiceFactory.createNotionService();

    syncService = new SyncService(mockYouTubeService, mockNotionService);
  });

  it('should sync data successfully', async () => {
    // Test with mocked dependencies
    const result = await syncService.syncData('channel-id', 'workspace-id');

    expect(result.success).toBe(true);
    expect(mockYouTubeService.getAnalyticsData).toHaveBeenCalled();
    expect(mockNotionService.updateDatabase).toHaveBeenCalled();
  });
});
```

### **Strategy 5: API Gateway Pattern**

#### **API Gateway for External Dependencies**
```typescript
// Centralized API gateway to manage external service dependencies
class APIGateway {
  private rateLimiters = new Map<string, RateLimiter>();
  private circuitBreakers = new Map<string, CircuitBreaker>();

  async callYouTubeAPI(endpoint: string, params: any): Promise<any> {
    const rateLimiter = this.getRateLimiter('youtube');
    const circuitBreaker = this.getCircuitBreaker('youtube');

    await rateLimiter.acquire();

    try {
      return await circuitBreaker.execute(() =>
        this.youtubeClient.request(endpoint, params)
      );
    } catch (error) {
      if (error.name === 'CircuitBreakerOpenError') {
        // Fallback to cached data or mock response
        return this.getFallbackData('youtube', endpoint);
      }
      throw error;
    }
  }

  async callNotionAPI(endpoint: string, params: any): Promise<any> {
    const rateLimiter = this.getRateLimiter('notion');
    const circuitBreaker = this.getCircuitBreaker('notion');

    await rateLimiter.acquire();

    try {
      return await circuitBreaker.execute(() =>
        this.notionClient.request(endpoint, params)
      );
    } catch (error) {
      if (error.name === 'CircuitBreakerOpenError') {
        return this.getFallbackData('notion', endpoint);
      }
      throw error;
    }
  }

  private getFallbackData(service: string, endpoint: string): any {
    // Return cached data or mock responses when services are unavailable
    return this.cache.get(`${service}:${endpoint}`) || this.getMockData(service, endpoint);
  }
}
```

---

## 🔄 **Dependency Resolution Workflow**

### **Pre-Slice Development**
```typescript
// Before starting each slice, resolve dependencies
class DependencyResolver {
  async resolveSliceDependencies(sliceNumber: number): Promise<DependencyStatus> {
    const dependencies = this.getSliceDependencies(sliceNumber);
    const status: DependencyStatus = {
      ready: true,
      missing: [],
      warnings: []
    };

    for (const dep of dependencies) {
      if (!await this.isDependencyReady(dep)) {
        status.ready = false;
        status.missing.push(dep);
      }
    }

    return status;
  }

  private getSliceDependencies(sliceNumber: number): string[] {
    const dependencyMap = {
      1: [], // No dependencies
      2: ['auth', 'database'],
      3: ['auth', 'database', 'youtube-service'],
      4: ['auth', 'database', 'notion-service'],
      5: ['auth', 'database', 'youtube-service', 'notion-service'],
      6: ['auth', 'database'], // Compliance builds on existing
      7: ['auth', 'database', 'sync-service'],
      8: ['auth', 'database', 'analytics-service'],
      9: ['auth', 'database', 'billing-service'],
      10: [], // UX improvements
      11: ['auth', 'database', 'multi-channel-service'],
      12: [] // Production setup
    };

    return dependencyMap[sliceNumber] || [];
  }
}
```

### **Slice Development Process**
```typescript
// Enhanced slice development process with dependency management
class SliceDevelopmentProcess {
  async developSlice(sliceNumber: number): Promise<SliceResult> {
    // 1. Check dependencies
    const dependencyStatus = await this.dependencyResolver.resolveSliceDependencies(sliceNumber);
    if (!dependencyStatus.ready) {
      throw new Error(`Dependencies not ready: ${dependencyStatus.missing.join(', ')}`);
    }

    // 2. Set up slice environment
    await this.setupSliceEnvironment(sliceNumber);

    // 3. Implement slice with mocked dependencies
    const sliceResult = await this.implementSlice(sliceNumber);

    // 4. Run integration tests
    await this.runIntegrationTests(sliceNumber);

    // 5. Validate dependencies are working
    await this.validateDependencies(sliceNumber);

    return sliceResult;
  }

  private async setupSliceEnvironment(sliceNumber: number): Promise<void> {
    // Set up database migrations
    await this.migrationManager.migrateToVersion(this.getSliceVersion(sliceNumber));

    // Configure mock services
    await this.configureMockServices(sliceNumber);

    // Set up test data
    await this.setupTestData(sliceNumber);
  }
}
```

---

## 📊 **Dependency Monitoring & Validation**

### **Dependency Health Dashboard**
```typescript
// Monitor dependency health across slices
class DependencyMonitor {
  async getDependencyHealth(): Promise<DependencyHealthReport> {
    const services = ['auth', 'database', 'youtube', 'notion', 'sync'];
    const health: Record<string, ServiceHealth> = {};

    for (const service of services) {
      health[service] = await this.checkServiceHealth(service);
    }

    return {
      overall: this.calculateOverallHealth(health),
      services: health,
      recommendations: this.generateRecommendations(health)
    };
  }

  private async checkServiceHealth(service: string): Promise<ServiceHealth> {
    try {
      const startTime = Date.now();
      await this.pingService(service);
      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        responseTime,
        lastCheck: new Date(),
        uptime: await this.getServiceUptime(service)
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        lastCheck: new Date()
      };
    }
  }
}
```

### **Automated Dependency Testing**
```typescript
// Automated tests to validate dependencies between slices
describe('Dependency Integration Tests', () => {
  describe('Slice 2 → Slice 3 Integration', () => {
    it('should allow analytics import after channel connection', async () => {
      // Test that Slice 3 can work with Slice 2's channel data
      const channel = await channelService.connectChannel('user-id', 'channel-id');
      const analytics = await analyticsService.importAnalytics(channel.id);

      expect(analytics).toBeDefined();
      expect(analytics.channelId).toBe(channel.id);
    });
  });

  describe('Slice 4 → Slice 5 Integration', () => {
    it('should allow data sync after Notion database creation', async () => {
      // Test that Slice 5 can work with Slice 4's Notion integration
      const workspace = await notionService.connectWorkspace('user-id', 'workspace-id');
      const database = await notionService.createDatabase(workspace.id, mockSchema);
      const syncResult = await syncService.syncData('channel-id', database.id);

      expect(syncResult.success).toBe(true);
    });
  });
});
```

---

## 🎯 **Implementation Checklist**

### **Pre-Development Setup**
- [ ] Set up dependency injection container
- [ ] Configure mock service factories
- [ ] Set up database migration system
- [ ] Create API gateway for external services
- [ ] Implement dependency monitoring

### **Per-Slice Process**
- [ ] Check slice dependencies before development
- [ ] Set up slice environment with migrations
- [ ] Configure mock services for development
- [ ] Implement slice with dependency interfaces
- [ ] Run integration tests with real dependencies
- [ ] Validate all dependencies are working

### **Post-Slice Validation**
- [ ] Run dependency health checks
- [ ] Execute integration tests
- [ ] Update dependency documentation
- [ ] Monitor for dependency-related issues
- [ ] Plan for next slice dependencies

---

This comprehensive dependency management strategy ensures that the vertical slice approach can be executed successfully without dependency conflicts, while maintaining the benefits of rapid development and immediate value delivery.

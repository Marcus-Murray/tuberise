# Compliance AI Workflow Guide

## Overview
This guide optimizes the compliance documentation for AI-assisted coding workflows, providing clear context, implementation patterns, and decision trees for AI tools.

## 🤖 AI Coding Context

### Service Architecture Patterns
```typescript
// Pattern: Compliance Service Base Class
abstract class BaseComplianceService {
  protected abstract validateCompliance(data: any): Promise<ComplianceResult>;
  protected abstract logActivity(action: string, metadata: any): Promise<void>;

  async processRequest<T>(data: any, handler: (data: any) => Promise<T>): Promise<ApiResponse<T>> {
    // Common compliance logic
    const validation = await this.validateCompliance(data);
    if (!validation.valid) {
      await this.logActivity('validation_failed', { data, validation });
      return { success: false, error: validation.error };
    }

    const result = await handler(data);
    await this.logActivity('request_processed', { data, result });
    return { success: true, data: result };
  }
}

// Pattern: Specific Service Implementation
export class GDPRComplianceService extends BaseComplianceService {
  protected async validateCompliance(data: any): Promise<ComplianceResult> {
    // GDPR-specific validation
  }

  protected async logActivity(action: string, metadata: any): Promise<void> {
    // GDPR-specific logging
  }
}
```

### Error Handling Patterns
```typescript
// Pattern: Compliance Error Types
export enum ComplianceErrorType {
  VALIDATION_FAILED = 'validation_failed',
  QUOTA_EXCEEDED = 'quota_exceeded',
  RATE_LIMIT_HIT = 'rate_limit_hit',
  DATA_NOT_FOUND = 'data_not_found',
  UNAUTHORIZED_ACCESS = 'unauthorized_access'
}

// Pattern: Standardized Error Response
export interface ComplianceError {
  type: ComplianceErrorType;
  message: string;
  details?: any;
  retryable: boolean;
  retryAfter?: number;
}
```

### Configuration Patterns
```typescript
// Pattern: Compliance Configuration
export interface ComplianceConfig {
  gdpr: {
    dataRetentionDays: number;
    deletionGracePeriod: number;
    auditLogRetention: number;
  };
  api: {
    youtube: {
      dailyQuota: number;
      rateLimitPerSecond: number;
      warningThreshold: number;
    };
    notion: {
      rateLimitPerSecond: number;
      burstLimit: number;
    };
  };
  bias: {
    assessmentThreshold: number;
    mitigationEffectivenessTarget: number;
    monitoringFrequency: number;
  };
}
```

## 🎯 Implementation Decision Trees

### GDPR Compliance Decision Tree
```
User Request → Data Type?
├── Personal Data → Right Type?
│   ├── Access → Export Format?
│   │   ├── JSON → Generate JSON Export
│   │   └── CSV → Generate CSV Export
│   ├── Rectification → Field Validation?
│   │   ├── Valid → Update & Log
│   │   └── Invalid → Return Error
│   ├── Erasure → Confirmation Required?
│   │   ├── Yes → Send Confirmation
│   │   └── No → Delete & Schedule Cleanup
│   └── Portability → Format?
│       └── Machine Readable → Generate Export
└── Analytics Data → Retention Check?
    ├── Within 30 Days → Allow Access
    └── Beyond 30 Days → Delete or Anonymize
```

### API Compliance Decision Tree
```
API Request → Service Type?
├── YouTube → Quota Check?
│   ├── Available → Rate Limit Check?
│   │   ├── Within Limit → Process Request
│   │   └── Exceeded → Queue & Retry
│   └── Exceeded → Return Quota Error
└── Notion → Rate Limit Check?
    ├── Within 3 req/sec → Process Request
    └── Exceeded → Wait & Retry
```

### Bias Detection Decision Tree
```
Analytics Data → Bias Type?
├── Content Type → Distribution Analysis
│   ├── Balanced → Continue
│   └── Skewed → Generate Diversification Plan
├── Temporal → Time Pattern Analysis
│   ├── Even Distribution → Continue
│   └── Concentrated → Suggest Schedule Changes
├── Demographic → Audience Analysis
│   ├── Representative → Continue
│   └── Underrepresented → Create Expansion Strategy
└── Recommendation → Filter Bubble Detection
    ├── Diverse → Continue
    └── Narrow → Implement Diversity Measures
```

## 📋 AI Coding Prompts

### Service Creation Prompts
```
Create a new compliance service that:
1. Extends BaseComplianceService
2. Implements [SPECIFIC_COMPLIANCE_TYPE]
3. Handles [SPECIFIC_DATA_TYPE]
4. Includes proper error handling
5. Has comprehensive logging
6. Follows the established patterns

Context: [SERVICE_CONTEXT]
Requirements: [SPECIFIC_REQUIREMENTS]
```

### Testing Prompts
```
Create comprehensive tests for [SERVICE_NAME]:
1. Unit tests for all methods
2. Integration tests for API endpoints
3. Error scenario testing
4. Compliance validation testing
5. Performance testing
6. Security testing

Test Coverage: 90%+
Framework: Jest
Pattern: AAA (Arrange, Act, Assert)
```

### Documentation Prompts
```
Generate documentation for [COMPONENT_NAME]:
1. API reference with examples
2. Usage patterns and best practices
3. Error handling scenarios
4. Configuration options
5. Integration examples
6. Troubleshooting guide

Format: Markdown
Audience: Developers using AI assistance
```

## 🔧 Code Generation Templates

### Service Template
```typescript
// Template: Compliance Service
export class [ServiceName]ComplianceService extends BaseComplianceService {
  constructor(private config: ComplianceConfig) {
    super();
  }

  async [mainMethod](params: [ParamsType]): Promise<ApiResponse<[ReturnType]>> {
    return this.processRequest(params, async (data) => {
      // Implementation logic
    });
  }

  protected async validateCompliance(data: any): Promise<ComplianceResult> {
    // Validation logic
  }

  protected async logActivity(action: string, metadata: any): Promise<void> {
    // Logging logic
  }
}
```

### Controller Template
```typescript
// Template: Compliance Controller
export class [ServiceName]Controller {
  constructor(private service: [ServiceName]ComplianceService) {}

  async [endpointMethod](req: Request, res: Response): Promise<void> {
    try {
      const result = await this.service.[serviceMethod](req.params);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(this.getErrorStatus(result.error)).json(result);
      }
    } catch (error) {
      this.handleError(error, res);
    }
  }
}
```

### Component Template
```typescript
// Template: React Compliance Component
export const [ComponentName]: React.FC<[PropsType]> = ({ ...props }) => {
  const [state, setState] = useState<[StateType]>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async () => {
    setLoading(true);
    try {
      const result = await api.[endpoint](params);
      setState(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="compliance-component">
      {/* Component JSX */}
    </div>
  );
};
```

## 🎯 Context for AI Tools

### Project Context
```
Project: Tuberise Analytics
Architecture: Monorepo with TypeScript, React, Express, Prisma
Compliance Focus: GDPR, CCPA, YouTube API, Notion API, AI Bias Detection
Security: OAuth 2.0, JWT, AES-256 encryption, rate limiting
Database: PostgreSQL with Prisma ORM
Deployment: Node.js, Docker-ready
```

### Coding Standards
```
TypeScript: Strict mode, explicit types, no any
Testing: Jest, 90%+ coverage, AAA pattern
Documentation: JSDoc for functions, README for modules
Error Handling: Custom error types, standardized responses
Logging: Structured logging with correlation IDs
Security: Input validation, output sanitization, audit trails
```

### Integration Patterns
```
API Design: RESTful, OpenAPI/Swagger documentation
Authentication: JWT tokens, refresh token rotation
Authorization: Role-based access control
Rate Limiting: Token bucket algorithm
Caching: Redis for session data, database query caching
Monitoring: Prometheus metrics, structured logging
```

This guide provides the context and patterns needed for AI-assisted development of compliance features.

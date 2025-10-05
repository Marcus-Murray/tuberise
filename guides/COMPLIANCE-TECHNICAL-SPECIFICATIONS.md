# Compliance Technical Specifications

## Overview
This document provides detailed technical specifications for implementing compliance features in Tuberise Analytics, optimized for AI-assisted development.

## 🏗️ System Architecture

### Service Layer Architecture
```typescript
// Core compliance service interfaces
export interface IComplianceService {
  validate(data: any): Promise<ComplianceResult>;
  process(data: any): Promise<ProcessingResult>;
  audit(action: string, metadata: any): Promise<void>;
}

export interface ComplianceResult {
  valid: boolean;
  violations: ComplianceViolation[];
  warnings: ComplianceWarning[];
  metadata: Record<string, any>;
}

export interface ProcessingResult {
  success: boolean;
  data?: any;
  error?: ComplianceError;
  auditTrail: AuditEntry[];
}
```

### Database Schema Extensions
```sql
-- Compliance audit table
CREATE TABLE compliance_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_type VARCHAR(50) NOT NULL, -- 'gdpr', 'api', 'bias'
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  request_metadata JSONB,
  response_metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(255),
  correlation_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP -- For automatic cleanup
);

-- Bias assessment results
CREATE TABLE bias_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id VARCHAR(100) NOT NULL,
  assessment_type VARCHAR(50) NOT NULL, -- 'content', 'temporal', 'demographic', 'recommendation'
  bias_score DECIMAL(5,2) NOT NULL CHECK (bias_score >= 0 AND bias_score <= 100),
  assessment_data JSONB NOT NULL,
  recommendations JSONB,
  mitigation_plan JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '90 days')
);

-- API usage tracking
CREATE TABLE api_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_type VARCHAR(50) NOT NULL, -- 'youtube', 'notion'
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  quota_cost INTEGER NOT NULL DEFAULT 1,
  response_code INTEGER NOT NULL,
  response_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Data retention policies
CREATE TABLE data_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_type VARCHAR(50) NOT NULL, -- 'user_data', 'analytics', 'audit_log'
  retention_days INTEGER NOT NULL,
  auto_delete BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Compliance violations
CREATE TABLE compliance_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  violation_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  metadata JSONB,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP,
  resolved_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔧 Implementation Specifications

### GDPR Compliance Implementation
```typescript
// GDPR Compliance Service Specification
export class GDPRComplianceService implements IComplianceService {
  private readonly dataRetentionDays = 30;
  private readonly auditLogRetentionDays = 90;

  async validate(data: any): Promise<ComplianceResult> {
    const violations: ComplianceViolation[] = [];
    const warnings: ComplianceWarning[] = [];

    // Validate data minimization
    if (this.hasExcessiveData(data)) {
      violations.push({
        type: 'data_minimization',
        severity: 'high',
        message: 'Data collection exceeds minimum necessary requirements'
      });
    }

    // Validate consent
    if (!this.hasValidConsent(data)) {
      violations.push({
        type: 'consent',
        severity: 'critical',
        message: 'No valid consent for data processing'
      });
    }

    return {
      valid: violations.length === 0,
      violations,
      warnings,
      metadata: {
        dataTypes: this.extractDataTypes(data),
        processingPurposes: this.extractProcessingPurposes(data)
      }
    };
  }

  async process(data: any): Promise<ProcessingResult> {
    const auditTrail: AuditEntry[] = [];

    try {
      // Log data access
      auditTrail.push(await this.logDataAccess(data));

      // Process based on request type
      const result = await this.routeRequest(data);

      // Log processing completion
      auditTrail.push(await this.logProcessingCompletion(data, result));

      return {
        success: true,
        data: result,
        auditTrail
      };
    } catch (error) {
      auditTrail.push(await this.logError(data, error));

      return {
        success: false,
        error: this.createComplianceError(error),
        auditTrail
      };
    }
  }

  async audit(action: string, metadata: any): Promise<void> {
    await this.db.complianceAuditLog.create({
      data: {
        serviceType: 'gdpr',
        action,
        metadata,
        correlationId: this.generateCorrelationId(),
        expiresAt: new Date(Date.now() + this.auditLogRetentionDays * 24 * 60 * 60 * 1000)
      }
    });
  }

  // Specific GDPR rights implementations
  async getUserData(userId: string): Promise<UserDataExport> {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      include: {
        youtubeChannels: true,
        syncLogs: true
      }
    });

    if (!user) {
      throw new ComplianceError('User not found', 'DATA_NOT_FOUND');
    }

    // Get analytics data
    const analyticsData = await this.getUserAnalyticsData(userId);

    return {
      personalData: {
        id: user.id,
        email: user.email,
        googleId: user.googleId,
        subscriptionTier: user.subscriptionTier,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      analyticsData,
      processingActivities: await this.getProcessingActivities(userId),
      dataCategories: await this.getDataCategories(userId),
      thirdPartySharing: await this.getThirdPartySharing(userId)
    };
  }

  async deleteUserData(userId: string, reason?: string): Promise<DeletionResult> {
    const deletionRequest = await this.createDeletionRequest(userId, reason);

    // Schedule deletion after grace period
    await this.scheduleDataDeletion(userId, this.dataRetentionDays);

    // Log deletion request
    await this.audit('data_deletion_requested', {
      userId,
      reason,
      deletionId: deletionRequest.id,
      scheduledDeletionDate: new Date(Date.now() + this.dataRetentionDays * 24 * 60 * 60 * 1000)
    });

    return {
      deletionId: deletionRequest.id,
      scheduledDeletionDate: new Date(Date.now() + this.dataRetentionDays * 24 * 60 * 60 * 1000),
      confirmationRequired: true
    };
  }

  private async scheduleDataDeletion(userId: string, days: number): Promise<void> {
    // Implementation would use a job queue (Bull, Agenda, etc.)
    await this.jobQueue.add('deleteUserData', {
      userId,
      deletionDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    }, {
      delay: days * 24 * 60 * 60 * 1000
    });
  }
}
```

### API Compliance Implementation
```typescript
// API Compliance Service Specification
export class APIComplianceService implements IComplianceService {
  private readonly youtubeQuotaLimit = 10000;
  private readonly youtubeRateLimit = 100; // requests per second
  private readonly notionRateLimit = 3; // requests per second

  async validate(data: any): Promise<ComplianceResult> {
    const violations: ComplianceViolation[] = [];

    // Check quota usage
    const quotaStatus = await this.checkQuotaUsage(data.userId);
    if (quotaStatus.percentage > 90) {
      violations.push({
        type: 'quota_exceeded',
        severity: 'high',
        message: `Quota usage at ${quotaStatus.percentage}%`
      });
    }

    // Check rate limiting
    const rateLimitStatus = await this.checkRateLimit(data.userId, data.service);
    if (rateLimitStatus.exceeded) {
      violations.push({
        type: 'rate_limit_exceeded',
        severity: 'medium',
        message: `Rate limit exceeded for ${data.service}`
      });
    }

    return {
      valid: violations.length === 0,
      violations,
      warnings: [],
      metadata: { quotaStatus, rateLimitStatus }
    };
  }

  async process(data: any): Promise<ProcessingResult> {
    const auditTrail: AuditEntry[] = [];

    try {
      // Enforce rate limiting
      await this.enforceRateLimit(data.userId, data.service);

      // Track quota usage
      await this.trackQuotaUsage(data.userId, data.service, data.quotaCost);

      // Process request
      const result = await this.executeRequest(data);

      // Log successful request
      auditTrail.push(await this.logAPICall(data, result, 200));

      return {
        success: true,
        data: result,
        auditTrail
      };
    } catch (error) {
      auditTrail.push(await this.logAPICall(data, null, error.status || 500, error.message));

      return {
        success: false,
        error: this.createComplianceError(error),
        auditTrail
      };
    }
  }

  async audit(action: string, metadata: any): Promise<void> {
    await this.db.complianceAuditLog.create({
      data: {
        serviceType: 'api',
        action,
        metadata,
        correlationId: this.generateCorrelationId()
      }
    });
  }

  private async enforceRateLimit(userId: string, service: string): Promise<void> {
    const key = `rate_limit:${userId}:${service}`;
    const limit = service === 'youtube' ? this.youtubeRateLimit : this.notionRateLimit;

    const current = await this.redis.incr(key);
    if (current === 1) {
      await this.redis.expire(key, 1); // 1 second window
    }

    if (current > limit) {
      const ttl = await this.redis.ttl(key);
      throw new ComplianceError(
        `Rate limit exceeded for ${service}`,
        'RATE_LIMIT_EXCEEDED',
        { retryAfter: ttl }
      );
    }
  }

  private async trackQuotaUsage(userId: string, service: string, cost: number): Promise<void> {
    if (service !== 'youtube') return;

    const key = `quota:${userId}:${this.getCurrentDate()}`;
    const usage = await this.redis.incrby(key, cost);

    if (usage === cost) {
      await this.redis.expire(key, 24 * 60 * 60); // 24 hours
    }

    // Check if approaching limit
    if (usage > this.youtubeQuotaLimit * 0.8) {
      await this.notifyQuotaWarning(userId, usage, this.youtubeQuotaLimit);
    }
  }
}
```

### Bias Detection Implementation
```typescript
// Bias Detection Service Specification
export class BiasDetectionService implements IComplianceService {
  private readonly biasThreshold = 70; // 70% bias score threshold
  private readonly assessmentTypes = ['content', 'temporal', 'demographic', 'recommendation'];

  async validate(data: any): Promise<ComplianceResult> {
    const violations: ComplianceViolation[] = [];
    const warnings: ComplianceWarning[] = [];

    // Check if bias assessment is required
    const lastAssessment = await this.getLastBiasAssessment(data.channelId);
    const daysSinceLastAssessment = lastAssessment
      ? this.getDaysDifference(new Date(), lastAssessment.createdAt)
      : 999;

    if (daysSinceLastAssessment > 30) {
      warnings.push({
        type: 'bias_assessment_overdue',
        severity: 'medium',
        message: 'Bias assessment is overdue (>30 days)'
      });
    }

    return {
      valid: violations.length === 0,
      violations,
      warnings,
      metadata: {
        lastAssessment,
        daysSinceLastAssessment
      }
    };
  }

  async process(data: any): Promise<ProcessingResult> {
    const auditTrail: AuditEntry[] = [];

    try {
      // Run bias assessments
      const assessments = await this.runBiasAssessments(data.channelId, data.analyticsData);

      // Calculate overall bias score
      const overallScore = this.calculateOverallBiasScore(assessments);

      // Generate recommendations if bias detected
      let recommendations = null;
      let mitigationPlan = null;

      if (overallScore > this.biasThreshold) {
        recommendations = await this.generateRecommendations(assessments);
        mitigationPlan = await this.createMitigationPlan(assessments, recommendations);
      }

      // Store assessment results
      const assessment = await this.storeBiasAssessment({
        channelId: data.channelId,
        assessments,
        overallScore,
        recommendations,
        mitigationPlan
      });

      auditTrail.push(await this.logBiasAssessment(data.channelId, assessment));

      return {
        success: true,
        data: {
          assessment,
          overallScore,
          recommendations,
          mitigationPlan
        },
        auditTrail
      };
    } catch (error) {
      auditTrail.push(await this.logError(data, error));

      return {
        success: false,
        error: this.createComplianceError(error),
        auditTrail
      };
    }
  }

  async audit(action: string, metadata: any): Promise<void> {
    await this.db.complianceAuditLog.create({
      data: {
        serviceType: 'bias',
        action,
        metadata,
        correlationId: this.generateCorrelationId()
      }
    });
  }

  private async runBiasAssessments(channelId: string, analyticsData: any): Promise<BiasAssessment[]> {
    const assessments: BiasAssessment[] = [];

    for (const type of this.assessmentTypes) {
      const assessment = await this.assessBiasByType(type, analyticsData);
      assessments.push({
        type,
        score: assessment.score,
        details: assessment.details,
        recommendations: assessment.recommendations
      });
    }

    return assessments;
  }

  private async assessBiasByType(type: string, data: any): Promise<BiasAssessment> {
    switch (type) {
      case 'content':
        return this.assessContentTypeBias(data);
      case 'temporal':
        return this.assessTemporalBias(data);
      case 'demographic':
        return this.assessDemographicBias(data);
      case 'recommendation':
        return this.assessRecommendationBias(data);
      default:
        throw new Error(`Unknown bias assessment type: ${type}`);
    }
  }

  private async assessContentTypeBias(data: any): Promise<BiasAssessment> {
    const categories = data.categories || {};
    const totalVideos = Object.values(categories).reduce((sum: number, count: any) => sum + count, 0);

    if (totalVideos === 0) {
      return {
        type: 'content',
        score: 0,
        details: { message: 'No content data available' },
        recommendations: []
      };
    }

    // Calculate Gini coefficient for content distribution
    const distribution = Object.values(categories).map(count => (count as number) / totalVideos);
    const giniCoefficient = this.calculateGiniCoefficient(distribution);
    const biasScore = giniCoefficient * 100;

    const recommendations = [];
    if (biasScore > this.biasThreshold) {
      recommendations.push('Diversify content categories');
      recommendations.push('Create content in underrepresented categories');
    }

    return {
      type: 'content',
      score: biasScore,
      details: {
        categories,
        distribution,
        giniCoefficient,
        dominantCategories: this.getDominantCategories(categories),
        underrepresentedCategories: this.getUnderrepresentedCategories(categories)
      },
      recommendations
    };
  }

  private calculateGiniCoefficient(values: number[]): number {
    const sortedValues = values.sort((a, b) => a - b);
    const n = sortedValues.length;
    const sum = sortedValues.reduce((acc, val) => acc + val, 0);

    let gini = 0;
    for (let i = 0; i < n; i++) {
      gini += (2 * (i + 1) - n - 1) * sortedValues[i];
    }

    return sum === 0 ? 0 : gini / (n * sum);
  }
}
```

## 🔒 Security Implementation

### Authentication & Authorization
```typescript
// Security middleware specification
export class ComplianceSecurityMiddleware {
  async authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = this.extractToken(req);
      const decoded = await this.verifyToken(token);

      req.user = await this.getUser(decoded.userId);
      req.correlationId = this.generateCorrelationId();

      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
  }

  async authorize(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resourceType = req.params.resourceType;
      const resourceId = req.params.resourceId;
      const userId = req.user.id;

      const hasAccess = await this.checkResourceAccess(userId, resourceType, resourceId);

      if (!hasAccess) {
        res.status(403).json({
          success: false,
          error: 'Access denied'
        });
        return;
      }

      next();
    } catch (error) {
      res.status(403).json({
        success: false,
        error: 'Authorization failed'
      });
    }
  }

  async audit(req: Request, res: Response, next: NextFunction): Promise<void> {
    const startTime = Date.now();

    res.on('finish', async () => {
      const duration = Date.now() - startTime;

      await this.logRequest({
        correlationId: req.correlationId,
        userId: req.user?.id,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
    });

    next();
  }
}
```

### Data Encryption
```typescript
// Encryption service specification
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;

  async encrypt(data: any, keyId: string): Promise<EncryptedData> {
    const key = await this.getEncryptionKey(keyId);
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipher(this.algorithm, key);

    cipher.setAAD(Buffer.from(keyId));

    const plaintext = Buffer.from(JSON.stringify(data));
    const ciphertext = Buffer.concat([
      cipher.update(plaintext),
      cipher.final()
    ]);

    const tag = cipher.getAuthTag();

    return {
      data: ciphertext.toString('base64'),
      iv: iv.toString('base64'),
      tag: tag.toString('base64'),
      keyId,
      algorithm: this.algorithm
    };
  }

  async decrypt(encryptedData: EncryptedData): Promise<any> {
    const key = await this.getEncryptionKey(encryptedData.keyId);
    const decipher = crypto.createDecipher(
      encryptedData.algorithm,
      key
    );

    decipher.setAAD(Buffer.from(encryptedData.keyId));
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'base64'));

    const ciphertext = Buffer.from(encryptedData.data, 'base64');
    const plaintext = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final()
    ]);

    return JSON.parse(plaintext.toString());
  }

  private async getEncryptionKey(keyId: string): Promise<Buffer> {
    // Implementation would retrieve key from secure key management system
    const key = await this.keyManagement.getKey(keyId);
    return Buffer.from(key, 'base64');
  }
}
```

This technical specification provides the detailed implementation guidance needed for AI-assisted development of compliance features.

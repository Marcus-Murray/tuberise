# API Documentation - Tuberise Analytics

## 🔌 API Overview

The Tuberise Analytics API provides comprehensive access to YouTube analytics data, AI-powered insights, and Notion integration capabilities. Built with RESTful principles and GraphQL support for complex queries.

## 🎯 Base Information

### **Base URLs**

- **Production:** `https://api.tuberise.com/v1`
- **Staging:** `https://api-staging.tuberise.com/v1`
- **Development:** `http://localhost:3001/api/v1`

### **Authentication**

All API requests require authentication using JWT tokens in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### **Rate Limiting**

- **Free Tier:** 100 requests/hour
- **Pro Tier:** 1,000 requests/hour
- **Enterprise:** 10,000 requests/hour

### **Response Format**

All responses are in JSON format with the following structure:

```json
{
  "success": true,
  "data": {},
  "meta": {
    "timestamp": "2025-10-05T12:00:00Z",
    "request_id": "req_123456789"
  },
  "error": null
}
```

## 🔐 Authentication Endpoints

### **POST /auth/login**

Authenticate user and receive JWT token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "subscription_tier": "pro"
    },
    "tokens": {
      "access_token": "jwt_access_token",
      "refresh_token": "jwt_refresh_token",
      "expires_in": 3600
    }
  }
}
```

### **POST /auth/register**

Register a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

### **POST /auth/refresh**

Refresh access token using refresh token.

**Request Body:**

```json
{
  "refresh_token": "jwt_refresh_token"
}
```

### **POST /auth/logout**

Logout user and invalidate tokens.

**Headers:**

```http
Authorization: Bearer <access_token>
```

## 👤 User Management Endpoints

### **GET /users/me**

Get current user profile information.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "subscription_tier": "pro",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-10-05T12:00:00Z"
  }
}
```

### **PUT /users/me**

Update user profile information.

**Request Body:**

```json
{
  "name": "John Smith",
  "preferences": {
    "notifications": true,
    "timezone": "America/New_York"
  }
}
```

### **GET /users/me/subscription**

Get user subscription information.

**Response:**

```json
{
  "success": true,
  "data": {
    "tier": "pro",
    "status": "active",
    "billing_cycle": "monthly",
    "current_period_end": "2025-11-05T00:00:00Z",
    "features": {
      "analytics": true,
      "ai_insights": true,
      "notion_integration": true,
      "api_access": true
    }
  }
}
```

## 📺 YouTube Channel Endpoints

### **GET /channels**

Get list of connected YouTube channels.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**

```json
{
  "success": true,
  "data": {
    "channels": [
      {
        "id": "channel_123",
        "youtube_channel_id": "UC1234567890",
        "name": "My YouTube Channel",
        "subscriber_count": 10000,
        "view_count": 1000000,
        "video_count": 150,
        "connected_at": "2025-01-01T00:00:00Z",
        "last_sync": "2025-10-05T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

### **POST /channels/connect**

Connect a new YouTube channel.

**Request Body:**

```json
{
  "youtube_channel_id": "UC1234567890",
  "access_token": "youtube_access_token"
}
```

### **GET /channels/{channel_id}**

Get detailed information about a specific channel.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "channel_123",
    "youtube_channel_id": "UC1234567890",
    "name": "My YouTube Channel",
    "description": "Channel description",
    "subscriber_count": 10000,
    "view_count": 1000000,
    "video_count": 150,
    "thumbnail_url": "https://yt3.ggpht.com/...",
    "connected_at": "2025-01-01T00:00:00Z",
    "last_sync": "2025-10-05T12:00:00Z"
  }
}
```

### **DELETE /channels/{channel_id}**

Disconnect a YouTube channel.

## 📊 Analytics Endpoints

### **GET /analytics/channels/{channel_id}/overview**

Get channel overview analytics.

**Query Parameters:**

- `start_date` (required): Start date (ISO 8601)
- `end_date` (required): End date (ISO 8601)
- `granularity` (optional): daily, weekly, monthly (default: daily)

**Response:**

```json
{
  "success": true,
  "data": {
    "period": {
      "start_date": "2025-10-01T00:00:00Z",
      "end_date": "2025-10-05T23:59:59Z",
      "granularity": "daily"
    },
    "metrics": {
      "subscribers": {
        "total": 10000,
        "change": 150,
        "change_percentage": 1.52
      },
      "views": {
        "total": 50000,
        "change": 5000,
        "change_percentage": 11.11
      },
      "watch_time": {
        "total": 1250000,
        "change": 125000,
        "change_percentage": 11.11
      },
      "engagement": {
        "likes": 2500,
        "comments": 150,
        "shares": 75
      }
    },
    "daily_data": [
      {
        "date": "2025-10-01",
        "subscribers": 9850,
        "views": 8000,
        "watch_time": 200000,
        "engagement_rate": 0.05
      }
    ]
  }
}
```

### **GET /analytics/channels/{channel_id}/videos**

Get video analytics for a channel.

**Query Parameters:**

- `start_date` (required): Start date (ISO 8601)
- `end_date` (required): End date (ISO 8601)
- `sort_by` (optional): views, likes, comments, published_at (default: views)
- `sort_order` (optional): asc, desc (default: desc)
- `limit` (optional): Number of videos (default: 20)

**Response:**

```json
{
  "success": true,
  "data": {
    "videos": [
      {
        "id": "video_123",
        "youtube_video_id": "dQw4w9WgXcQ",
        "title": "My Amazing Video",
        "published_at": "2025-10-01T12:00:00Z",
        "metrics": {
          "views": 10000,
          "likes": 500,
          "comments": 50,
          "shares": 25,
          "watch_time": 250000,
          "engagement_rate": 0.0575
        },
        "thumbnail_url": "https://i.ytimg.com/vi/...",
        "duration": "3:32"
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 20
  }
}
```

### **GET /analytics/channels/{channel_id}/audience**

Get audience analytics for a channel.

**Query Parameters:**

- `start_date` (required): Start date (ISO 8601)
- `end_date` (required): End date (ISO 8601)

**Response:**

```json
{
  "success": true,
  "data": {
    "demographics": {
      "age_groups": [
        { "age_group": "18-24", "percentage": 35.5 },
        { "age_group": "25-34", "percentage": 28.3 },
        { "age_group": "35-44", "percentage": 18.7 }
      ],
      "gender": [
        { "gender": "male", "percentage": 58.2 },
        { "gender": "female", "percentage": 41.8 }
      ]
    },
    "geography": {
      "top_countries": [
        { "country": "United States", "percentage": 45.2 },
        { "country": "United Kingdom", "percentage": 12.8 },
        { "country": "Canada", "percentage": 8.5 }
      ]
    },
    "devices": {
      "mobile": 45.2,
      "desktop": 35.8,
      "tablet": 19.0
    }
  }
}
```

## 🤖 AI Insights Endpoints

### **GET /insights/channels/{channel_id}**

Get AI-generated insights for a channel.

**Query Parameters:**

- `type` (optional): content, timing, audience, growth (default: all)
- `limit` (optional): Number of insights (default: 10)

**Response:**

```json
{
  "success": true,
  "data": {
    "insights": [
      {
        "id": "insight_123",
        "type": "content",
        "title": "High-Performing Content Topics",
        "description": "Your videos about 'tutorials' and 'reviews' perform 40% better than average.",
        "confidence": 0.85,
        "action_items": [
          "Create more tutorial content",
          "Focus on product reviews",
          "Consider tutorial series"
        ],
        "impact": "high",
        "generated_at": "2025-10-05T12:00:00Z"
      }
    ],
    "summary": {
      "total_insights": 15,
      "high_impact": 5,
      "medium_impact": 7,
      "low_impact": 3
    }
  }
}
```

### **POST /insights/channels/{channel_id}/generate**

Generate new AI insights for a channel.

**Request Body:**

```json
{
  "types": ["content", "timing", "audience"],
  "time_period": {
    "start_date": "2025-09-01T00:00:00Z",
    "end_date": "2025-10-01T00:00:00Z"
  }
}
```

### **GET /insights/channels/{channel_id}/recommendations**

Get content recommendations based on AI analysis.

**Response:**

```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "id": "rec_123",
        "type": "topic",
        "title": "Create a video about 'AI Tools for Content Creators'",
        "description": "This topic aligns with your audience interests and trending keywords.",
        "confidence": 0.92,
        "expected_performance": {
          "views": "15000-25000",
          "engagement_rate": "0.06-0.08"
        },
        "keywords": ["AI tools", "content creation", "productivity"],
        "trending": true
      }
    ]
  }
}
```

## 📝 Notion Integration Endpoints

### **GET /notion/workspaces**

Get connected Notion workspaces.

**Response:**

```json
{
  "success": true,
  "data": {
    "workspaces": [
      {
        "id": "workspace_123",
        "notion_workspace_id": "notion_ws_123",
        "name": "My Content Workspace",
        "connected_at": "2025-01-01T00:00:00Z",
        "last_sync": "2025-10-05T12:00:00Z"
      }
    ]
  }
}
```

### **POST /notion/workspaces/connect**

Connect a new Notion workspace.

**Request Body:**

```json
{
  "access_token": "notion_access_token",
  "workspace_id": "notion_ws_123"
}
```

### **POST /notion/sync/channels/{channel_id}**

Sync channel analytics to Notion workspace.

**Request Body:**

```json
{
  "workspace_id": "workspace_123",
  "database_id": "notion_db_123",
  "sync_type": "analytics",
  "frequency": "daily"
}
```

### **GET /notion/templates**

Get available Notion templates.

**Response:**

```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "template_123",
        "name": "Content Planning Template",
        "description": "Comprehensive template for content planning and analytics",
        "category": "content_planning",
        "features": [
          "Content calendar",
          "Analytics tracking",
          "Performance metrics"
        ],
        "preview_url": "https://notion.so/template/123"
      }
    ]
  }
}
```

## 📊 Reporting Endpoints

### **GET /reports**

Get list of generated reports.

**Query Parameters:**

- `type` (optional): analytics, insights, custom
- `status` (optional): pending, completed, failed
- `page` (optional): Page number (default: 1)

**Response:**

```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "report_123",
        "name": "Monthly Analytics Report",
        "type": "analytics",
        "status": "completed",
        "created_at": "2025-10-01T00:00:00Z",
        "download_url": "https://api.tuberise.com/reports/123/download"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "pages": 1
    }
  }
}
```

### **POST /reports/generate**

Generate a new report.

**Request Body:**

```json
{
  "name": "Weekly Performance Report",
  "type": "analytics",
  "channels": ["channel_123"],
  "time_period": {
    "start_date": "2025-10-01T00:00:00Z",
    "end_date": "2025-10-07T23:59:59Z"
  },
  "format": "pdf",
  "include_insights": true
}
```

### **GET /reports/{report_id}/download**

Download a generated report.

**Response:** Binary file download

## 🔔 Webhook Endpoints

### **POST /webhooks**

Create a new webhook.

**Request Body:**

```json
{
  "url": "https://your-app.com/webhook",
  "events": ["analytics.updated", "insights.generated"],
  "secret": "your_webhook_secret"
}
```

### **GET /webhooks**

Get list of configured webhooks.

### **PUT /webhooks/{webhook_id}**

Update webhook configuration.

### **DELETE /webhooks/{webhook_id}**

Delete a webhook.

## 📈 GraphQL Endpoint

### **POST /graphql**

GraphQL endpoint for complex queries.

**Example Query:**

```graphql
query GetChannelAnalytics(
  $channelId: ID!
  $startDate: String!
  $endDate: String!
) {
  channel(id: $channelId) {
    name
    analytics(startDate: $startDate, endDate: $endDate) {
      subscribers {
        total
        change
      }
      videos {
        id
        title
        views
        engagement
      }
    }
    insights {
      content {
        recommendations
        performance
      }
    }
  }
}
```

**Variables:**

```json
{
  "channelId": "channel_123",
  "startDate": "2025-10-01",
  "endDate": "2025-10-05"
}
```

## 🚨 Error Handling

### **Error Response Format**

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  },
  "meta": {
    "timestamp": "2025-10-05T12:00:00Z",
    "request_id": "req_123456789"
  }
}
```

### **Common Error Codes**

- `UNAUTHORIZED` - Invalid or missing authentication
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid request parameters
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error

## 📚 SDKs and Libraries

### **JavaScript/TypeScript**

```bash
npm install @tuberise/analytics-sdk
```

```javascript
import { TuberiseAnalytics } from '@tuberise/analytics-sdk';

const client = new TuberiseAnalytics({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.tuberise.com/v1',
});

// Get channel analytics
const analytics = await client.analytics.getChannelOverview('channel_123', {
  startDate: '2025-10-01',
  endDate: '2025-10-05',
});
```

### **Python**

```bash
pip install tuberise-analytics
```

```python
from tuberise_analytics import TuberiseAnalytics

client = TuberiseAnalytics(api_key='your-api-key')

# Get channel analytics
analytics = client.analytics.get_channel_overview(
    channel_id='channel_123',
    start_date='2025-10-01',
    end_date='2025-10-05'
)
```

## 🔧 Testing

### **Postman Collection**

Download our Postman collection for easy API testing:
[Download Collection](https://api.tuberise.com/docs/postman-collection.json)

### **API Testing Tools**

- **Postman** - GUI-based API testing
- **Insomnia** - REST client for API testing
- **curl** - Command-line API testing
- **HTTPie** - User-friendly command-line HTTP client

### **Example curl Commands**

```bash
# Get channel analytics
curl -X GET \
  'https://api.tuberise.com/v1/analytics/channels/channel_123/overview?start_date=2025-10-01&end_date=2025-10-05' \
  -H 'Authorization: Bearer your-jwt-token'

# Generate AI insights
curl -X POST \
  'https://api.tuberise.com/v1/insights/channels/channel_123/generate' \
  -H 'Authorization: Bearer your-jwt-token' \
  -H 'Content-Type: application/json' \
  -d '{
    "types": ["content", "timing"],
    "time_period": {
      "start_date": "2025-09-01T00:00:00Z",
      "end_date": "2025-10-01T00:00:00Z"
    }
  }'
```

---

**Document Version:** 1.0
**Last Updated:** October 5, 2025
**Next Review:** October 12, 2025
**Maintained By:** Engineering Team

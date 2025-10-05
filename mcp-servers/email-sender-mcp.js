#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import nodemailer from 'nodemailer';

// Email Sender MCP Server (mimics Mailtrap functionality)
class EmailSenderMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'email-sender-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler('tools/list', async () => {
      return {
        tools: [
          {
            name: 'send_email',
            description: 'Send an email using SMTP or email service',
            inputSchema: {
              type: 'object',
              properties: {
                to: {
                  type: 'string',
                  description: 'Recipient email address',
                },
                subject: {
                  type: 'string',
                  description: 'Email subject',
                },
                body: {
                  type: 'string',
                  description: 'Email body content',
                },
                isHtml: {
                  type: 'boolean',
                  description: 'Whether the body is HTML',
                  default: false,
                },
                from: {
                  type: 'string',
                  description: 'Sender email address',
                  default: 'noreply@tuberise.com',
                },
                replyTo: {
                  type: 'string',
                  description: 'Reply-to email address',
                },
                attachments: {
                  type: 'array',
                  description: 'Email attachments',
                  items: {
                    type: 'object',
                    properties: {
                      filename: { type: 'string' },
                      content: { type: 'string' },
                      contentType: { type: 'string' },
                    },
                  },
                },
                service: {
                  type: 'string',
                  description: 'Email service provider',
                  enum: ['smtp', 'mailtrap', 'sendgrid', 'ses', 'gmail'],
                  default: 'smtp',
                },
                credentials: {
                  type: 'object',
                  description: 'Email service credentials',
                  properties: {
                    host: { type: 'string' },
                    port: { type: 'number' },
                    user: { type: 'string' },
                    password: { type: 'string' },
                    apiKey: { type: 'string' },
                  },
                },
              },
              required: ['to', 'subject', 'body'],
            },
          },
          {
            name: 'send_analytics_report',
            description: 'Send analytics report email to user',
            inputSchema: {
              type: 'object',
              properties: {
                userEmail: {
                  type: 'string',
                  description: 'User email address',
                },
                userName: {
                  type: 'string',
                  description: 'User name',
                },
                reportData: {
                  type: 'object',
                  description: 'Analytics report data',
                  properties: {
                    period: { type: 'string' },
                    channelName: { type: 'string' },
                    views: { type: 'number' },
                    subscribers: { type: 'number' },
                    revenue: { type: 'number' },
                    topVideos: { type: 'array' },
                  },
                },
                template: {
                  type: 'string',
                  description: 'Email template type',
                  enum: ['weekly', 'monthly', 'custom'],
                  default: 'weekly',
                },
              },
              required: ['userEmail', 'userName', 'reportData'],
            },
          },
          {
            name: 'send_notification',
            description: 'Send system notification email',
            inputSchema: {
              type: 'object',
              properties: {
                to: {
                  type: 'string',
                  description: 'Recipient email address',
                },
                type: {
                  type: 'string',
                  description: 'Notification type',
                  enum: [
                    'welcome',
                    'password_reset',
                    'account_verification',
                    'api_limit',
                    'maintenance',
                  ],
                },
                data: {
                  type: 'object',
                  description: 'Notification data',
                },
                priority: {
                  type: 'string',
                  description: 'Email priority',
                  enum: ['low', 'normal', 'high'],
                  default: 'normal',
                },
              },
              required: ['to', 'type', 'data'],
            },
          },
          {
            name: 'test_email_config',
            description: 'Test email configuration and connectivity',
            inputSchema: {
              type: 'object',
              properties: {
                service: {
                  type: 'string',
                  description: 'Email service to test',
                  enum: ['smtp', 'mailtrap', 'sendgrid', 'ses', 'gmail'],
                  default: 'smtp',
                },
                credentials: {
                  type: 'object',
                  description: 'Email service credentials',
                  properties: {
                    host: { type: 'string' },
                    port: { type: 'number' },
                    user: { type: 'string' },
                    password: { type: 'string' },
                    apiKey: { type: 'string' },
                  },
                },
                testEmail: {
                  type: 'string',
                  description: 'Email address to send test to',
                },
              },
              required: ['credentials'],
            },
          },
          {
            name: 'generate_email_template',
            description: 'Generate email template for different use cases',
            inputSchema: {
              type: 'object',
              properties: {
                templateType: {
                  type: 'string',
                  description: 'Type of email template',
                  enum: [
                    'analytics_report',
                    'welcome',
                    'notification',
                    'marketing',
                  ],
                },
                data: {
                  type: 'object',
                  description: 'Data to populate template',
                },
                style: {
                  type: 'string',
                  description: 'Email style',
                  enum: ['modern', 'classic', 'minimal'],
                  default: 'modern',
                },
              },
              required: ['templateType', 'data'],
            },
          },
          {
            name: 'validate_email',
            description: 'Validate email address format and deliverability',
            inputSchema: {
              type: 'object',
              properties: {
                email: {
                  type: 'string',
                  description: 'Email address to validate',
                },
                checkDeliverability: {
                  type: 'boolean',
                  description: 'Check if email is deliverable',
                  default: false,
                },
              },
              required: ['email'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'send_email':
            return await this.sendEmail(args);
          case 'send_analytics_report':
            return await this.sendAnalyticsReport(args);
          case 'send_notification':
            return await this.sendNotification(args);
          case 'test_email_config':
            return await this.testEmailConfig(args);
          case 'generate_email_template':
            return await this.generateEmailTemplate(args);
          case 'validate_email':
            return await this.validateEmail(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async sendEmail(args) {
    const {
      to,
      subject,
      body,
      isHtml = false,
      from = 'noreply@tuberise.com',
      replyTo,
      attachments = [],
      service = 'smtp',
      credentials,
    } = args;

    try {
      // Create transporter based on service
      const transporter = this.createTransporter(service, credentials);

      // Prepare email options
      const mailOptions = {
        from: from,
        to: to,
        subject: subject,
        text: isHtml ? undefined : body,
        html: isHtml ? body : undefined,
        replyTo: replyTo,
        attachments: attachments,
      };

      // Send email
      const result = await transporter.sendMail(mailOptions);

      return {
        content: [
          {
            type: 'text',
            text: `📧 **Email Sent Successfully**\n\n**Details:**\n- To: ${to}\n- Subject: ${subject}\n- From: ${from}\n- Service: ${service}\n- Message ID: ${result.messageId}\n\n**Response:**\n${result.response}\n\n**Status:** ✅ Email queued for delivery\n\n**Next Steps:**\n- Monitor email delivery status\n- Check spam folders if not received\n- Consider using email tracking for important emails`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ **Email Send Failed**\n\n**Error:** ${error.message}\n\n**Troubleshooting:**\n- Check email credentials\n- Verify SMTP settings\n- Ensure recipient email is valid\n- Check service provider limits\n\n**Common Issues:**\n- Invalid credentials\n- Network connectivity\n- Service provider blocking\n- Email address format`,
          },
        ],
        isError: true,
      };
    }
  }

  createTransporter(service, credentials) {
    let config;

    switch (service) {
      case 'mailtrap':
        config = {
          host: 'smtp.mailtrap.io',
          port: 2525,
          auth: {
            user: credentials.user,
            pass: credentials.password,
          },
        };
        break;
      case 'gmail':
        config = {
          service: 'gmail',
          auth: {
            user: credentials.user,
            pass: credentials.password,
          },
        };
        break;
      case 'sendgrid':
        config = {
          service: 'SendGrid',
          auth: {
            user: 'apikey',
            pass: credentials.apiKey,
          },
        };
        break;
      case 'ses':
        config = {
          host: 'email-smtp.us-east-1.amazonaws.com',
          port: 587,
          auth: {
            user: credentials.user,
            pass: credentials.password,
          },
        };
        break;
      default: // smtp
        config = {
          host: credentials.host,
          port: credentials.port || 587,
          secure: credentials.port === 465,
          auth: {
            user: credentials.user,
            pass: credentials.password,
          },
        };
    }

    return nodemailer.createTransporter(config);
  }

  async sendAnalyticsReport(args) {
    const { userEmail, userName, reportData, template = 'weekly' } = args;

    const emailTemplate = this.generateAnalyticsTemplate(
      template,
      reportData,
      userName
    );

    return await this.sendEmail({
      to: userEmail,
      subject: `📊 Your ${reportData.period} Analytics Report - ${reportData.channelName}`,
      body: emailTemplate,
      isHtml: true,
      from: 'analytics@tuberise.com',
      replyTo: 'support@tuberise.com',
    });
  }

  generateAnalyticsTemplate(template, data, userName) {
    const { period, channelName, views, subscribers, revenue, topVideos } =
      data;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Analytics Report</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .metric { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #667eea; }
        .metric-value { font-size: 24px; font-weight: bold; color: #667eea; }
        .metric-label { color: #666; font-size: 14px; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .cta-button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Analytics Report</h1>
        <p>${period} Report for ${channelName}</p>
    </div>

    <div class="content">
        <h2>Hello ${userName}!</h2>
        <p>Here's your ${period} analytics report for <strong>${channelName}</strong>:</p>

        <div class="metric">
            <div class="metric-value">${views.toLocaleString()}</div>
            <div class="metric-label">Total Views</div>
        </div>

        <div class="metric">
            <div class="metric-value">${subscribers.toLocaleString()}</div>
            <div class="metric-label">Subscribers</div>
        </div>

        <div class="metric">
            <div class="metric-value">$${revenue.toFixed(2)}</div>
            <div class="metric-label">Estimated Revenue</div>
        </div>

        ${
          topVideos && topVideos.length > 0
            ? `
        <h3>🏆 Top Performing Videos</h3>
        <ul>
            ${topVideos
              .slice(0, 5)
              .map(
                (video) => `
            <li><strong>${
              video.title
            }</strong> - ${video.views.toLocaleString()} views</li>
            `
              )
              .join('')}
        </ul>
        `
            : ''
        }

        <a href="https://tuberise.com/dashboard" class="cta-button">View Full Dashboard</a>
    </div>

    <div class="footer">
        <p>This report was generated by Tuberise Analytics</p>
        <p>Questions? Contact us at support@tuberise.com</p>
    </div>
</body>
</html>`;
  }

  async sendNotification(args) {
    const { to, type, data, priority = 'normal' } = args;

    const templates = {
      welcome: {
        subject: 'Welcome to Tuberise Analytics! 🎉',
        body: this.generateWelcomeTemplate(data),
      },
      password_reset: {
        subject: 'Reset Your Tuberise Password',
        body: this.generatePasswordResetTemplate(data),
      },
      account_verification: {
        subject: 'Verify Your Tuberise Account',
        body: this.generateVerificationTemplate(data),
      },
      api_limit: {
        subject: 'API Limit Warning - Tuberise Analytics',
        body: this.generateApiLimitTemplate(data),
      },
      maintenance: {
        subject: 'Scheduled Maintenance - Tuberise Analytics',
        body: this.generateMaintenanceTemplate(data),
      },
    };

    const template = templates[type];
    if (!template) {
      throw new Error(`Unknown notification type: ${type}`);
    }

    return await this.sendEmail({
      to,
      subject: template.subject,
      body: template.body,
      isHtml: true,
      from: 'notifications@tuberise.com',
    });
  }

  generateWelcomeTemplate(data) {
    return `
    <h1>Welcome to Tuberise Analytics!</h1>
    <p>Hi ${data.name},</p>
    <p>Welcome to Tuberise Analytics! We're excited to help you grow your YouTube channel with powerful analytics and insights.</p>
    <p>To get started:</p>
    <ol>
        <li>Connect your YouTube channel</li>
        <li>Set up your Notion workspace</li>
        <li>Start receiving detailed analytics reports</li>
    </ol>
    <p>Need help? Check out our <a href="https://tuberise.com/docs">documentation</a> or contact support.</p>
    `;
  }

  generatePasswordResetTemplate(data) {
    return `
    <h1>Reset Your Password</h1>
    <p>Hi ${data.name},</p>
    <p>You requested a password reset for your Tuberise account.</p>
    <p>Click the link below to reset your password:</p>
    <a href="${data.resetLink}">Reset Password</a>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this reset, please ignore this email.</p>
    `;
  }

  generateVerificationTemplate(data) {
    return `
    <h1>Verify Your Account</h1>
    <p>Hi ${data.name},</p>
    <p>Please verify your email address to activate your Tuberise account.</p>
    <a href="${data.verificationLink}">Verify Email</a>
    <p>If you didn't create this account, please ignore this email.</p>
    `;
  }

  generateApiLimitTemplate(data) {
    return `
    <h1>API Limit Warning</h1>
    <p>Hi ${data.name},</p>
    <p>Your Tuberise account has reached ${data.percentage}% of its API limit.</p>
    <p>Current usage: ${data.currentUsage} / ${data.limit}</p>
    <p>Consider upgrading your plan to avoid service interruption.</p>
    <a href="https://tuberise.com/plans">Upgrade Plan</a>
    `;
  }

  generateMaintenanceTemplate(data) {
    return `
    <h1>Scheduled Maintenance</h1>
    <p>Hi ${data.name},</p>
    <p>We'll be performing scheduled maintenance on Tuberise Analytics.</p>
    <p><strong>Date:</strong> ${data.date}</p>
    <p><strong>Duration:</strong> ${data.duration}</p>
    <p><strong>Impact:</strong> ${data.impact}</p>
    <p>We apologize for any inconvenience and appreciate your patience.</p>
    `;
  }

  async testEmailConfig(args) {
    const { service, credentials, testEmail } = args;

    try {
      const transporter = this.createTransporter(service, credentials);

      // Test connection
      await transporter.verify();

      // Send test email if testEmail provided
      if (testEmail) {
        await transporter.sendMail({
          from: credentials.user,
          to: testEmail,
          subject: 'Test Email from Tuberise',
          text: 'This is a test email to verify your email configuration.',
        });
      }

      return {
        content: [
          {
            type: 'text',
            text: `✅ **Email Configuration Test Successful**\n\n**Service:** ${service}\n**Status:** Connection verified\n${
              testEmail ? `**Test Email:** Sent to ${testEmail}` : ''
            }\n\n**Configuration Details:**\n- Host: ${
              credentials.host || 'N/A'
            }\n- Port: ${credentials.port || 'N/A'}\n- User: ${
              credentials.user || 'N/A'
            }\n\n**Next Steps:**\n- Save these credentials securely\n- Test with different email types\n- Set up monitoring for email delivery`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ **Email Configuration Test Failed**\n\n**Error:** ${error.message}\n\n**Troubleshooting Steps:**\n1. Verify credentials are correct\n2. Check firewall settings\n3. Ensure service is accessible\n4. Test with different ports (587, 465, 25)\n5. Check if 2FA requires app password\n\n**Common Solutions:**\n- Use app-specific passwords for Gmail\n- Enable "Less secure apps" for testing\n- Check SMTP authentication settings`,
          },
        ],
        isError: true,
      };
    }
  }

  async generateEmailTemplate(args) {
    const { templateType, data, style = 'modern' } = args;

    const templates = {
      analytics_report: this.generateAnalyticsTemplate(
        'weekly',
        data,
        data.userName
      ),
      welcome: this.generateWelcomeTemplate(data),
      notification: `
        <h1>Notification</h1>
        <p>${data.message}</p>
        ${
          data.actionUrl
            ? `<a href="${data.actionUrl}">${
                data.actionText || 'Take Action'
              }</a>`
            : ''
        }
      `,
      marketing: `
        <h1>${data.title}</h1>
        <p>${data.content}</p>
        <a href="${data.ctaUrl}">${data.ctaText}</a>
      `,
    };

    const template = templates[templateType];
    if (!template) {
      throw new Error(`Unknown template type: ${templateType}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: `📧 **Email Template Generated**\n\n**Type:** ${templateType}\n**Style:** ${style}\n\n**Template:**\n\`\`\`html\n${template}\n\`\`\`\n\n**Usage:**\n1. Copy the HTML template above\n2. Customize with your data\n3. Use with send_email tool\n4. Test with different email clients\n\n**Customization Tips:**\n- Replace placeholders with actual data\n- Test responsive design\n- Check email client compatibility\n- Add tracking pixels if needed`,
        },
      ],
    };
  }

  async validateEmail(args) {
    const { email, checkDeliverability = false } = args;

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidFormat = emailRegex.test(email);

    const validations = [];

    if (isValidFormat) {
      validations.push('✅ Email format is valid');
    } else {
      validations.push('❌ Email format is invalid');
    }

    // Check for common issues
    if (email.includes('..')) {
      validations.push('❌ Email contains consecutive dots');
    }

    if (email.startsWith('.') || email.endsWith('.')) {
      validations.push('❌ Email starts or ends with a dot');
    }

    const domain = email.split('@')[1];
    if (domain && domain.length > 253) {
      validations.push('❌ Domain name too long');
    }

    // Check for disposable email domains (basic list)
    const disposableDomains = [
      '10minutemail.com',
      'tempmail.org',
      'guerrillamail.com',
    ];
    if (disposableDomains.includes(domain)) {
      validations.push('⚠️ Email appears to be from disposable email service');
    }

    return {
      content: [
        {
          type: 'text',
          text: `📧 **Email Validation Results**\n\n**Email:** ${email}\n\n**Validation Results:**\n${validations
            .map((v) => `- ${v}`)
            .join(
              '\n'
            )}\n\n**Recommendations:**\n- Use valid email addresses for important communications\n- Avoid disposable email services\n- Implement email verification in your app\n- Consider using email validation services for production\n\n**Next Steps:**\n${
            isValidFormat
              ? '✅ Email is ready to use'
              : '❌ Fix email format before sending'
          }`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('EmailSender MCP server running on stdio');
  }
}

// Start the server
const server = new EmailSenderMCPServer();
server.run().catch(console.error);

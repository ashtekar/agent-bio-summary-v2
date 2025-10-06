import { EmailRecipient, ToolResult } from '@/types/agent';
import { Resend } from 'resend';

export class EmailTools {
  private resend: Resend | null = null;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('Resend API key not configured');
    } else {
      this.resend = new Resend(apiKey);
    }
  }

  /**
   * Send email with daily summary to recipients
   */
  async sendEmail(params: {
    summary: string;
    recipients: EmailRecipient[];
    metadata: {
      sessionId: string;
      articlesCount: number;
      executionTime: number;
    };
  }): Promise<ToolResult> {
    try {
      console.log(`Sending email to ${params.recipients.length} recipients`);
      
      if (!this.resend) {
        throw new Error('Resend client not initialized');
      }

      if (params.recipients.length === 0) {
        throw new Error('No recipients specified');
      }

      const emailHtml = this.generateEmailHtml(params.summary, params.metadata);
      const emailSubject = this.generateEmailSubject(params.metadata);
      
      // Send to all recipients
      const emailPromises = params.recipients.map(recipient => 
        this.sendToRecipient(recipient, emailSubject, emailHtml)
      );

      const results = await Promise.allSettled(emailPromises);
      
      // Check results
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      if (failed > 0) {
        console.warn(`${failed} emails failed to send out of ${params.recipients.length}`);
      }

      console.log(`Successfully sent ${successful} emails`);
      
      return {
        success: successful > 0,
        data: {
          successful,
          failed,
          recipients: params.recipients.length,
          emailId: this.generateEmailId(params.metadata.sessionId)
        },
        metadata: {
          executionTime: Date.now(),
          cost: this.calculateEmailCost(params.recipients.length),
          tokens: 0
        }
      };

    } catch (error) {
      console.error('Email sending failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Email sending failed'
      };
    }
  }

  /**
   * Send email to individual recipient
   */
  private async sendToRecipient(recipient: EmailRecipient, subject: string, html: string): Promise<void> {
    try {
      if (!this.resend) {
        throw new Error('Resend client not initialized');
      }
      
      const { data, error } = await this.resend.emails.send({
        from: 'Agent Bio Summary <noreply@agentbiosummary.com>',
        to: [recipient.email],
        subject,
        html,
        headers: {
          'X-Entity-Ref-ID': recipient.email,
        },
      });

      if (error) {
        throw new Error(`Resend error: ${error.message}`);
      }

      console.log(`Email sent successfully to ${recipient.email}, ID: ${data?.id}`);
      
    } catch (error) {
      console.error(`Failed to send email to ${recipient.email}:`, error);
      throw error;
    }
  }

  /**
   * Generate HTML email content
   */
  private generateEmailHtml(summary: string, metadata: { sessionId: string; articlesCount: number; executionTime: number }): string {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Synthetic Biology Summary - ${currentDate}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #2c3e50;
            margin: 0;
            font-size: 28px;
        }
        .header p {
            color: #6c757d;
            margin: 10px 0 0 0;
            font-size: 16px;
        }
        .content {
            margin-bottom: 30px;
        }
        .content h2 {
            color: #2c3e50;
            border-left: 4px solid #3498db;
            padding-left: 15px;
            margin-top: 30px;
            margin-bottom: 15px;
        }
        .content h3 {
            color: #34495e;
            margin-top: 25px;
            margin-bottom: 10px;
        }
        .content p {
            margin-bottom: 15px;
            text-align: justify;
        }
        .content a {
            color: #3498db;
            text-decoration: none;
        }
        .content a:hover {
            text-decoration: underline;
        }
        .footer {
            border-top: 1px solid #e9ecef;
            padding-top: 20px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
        }
        .feedback-section {
            background-color: #f8f9fa;
            border-radius: 6px;
            padding: 20px;
            margin: 30px 0;
            text-align: center;
        }
        .feedback-section h3 {
            color: #2c3e50;
            margin-top: 0;
        }
        .feedback-button {
            display: inline-block;
            background-color: #3498db;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 10px;
        }
        .feedback-button:hover {
            background-color: #2980b9;
            text-decoration: none;
        }
        .metadata {
            font-size: 12px;
            color: #95a5a6;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #ecf0f1;
        }
        .article-link {
            background-color: #ecf0f1;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
            font-size: 14px;
        }
        .article-link a {
            font-weight: bold;
        }
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .container {
                padding: 20px;
            }
            .header h1 {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧬 Daily Synthetic Biology Summary</h1>
            <p>${currentDate}</p>
        </div>
        
        <div class="content">
            ${summary}
        </div>
        
        <div class="feedback-section">
            <h3>📝 Help Us Improve</h3>
            <p>Your feedback helps us create better summaries. Please take a moment to rate this summary:</p>
            <a href="${baseUrl}/feedback?session=${metadata.sessionId}" class="feedback-button">
                Rate This Summary
            </a>
            <a href="${baseUrl}/settings" class="feedback-button" style="background-color: #95a5a6;">
                Update Preferences
            </a>
        </div>
        
        <div class="footer">
            <p>Generated by Agent Bio Summary V2</p>
            <div class="metadata">
                Session ID: ${metadata.sessionId} | 
                Articles Processed: ${metadata.articlesCount} | 
                Generation Time: ${Math.round(metadata.executionTime / 1000)}s
            </div>
            <p style="margin-top: 15px;">
                <a href="${baseUrl}/unsubscribe?email={{recipient_email}}">Unsubscribe</a> | 
                <a href="${baseUrl}/privacy">Privacy Policy</a>
            </p>
        </div>
    </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate email subject line
   */
  private generateEmailSubject(metadata: { articlesCount: number }): string {
    const currentDate = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    
    const articleText = metadata.articlesCount === 1 ? 'article' : 'articles';
    
    return `🧬 Synthetic Biology Summary - ${currentDate} (${metadata.articlesCount} ${articleText})`;
  }

  /**
   * Generate unique email ID
   */
  private generateEmailId(sessionId: string): string {
    return `email_${sessionId}_${Date.now()}`;
  }

  /**
   * Calculate email sending cost
   */
  private calculateEmailCost(recipientCount: number): number {
    // Resend pricing: $0.40 per 1,000 emails
    const costPerEmail = 0.40 / 1000;
    return recipientCount * costPerEmail;
  }

  /**
   * Test email functionality
   */
  async testEmail(testRecipient: string): Promise<ToolResult> {
    try {
      const testSummary = `
        <h2>Test Summary</h2>
        <p>This is a test email from Agent Bio Summary V2.</p>
        <p>If you receive this email, the email functionality is working correctly.</p>
      `;

      const testMetadata = {
        sessionId: 'test_session',
        articlesCount: 1,
        executionTime: 1000
      };

      const result = await this.sendEmail({
        summary: testSummary,
        recipients: [{ email: testRecipient, name: 'Test User', preferences: { frequency: 'daily', format: 'html' } }],
        metadata: testMetadata
      });

      return result;

    } catch (error) {
      console.error('Email test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Email test failed'
      };
    }
  }

  /**
   * Get email sending statistics
   */
  async getEmailStats(): Promise<ToolResult> {
    try {
      if (!this.resend) {
        throw new Error('Resend client not initialized');
      }

      // Get email domain information
      const { data, error } = await this.resend.domains.list();

      if (error) {
        throw new Error(`Failed to get email stats: ${error.message}`);
      }

      return {
        success: true,
        data: {
          domains: data?.data || [],
          totalDomains: data?.data?.length || 0
        },
        metadata: {
          executionTime: Date.now(),
          cost: 0,
          tokens: 0
        }
      };

    } catch (error) {
      console.error('Failed to get email stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get email stats'
      };
    }
  }
}


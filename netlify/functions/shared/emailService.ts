// netlify/functions/shared/emailService.ts

export interface EmailData {
  to: string[];
  subject: string;
  html: string;
  text: string;
  from?: string;
}

export class EmailService {
  private resendApiKey: string;
  private defaultFrom: string;

  constructor(resendApiKey: string, defaultFrom = 'WhatTheMenu <hello@whatthemenu.com>') {
    this.resendApiKey = resendApiKey;
    this.defaultFrom = defaultFrom;
  }

  async sendEmail(emailData: EmailData): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: emailData.from || this.defaultFrom,
          to: emailData.to,
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Resend API error:', errorText);
        return { success: false, error: `HTTP ${response.status}: ${errorText}` };
      }

      const result = await response.json();
      return { success: true, id: result.id };

    } catch (error) {
      console.error('Email sending error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Log email sends to Supabase for tracking
  async logEmailSend(
    supabase: any,
    emailType: string,
    recipient: string,
    success: boolean,
    emailId?: string,
    error?: string
  ) {
    try {
      await supabase
        .from('email_logs')
        .insert({
          email_type: emailType,
          recipient: recipient,
          success: success,
          resend_id: emailId,
          error_message: error,
          sent_at: new Date().toISOString()
        });
    } catch (logError) {
      console.error('Failed to log email send:', logError);
      // Don't throw - logging failure shouldn't break email sending
    }
  }

  // NEW METHOD: Send magic link emails
  async sendMagicLinkEmail(
    email: string, 
    magicLink: string, 
    isSignUp: boolean = false,
    supabase?: any
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    
    const subject = isSignUp ? 'Welcome to WhatTheMenu!' : 'Sign in to WhatTheMenu';
    const actionText = isSignUp ? 'Complete Registration' : 'Sign In';
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 40px; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 16px; border: 4px solid #292524; box-shadow: 8px 8px 0px #292524; overflow: hidden;">
            
            <!-- Header -->
            <div style="background-color: #FF6B6B; color: white; padding: 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 900;">WhatTheMenu?</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">
                ${isSignUp ? '🎉 Welcome aboard!' : '🔐 Sign in to your account'}
              </p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px;">
              <h2 style="color: #292524; font-size: 24px; margin: 0 0 20px 0; font-weight: 800;">
                ${isSignUp ? 'Complete your registration' : 'Ready to scan some menus?'}
              </h2>
              
              <p style="color: #57534e; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                ${isSignUp 
                  ? 'Click the button below to complete your account setup and start scanning menus!'
                  : 'Click the button below to sign in to your account and start explaining dishes!'
                }
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${magicLink}" 
                   style="display: inline-block; background-color: #FF6B6B; color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 700; font-size: 18px; border: 3px solid #292524; box-shadow: 4px 4px 0px #292524;">
                  ${actionText}
                </a>
              </div>
              
              <div style="background-color: #FEF3C7; border: 2px solid #F59E0B; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <p style="margin: 0; color: #92400E; font-size: 14px; font-weight: 600;">
                  🔒 This link expires in 10 minutes for security. If you didn't request this, you can safely ignore this email.
                </p>
              </div>
              
              <p style="color: #78716c; font-size: 14px; margin: 0;">
                Need help? Just reply to this email and we'll get back to you quickly!
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f5f5f4; padding: 20px; text-align: center; border-top: 2px solid #e7e5e4;">
              <p style="margin: 0; color: #78716c; font-size: 12px;">
                WhatTheMenu - Making dining decisions easier, one scan at a time.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
${subject}

${isSignUp ? 'Welcome to WhatTheMenu!' : 'Sign in to WhatTheMenu'}

${isSignUp 
  ? 'Complete your account setup by clicking this link:'
  : 'Sign in to your account by clicking this link:'
}

${magicLink}

This link expires in 10 minutes for security.

If you didn't request this, you can safely ignore this email.

Need help? Just reply to this email!
    `.trim();

    try {
      // Use your existing sendEmail method
      const result = await this.sendEmail({
        to: [email],
        subject,
        html,
        text
      });

      // Log the email send if supabase is provided
      if (supabase) {
        await this.logEmailSend(
          supabase,
          isSignUp ? 'magic_link_signup' : 'magic_link_signin',
          email,
          result.success,
          result.id,
          result.error
        );
      }

      return result;

    } catch (error) {
      console.error('Magic link email error:', error);
      
      // Log the failure if supabase is provided
      if (supabase) {
        await this.logEmailSend(
          supabase,
          isSignUp ? 'magic_link_signup' : 'magic_link_signin',
          email,
          false,
          undefined,
          error instanceof Error ? error.message : 'Unknown error'
        );
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
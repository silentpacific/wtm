// netlify/functions/shared/emailService.ts - OPTIMIZED FOR SPEED

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

  constructor(resendApiKey: string, defaultFrom = 'WhatTheMenu <noreply@whatthemenu.com>') {
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
          // Speed optimizations
          reply_to: 'noreply@whatthemenu.com',
          tags: [
            { name: 'type', value: 'auth' },
            { name: 'priority', value: 'high' }
          ],
          headers: {
            'X-Priority': '1',
            'X-MSMail-Priority': 'High',
            'Importance': 'high'
          }
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

  // Optimized magic link email - minimal HTML for fastest processing
  async sendMagicLinkEmail(
    email: string, 
    magicLink: string, 
    isSignUp: boolean = false,
    supabase?: any
  ): Promise<{ success: boolean; id?: string; error?: string; duration?: number }> {
    
    const startTime = Date.now();
    const subject = isSignUp ? 'Welcome to WhatTheMenu!' : 'Sign in to WhatTheMenu';
    const actionText = isSignUp ? 'Complete Registration' : 'Sign In';
    
    // Ultra-minimal HTML for maximum speed
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${subject}</title></head>
<body style="font-family:Arial,sans-serif;margin:0;padding:20px;background:#f9f9f9">
<div style="max-width:600px;margin:0 auto;background:#fff;padding:30px;border-radius:8px">
<h1 style="color:#FF6B6B;text-align:center;margin-bottom:20px">WhatTheMenu</h1>
<h2 style="color:#333;margin-bottom:15px">${isSignUp ? 'Complete your registration' : 'Sign in to your account'}</h2>
<p style="color:#666;margin-bottom:25px">Click the button below to ${isSignUp ? 'complete your account setup' : 'sign in to your account'}.</p>
<div style="text-align:center;margin:30px 0">
<a href="${magicLink}" style="display:inline-block;background:#FF6B6B;color:#fff;text-decoration:none;padding:12px 30px;border-radius:6px;font-weight:bold">${actionText}</a>
</div>
<p style="color:#999;font-size:14px;margin-top:30px">This link expires in 10 minutes.</p>
</div>
</body>
</html>`;

    const text = `${subject}\n\nClick this link to ${isSignUp ? 'complete your registration' : 'sign in'}:\n${magicLink}\n\nThis link expires in 10 minutes.`;

    try {
      const result = await this.sendEmail({
        to: [email],
        subject,
        html,
        text
      });

      const duration = Date.now() - startTime;
      console.log(`📧 Magic link email sent in ${duration}ms`);

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

      return {
        ...result,
        duration
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('Magic link email error:', error);
      
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
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
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
    }
  }
}

// New: Multi-provider racing system for maximum speed
interface EmailProvider {
  name: string;
  send: (emailData: EmailData) => Promise<{ success: boolean; id?: string; error?: string }>;
}

export class SpeedOptimizedEmailService {
  private providers: EmailProvider[] = [];
  private defaultFrom: string;

  constructor(
    resendApiKey: string,
    sendGridApiKey?: string,
    defaultFrom = 'WhatTheMenu <noreply@whatthemenu.com>'
  ) {
    this.defaultFrom = defaultFrom;

    // Primary: Resend (your verified domain)
    this.providers.push({
      name: 'Resend',
      send: async (emailData: EmailData) => {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: emailData.from || this.defaultFrom,
            to: emailData.to,
            subject: emailData.subject,
            html: emailData.html,
            text: emailData.text,
            tags: [{ name: 'provider', value: 'resend' }],
            headers: { 'X-Priority': '1' }
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Resend: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        return { success: true, id: result.id };
      }
    });

    // Backup: SendGrid (if provided)
    if (sendGridApiKey) {
      this.providers.push({
        name: 'SendGrid',
        send: async (emailData: EmailData) => {
          const fromEmail = emailData.from?.match(/<(.+)>/)?.[1] || 
                           emailData.from || 
                           this.defaultFrom.match(/<(.+)>/)?.[1] || 
                           this.defaultFrom;

          const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${sendGridApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: { email: fromEmail, name: 'WhatTheMenu' },
              to: emailData.to.map(email => ({ email })),
              subject: emailData.subject,
              content: [
                { type: 'text/html', value: emailData.html },
                { type: 'text/plain', value: emailData.text }
              ],
              categories: ['auth'],
              custom_args: { provider: 'sendgrid' }
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`SendGrid: ${response.status} - ${errorText}`);
          }

          return { success: true, id: response.headers.get('X-Message-ID') || 'sendgrid-sent' };
        }
      });
    }
  }

  // Race multiple providers - use the fastest one
  async sendMagicLinkFast(
    email: string,
    magicLink: string,
    isSignUp: boolean = false
  ): Promise<{ success: boolean; id?: string; error?: string; provider?: string; duration?: number }> {
    
    const startTime = Date.now();
    const subject = isSignUp ? 'Welcome to WhatTheMenu!' : 'Sign in to WhatTheMenu';
    const actionText = isSignUp ? 'Complete Registration' : 'Sign In';
    
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${subject}</title></head><body style="font-family:Arial,sans-serif;margin:0;padding:20px;background:#f9f9f9"><div style="max-width:600px;margin:0 auto;background:#fff;padding:30px;border-radius:8px"><h1 style="color:#FF6B6B;text-align:center;margin-bottom:20px">WhatTheMenu</h1><h2 style="color:#333;margin-bottom:15px">${isSignUp ? 'Complete your registration' : 'Sign in to your account'}</h2><p style="color:#666;margin-bottom:25px">Click the button below to ${isSignUp ? 'complete your account setup' : 'sign in to your account'}.</p><div style="text-align:center;margin:30px 0"><a href="${magicLink}" style="display:inline-block;background:#FF6B6B;color:#fff;text-decoration:none;padding:12px 30px;border-radius:6px;font-weight:bold">${actionText}</a></div><p style="color:#999;font-size:14px;margin-top:30px">This link expires in 10 minutes.</p></div></body></html>`;

    const text = `${subject}\n\nClick this link: ${magicLink}\n\nExpires in 10 minutes.`;

    const emailData = { to: [email], subject, html, text };

    try {
      if (this.providers.length === 1) {
        // Single provider - just send
        const result = await this.providers[0].send(emailData);
        const duration = Date.now() - startTime;
        
        console.log(`📧 Email sent via ${this.providers[0].name} in ${duration}ms`);
        
        return {
          ...result,
          provider: this.providers[0].name,
          duration
        };
      }

      // Multiple providers - race them!
      console.log(`🏁 Racing ${this.providers.length} email providers...`);
      
      const promises = this.providers.map(async (provider) => {
        try {
          const result = await provider.send(emailData);
          return { ...result, provider: provider.name };
        } catch (error: any) {
          throw new Error(`${provider.name}: ${error.message}`);
        }
      });

      const result = await Promise.any(promises);
      const duration = Date.now() - startTime;
      
      console.log(`🏆 ${result.provider} won! Email sent in ${duration}ms`);
      
      return {
        ...result,
        duration
      };

    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`❌ All providers failed after ${duration}ms:`, error.message);
      
      return {
        success: false,
        error: `All providers failed: ${error.message}`,
        duration
      };
    }
  }
}
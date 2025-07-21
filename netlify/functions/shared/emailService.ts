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
}
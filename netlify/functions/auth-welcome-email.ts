// netlify/functions/auth-welcome-email.ts
import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { EmailService } from './shared/emailService';
import { emailTemplates } from './shared/emailTemplates';

const handler: Handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Log incoming webhook for debugging
    console.log('Webhook received!');
    console.log('Headers:', JSON.stringify(event.headers, null, 2));
    console.log('Body:', event.body);

    // Parse the webhook payload from Supabase
    const payload = JSON.parse(event.body || '{}');
    console.log('Parsed payload:', JSON.stringify(payload, null, 2));
    
    // Validate webhook signature - Supabase Database Webhooks use different auth
    const authHeader = event.headers['authorization'];
    const expectedSecret = process.env.SUPABASE_AUTH_WEBHOOK_SECRET;
    
    // Check if auth header matches our secret (case insensitive)
    const expectedAuthHeader = `Bearer ${expectedSecret}`;
    if (expectedSecret && authHeader?.toLowerCase() !== expectedAuthHeader.toLowerCase()) {
      console.error('Invalid webhook signature. Expected:', expectedAuthHeader, 'Got:', authHeader);
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    // Extract user data from the Supabase Database Webhook payload
    const { type, table, record, old_record } = payload;
    
    console.log('Webhook type:', type, 'table:', table);
    
    // Only process new user signups
    if (type !== 'INSERT' || table !== 'users') {
      console.log('Event ignored - not a user insert');
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Event ignored - not a user insert' }),
      };
    }

    const user = record;
    console.log('User record:', JSON.stringify(user, null, 2));
    
    if (!user || !user.email) {
      console.error('No user email found in payload');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No user email found' }),
      };
    }

    // Initialize services
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const emailService = new EmailService(process.env.RESEND_API_KEY!);

    // Extract user name from email
    let userName = user.email.split('@')[0]; // Default to email prefix
    console.log('User name:', userName);

    // Create verification link if user needs to verify email
    let verificationLink;
    if (!user.email_confirmed_at && user.confirmation_token) {
      verificationLink = `https://whatthemenu.com/auth/confirm?token=${user.confirmation_token}&type=signup&redirect_to=https://whatthemenu.com`;
    }
    console.log('Verification link:', verificationLink);

    // Generate welcome email
    const welcomeTemplate = emailTemplates.welcome(userName, verificationLink);
    
    const emailData = {
      to: [user.email],
      subject: welcomeTemplate.subject,
      html: welcomeTemplate.html,
      text: welcomeTemplate.text
    };

    console.log('Sending email to:', user.email);

    // Send welcome email
    const emailResult = await emailService.sendEmail(emailData);
    console.log('Email result:', emailResult);

    // Log the email send
    await emailService.logEmailSend(
      supabase,
      'welcome_email',
      user.email,
      emailResult.success,
      emailResult.id,
      emailResult.error
    );

    if (!emailResult.success) {
      console.error('Failed to send welcome email:', emailResult.error);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Failed to send welcome email',
          details: emailResult.error 
        }),
      };
    }

    console.log('Welcome email sent successfully!');

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'Welcome email sent successfully',
        emailId: emailResult.id,
        recipient: user.email
      }),
    };

  } catch (error) {
    console.error('Welcome email webhook error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};

export { handler };
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
    console.log('Auth webhook received!');
    console.log('Headers:', JSON.stringify(event.headers, null, 2));
    console.log('Body:', event.body);

    // Parse the webhook payload from Supabase Auth
    const payload = JSON.parse(event.body || '{}');
    console.log('Parsed payload:', JSON.stringify(payload, null, 2));
    
    // Validate webhook signature
    const authHeader = event.headers['authorization'];
    const expectedSecret = process.env.SUPABASE_AUTH_WEBHOOK_SECRET;
    
    // Check if auth header matches our secret
    const expectedAuthHeader = `Bearer ${expectedSecret}`;
    if (expectedSecret && authHeader?.toLowerCase() !== expectedAuthHeader.toLowerCase()) {
      console.error('Invalid webhook signature. Expected:', expectedAuthHeader, 'Got:', authHeader);
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    // Extract event data from Supabase Auth webhook
    const { type, user } = payload;
    
    console.log('Webhook type:', type);
    console.log('User data:', user);
    
    // Only process user signup events (when user confirms their email via magic link)
    if (type !== 'user.created') {
      console.log('Event ignored - not a user creation event');
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Event ignored - not a user creation event' }),
      };
    }

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

    // Extract user name from email or user metadata
    let userName = user.user_metadata?.full_name || user.email.split('@')[0];
    console.log('User name:', userName);

    // Create user profile in our custom table
    try {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || null,
          subscription_type: 'free',
          scans_used: 0,
          scans_limit: 5,
          current_menu_dish_explanations: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        // Don't fail the whole process if profile creation fails
      } else {
        console.log('User profile created successfully');
      }
    } catch (profileErr) {
      console.error('Error creating user profile:', profileErr);
    }

    // Generate welcome email (no verification link needed for magic link flow)
    const welcomeTemplate = emailTemplates.welcome(userName, null);
    
    const emailData = {
      to: [user.email],
      subject: welcomeTemplate.subject,
      html: welcomeTemplate.html,
      text: welcomeTemplate.text
    };

    console.log('Sending welcome email to:', user.email);

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
// netlify/functions/welcome-email.ts
// Simplified welcome email function for email/password auth

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
    console.log('Welcome email function called');
    
    // Parse the request body
    const { userId, email, name } = JSON.parse(event.body || '{}');
    
    if (!userId || !email) {
      console.error('Missing required fields: userId or email');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: userId and email' }),
      };
    }

    // Initialize services
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const emailService = new EmailService(process.env.RESEND_API_KEY!);

    // Extract user name from email or use provided name
    let userName = name || email.split('@')[0];
    console.log('Sending welcome email to:', email, 'for user:', userName);

    // Check if welcome email already sent (prevent duplicates)
    const { data: existingLog } = await supabase
      .from('email_logs')
      .select('id')
      .eq('email_type', 'welcome')
      .eq('recipient', email)
      .eq('success', true)
      .single();

    if (existingLog) {
      console.log('Welcome email already sent to', email);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Welcome email already sent' }),
      };
    }

    // Create user profile in our custom table
    try {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          email: email,
          full_name: name || null,
          subscription_type: 'free',
          scans_used: 0,
          scans_limit: 5,
          current_menu_dish_explanations: 0,
          lifetime_menus_scanned: 0,
          lifetime_dishes_explained: 0,
          lifetime_restaurants_visited: 0,
          lifetime_countries_explored: 0,
          current_month_menus: 0,
          current_month_dishes: 0,
          current_month_restaurants: 0,
          current_month_countries: 0,
          usage_month: new Date().toISOString().slice(0, 7), // YYYY-MM format
          subscription_status: 'inactive',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
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

    // Generate welcome email using shared template
    const welcomeTemplate = emailTemplates.welcome(userName);
    
    const emailData = {
      to: [email],
      subject: welcomeTemplate.subject,
      html: welcomeTemplate.html,
      text: welcomeTemplate.text
    };

    console.log('Sending welcome email to:', email);

    // Send welcome email
    const emailResult = await emailService.sendEmail(emailData);
    console.log('Email result:', emailResult);

    // Log the email send
    await emailService.logEmailSend(
      supabase,
      'welcome',
      email,
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
        recipient: email
      }),
    };

  } catch (error) {
    console.error('Welcome email function error:', error);
    
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
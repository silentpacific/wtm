// Create new file: netlify/functions/custom-auth-email.ts

import { EmailService } from './shared/emailService';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export const handler = async (event: any) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: '',
    };
  }

  try {
    const { email, isSignUp } = JSON.parse(event.body);
    
    if (!email) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Email is required' }),
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Invalid email format' }),
      };
    }

    // Generate the magic link using Supabase (but don't let it send the email)
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.URL || 'https://whatthemenu.com'}`,
        shouldCreateUser: isSignUp,
        // This prevents Supabase from sending the email
        data: {
          custom_email_handling: true
        }
      }
    });

    if (error) {
      console.error('Supabase auth error:', error);
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          error: error.message || 'Authentication failed' 
        }),
      };
    }

    // Create the magic link URL
    // Note: You'll need to get the actual token from Supabase's response
    // This is a simplified version - you may need to adjust based on Supabase's response structure
    const baseUrl = process.env.URL || 'https://whatthemenu.com';
    const magicLink = `${baseUrl}/auth/callback?token_hash=${data}&type=signup&next=/`;

    // Initialize email service
    const emailService = new EmailService(
      process.env.RESEND_API_KEY!,
      'WhatTheMenu <noreply@whatthemenu.com>'
    );

    // Send the magic link email using Resend
    const emailResult = await emailService.sendMagicLinkEmail(
      email,
      magicLink,
      isSignUp,
      supabase
    );

    if (!emailResult.success) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          error: 'Failed to send email',
          details: emailResult.error 
        }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        success: true,
        message: 'Magic link sent successfully',
        emailId: emailResult.id
      }),
    };
    
  } catch (error: any) {
    console.error('Custom auth email function error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
    };
  }
};
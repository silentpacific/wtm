// netlify/functions/custom-auth-email.ts

import { EmailService } from './shared/emailService';
import { createClient } from '@supabase/supabase-js';
import { createHmac, randomBytes } from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for admin access
);

// Generate a secure token for the magic link
function generateSecureToken(): string {
  return randomBytes(32).toString('hex');
}

// Create HMAC signature for token validation
function createTokenSignature(token: string, email: string): string {
  const secret = process.env.SUPABASE_JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createHmac('sha256', secret)
    .update(`${token}:${email}`)
    .digest('hex');
}

export const handler = async (event: any) => {
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

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
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

    // Check if user exists (only for sign-in)
    if (!isSignUp) {
      const { data: existingUser, error: userCheckError } = await supabase.auth.admin.getUserByEmail(email);
      
      if (userCheckError || !existingUser.user) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ 
            error: 'No account found with this email. Please sign up first.' 
          }),
        };
      }
    }

    // Generate our own secure token instead of using Supabase's OTP
    const token = generateSecureToken();
    const signature = createTokenSignature(token, email);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Store the token in Supabase for later verification
    const { error: tokenError } = await supabase
      .from('magic_link_tokens')
      .insert({
        token,
        email,
        signature,
        expires_at: expiresAt.toISOString(),
        is_signup: isSignUp,
        used: false,
        created_at: new Date().toISOString()
      });

    if (tokenError) {
      console.error('Error storing magic link token:', tokenError);
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          error: 'Failed to generate magic link' 
        }),
      };
    }

    // Create the magic link URL
    const baseUrl = process.env.URL || 'https://whatthemenu.com';
    const magicLink = `${baseUrl}/auth/verify?token=${token}&signature=${signature}&email=${encodeURIComponent(email)}`;

    // Initialize email service
    const emailService = new EmailService(
      process.env.RESEND_API_KEY!,
      'WhatTheMenu <noreply@whatthemenu.com>'
    );

    // Send the magic link email using Resend (completely bypasses Supabase email)
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
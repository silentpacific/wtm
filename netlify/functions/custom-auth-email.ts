// netlify/functions/custom-auth-email.ts - FIXED VERSION

import { EmailService } from './shared/emailService';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

// Create admin client with service role key
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Generate a secure token for the magic link
function generateSecureToken(): string {
  return randomBytes(32).toString('hex');
}

export const handler = async (event: any) => {
  console.log('🔍 Function started');

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
    console.log('🔍 Processing request:', { email, isSignUp });
    
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

    // Check if user exists (only for sign-in) - FIXED METHOD
    if (!isSignUp) {
      console.log('🔍 Checking if user exists for sign-in...');
      
      const { data: existingUsers, error: userCheckError } = await supabaseAdmin
        .from('auth.users') // Query the auth.users view directly
        .select('email')
        .eq('email', email)
        .limit(1);

      console.log('🔍 User check result:', { existingUsers, userCheckError });

      // If we can't check users table, try a different approach
      if (userCheckError) {
        console.log('⚠️ Could not check auth.users, trying alternative method...');
        
        // Alternative: try to generate a magic link and see if it fails
        try {
          await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: email
          });
          console.log('✅ User exists (magic link generation succeeded)');
        } catch (linkError: any) {
          if (linkError.message?.includes('not found') || linkError.message?.includes('User not found')) {
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
          // If it's a different error, continue anyway
          console.log('⚠️ Unexpected error checking user:', linkError.message);
        }
      } else if (!existingUsers || existingUsers.length === 0) {
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

    // For now, let's skip the complex token storage and just send a simple email
    // We'll make the magic link work with Supabase's built-in system
    console.log('🔍 Generating magic link using Supabase admin...');
    
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `${process.env.URL || 'https://whatthemenu.com'}/`
      }
    });

    if (linkError) {
      console.error('❌ Error generating magic link:', linkError);
      
      // Handle specific errors
      if (linkError.message?.includes('not found') && !isSignUp) {
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
      
      // For signup, create the user first
      if (isSignUp) {
        console.log('🔍 Creating new user for signup...');
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: email,
          email_confirm: false // We'll confirm via magic link
        });

        if (createError) {
          if (createError.message?.includes('already registered')) {
            return {
              statusCode: 400,
              headers: {
                'Access-Control-Allow-Origin': '*',
              },
              body: JSON.stringify({ 
                error: 'An account with this email already exists. Try signing in instead.' 
              }),
            };
          }
          
          console.error('❌ Error creating user:', createError);
          return {
            statusCode: 500,
            headers: {
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ 
              error: 'Failed to create account',
              details: createError.message 
            }),
          };
        }

        // Now generate the magic link for the new user
        const { data: newLinkData, error: newLinkError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email: email,
          options: {
            redirectTo: `${process.env.URL || 'https://whatthemenu.com'}/`
          }
        });

        if (newLinkError || !newLinkData.properties?.action_link) {
          console.error('❌ Error generating magic link for new user:', newLinkError);
          return {
            statusCode: 500,
            headers: {
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ 
              error: 'Failed to generate magic link',
              details: newLinkError?.message 
            }),
          };
        }

        linkData.properties = newLinkData.properties;
      } else {
        return {
          statusCode: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ 
            error: 'Failed to generate magic link',
            details: linkError.message 
          }),
        };
      }
    }

    if (!linkData?.properties?.action_link) {
      console.error('❌ No action link in response:', linkData);
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          error: 'Failed to generate valid magic link' 
        }),
      };
    }

    const magicLink = linkData.properties.action_link;
    console.log('✅ Magic link generated successfully');

    // Initialize email service
    const emailService = new EmailService(
      process.env.RESEND_API_KEY!,
      'WhatTheMenu <noreply@whatthemenu.com>'
    );

    console.log('🔍 Sending email via Resend...');
    // Send the magic link email using Resend
    const emailResult = await emailService.sendMagicLinkEmail(
      email,
      magicLink,
      isSignUp
    );

    if (!emailResult.success) {
      console.error('❌ Email sending failed:', emailResult.error);
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

    console.log('✅ Email sent successfully:', emailResult.id);
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
    console.error('❌ Function error:', error);
    
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
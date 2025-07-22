// netlify/functions/custom-auth-email.ts - SPEED OPTIMIZED

import { SpeedOptimizedEmailService } from './shared/emailService';
import { createClient } from '@supabase/supabase-js';

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

export const handler = async (event: any) => {
  const requestStart = Date.now();
  console.log('⚡ Speed-optimized auth function started');

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

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { email, isSignUp } = JSON.parse(event.body);
    console.log(`⚡ Processing ${isSignUp ? 'signup' : 'signin'} for: ${email}`);
    
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Valid email is required' }),
      };
    }

    // For sign-in, quickly check if user exists (optimized)
    if (!isSignUp) {
      console.log('⚡ Quick user existence check...');
      try {
        await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email: email
        });
        console.log('✅ User exists');
      } catch (error: any) {
        if (error.message?.includes('not found')) {
          return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ 
              error: 'No account found. Please sign up first.' 
            }),
          };
        }
      }
    }

    // Generate magic link (parallel processing where possible)
    console.log('⚡ Generating magic link...');
    const linkPromise = isSignUp 
      ? (async () => {
          // For signup: create user first, then generate link
          const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            email_confirm: false
          });

          if (createError?.message?.includes('already registered')) {
            throw new Error('Account exists. Try signing in instead.');
          }
          if (createError) throw createError;

          return await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: email,
            options: { redirectTo: `${process.env.URL || 'https://whatthemenu.com'}/` }
          });
        })()
      : supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email: email,
          options: { redirectTo: `${process.env.URL || 'https://whatthemenu.com'}/` }
        });

    const linkData = await linkPromise;

    if (!linkData?.properties?.action_link) {
      throw new Error('Failed to generate magic link');
    }

    const magicLink = linkData.properties.action_link;
    const linkGenTime = Date.now() - requestStart;
    console.log(`✅ Magic link generated in ${linkGenTime}ms`);

    // Initialize speed-optimized email service
    const emailService = new SpeedOptimizedEmailService(
      process.env.RESEND_API_KEY!,
      process.env.SENDGRID_API_KEY, // Optional fallback
      'WhatTheMenu <noreply@whatthemenu.com>' // Your verified domain
    );

    console.log('⚡ Sending email at maximum speed...');
    
    // Use the racing email system for maximum speed
    const emailResult = await emailService.sendMagicLinkFast(
      email,
      magicLink,
      isSignUp
    );

    const totalTime = Date.now() - requestStart;
    
    if (!emailResult.success) {
      console.error(`❌ Email failed after ${totalTime}ms:`, emailResult.error);
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          error: 'Failed to send email',
          details: emailResult.error 
        }),
      };
    }

    console.log(`🚀 SUCCESS! Total time: ${totalTime}ms (Email: ${emailResult.duration}ms via ${emailResult.provider})`);
    
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        success: true,
        message: 'Magic link sent successfully',
        emailId: emailResult.id,
        provider: emailResult.provider,
        timing: {
          total: totalTime,
          email: emailResult.duration,
          linkGeneration: linkGenTime
        }
      }),
    };
    
  } catch (error: any) {
    const totalTime = Date.now() - requestStart;
    console.error(`❌ Function failed after ${totalTime}ms:`, error.message);
    
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        error: error.message || 'Internal server error',
        timing: { total: totalTime }
      }),
    };
  }
};
// netlify/functions/verify-magic-link.ts

import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Verify token signature
function verifyTokenSignature(token: string, email: string, signature: string): boolean {
  const secret = process.env.SUPABASE_JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const expectedSignature = createHmac('sha256', secret)
    .update(`${token}:${email}`)
    .digest('hex');
  
  return signature === expectedSignature;
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
    const { token, signature, email } = JSON.parse(event.body);
    
    if (!token || !signature || !email) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Missing required parameters' }),
      };
    }

    // Verify the token signature
    if (!verifyTokenSignature(token, email, signature)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Invalid token signature' }),
      };
    }

    // Look up the token in the database
    const { data: tokenData, error: tokenError } = await supabase
      .from('magic_link_tokens')
      .select('*')
      .eq('token', token)
      .eq('email', email)
      .eq('used', false)
      .single();

    if (tokenError || !tokenData) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Invalid or expired token' }),
      };
    }

    // Check if token has expired
    if (new Date() > new Date(tokenData.expires_at)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Token has expired' }),
      };
    }

    // Mark token as used
    await supabase
      .from('magic_link_tokens')
      .update({ used: true, used_at: new Date().toISOString() })
      .eq('token', token);

    // Handle sign up vs sign in
    if (tokenData.is_signup) {
      // Create new user
      const { data: newUser, error: signupError } = await supabase.auth.admin.createUser({
        email: email,
        email_confirm: true, // Mark email as confirmed
        user_metadata: {
          source: 'magic_link',
          created_via: 'custom_auth'
        }
      });

      if (signupError) {
        console.error('Signup error:', signupError);
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ 
            error: signupError.message || 'Failed to create account' 
          }),
        };
      }

      // Generate session token for the new user
      const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: email,
        options: {
          redirectTo: `${process.env.URL || 'https://whatthemenu.com'}/`
        }
      });

      if (sessionError || !sessionData.properties?.hashed_token) {
        return {
          statusCode: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ error: 'Failed to create session' }),
        };
      }

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: true,
          message: 'Account created successfully',
          redirectUrl: `${process.env.URL || 'https://whatthemenu.com'}/auth/callback?token_hash=${sessionData.properties.hashed_token}&type=signup`
        }),
      };

    } else {
      // Sign in existing user
      const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: email,
        options: {
          redirectTo: `${process.env.URL || 'https://whatthemenu.com'}/`
        }
      });

      if (sessionError || !sessionData.properties?.hashed_token) {
        return {
          statusCode: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ error: 'Failed to create session' }),
        };
      }

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: true,
          message: 'Sign in successful',
          redirectUrl: `${process.env.URL || 'https://whatthemenu.com'}/auth/callback?token_hash=${sessionData.properties.hashed_token}&type=magiclink`
        }),
      };
    }

  } catch (error: any) {
    console.error('Magic link verification error:', error);
    
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
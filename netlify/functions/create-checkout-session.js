// netlify/functions/create-checkout-session.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

exports.handler = async (event, context) => {
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
    const { priceId, userId, planType } = JSON.parse(event.body);

    console.log('Received request:', { priceId, userId, planType });

    if (!priceId || !userId || !planType) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ 
          error: 'Missing required fields: priceId, userId, planType' 
        }),
      };
    }

    // First, try to get user profile from your custom table
    let { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('email, stripe_customer_id')
      .eq('id', userId)
      .single();

    console.log('User profile query result:', { userProfile, userError });

    // If user profile doesn't exist, create it
    if (userError && userError.code === 'PGRST116') {
      console.log('User profile not found, creating new profile...');
      
      // Get user's email from Supabase auth
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
      
      console.log('Auth user lookup:', { authUser: authUser?.user?.email, authError });

      if (authError || !authUser.user) {
        return {
          statusCode: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
          body: JSON.stringify({ error: 'User not found in authentication system' }),
        };
      }

      // Create user profile
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          email: authUser.user.email,
          subscription_type: 'free',
          scans_used: 0,
          scans_limit: 5,
          current_menu_dish_explanations: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('email, stripe_customer_id')
        .single();

      console.log('User profile creation result:', { newProfile, createError });

      if (createError) {
        console.error('Error creating user profile:', createError);
        return {
          statusCode: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
          body: JSON.stringify({ error: 'Failed to create user profile' }),
        };
      }

      userProfile = newProfile;
    } else if (userError) {
      console.error('Database error:', userError);
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ error: 'Database error' }),
      };
    }

    if (!userProfile) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ error: 'User profile not found after creation attempt' }),
      };
    }

    let customerId = userProfile.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      console.log('Creating new Stripe customer...');
      const customer = await stripe.customers.create({
        email: userProfile.email,
        metadata: {
          userId: userId,
        },
      });
      customerId = customer.id;
      console.log('Created Stripe customer:', customerId);

      // Update user profile with customer ID
      await supabase
        .from('user_profiles')
        .update({ 
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
    }

    // Create checkout session
    console.log('Creating Stripe checkout session...');
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${event.headers.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${event.headers.origin}/payment-cancelled`,
      metadata: {
        userId: userId,
        planType: planType, // 'daily' or 'weekly'
      },
    });

    console.log('Checkout session created:', session.id);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ 
        sessionId: session.id,
        url: session.url 
      }),
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ 
        error: 'Failed to create checkout session',
        details: error.message 
      }),
    };
  }
};
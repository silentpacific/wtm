// netlify/functions/create-checkout-session.js
// Updated to handle new scan limits for paid users

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Use service role key for admin operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
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
    const { priceId, userId, planType, userEmail } = JSON.parse(event.body);

    console.log('Received request:', { priceId, userId, planType, userEmail });

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

    // Validate planType
    if (!['daily', 'weekly'].includes(planType)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ 
          error: 'Invalid planType. Must be daily or weekly.' 
        }),
      };
    }

    // First, try to get user profile from your custom table
    let { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('email, stripe_customer_id, scans_used')
      .eq('id', userId)
      .single();

    console.log('User profile query result:', { userProfile, userError });

    // If user profile doesn't exist, create it using the email from frontend
    if (userError && userError.code === 'PGRST116') {
      console.log('User profile not found, creating new profile...');
      
      if (!userEmail) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
          body: JSON.stringify({ error: 'User email is required to create profile' }),
        };
      }

      // Create user profile using email from frontend
      // NOTE: We don't set scans_limit here since it's now calculated dynamically
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          email: userEmail,
          subscription_type: 'free',
          scans_used: 0,
          scans_limit: 5, // Default free tier limit
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
        })
        .select('email, stripe_customer_id, scans_used')
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

    // Create checkout session with enhanced metadata
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
        currentScansUsed: userProfile.scans_used?.toString() || '0', // Track current usage for potential reset
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
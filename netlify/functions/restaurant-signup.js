const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Generate a unique slug from restaurant name
const generateSlug = (restaurantName: string): string => {
  return restaurantName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .substring(0, 50); // Limit length
};

// Check if slug is available
const isSlugAvailable = async (slug: string): Promise<boolean> => {
  const { data } = await supabaseAdmin
    .from('restaurant_accounts')
    .select('slug')
    .eq('slug', slug)
    .single();
  
  return !data; // If no data found, slug is available
};

// Generate unique slug
const generateUniqueSlug = async (restaurantName: string): Promise<string> => {
  let baseSlug = generateSlug(restaurantName);
  let slug = baseSlug;
  let counter = 1;
  
  while (!(await isSlugAvailable(slug))) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
};

export const handler = async (event: any) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { email, password, restaurantName, contactPerson, phone, address, city, state, country } = body;

    if (!email || !password || !restaurantName) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Create auth user with admin client
    const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: password,
      email_confirm: true, // Auto-confirm email for restaurants
      user_metadata: {
        source: 'restaurant_signup',
        restaurant_name: restaurantName,
        timestamp: new Date().toISOString()
      }
    });

    if (signUpError) {
      throw signUpError;
    }

    if (!signUpData.user) {
      throw new Error('Failed to create user account');
    }

    // Generate unique slug
    const slug = await generateUniqueSlug(restaurantName);

    // Create restaurant account record
    const restaurantData = {
      id: signUpData.user.id,
      email: email.trim().toLowerCase(),
      restaurant_name: restaurantName,
      slug: slug,
      contact_person: contactPerson || null,
      phone: phone || null,
      address: address || null,
      city: city || null,
      state: state || null,
      country: country || 'Australia',
      subscription_status: 'trial',
      trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      page_views: 0,
      total_dish_clicks: 0,
      is_active: true
    };

    const { data: restaurantAccount, error: restaurantError } = await supabaseAdmin
      .from('restaurant_accounts')
      .insert(restaurantData)
      .select()
      .single();

    if (restaurantError) {
      console.error('Error creating restaurant account:', restaurantError);
      throw new Error('Failed to create restaurant account');
    }

    // Send welcome email
    try {
      await fetch(`${process.env.URL}/.netlify/functions/restaurant-welcome-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: signUpData.user.id,
          email: email,
          restaurantName: restaurantName,
          contactPerson: contactPerson
        }),
      });
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Don't fail the signup if email fails
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ 
        success: true, 
        user: signUpData.user,
        restaurant: restaurantAccount,
        message: 'Restaurant account created successfully'
      }),
    };

  } catch (error: any) {
    console.error('Restaurant signup error:', error);
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ 
        error: error.message || 'Failed to create restaurant account' 
      }),
    };
  }
};
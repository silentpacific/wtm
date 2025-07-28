// netlify/functions/cleanup-expired-subscriptions.ts
import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const handler: Handler = async (event, context) => {
  try {
    console.log('🧹 Starting cleanup of expired subscriptions...');
    
    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Find all users with expired subscriptions that haven't been cleaned up yet
    const now = new Date().toISOString();
    
    const { data: expiredUsers, error: queryError } = await supabase
      .from('user_profiles')
      .select('id, email, subscription_type, subscription_expires_at')
      .eq('subscription_status', 'active')
      .neq('subscription_type', 'free')
      .lt('subscription_expires_at', now);

    if (queryError) {
      console.error('❌ Database query error:', queryError);
      throw new Error('Failed to query expired subscriptions');
    }

    if (!expiredUsers || expiredUsers.length === 0) {
      console.log('✅ No expired subscriptions found that need cleanup');
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          message: 'No expired subscriptions to clean up',
          cleaned: 0,
          timestamp: new Date().toISOString()
        }),
      };
    }

    console.log(`🔄 Found ${expiredUsers.length} expired subscriptions to clean up`);

    // Clean up each expired user
    const cleanupPromises = expiredUsers.map(async (user) => {
      try {
        const { error } = await supabase
          .from('user_profiles')
          .update({
            subscription_type: 'free',
            subscription_status: 'inactive',
            subscription_expires_at: null,
            scans_used: 0, // Reset to give them fresh free tier limits
            current_menu_dish_explanations: 0,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) {
          console.error(`❌ Failed to clean up user ${user.id}:`, error);
          return {
            userId: user.id,
            email: user.email,
            success: false,
            error: error.message
          };
        }

        console.log(`✅ Successfully cleaned up expired subscription for user ${user.id}`);
        return {
          userId: user.id,
          email: user.email,
          success: true,
          previousType: user.subscription_type
        };

      } catch (userError) {
        console.error(`❌ Error processing user ${user.id}:`, userError);
        return {
          userId: user.id,
          email: user.email,
          success: false,
          error: userError instanceof Error ? userError.message : 'Unknown error'
        };
      }
    });

    // Wait for all cleanup operations to complete
    const results = await Promise.all(cleanupPromises);
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success);

    console.log(`✅ Cleanup completed: ${successful} users reset to free tier, ${failed.length} failed`);

    if (failed.length > 0) {
      console.error('❌ Failed cleanups:', failed);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Expired subscription cleanup completed',
        totalFound: expiredUsers.length,
        cleaned: successful,
        failed: failed.length,
        failures: failed,
        timestamp: new Date().toISOString()
      }),
    };

  } catch (error) {
    console.error('❌ Cleanup process error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error during cleanup',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
    };
  }
};

export { handler };
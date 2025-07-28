// services/counterService.ts - COMPLETE VERSION with all required functions

import { supabase } from './supabaseClient';

export interface UserCounters {
  scans_used: number;
  scans_limit: number;
  current_menu_dish_explanations: number;
  subscription_type: string;
  subscription_status: string;
  subscription_expires_at: string | null;
  lifetime_menus_scanned: number;
  lifetime_dishes_explained: number;
}

export interface GlobalCounters {
  total_menus_scanned: number;
  total_dishes_explained: number;
}

// Helper function to check if subscription is expired
const isSubscriptionExpired = (expiresAt: string | null): boolean => {
  if (!expiresAt) return true;
  
  const now = new Date();
  const expiry = new Date(expiresAt);
  
  return now >= expiry;
};

// Function to handle expired subscription cleanup
const handleExpiredSubscription = async (userId: string): Promise<void> => {
  console.log('🔄 Handling expired subscription for user:', userId);
  
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
    .eq('id', userId);

  if (error) {
    console.error('❌ Error handling expired subscription:', error);
    throw error;
  }
  
  console.log('✅ Successfully reset expired user to free tier');
};

export const getUserCounters = async (userId: string): Promise<UserCounters> => {
  try {
    // Get user profile from database
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ Error fetching user profile:', error);
      throw error;
    }

    if (!profile) {
      throw new Error('User profile not found');
    }

    // Check if subscription is expired and handle it
    const subscriptionExpired = isSubscriptionExpired(profile.subscription_expires_at);
    
    if (subscriptionExpired && profile.subscription_type !== 'free') {
      console.log('⏰ Subscription expired, resetting user to free tier...');
      
      // Reset the user to free tier
      await handleExpiredSubscription(userId);
      
      // Return fresh free tier data
      return {
        scans_used: 0,
        scans_limit: 5,
        current_menu_dish_explanations: 0,
        subscription_type: 'free',
        subscription_status: 'inactive',
        subscription_expires_at: null,
        lifetime_menus_scanned: profile.lifetime_menus_scanned || 0,
        lifetime_dishes_explained: profile.lifetime_dishes_explained || 0,
      };
    }

    // Calculate dynamic scan limits based on ACTIVE subscription
    let scanLimit = 5; // Default free tier
    if (!subscriptionExpired) {
      switch (profile.subscription_type?.toLowerCase()) {
        case 'daily':
          scanLimit = 10;
          break;
        case 'weekly':
          scanLimit = 70;
          break;
        default:
          scanLimit = 5;
      }
    }

    return {
      scans_used: profile.scans_used || 0,
      scans_limit: scanLimit,
      current_menu_dish_explanations: profile.current_menu_dish_explanations || 0,
      subscription_type: subscriptionExpired ? 'free' : (profile.subscription_type || 'free'),
      subscription_status: subscriptionExpired ? 'inactive' : (profile.subscription_status || 'inactive'),
      subscription_expires_at: subscriptionExpired ? null : profile.subscription_expires_at,
      lifetime_menus_scanned: profile.lifetime_menus_scanned || 0,
      lifetime_dishes_explained: profile.lifetime_dishes_explained || 0,
    };

  } catch (error) {
    console.error('❌ Error in getUserCounters:', error);
    throw error;
  }
};

// Function to check if user can scan (with expiration check)
export const canUserScan = async (userId: string): Promise<boolean> => {
  try {
    const counters = await getUserCounters(userId);
    return counters.scans_used < counters.scans_limit;
  } catch (error) {
    console.error('❌ Error checking if user can scan:', error);
    return false;
  }
};

// Function to check if user has unlimited dish explanations (with expiration check)
export const hasUnlimitedDishExplanations = async (userId: string): Promise<boolean> => {
  try {
    const counters = await getUserCounters(userId);
    
    // Only paid users with active subscriptions get unlimited explanations
    if (counters.subscription_status === 'active' && counters.subscription_expires_at) {
      const now = new Date();
      const expiresAt = new Date(counters.subscription_expires_at);
      
      if (now < expiresAt) {
        return ['daily', 'weekly'].includes(counters.subscription_type.toLowerCase());
      }
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error checking unlimited dish explanations:', error);
    return false;
  }
};

// Function to check if user can explain a dish (with expiration check)
export const canUserExplainDish = async (userId: string): Promise<boolean> => {
  try {
    const counters = await getUserCounters(userId);
    
    // Check if user has unlimited dish explanations (paid + active subscription)
    const hasUnlimited = await hasUnlimitedDishExplanations(userId);
    
    if (hasUnlimited) {
      return true; // Unlimited explanations for paid users
    }
    
    // Free users: limited to 5 explanations per menu
    return counters.current_menu_dish_explanations < 5;
  } catch (error) {
    console.error('❌ Error checking if user can explain dish:', error);
    return false;
  }
};

// Global counter functions
export const incrementMenuScans = async (): Promise<void> => {
  try {
    const { error } = await supabase.rpc('increment_global_counter', {
      counter_name: 'total_menus_scanned'
    });
    
    if (error) {
      console.error('❌ Error incrementing menu scans:', error);
      throw error;
    }
    
    console.log('✅ Global menu scan counter incremented');
  } catch (error) {
    console.error('❌ Error in incrementMenuScans:', error);
    throw error;
  }
};

export const incrementDishExplanations = async (): Promise<void> => {
  try {
    const { error } = await supabase.rpc('increment_global_counter', {
      counter_name: 'total_dishes_explained'
    });
    
    if (error) {
      console.error('❌ Error incrementing dish explanations:', error);
      throw error;
    }
    
    console.log('✅ Global dish explanations counter incremented');
  } catch (error) {
    console.error('❌ Error in incrementDishExplanations:', error);
    throw error;
  }
};

// Function to get global counters
export const getGlobalCounters = async (): Promise<GlobalCounters> => {
  try {
    const { data, error } = await supabase
      .from('global_counters')
      .select('counter_type, count')
      .in('counter_type', ['total_menus_scanned', 'total_dishes_explained']);

    if (error) {
      console.error('❌ Error fetching global counters:', error);
      throw error;
    }

    // Convert array to object with default values
    const counters: GlobalCounters = {
      total_menus_scanned: 0,
      total_dishes_explained: 0
    };

    if (data) {
      data.forEach(row => {
        if (row.counter_type === 'total_menus_scanned') {
          counters.total_menus_scanned = row.count || 0;
        } else if (row.counter_type === 'total_dishes_explained') {
          counters.total_dishes_explained = row.count || 0;
        }
      });
    }

    return counters;
  } catch (error) {
    console.error('❌ Error in getGlobalCounters:', error);
    // Return defaults on error
    return {
      total_menus_scanned: 0,
      total_dishes_explained: 0
    };
  }
};

// Function to set up real-time counter updates
export const setupRealtimeCounters = (callback: (counters: GlobalCounters) => void) => {
  const subscription = supabase
    .channel('global_counters_realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'global_counters'
      },
      async () => {
        // When counters change, fetch latest and call callback
        try {
          const updatedCounters = await getGlobalCounters();
          callback(updatedCounters);
        } catch (error) {
          console.error('❌ Error updating real-time counters:', error);
        }
      }
    )
    .subscribe();

  return subscription;
};

// Function to subscribe to real-time counter updates
export const subscribeToCounters = (callback: () => void) => {
  // Subscribe to global_counters table changes
  const subscription = supabase
    .channel('global_counters_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'global_counters'
      },
      callback
    )
    .subscribe();

  return subscription;
};
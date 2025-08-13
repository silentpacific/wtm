// services/counterService.ts - DEFENSIVE VERSION with extensive null checks

import { supabase } from './supabaseClient';

export interface UserCounters {
  scans_used: number;
  scans_limit: number;
  current_menu_dish_explanations: number;
  subscription_type: string;
  subscription_status: string;
  subscription_expires_at: string | null;
  lifetime_menus_scanned: number;
  lifetime_dish_explanations: number;
}

export interface GlobalCounters {
  menus_scanned: number;
  dish_explanations: number;
}

// Helper function to safely check if subscription is expired
const isSubscriptionExpired = (expiresAt: string | null | undefined): boolean => {
  if (!expiresAt) return true;
  
  try {
    const now = new Date();
    const expiry = new Date(expiresAt);
    
    // Check if date is valid
    if (isNaN(expiry.getTime())) return true;
    
    return now >= expiry;
  } catch (error) {
    console.error('Error checking subscription expiry:', error);
    return true; // Assume expired if we can't parse
  }
};

// Function to handle expired subscription cleanup
const handleExpiredSubscription = async (userId: string): Promise<void> => {
  try {
    console.log('🔄 Handling expired subscription for user:', userId);
    
    const { error } = await supabase
      .from('user_profiles')
      .update({
        subscription_type: 'free',
        subscription_status: 'inactive',
        subscription_expires_at: null,
        scans_used: 0,
        current_menu_dish_explanations: 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('❌ Error handling expired subscription:', error);
      throw error;
    }
    
    console.log('✅ Successfully reset expired user to free tier');
  } catch (error) {
    console.error('❌ Error in handleExpiredSubscription:', error);
    throw error;
  }
};

export const getUserCounters = async (userId: string): Promise<UserCounters> => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

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

    // Safely check if subscription is expired
    const subscriptionExpired = isSubscriptionExpired(profile.subscription_expires_at);
    
    if (subscriptionExpired && profile.subscription_type !== 'free') {
      console.log('⏰ Subscription expired, resetting user to free tier...');
      
      try {
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
          lifetime_menus_scanned: Number(profile.lifetime_menus_scanned) || 0,
          lifetime_dish_explanations: Number(profile.lifetime_dish_explanations) || 0,
        };
      } catch (resetError) {
        console.error('❌ Error resetting expired subscription:', resetError);
        // Continue with expired data rather than crashing
      }
    }

    // Calculate dynamic scan limits based on ACTIVE subscription
    let scanLimit = 5; // Default free tier
    if (!subscriptionExpired && profile.subscription_type) {
      switch (profile.subscription_type.toLowerCase()) {
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
      scans_used: Number(profile.scans_used) || 0,
      scans_limit: scanLimit,
      current_menu_dish_explanations: Number(profile.current_menu_dish_explanations) || 0,
      subscription_type: subscriptionExpired ? 'free' : (profile.subscription_type || 'free'),
      subscription_status: subscriptionExpired ? 'inactive' : (profile.subscription_status || 'inactive'),
      subscription_expires_at: subscriptionExpired ? null : profile.subscription_expires_at,
      lifetime_menus_scanned: Number(profile.lifetime_menus_scanned) || 0,
      lifetime_dish_explanations: Number(profile.lifetime_dish_explanations) || 0,
    };

  } catch (error) {
    console.error('❌ Error in getUserCounters:', error);
    
    // Return safe defaults instead of crashing
    return {
      scans_used: 0,
      scans_limit: 5,
      current_menu_dish_explanations: 0,
      subscription_type: 'free',
      subscription_status: 'inactive',
      subscription_expires_at: null,
      lifetime_menus_scanned: 0,
      lifetime_dish_explanations: 0,
    };
  }
};

// Function to check if user can scan (with expiration check)
export const canUserScan = async (userId: string): Promise<boolean> => {
  try {
    if (!userId) return false;
    
    const counters = await getUserCounters(userId);
    return (counters.scans_used || 0) < (counters.scans_limit || 5);
  } catch (error) {
    console.error('❌ Error checking if user can scan:', error);
    return false;
  }
};

// Function to check if user has unlimited dish explanations (with expiration check)
export const hasUnlimitedDishExplanations = async (userId: string): Promise<boolean> => {
  try {
    if (!userId) return false;
    
    const counters = await getUserCounters(userId);
    
    // Only paid users with active subscriptions get unlimited explanations
    if (counters.subscription_status === 'active' && counters.subscription_expires_at) {
      if (!isSubscriptionExpired(counters.subscription_expires_at)) {
        return ['daily', 'weekly'].includes((counters.subscription_type || '').toLowerCase());
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
    if (!userId) return false;
    
    const counters = await getUserCounters(userId);
    
    // Check if user has unlimited dish explanations (paid + active subscription)
    const hasUnlimited = await hasUnlimitedDishExplanations(userId);
    
    if (hasUnlimited) {
      return true; // Unlimited explanations for paid users
    }
    
    // Free users: limited to 5 explanations per menu
    return (counters.current_menu_dish_explanations || 0) < 5;
  } catch (error) {
    console.error('❌ Error checking if user can explain dish:', error);
    return false;
  }
};

// Function to get global counters with safe defaults - FIXED VERSION
export const getGlobalCounters = async (): Promise<GlobalCounters> => {
  try {
    // Use the RPC function instead of direct table access
    const { data, error } = await supabase.rpc('get_public_global_counters');

    if (error) {
      console.error('❌ Error fetching global counters:', error);
      // Return defaults on error instead of throwing
      return {
        menus_scanned: 152,
        dish_explanations: 524
      };
    }

    // Convert array to object with default values
    const counters: GlobalCounters = {
      menus_scanned: 0,
      dish_explanations: 0
    };

    if (data && Array.isArray(data)) {
      data.forEach(row => {
        if (row && row.counter_type && typeof row.count === 'number') {
          if (row.counter_type === 'menus_scanned') {
            counters.menus_scanned = row.count;
          } else if (row.counter_type === 'dish_explanations') {
            counters.dish_explanations = row.count;
          }
        }
      });
    }

    return {
      menus_scanned: counters.menus_scanned || 152,  // Use your real count
      dish_explanations: counters.dish_explanations || 524  // Use your real count
    };
  } catch (error) {
    console.error('❌ Error in getGlobalCounters:', error);
    // Return safe defaults on error
    return {
      menus_scanned: 152,
      dish_explanations: 524
    };
  }
};

// Global counter functions
export const incrementMenuScans = async (): Promise<void> => {
  try {
    const { error } = await supabase.rpc('increment_global_counter', {
      counter_name: 'menus_scanned'
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
      counter_name: 'dish_explanations'
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

// Safe function to set up real-time counter updates
export const setupRealtimeCounters = (callback: (counters: GlobalCounters) => void) => {
  try {
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
          try {
            // When counters change, fetch latest and call callback
            const updatedCounters = await getGlobalCounters();
            if (callback && typeof callback === 'function') {
              callback(updatedCounters);
            }
          } catch (error) {
            console.error('❌ Error updating real-time counters:', error);
          }
        }
      )
      .subscribe();

    return subscription;
  } catch (error) {
    console.error('❌ Error setting up real-time counters:', error);
    // Return a mock subscription object
    return {
      unsubscribe: () => console.log('Mock unsubscribe called')
    };
  }
};

// Fixed function to subscribe to real-time counter updates
export const subscribeToCounters = (callback: (counters: GlobalCounters) => void) => {
  try {
    const subscription = supabase
      .channel('global_counters_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'global_counters'
        },
        async () => {
          try {
            if (callback && typeof callback === 'function') {
              const updatedCounters = await getGlobalCounters();
              callback(updatedCounters);
            }
          } catch (error) {
            console.error('❌ Error in subscription callback:', error);
          }
        }
      )
      .subscribe();

    // Return proper unsubscribe function that matches expected interface
    return {
      unsubscribe: () => {
        try {
          if (subscription && subscription.unsubscribe && typeof subscription.unsubscribe === 'function') {
            subscription.unsubscribe();
            console.log('✅ Successfully unsubscribed from counters');
          }
        } catch (error) {
          console.error('❌ Error unsubscribing:', error);
        }
      }
    };
  } catch (error) {
    console.error('❌ Error setting up counter subscription:', error);
    // Return safe mock subscription that won't crash
    return {
      unsubscribe: () => console.log('Mock unsubscribe called - subscription setup failed')
    };
  }
};
// services/counterService.ts - FIXED VERSION with proper error handling and circuit breaker

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

// Circuit breaker to prevent infinite loops
class CircuitBreaker {
  private failureCount = 0;
  private failureThreshold = 3;
  private resetTimeout = 30000; // 30 seconds
  private lastFailureTime = 0;

  canExecute(): boolean {
    if (this.failureCount >= this.failureThreshold) {
      const now = Date.now();
      if (now - this.lastFailureTime >= this.resetTimeout) {
        this.reset();
        return true;
      }
      return false;
    }
    return true;
  }

  recordSuccess(): void {
    this.failureCount = 0;
  }

  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
  }

  reset(): void {
    this.failureCount = 0;
    this.lastFailureTime = 0;
  }
}

// Circuit breakers for different operations
const userProfileCircuitBreaker = new CircuitBreaker();
const globalCountersCircuitBreaker = new CircuitBreaker();

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

// FIXED: Get user counters with circuit breaker and proper error handling
export const getUserCounters = async (userId: string): Promise<UserCounters> => {
  // Check circuit breaker
  if (!userProfileCircuitBreaker.canExecute()) {
    console.warn('🚫 Circuit breaker open for user profiles, returning defaults');
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

  try {
    // Validate userId
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID provided');
    }

    console.log('🔍 Fetching user counters for:', userId);

    // Get user profile from database with timeout
    const { data: profile, error } = await Promise.race([
      supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      )
    ]) as any;

    if (error) {
      if (error.code === '42501') {
        console.error('❌ Permission denied for user_profiles table');
        userProfileCircuitBreaker.recordFailure();
        throw new Error('Database permission denied');
      }
      
      if (error.code === 'PGRST116') {
        console.log('📝 User profile not found, returning defaults');
        userProfileCircuitBreaker.recordSuccess();
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
      
      console.error('❌ Error fetching user profile:', error);
      userProfileCircuitBreaker.recordFailure();
      throw error;
    }

    if (!profile) {
      console.warn('⚠️ No profile data returned');
      userProfileCircuitBreaker.recordSuccess();
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

    // Record success
    userProfileCircuitBreaker.recordSuccess();

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
          lifetime_dish_explanations: Number(profile.lifetime_dishes_explained) || 0,
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

    console.log('✅ Successfully fetched user counters');
    return {
      scans_used: Number(profile.scans_used) || 0,
      scans_limit: scanLimit,
      current_menu_dish_explanations: Number(profile.current_menu_dish_explanations) || 0,
      subscription_type: subscriptionExpired ? 'free' : (profile.subscription_type || 'free'),
      subscription_status: subscriptionExpired ? 'inactive' : (profile.subscription_status || 'inactive'),
      subscription_expires_at: subscriptionExpired ? null : profile.subscription_expires_at,
      lifetime_menus_scanned: Number(profile.lifetime_menus_scanned) || 0,
      lifetime_dish_explanations: Number(profile.lifetime_dishes_explained) || 0,
    };

  } catch (error) {
    console.error('❌ Error in getUserCounters:', error);
    userProfileCircuitBreaker.recordFailure();
    
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

// FIXED: Get global counters with circuit breaker
export const getGlobalCounters = async (): Promise<GlobalCounters> => {
  // Check circuit breaker
  if (!globalCountersCircuitBreaker.canExecute()) {
    console.warn('🚫 Circuit breaker open for global counters, returning defaults');
    return {
      menus_scanned: 185,
      dish_explanations: 615
    };
  }

  try {
    console.log('🔍 Fetching global counters...');
    
    // Use the RPC function with timeout
    const { data, error } = await Promise.race([
      supabase.rpc('get_public_global_counters'),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Global counters timeout')), 5000)
      )
    ]) as any;

    if (error) {
      console.error('❌ Error fetching global counters:', error);
      globalCountersCircuitBreaker.recordFailure();
      // Return defaults on error instead of throwing
      return {
        menus_scanned: 185,
        dish_explanations: 615
      };
    }

    // Record success
    globalCountersCircuitBreaker.recordSuccess();

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

    console.log('✅ Successfully fetched global counters');
    return {
      menus_scanned: counters.menus_scanned || 185,
      dish_explanations: counters.dish_explanations || 615
    };
  } catch (error) {
    console.error('❌ Error in getGlobalCounters:', error);
    globalCountersCircuitBreaker.recordFailure();
    // Return safe defaults on error
    return {
      menus_scanned: 185,
      dish_explanations: 615
    };
  }
};

// Global counter functions with better error handling
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
    // Don't throw, let the app continue
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
    // Don't throw, let the app continue
  }
};

// FIXED: Safe function to set up real-time counter updates with unsubscribe tracking
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

// FIXED: Subscribe to counter updates with proper cleanup
export const subscribeToCounters = (callback: (counters: GlobalCounters) => void) => {
  try {
    console.log('📡 Setting up counter subscription...');
    
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

    console.log('✅ Counter subscription established');

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
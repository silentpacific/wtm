// services/counterService.ts - FIXED VERSION with proper error handling and simplified approach

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

// Simplified circuit breaker with better defaults
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

// FIXED: Get user counters with better timeout handling
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

    // FIXED: Use AbortController for proper timeout control
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds

    // Get user profile from database with proper timeout
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .abortSignal(controller.signal)
      .single();

    clearTimeout(timeoutId);

    if (error) {
      if (error.name === 'AbortError') {
        console.error('❌ User profile request timed out');
        userProfileCircuitBreaker.recordFailure();
        throw new Error('Request timeout');
      }
      
      if (error.code === '42501') {
        console.error('❌ Permission denied for user_profiles table');
        userProfileCircuitBreaker.recordFailure();
        throw new Error('Database permission denied');
      }
      
      if (error.code === 'PGRST116') {
        console.log('🔍 User profile not found, returning defaults');
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

// FIXED: Function to check if user can scan
export const canUserScan = (counters: UserCounters): boolean => {
  try {
    return (counters.scans_used || 0) < (counters.scans_limit || 5);
  } catch (error) {
    console.error('❌ Error checking if user can scan:', error);
    return false;
  }
};

// FIXED: Function to check if user has unlimited dish explanations
export const hasUnlimitedDishExplanations = (counters: UserCounters): boolean => {
  try {
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

// FIXED: Function to check if user can explain a dish
export const canUserExplainDish = (counters: UserCounters): boolean => {
  try {
    // Check if user has unlimited dish explanations (paid + active subscription)
    const hasUnlimited = hasUnlimitedDishExplanations(counters);
    
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

// FIXED: Get global counters with simplified approach and better error handling
export const getGlobalCounters = async (): Promise<GlobalCounters> => {
  // Check circuit breaker
  if (!globalCountersCircuitBreaker.canExecute()) {
    console.warn('🚫 Circuit breaker open for global counters, returning defaults');
    return {
      menus_scanned: 186,
      dish_explanations: 616
    };
  }

  try {
    console.log('🔍 Fetching global counters...');
    
    // FIXED: Use AbortController instead of Promise.race for cleaner timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 seconds

    const { data, error } = await supabase
      .rpc('get_public_global_counters')
      .abortSignal(controller.signal);

    clearTimeout(timeoutId);

    if (error) {
      if (error.name === 'AbortError') {
        console.error('❌ Global counters request timed out');
        globalCountersCircuitBreaker.recordFailure();
        // Return defaults on timeout instead of throwing
        return {
          menus_scanned: 186,
          dish_explanations: 616
        };
      }
      
      console.error('❌ Error fetching global counters:', error);
      globalCountersCircuitBreaker.recordFailure();
      // Return defaults on error instead of throwing
      return {
        menus_scanned: 186,
        dish_explanations: 616
      };
    }

    // Record success
    globalCountersCircuitBreaker.recordSuccess();

    // Convert array to object with default values
    const counters: GlobalCounters = {
      menus_scanned: 186,
      dish_explanations: 616
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

    console.log('✅ Successfully fetched global counters:', counters);
    return counters;
  } catch (error) {
    console.error('❌ Error in getGlobalCounters:', error);
    globalCountersCircuitBreaker.recordFailure();
    // Return safe defaults on error
    return {
      menus_scanned: 186,
      dish_explanations: 616
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
      // Don't throw, let the app continue
      return;
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
      // Don't throw, let the app continue
      return;
    }
    
    console.log('✅ Global dish explanations counter incremented');
  } catch (error) {
    console.error('❌ Error in incrementDishExplanations:', error);
    // Don't throw, let the app continue
  }
};

// FIXED: Simplified subscription setup without complex real-time that causes timer issues
export const setupRealtimeCounters = (callback: (counters: GlobalCounters) => void) => {
  try {
    // Instead of complex real-time subscription, use simple polling
    const pollInterval = 30000; // 30 seconds
    
    const intervalId = setInterval(async () => {
      try {
        const updatedCounters = await getGlobalCounters();
        if (callback && typeof callback === 'function') {
          callback(updatedCounters);
        }
      } catch (error) {
        console.error('❌ Error updating polled counters:', error);
      }
    }, pollInterval);

    // Return cleanup function
    return {
      unsubscribe: () => {
        clearInterval(intervalId);
        console.log('✅ Counter polling stopped');
      }
    };
  } catch (error) {
    console.error('❌ Error setting up counter polling:', error);
    // Return safe mock subscription
    return {
      unsubscribe: () => console.log('Mock unsubscribe called')
    };
  }
};

// FIXED: Simplified subscription using polling instead of problematic real-time
export const subscribeToCounters = (callback: (counters: GlobalCounters) => void) => {
  try {
    console.log('🔄 Setting up counter polling...');
    
    // Use polling instead of real-time subscription to avoid timer issues
    const pollInterval = 30000; // 30 seconds
    
    const intervalId = setInterval(async () => {
      try {
        if (callback && typeof callback === 'function') {
          const updatedCounters = await getGlobalCounters();
          callback(updatedCounters);
        }
      } catch (error) {
        console.error('❌ Error in polling callback:', error);
      }
    }, pollInterval);

    console.log('✅ Counter polling established');

    // Return proper unsubscribe function
    return {
      unsubscribe: () => {
        try {
          clearInterval(intervalId);
          console.log('✅ Successfully stopped counter polling');
        } catch (error) {
          console.error('❌ Error stopping polling:', error);
        }
      }
    };
  } catch (error) {
    console.error('❌ Error setting up counter polling:', error);
    // Return safe mock subscription that won't crash
    return {
      unsubscribe: () => console.log('Mock unsubscribe called - polling setup failed')
    };
  }
};
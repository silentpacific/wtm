// services/counterService.ts - Updated with new scan limits for paid users

import { supabase } from './supabaseClient';

export interface GlobalCounters {
  menus_scanned: number;
  dish_explanations: number;
}

export interface UserCounters {
  scans_used: number;
  scans_limit: number;
  current_menu_dish_explanations: number;
  subscription_type: string;
  subscription_expires_at?: string;
  subscription_status?: string;
}

// Subscribers for real-time updates
type CounterSubscriber = (counters: GlobalCounters) => void;
let subscribers: CounterSubscriber[] = [];

// Helper function to determine scan limit based on subscription
const getScansLimit = (subscriptionType: string, subscriptionExpiresAt?: string, subscriptionStatus?: string): number => {
  // Check if subscription is active and not expired
  if (subscriptionStatus === 'active' && subscriptionExpiresAt) {
    const now = new Date();
    const expiresAt = new Date(subscriptionExpiresAt);
    
    if (now < expiresAt) {
      switch (subscriptionType.toLowerCase()) {
        case 'daily':
          return 10;
        case 'weekly':
          return 70;
        case 'free':
        default:
          return 5;
      }
    }
  }
  
  // Default to free tier limits if subscription is expired or inactive
  return 5;
};

// Helper function to check if user has unlimited dish explanations
const hasUnlimitedDishExplanations = (subscriptionType: string, subscriptionExpiresAt?: string, subscriptionStatus?: string): boolean => {
  if (subscriptionStatus === 'active' && subscriptionExpiresAt) {
    const now = new Date();
    const expiresAt = new Date(subscriptionExpiresAt);
    
    if (now < expiresAt) {
      return ['daily', 'weekly'].includes(subscriptionType.toLowerCase());
    }
  }
  
  return false;
};

// Get current global counters from database
export const getGlobalCounters = async (): Promise<GlobalCounters> => {
  try {
    const { data, error } = await supabase
      .from('global_counters')
      .select('counter_type, count')
      .in('counter_type', ['menus_scanned', 'dish_explanations']);

    if (error) {
      console.error('Error fetching global counters:', error);
      // Return default values on error
      return { menus_scanned: 0, dish_explanations: 0 };
    }

    // Convert array to object
    const counters: GlobalCounters = {
      menus_scanned: 0,
      dish_explanations: 0
    };

    console.log('📊 Raw counter data from database:', data);

    data?.forEach(row => {
      if (row.counter_type === 'menus_scanned') {
        counters.menus_scanned = row.count;
      } else if (row.counter_type === 'dish_explanations') {
        counters.dish_explanations = row.count;
      }
    });

    console.log('📊 Parsed counters:', counters);
    return counters;
  } catch (error) {
    console.error('Error in getGlobalCounters:', error);
    return { menus_scanned: 0, dish_explanations: 0 };
  }
};

// Get user-specific counters from database
export const getUserCounters = async (userId: string): Promise<UserCounters> => {
  try {
    console.log('🔍 Fetching user counters for userId:', userId);
    
    // Check if user profile exists first - now fetch subscription info too
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('scans_used, scans_limit, current_menu_dish_explanations, subscription_type, subscription_expires_at, subscription_status')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching user profile:', fetchError);
      // Return defaults if fetch fails
      return {
        scans_used: 0,
        scans_limit: 5,
        current_menu_dish_explanations: 0,
        subscription_type: 'free'
      };
    }

    if (!existingProfile) {
      console.log('👤 User profile not found, creating new profile for:', userId);
      
      // Get current user to get email
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const userEmail = authUser?.email || '';

      // Create new user profile with only the columns that exist
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          email: userEmail,
          subscription_type: 'free',
          scans_used: 0,
          scans_limit: 5,
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
        .select('scans_used, scans_limit, current_menu_dish_explanations, subscription_type, subscription_expires_at, subscription_status')
        .single();

      if (createError) {
        console.error('Error creating user profile:', createError);
        // Return safe defaults on error
        return {
          scans_used: 0,
          scans_limit: 5,
          current_menu_dish_explanations: 0,
          subscription_type: 'free'
        };
      }

      console.log('✅ Created new user profile:', newProfile);
      
      return {
        scans_used: newProfile?.scans_used || 0,
        scans_limit: getScansLimit(newProfile?.subscription_type || 'free', newProfile?.subscription_expires_at, newProfile?.subscription_status),
        current_menu_dish_explanations: newProfile?.current_menu_dish_explanations || 0,
        subscription_type: newProfile?.subscription_type || 'free',
        subscription_expires_at: newProfile?.subscription_expires_at,
        subscription_status: newProfile?.subscription_status
      };
    }

    console.log('✅ Found existing user profile:', existingProfile);

    // Calculate dynamic scan limit based on subscription
    const dynamicScansLimit = getScansLimit(
      existingProfile.subscription_type || 'free',
      existingProfile.subscription_expires_at,
      existingProfile.subscription_status
    );

    return {
      scans_used: existingProfile.scans_used || 0,
      scans_limit: dynamicScansLimit,
      current_menu_dish_explanations: existingProfile.current_menu_dish_explanations || 0,
      subscription_type: existingProfile.subscription_type || 'free',
      subscription_expires_at: existingProfile.subscription_expires_at,
      subscription_status: existingProfile.subscription_status
    };

  } catch (error) {
    console.error('Error in getUserCounters:', error);
    return {
      scans_used: 0,
      scans_limit: 5,
      current_menu_dish_explanations: 0,
      subscription_type: 'free'
    };
  }
};

// Check if user can scan (considering dynamic limits)
export const canUserScan = (userCounters: UserCounters): boolean => {
  return userCounters.scans_used < userCounters.scans_limit;
};

// Check if user can explain more dishes (unlimited for paid users)
export const canUserExplainDish = (userCounters: UserCounters): boolean => {
  // Paid users have unlimited dish explanations
  if (hasUnlimitedDishExplanations(
    userCounters.subscription_type,
    userCounters.subscription_expires_at,
    userCounters.subscription_status
  )) {
    return true;
  }
  
  // Free users have limit of 5 dishes per menu
  return userCounters.current_menu_dish_explanations < 5;
};

// Update user counters (for incrementing scans or dish explanations)
export const updateUserCounters = async (
  userId: string, 
  updates: Partial<Pick<UserCounters, 'scans_used' | 'current_menu_dish_explanations'>>
): Promise<void> => {
  try {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      console.error('Error updating user counters:', error);
      throw error;
    }

    console.log('✅ User counters updated successfully:', updates);
  } catch (error) {
    console.error('Error in updateUserCounters:', error);
    throw error;
  }
};

// Increment user's scan count
export const incrementUserScans = async (userId: string): Promise<void> => {
  try {
    // First get current count
    const userCounters = await getUserCounters(userId);
    
    // Check if user can scan
    if (!canUserScan(userCounters)) {
      throw new Error('Scan limit reached');
    }
    
    // Increment scan count
    await updateUserCounters(userId, {
      scans_used: userCounters.scans_used + 1
    });

    console.log('✅ User scan count incremented');
  } catch (error) {
    console.error('Error incrementing user scans:', error);
    throw error;
  }
};

// Increment user's dish explanation count
export const incrementUserDishExplanations = async (userId: string): Promise<void> => {
  try {
    // First get current count
    const userCounters = await getUserCounters(userId);
    
    // Check if user can explain dishes
    if (!canUserExplainDish(userCounters)) {
      throw new Error('Dish explanation limit reached');
    }
    
    // Increment dish explanation count
    await updateUserCounters(userId, {
      current_menu_dish_explanations: userCounters.current_menu_dish_explanations + 1
    });

    console.log('✅ User dish explanation count incremented');
  } catch (error) {
    console.error('Error incrementing user dish explanations:', error);
    throw error;
  }
};

// Reset user's dish explanations for new menu
export const resetUserDishExplanations = async (userId: string): Promise<void> => {
  try {
    await updateUserCounters(userId, {
      current_menu_dish_explanations: 0
    });

    console.log('✅ User dish explanations reset for new menu');
  } catch (error) {
    console.error('Error resetting user dish explanations:', error);
    throw error;
  }
};

// Initialize counter if it doesn't exist, without resetting its value
const initializeCounter = async (counterType: string): Promise<void> => {
  try {
    // Attempt to upsert, inserting if not exists, and ignoring updates if it does.
    // This achieves 'insert if not exists' without resetting the count.
    const { error } = await supabase
      .from('global_counters')
      .upsert(
        {
          counter_type: counterType,
          count: 0 // Initial count if it's a new entry
        },
        {
          onConflict: 'counter_type', // Column(s) to check for conflict
          ignoreDuplicates: true // Do nothing if a conflict occurs
        }
      );

    if (error) {
      console.error(`Error initializing ${counterType} counter:`, error);
    } else {
      console.log(`Counter '${counterType}' initialized or already exists.`);
    }
  } catch (error) {
    console.error(`Error in initializeCounter for ${counterType}:`, error);
  }
};

// Increment menu scans counter in database
export const incrementMenuScans = async (): Promise<void> => {
  try {
    // First ensure the counter exists (will not reset existing ones now)
    await initializeCounter('menus_scanned');

    // Increment the counter using an RPC call (atomic increment)
    const { data, error } = await supabase.rpc('increment_global_counter', {
      counter_name: 'menus_scanned'
    });

    if (error) {
      console.error('Error incrementing menu scans:', error);
      throw error;
    }

    console.log('Menu scan counter incremented successfully via RPC');

    // Real-time subscription will now handle the UI update, no manual refresh needed.
  } catch (error) {
    console.error('Error in incrementMenuScans:', error);
    throw error;
  }
};

// Increment dish explanations counter in database
export const incrementDishExplanations = async (): Promise<void> => {
  try {
    // First ensure the counter exists (will not reset existing ones now)
    await initializeCounter('dish_explanations');

    // Increment the counter using an RPC call (atomic increment)
    const { data, error } = await supabase.rpc('increment_global_counter', {
      counter_name: 'dish_explanations'
    });

    if (error) {
      console.error('Error incrementing dish explanations:', error);
      throw error;
    }

    console.log('Dish explanation counter incremented successfully via RPC');

    // Real-time subscription will now handle the UI update, no manual refresh needed.
  } catch (error) {
    console.error('Error in incrementDishExplanations:', error);
    throw error;
  }
};

// Subscribe to counter updates (used by React components)
export const subscribeToCounters = (callback: CounterSubscriber) => {
  subscribers.push(callback);
  
  return {
    unsubscribe: () => {
      subscribers = subscribers.filter(sub => sub !== callback);
    }
  };
};

// Notify all subscribers of counter updates
const notifySubscribers = (counters: GlobalCounters) => {
  subscribers.forEach(callback => {
    callback(counters);
  });
};

// Set up real-time subscriptions for counter changes
export const setupRealtimeCounters = () => {
  console.log('📡 Setting up real-time subscription for global_counters table...');

  // Subscribe to changes in the 'global_counters' table
  const subscription = supabase
    .channel('global_counters_changes')
    .on(
      'postgres_changes',
      { 
        event: '*',
        schema: 'public',
        table: 'global_counters' 
      },
      async (payload) => {
        console.log('📡 Real-time change received:', payload);
        // Fetch the latest counters after any change to ensure consistency
        const updatedCounters = await getGlobalCounters();
        notifySubscribers(updatedCounters);
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('📡 Subscribed to global_counters real-time updates!');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('📡 Real-time channel error:', status);
      } else if (status === 'TIMED_OUT') {
        console.warn('📡 Real-time subscription timed out.');
      }
    });

  return subscription;
};
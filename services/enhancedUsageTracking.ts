// src/services/enhancedUsageTracking.ts
// Updated for new paid user scan limits (Daily: 10 scans, Weekly: 70 scans)

import { supabase } from './supabaseClient';
import { UserProfile } from '../types';

// Enhanced user profile interface with new tracking fields
export interface EnhancedUserProfile extends UserProfile {
  lifetime_menus_scanned: number;
  lifetime_dishes_explained: number;
  lifetime_restaurants_visited: number;
  lifetime_countries_explored: number;
  current_month_menus: number;
  current_month_dishes: number;
  current_month_restaurants: number;
  current_month_countries: number;
  usage_month: string;
  current_menu_dish_explanations: number;
  subscription_expires_at?: string;
  subscription_status?: string;
}

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

// Get current month string (YYYY-MM format)
const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

// Get or create enhanced user profile
export const getOrCreateEnhancedUserProfile = async (
  userId: string, 
  email?: string
): Promise<EnhancedUserProfile | null> => {
  try {
    const currentMonth = getCurrentMonth();
    
    // Try to get existing profile
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (existingProfile && !fetchError) {
      // Check if we need to reset monthly counters
      if (existingProfile.usage_month !== currentMonth) {
        console.log(`🗓️ New month detected for user ${userId}, resetting monthly counters`);
        
        // Save current month to history before resetting
        if (existingProfile.usage_month && 
            (existingProfile.current_month_menus > 0 || existingProfile.current_month_dishes > 0)) {
          
          const [year, month] = existingProfile.usage_month.split('-');
          await supabase
            .from('monthly_usage_history')
            .upsert({
              user_id: userId,
              year: parseInt(year),
              month: parseInt(month),
              menus_scanned: existingProfile.current_month_menus || 0,
              dishes_explained: existingProfile.current_month_dishes || 0,
              restaurants_visited: existingProfile.current_month_restaurants || 0,
              countries_explored: existingProfile.current_month_countries || 0
            });
        }
        
        // Reset monthly counters
        const { data: updatedProfile, error: updateError } = await supabase
          .from('user_profiles')
          .update({
            usage_month: currentMonth,
            current_month_menus: 0,
            current_month_dishes: 0,
            current_month_restaurants: 0,
            current_month_countries: 0,
            current_menu_dish_explanations: 0, // Reset current menu counter too
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select()
          .single();
          
        if (updateError) {
          console.error('Error updating profile for new month:', updateError);
          return existingProfile as EnhancedUserProfile;
        }
        
        return updatedProfile as EnhancedUserProfile;
      }
      
      // Ensure current_menu_dish_explanations field exists (for existing users)
      if (existingProfile.current_menu_dish_explanations === undefined) {
        const { data: updatedProfile, error: updateError } = await supabase
          .from('user_profiles')
          .update({
            current_menu_dish_explanations: 0,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select()
          .single();
          
        if (updateError) {
          console.error('Error adding current_menu_dish_explanations field:', updateError);
          return existingProfile as EnhancedUserProfile;
        }
        
        return updatedProfile as EnhancedUserProfile;
      }
      
      return existingProfile as EnhancedUserProfile;
    }

    // Create new profile if doesn't exist
    const newProfile = {
      id: userId,
      email: email,
      subscription_type: 'free' as const,
      subscription_expires_at: null,
      scans_used: 0,
      scans_limit: 5,
      dish_explanations_used: 0,
      lifetime_menus_scanned: 0,
      lifetime_dishes_explained: 0,
      lifetime_restaurants_visited: 0,
      lifetime_countries_explored: 0,
      current_month_menus: 0,
      current_month_dishes: 0,
      current_month_restaurants: 0,
      current_month_countries: 0,
      current_menu_dish_explanations: 0,
      usage_month: currentMonth
    };

    const { data: createdProfile, error: createError } = await supabase
      .from('user_profiles')
      .insert(newProfile)
      .select()
      .single();

    if (createError) {
      console.error('Error creating enhanced user profile:', createError);
      return null;
    }

    return createdProfile as EnhancedUserProfile;
  } catch (error) {
    console.error('Error in getOrCreateEnhancedUserProfile:', error);
    return null;
  }
};

// Increment user's menu scan count and reset dish counter
export const incrementUserMenuScan = async (userId: string): Promise<boolean> => {
  try {
    const { data: profile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('scans_used, lifetime_menus_scanned, current_month_menus, subscription_type, subscription_expires_at, subscription_status')
      .eq('id', userId)
      .single();

    if (fetchError || !profile) {
      console.error('Error fetching profile for menu scan increment:', fetchError);
      return false;
    }

    // Get dynamic scan limit
    const scanLimit = getScansLimit(
      profile.subscription_type,
      profile.subscription_expires_at,
      profile.subscription_status
    );

    // Check if user can scan
    if (profile.scans_used >= scanLimit) {
      console.error('User has reached scan limit');
      return false;
    }

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        scans_used: profile.scans_used + 1,
        lifetime_menus_scanned: (profile.lifetime_menus_scanned || 0) + 1,
        current_month_menus: (profile.current_month_menus || 0) + 1,
        current_menu_dish_explanations: 0, // Reset current menu dish counter
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error incrementing menu scan count:', updateError);
      return false;
    }

    console.log(`📸 User ${userId} menu scans: ${profile.scans_used + 1}/${scanLimit}, dishes reset to 0`);
    return true;
  } catch (error) {
    console.error('Error in incrementUserMenuScan:', error);
    return false;
  }
};

// Increment user's dish explanation count for current menu
export const incrementUserDishExplanation = async (userId: string): Promise<boolean> => {
  try {
    const { data: profile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('dish_explanations_used, lifetime_dishes_explained, current_month_dishes, current_menu_dish_explanations, subscription_type, subscription_expires_at, subscription_status')
      .eq('id', userId)
      .single();

    if (fetchError || !profile) {
      console.error('Error fetching profile for dish explanation increment:', fetchError);
      return false;
    }

    // Check if user has unlimited dish explanations (paid users)
    const hasUnlimited = hasUnlimitedDishExplanations(
      profile.subscription_type,
      profile.subscription_expires_at,
      profile.subscription_status
    );

    // For free users, check the 5-dish limit
    if (!hasUnlimited && (profile.current_menu_dish_explanations || 0) >= 5) {
      console.error('Free user has reached dish explanation limit for current menu');
      return false;
    }

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        dish_explanations_used: (profile.dish_explanations_used || 0) + 1,
        lifetime_dishes_explained: (profile.lifetime_dishes_explained || 0) + 1,
        current_month_dishes: (profile.current_month_dishes || 0) + 1,
        current_menu_dish_explanations: (profile.current_menu_dish_explanations || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error incrementing dish explanation count:', updateError);
      return false;
    }

    const currentCount = (profile.current_menu_dish_explanations || 0) + 1;
    const limitText = hasUnlimited ? '∞' : '5';
    console.log(`💡 User ${userId} dish explanations: ${currentCount}/${limitText} (current menu)`);
    return true;
  } catch (error) {
    console.error('Error in incrementUserDishExplanation:', error);
    return false;
  }
};

// Reset user's current menu dish explanations (called when new scan starts)
export const resetUserDishCounter = async (userId: string): Promise<boolean> => {
  try {
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        current_menu_dish_explanations: 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error resetting dish counter:', updateError);
      return false;
    }

    console.log(`🔄 User ${userId} dish counter reset to 0 for new menu`);
    return true;
  } catch (error) {
    console.error('Error in resetUserDishCounter:', error);
    return false;
  }
};

// Get enhanced usage summary for display
export const getEnhancedUsageSummary = (profile: EnhancedUserProfile | null) => {
  if (!profile) {
    return {
      scansUsed: 0,
      scansLimit: 5,
      explanationsUsed: 0,
      explanationsLimit: 5, // Free users have limit
      hasUnlimited: false,
      hasUnlimitedDishExplanations: false,
      canScan: true,
      canExplainDish: true,
      timeRemaining: null,
      // Historical data
      lifetimeStats: {
        menus: 0,
        dishes: 0,
        restaurants: 0,
        countries: 0
      },
      monthlyStats: {
        menus: 0,
        dishes: 0,
        restaurants: 0,
        countries: 0
      }
    };
  }

  // Calculate dynamic scan limit
  const dynamicScansLimit = getScansLimit(
    profile.subscription_type,
    profile.subscription_expires_at,
    profile.subscription_status
  );

  // Check if user has unlimited dish explanations
  const hasUnlimitedDishes = hasUnlimitedDishExplanations(
    profile.subscription_type,
    profile.subscription_expires_at,
    profile.subscription_status
  );

  // Check if user has active subscription
  const hasActiveSubscription = profile.subscription_type !== 'free' && 
    profile.subscription_status === 'active' && 
    profile.subscription_expires_at && 
    new Date() < new Date(profile.subscription_expires_at);

  return {
    scansUsed: profile.scans_used,
    scansLimit: dynamicScansLimit,
    explanationsUsed: profile.current_menu_dish_explanations || 0,
    explanationsLimit: hasUnlimitedDishes ? '∞' : 5,
    hasUnlimited: hasActiveSubscription,
    hasUnlimitedDishExplanations: hasUnlimitedDishes,
    canScan: profile.scans_used < dynamicScansLimit,
    canExplainDish: hasUnlimitedDishes || (profile.current_menu_dish_explanations || 0) < 5,
    timeRemaining: hasActiveSubscription && profile.subscription_expires_at ? 
      new Date(profile.subscription_expires_at).getTime() - new Date().getTime() : null,
    lifetimeStats: {
      menus: profile.lifetime_menus_scanned || 0,
      dishes: profile.lifetime_dishes_explained || 0,
      restaurants: profile.lifetime_restaurants_visited || 0,
      countries: profile.lifetime_countries_explored || 0
    },
    monthlyStats: {
      menus: profile.current_month_menus || 0,
      dishes: profile.current_month_dishes || 0,
      restaurants: profile.current_month_restaurants || 0,
      countries: profile.current_month_countries || 0
    }
  };
};
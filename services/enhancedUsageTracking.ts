// src/services/enhancedUsageTracking.ts
// Updated for per-menu dish limits

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
  current_menu_dish_explanations: number; // NEW: track current menu only
}

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
      current_menu_dish_explanations: 0, // NEW: track current menu
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
      .select('scans_used, lifetime_menus_scanned, current_month_menus')
      .eq('id', userId)
      .single();

    if (fetchError || !profile) {
      console.error('Error fetching profile for menu scan increment:', fetchError);
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

    console.log(`📸 User ${userId} menu scans: ${profile.scans_used + 1}, dishes reset to 0/5`);
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
      .select('dish_explanations_used, lifetime_dishes_explained, current_month_dishes, current_menu_dish_explanations')
      .eq('id', userId)
      .single();

    if (fetchError || !profile) {
      console.error('Error fetching profile for dish explanation increment:', fetchError);
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

    console.log(`💡 User ${userId} dish explanations: ${(profile.current_menu_dish_explanations || 0) + 1}/5 (current menu)`);
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

    console.log(`🔄 User ${userId} dish counter reset to 0/5 for new menu`);
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
      explanationsLimit: 5, // Changed: 5 per menu
      hasUnlimited: false,
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

  // Check if user has unlimited access
  if (profile.subscription_type !== 'free' && profile.subscription_expires_at) {
    const now = new Date();
    const expiresAt = new Date(profile.subscription_expires_at);
    
    if (now < expiresAt) {
      return {
        scansUsed: profile.scans_used,
        scansLimit: '∞',
        explanationsUsed: profile.current_menu_dish_explanations || 0,
        explanationsLimit: '∞',
        hasUnlimited: true,
        canScan: true,
        canExplainDish: true,
        timeRemaining: expiresAt.getTime() - now.getTime(),
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
    }
  }

  // Free users or expired subscription
  return {
    scansUsed: profile.scans_used,
    scansLimit: profile.scans_limit,
    explanationsUsed: profile.current_menu_dish_explanations || 0, // Current menu only
    explanationsLimit: 5, // 5 dishes per menu
    hasUnlimited: false,
    canScan: profile.scans_used < profile.scans_limit,
    canExplainDish: (profile.current_menu_dish_explanations || 0) < 5,
    timeRemaining: null,
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
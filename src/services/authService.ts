// src/services/authService.ts - Updated with fallback logic for profiles
import { supabase } from './supabaseClient';
import type { SignupData, LoginData, Restaurant } from './supabaseClient';

export class AuthService {
  /**
   * Sign up a new restaurant owner
   */
  static async signUpRestaurant(signupData: SignupData) {
    try {
      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            full_name: signupData.ownerName,
            restaurant_name: signupData.restaurantName
          }
        }
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Wait for auth to be fully established
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Create restaurant profile using user_restaurant_profiles table
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('user_restaurant_profiles')
        .insert([
          {
            auth_user_id: authData.user.id,
            name: signupData.restaurantName,
            owner_name: signupData.ownerName,
            cuisine_type: signupData.cuisineType,
            phone: signupData.phone,
            address: signupData.address,
            city: signupData.city
          }
        ])
        .select()
        .single();

      if (restaurantError) {
        console.error('Restaurant creation error:', restaurantError);
        throw new Error('Failed to create restaurant profile');
      }

      return {
        user: authData.user,
        restaurant: restaurantData,
        session: authData.session
      };

    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  /**
   * Sign in restaurant owner
   */
  static async signInRestaurant(loginData: LoginData) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Login failed');
      }

      // Wait a moment for session to be fully established
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log("[AuthService] Session user:", data.user);

      // Get profile (restaurant or fallback)
      const restaurant = await this.getRestaurantProfile(data.user.id);

      return {
        user: data.user,
        restaurant,
        session: data.session
      };

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Sign out current user
   */
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Signout error:', error);
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true };

    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  /**
   * Get current session
   */
  static async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw new Error(error.message);
      }

      if (!session) {
        return null;
      }

      console.log("[AuthService] Current session:", session);

      // Get profile (restaurant or fallback)
      const restaurant = await this.getRestaurantProfile(session.user.id);

      return {
        user: session.user,
        restaurant,
        session
      };

    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }

  /**
   * Get profile by auth user ID — check restaurant first, then fallback to user_profiles
   */
  static async getRestaurantProfile(authUserId: string): Promise<Restaurant | null> {
    try {
      console.log("[AuthService] Looking up restaurant profile for", authUserId);

      // Try restaurant profile first
      let { data: restaurant, error: restError } = await supabase
        .from('user_restaurant_profiles')
        .select('*')
        .eq('auth_user_id', authUserId)
        .maybeSingle();

      if (restError) {
        console.error("[AuthService] Restaurant profile error:", restError);
      }

      if (restaurant) {
        console.log("[AuthService] Found restaurant profile:", restaurant);
        return restaurant;
      }

      // Fallback to user_profiles
      console.log("[AuthService] No restaurant profile, trying user_profiles...");
      let { data: userProfile, error: userError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUserId)
        .maybeSingle();

      if (userError) {
        console.error("[AuthService] User profile error:", userError);
      }

      if (userProfile) {
        console.log("[AuthService] Found user profile:", userProfile);
        return userProfile as unknown as Restaurant;
      }

      console.warn("[AuthService] No profile found in either table for", authUserId);
      return null;

    } catch (error) {
      console.error("[AuthService] getProfile fatal error:", error);
      return null;
    }
  }

  /**
   * Update restaurant profile
   */
  static async updateRestaurantProfile(authUserId: string, updates: Partial<Restaurant>) {
    try {
      const { data, error } = await supabase
        .from('user_restaurant_profiles')
        .update(updates)
        .eq('auth_user_id', authUserId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;

    } catch (error) {
      console.error('Update restaurant profile error:', error);
      throw error;
    }
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export default AuthService;
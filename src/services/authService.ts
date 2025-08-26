// src/services/authService.ts - Restaurant Authentication Service
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

      // Step 2: Create restaurant profile
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
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
        // If restaurant creation fails, we should clean up the auth user
        // But for now, let's log the error and continue
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

      // Get restaurant profile
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

      // Get restaurant profile
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
   * Get restaurant profile by auth user ID
   */
  static async getRestaurantProfile(authUserId: string): Promise<Restaurant | null> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('auth_user_id', authUserId)
        .single();

      if (error) {
        console.error('Get restaurant profile error:', error);
        return null;
      }

      return data;

    } catch (error) {
      console.error('Get restaurant profile error:', error);
      return null;
    }
  }

  /**
   * Update restaurant profile
   */
  static async updateRestaurantProfile(authUserId: string, updates: Partial<Restaurant>) {
    try {
      const { data, error } = await supabase
        .from('restaurants')
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
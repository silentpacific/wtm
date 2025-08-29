// src/services/authService.ts - Clean version with only auth_user_id FK
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

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error('Failed to create user account');

      // Step 2: Create restaurant profile
      const profile = {
        auth_user_id: authData.user.id,
        email: signupData.email,
        full_name: signupData.ownerName,
        restaurant_name: signupData.restaurantName,
        owner_name: signupData.ownerName,
        cuisine_type: signupData.cuisineType,
        phone: signupData.phone,
        address: signupData.address,
        city: signupData.city
      };

      const { data: restaurantData, error: restaurantError } = await supabase
        .from('user_restaurant_profiles')
        .upsert([profile], { onConflict: 'auth_user_id' })
        .select()
        .single();

      if (restaurantError) throw new Error('Failed to create restaurant profile');

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

      if (error) throw new Error(error.message);
      if (!data.user) throw new Error('Login failed');

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
   * Get restaurant profile
   */
  static async getRestaurantProfile(authUserId: string): Promise<Restaurant | null> {
    try {
      const { data, error } = await supabase
        .from('user_restaurant_profiles')
        .select('*')
        .eq('auth_user_id', authUserId)
        .maybeSingle();

      if (error) {
        console.error('Get restaurant profile error:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Get restaurant profile fatal error:', error);
      return null;
    }
  }

  static async signOut() {
    await supabase.auth.signOut();
  }

  static async resetPassword(email: string) {
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    return { success: true };
  }

  static async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw new Error(error.message);
    if (!session) return null;

    const restaurant = await this.getRestaurantProfile(session.user.id);

    return {
      user: session.user,
      restaurant,
      session
    };
  }

  static async updateRestaurantProfile(authUserId: string, updates: Partial<Restaurant>) {
    const { data, error } = await supabase
      .from('user_restaurant_profiles')
      .update(updates)
      .eq('auth_user_id', authUserId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export default AuthService;

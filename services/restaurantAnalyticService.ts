import { supabase } from './supabaseClient';

export interface RestaurantStats {
  totalViews: number;
  thisWeek: number;
  thisMonth: number;
  totalDishes: number;
  popularDishes: Array<{
    name: string;
    views: number;
    section: string;
  }>;
  recentActivity: Array<{
    date: string;
    views: number;
  }>;
}

class RestaurantAnalyticsService {
  
  // Get restaurant analytics data
  async getRestaurantStats(restaurantId: number): Promise<RestaurantStats> {
    try {
      // Get total menu views for this restaurant
      const totalViews = await this.getRestaurantPageViews(restaurantId);
      
      // Get recent activity (last 7 days)
      const thisWeek = await this.getRecentViews(restaurantId, 7);
      
      // Get this month's views
      const thisMonth = await this.getRecentViews(restaurantId, 30);
      
      // Get total dishes count
      const totalDishes = await this.getTotalDishes(restaurantId);
      
      // Get popular dishes (if any)
      const popularDishes = await this.getPopularDishes(restaurantId);
      
      // Get recent activity chart data
      const recentActivity = await this.getRecentActivity(restaurantId);
      
      return {
        totalViews,
        thisWeek,
        thisMonth,
        totalDishes,
        popularDishes,
        recentActivity
      };
    } catch (error) {
      console.error('Error fetching restaurant stats:', error);
      // Return default stats if there's an error
      return {
        totalViews: 0,
        thisWeek: 0,
        thisMonth: 0,
        totalDishes: 0,
        popularDishes: [],
        recentActivity: []
      };
    }
  }

  // Get total page views for restaurant public page
  private async getRestaurantPageViews(restaurantId: number): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('total_scans, dishes_explained')
        .eq('id', restaurantId)
        .single();

      if (error) throw error;
      
      // Return total scans + dish explanations as total views
      return (data?.total_scans || 0) + (data?.dishes_explained || 0);
    } catch (error) {
      console.error('Error fetching restaurant page views:', error);
      return 0;
    }
  }

  // Get recent views (placeholder - would need proper tracking)
  private async getRecentViews(restaurantId: number, days: number): Promise<number> {
    try {
      // This is a simplified approach - in reality you'd have daily tracking
      const totalViews = await this.getRestaurantPageViews(restaurantId);
      
      // Estimate recent activity as a percentage of total
      const estimatedRecent = Math.floor(totalViews * 0.1); // Assume 10% in recent period
      
      return Math.max(estimatedRecent, 0);
    } catch (error) {
      console.error('Error fetching recent views:', error);
      return 0;
    }
  }

  // Get total dishes count
  private async getTotalDishes(restaurantId: number): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('restaurant_dishes')
        .select('id', { count: 'exact' })
        .eq('restaurant_id', restaurantId)
        .eq('is_available', true);

      if (error) throw error;
      
      return count || 0;
    } catch (error) {
      console.error('Error fetching dishes count:', error);
      // Return a default number for demo purposes
      return 0;
    }
  }

  // Get popular dishes (simplified)
  private async getPopularDishes(restaurantId: number): Promise<Array<{name: string; views: number; section: string}>> {
    try {
      const { data, error } = await supabase
        .from('restaurant_dishes')
        .select('dish_name, section_name')
        .eq('restaurant_id', restaurantId)
        .eq('is_available', true)
        .limit(5);

      if (error) throw error;
      
      // Mock some view data since we don't have real tracking yet
      return (data || []).map((dish, index) => ({
        name: dish.dish_name,
        views: Math.floor(Math.random() * 100) + 20, // Mock data
        section: dish.section_name
      })).sort((a, b) => b.views - a.views);
    } catch (error) {
      console.error('Error fetching popular dishes:', error);
      return [];
    }
  }

  // Get recent activity for charts
  private async getRecentActivity(restaurantId: number): Promise<Array<{date: string; views: number}>> {
    try {
      // Generate mock data for the last 7 days
      const activity = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        activity.push({
          date: date.toLocaleDateString(),
          views: Math.floor(Math.random() * 50) + 10 // Mock data
        });
      }
      
      return activity;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  // Track a page view (to be called from public restaurant pages)
  async trackPageView(restaurantSlug: string): Promise<void> {
    try {
      // First, get restaurant by slug
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurant_business_accounts')
        .select('id')
        .eq('slug', restaurantSlug)
        .single();

      if (restaurantError || !restaurant) {
        console.error('Restaurant not found:', restaurantSlug);
        return;
      }

      // Update the restaurants table (reusing existing structure)
      const { error: updateError } = await supabase.rpc(
        'increment_restaurant_scans',
        { restaurant_id: restaurant.id }
      );

      if (updateError) {
        console.error('Error tracking page view:', updateError);
      }
    } catch (error) {
      console.error('Error in trackPageView:', error);
    }
  }

  // Track dish explanation view
  async trackDishView(restaurantSlug: string): Promise<void> {
    try {
      // Similar to trackPageView but for dish explanations
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurant_business_accounts')
        .select('id')
        .eq('slug', restaurantSlug)
        .single();

      if (restaurantError || !restaurant) {
        console.error('Restaurant not found:', restaurantSlug);
        return;
      }

      // Update dish explanations count
      const { error: updateError } = await supabase.rpc(
        'increment_restaurant_dish_views',
        { restaurant_id: restaurant.id }
      );

      if (updateError) {
        console.error('Error tracking dish view:', updateError);
      }
    } catch (error) {
      console.error('Error in trackDishView:', error);
    }
  }
}

export const restaurantAnalyticsService = new RestaurantAnalyticsService();
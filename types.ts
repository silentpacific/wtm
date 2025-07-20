export interface Dish {
  name: string;
}

export interface MenuSection {
  sectionTitle: string;
  dishes: Dish[];
}

export interface DishExplanation {
  explanation: string;
  tags?: string[];
  allergens?: string[];
  cuisine?: string;
}

// Database interface for Supabase
export interface DishRecord {
  id?: number;
  name: string;
  explanation: string;
  tags: string[] | null;
  allergens: string[] | null;
  cuisine: string | null;
  created_at?: string;
  language?: string;
  restaurant_id?: number;
  restaurant_name?: string; // NEW: Store restaurant name directly
}

export interface Restaurant {
  id?: number;
  name: string;
  cuisine_type?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
  latitude?: number;
  longitude?: number;
  total_scans?: number;
  dishes_scanned?: number;
  dishes_explained?: number; // NEW: Track explanations requested
  last_scanned_at?: string;
  name_location_hash?: string;
  created_at?: string;
}

export interface MenuAnalysisResult {
  sections: MenuSection[];
  restaurantName?: string;
  detectedCuisine?: string;
}

// SAFE - Only adds new types, doesn't change existing ones

// Enhanced user profile with historical tracking
export interface EnhancedUserProfile extends UserProfile {
  lifetime_menus_scanned?: number;
  lifetime_dishes_explained?: number;
  lifetime_restaurants_visited?: number;
  lifetime_countries_explored?: number;
  current_month_menus?: number;
  current_month_dishes?: number;
  current_month_restaurants?: number;
  current_month_countries?: number;
  usage_month?: string;
}

// Usage summary for display components
export interface UsageSummary {
  scansUsed: number;
  scansLimit: number | string; // string for "∞"
  explanationsUsed: number;
  explanationsLimit: number | string; // string for "∞"
  hasUnlimited: boolean;
  canScan: boolean;
  timeRemaining: number | null;
  lifetimeStats?: {
    menus: number;
    dishes: number;
    restaurants: number;
    countries: number;
  };
  monthlyStats?: {
    menus: number;
    dishes: number;
    restaurants: number;
    countries: number;
  };
}

// Anonymous user usage interface
export interface AnonymousUsage {
  scansUsed: number;
  explanationsUsed: number;
  lastResetMonth: string;
  fingerprint: string;
}
// types.ts - Complete merged file with existing and new accessibility types

// ================================
// EXISTING TYPES (Your current types)
// ================================

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

// Base user profile interface
export interface UserProfile {
  id?: string;
  email?: string;
  scans_used: number;
  scans_limit: number;
  subscription_type: 'free' | 'daily' | 'weekly';
  subscription_status?: string;
  subscription_expires_at?: string;
  current_menu_dish_explanations?: number;
  created_at?: string;
  updated_at?: string;
}

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

// ================================
// NEW ACCESSIBILITY TYPES
// ================================

export type Allergen = 'peanuts' | 'treenuts' | 'dairy' | 'gluten' | 'egg' | 'soy' | 'shellfish' | 'sesame' | 'fish' | 'sulfites'
export type Diet = 'vegan' | 'vegetarian' | 'halal' | 'kosher' | 'jain' | 'keto' | 'low_fodmap' | 'gluten_free'

// New enhanced Dish interface for accessibility features
export interface AccessibleDish {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  allergens?: Allergen[];
  diets?: Diet[];
  spiceLevel?: 0 | 1 | 2 | 3;
  imageUrl?: string;
  aliases?: string[];
  // Keep compatibility with existing fields
  section_name?: string; // Maps to category
  dish_name?: string;    // Maps to name
  description_en?: string; // Maps to description
  dietary_tags?: string[]; // Maps to diets
  is_available?: boolean;
}

// Restaurant interface for accessibility features
export interface AccessibleRestaurant {
  slug: string;
  name: string;
  currency: string;
  address?: string;
  // Keep compatibility with existing Restaurant interface
  id?: number;
  business_name?: string; // Maps to name
  cuisine_type?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface OrderItem {
  dish: AccessibleDish;
  quantity: number;
  customizations: string[];
  customNote?: string;
  question?: string;
  translations: DishTranslations;
}

export interface MenuFilters {
  excludeAllergens: Allergen[];
  includeDiets: Diet[];
}

export interface ActiveFilter {
  id: string;
  type: 'allergen' | 'diet';
  label: string;
  value: string;
}

export interface DishTranslations {
  name: string;
  description?: string;
  originalName: string;
  originalDescription?: string;
}

export interface SessionData {
  order: OrderItem[];
  language: string;
  filters: MenuFilters;
  searchQuery: string;
  expiresAt: number;
  lastActivity: number;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

// Menu structure for accessibility features
export interface AccessibleMenu {
  category: string;
  dishes: AccessibleDish[];
}

export type Menu = AccessibleMenu[];

// ================================
// TYPE ADAPTERS/MAPPERS
// ================================

// Helper functions to convert between old and new interfaces
export function adaptDishToAccessible(oldDish: any): AccessibleDish {
  return {
    id: oldDish.id?.toString() || '',
    name: oldDish.dish_name || oldDish.name || '',
    description: oldDish.description_en || oldDish.description || '',
    price: oldDish.price || 0,
    category: oldDish.section_name || oldDish.category || 'Other',
    allergens: oldDish.allergens || [],
    diets: oldDish.dietary_tags || oldDish.diets || [],
    spiceLevel: oldDish.spiceLevel || 0,
    imageUrl: oldDish.imageUrl || oldDish.image_url || '',
    aliases: oldDish.aliases || [],
    // Preserve original fields for backward compatibility
    section_name: oldDish.section_name,
    dish_name: oldDish.dish_name,
    description_en: oldDish.description_en,
    dietary_tags: oldDish.dietary_tags,
    is_available: oldDish.is_available !== false
  }
}

export function adaptRestaurantToAccessible(oldRestaurant: any): AccessibleRestaurant {
  return {
    slug: oldRestaurant.slug || '',
    name: oldRestaurant.business_name || oldRestaurant.name || '',
    currency: oldRestaurant.currency || '$',
    address: oldRestaurant.address || '',
    // Preserve original fields
    id: oldRestaurant.id,
    business_name: oldRestaurant.business_name,
    cuisine_type: oldRestaurant.cuisine_type,
    city: oldRestaurant.city,
    state: oldRestaurant.state,
    country: oldRestaurant.country
  }
}
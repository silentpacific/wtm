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
  restaurant_id?: number; // Add this
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
  dishes_scanned?: number; // NEW: Track total dishes scanned
  last_scanned_at?: string;
  name_location_hash?: string;
  created_at?: string;
}

export interface MenuAnalysisResult {
  sections: MenuSection[];
  restaurantName?: string;
  detectedCuisine?: string;
}
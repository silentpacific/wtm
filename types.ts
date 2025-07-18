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
  created_at?: string;
}
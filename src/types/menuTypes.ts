// src/types/menuTypes.ts
export interface MenuItemVariant {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  section: string;
  name: Record<string, string>;
  description: Record<string, string>;
  price: number; // fallback for single-price dishes
  allergens: string[];
  dietaryTags: string[];
  // Add these new fields for language-specific allergens and dietary tags
  allergensI18n?: Record<string, string[]>;
  dietaryTagsI18n?: Record<string, string[]>;
  explanation: Record<string, string>;
  variants?: MenuItemVariant[];
}

export interface OrderItem {
  dishId: string;
  variantId?: string;
  quantity: number;
  customRequest?: string;
  serverResponse?: 'yes' | 'no' | 'checking';
  responseTimestamp?: Date;
}

export interface MenuData {
  restaurantName: Record<string, string>;
  menuItems: MenuItem[];
  sections: Record<string, string[]>;
}

export type Language = 'en' | 'zh' | 'es' | 'fr';

export interface LanguageOption {
  code: Language;
  label: string;
  flag: string;
}

export interface CommunicationRequest {
  id: string;
  question: Record<string, string>;
  response?: 'yes' | 'no';
  timestamp?: Date;
}

export interface RestaurantMenuPageProps {
  menuData: MenuData;
  menuId: string;
  isDemo?: boolean;
}
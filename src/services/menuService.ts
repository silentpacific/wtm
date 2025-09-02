// src/services/menuService.ts

import { supabase } from "./supabaseClient";

export interface MenuItemVariant {
  id?: string; // optional for create
  menu_item_id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  section_id: string;
  name: string;
  description: string | null;
  price: number;
  allergens: string[];
  dietary_tags: string[];
  variants?: MenuItemVariant[];
}

export interface Section {
  id: string;
  name: string;
  display_order: number;
  dishes: MenuItem[];
}

// ✅ Keep Dish type for create/update operations
export interface Dish {
  id?: string;
  section_id?: string;
  name: string;
  description?: string | null;
  price?: number | null;
  allergens?: string[];
  dietary_tags?: string[];
}

// --- Fetch all menus for a restaurant ---
export async function getMenusByRestaurant(restaurantId: string) {
  const { data, error } = await supabase
    .from("menus")
    .select("id, name, url_slug, created_at") // ✅ include url_slug
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching menus:", error);
    throw error;
  }
  return data;
}

// --- Fetch menu with sections & dishes (and variants) ---
export async function getMenuWithSectionsAndItems(menuId: string) {
  // Fetch sections
  const { data: sections, error: sectionError } = await supabase
    .from("menu_sections")
    .select("id, name, display_order")
    .eq("menu_id", menuId)
    .order("display_order");

  if (sectionError) throw sectionError;

  // Fetch items
  const { data: items, error: itemError } = await supabase
    .from("menu_items")
    .select("id, section_id, name, description, price, name_i18n, description_i18n, allergens_i18n, dietary_tags_i18n")
    .eq("menu_id", menuId);

  if (itemError) throw itemError;

  // ✅ FIX: Filter variants by menu items that belong to this menu
  const itemIds = (items || []).map(item => item.id);
  const { data: variants, error: variantError } = await supabase
    .from("menu_item_variants")
    .select("id, menu_item_id, name, price")
    .in("menu_item_id", itemIds.length > 0 ? itemIds : ['-']); // Prevent empty array error

  if (variantError) throw variantError;

  console.log('Fetched variants:', variants); // Debug log

  // Build structured sections
  const structuredSections: Section[] = (sections || []).map((s) => ({
    ...s,
    dishes: (items || [])
      .filter((i) => i.section_id === s.id)
      .map((i) => {
        const itemVariants = (variants || []).filter((v) => v.menu_item_id === i.id);
        console.log(`Item ${i.name} has ${itemVariants.length} variants:`, itemVariants); // Debug log
        
        return {
          id: i.id,
          section_id: i.section_id,
          name: i.name_i18n || i.name,         // ✅ handle i18n if present
          description: i.description_i18n || i.description,
          price: i.price,
          allergens: i.allergens || [],
          dietary_tags: i.dietary_tags || [],
          variants: itemVariants, // ✅ attach filtered variants
        };
      }),
  }));

  return structuredSections;
}

// --- Diff-based save: insert/update/delete ---
export async function saveMenuDiff(
  menuId: string,
  editedSections: Section[],
  originalSections: Section[]
) {
  // Build lookup maps
  const origSectionMap = new Map(originalSections.map((s) => [s.id, s]));
  const editedSectionMap = new Map(editedSections.map((s) => [s.id, s]));

  // --- Handle Sections ---
  for (const section of editedSections) {
    if (!section.id) {
      // Insert new section
      const { data: newSec, error } = await supabase
        .from("menu_sections")
        .insert({
          menu_id: menuId,
          name: section.name,
          display_order: section.display_order || 0,
        })
        .select()
        .single();
      if (error) throw error;

      // Insert its dishes
      for (const dish of section.dishes) {
        const { error: dishErr } = await supabase.from("menu_items").insert({
          menu_id: menuId,
          section_id: newSec.id,
          name: dish.name,
          description: dish.description || null,
          price: dish.price || null,
          allergens: dish.allergens || [],
          dietary_tags: dish.dietary_tags || [],
        });
        if (dishErr) throw dishErr;
      }
      continue;
    }

    const original = origSectionMap.get(section.id);
    if (original && section.name !== original.name) {
      const { error } = await supabase
        .from("menu_sections")
        .update({ name: section.name })
        .eq("id", section.id);
      if (error) throw error;
    }
  }

  // Delete removed sections
  for (const section of originalSections) {
    if (!editedSectionMap.has(section.id)) {
      const { error } = await supabase
        .from("menu_sections")
        .delete()
        .eq("id", section.id);
      if (error) throw error;
    }
  }

  // --- Handle Dishes ---
  const origDishMap = new Map(
    originalSections.flatMap((s) => s.dishes.map((d) => [d.id, d]))
  );
  const editedDishMap = new Map(
    editedSections.flatMap((s) => s.dishes.map((d) => [d.id, d]))
  );

  for (const section of editedSections) {
    for (const dish of section.dishes) {
      if (!dish.id) {
        // Insert new dish
        const { error } = await supabase.from("menu_items").insert({
          menu_id: menuId,
          section_id: section.id,
          name: dish.name,
          description: dish.description || null,
          price: dish.price || null,
          allergens: dish.allergens || [],
          dietary_tags: dish.dietary_tags || [],
        });
        if (error) throw error;
        continue;
      }

      const original = origDishMap.get(dish.id);
      if (
        original &&
        (dish.name !== original.name ||
          dish.description !== original.description ||
          dish.price !== original.price ||
          JSON.stringify(dish.allergens || []) !==
            JSON.stringify(original.allergens || []) ||
          JSON.stringify(dish.dietary_tags || []) !==
            JSON.stringify(original.dietary_tags || []))
      ) {
        const { error } = await supabase
          .from("menu_items")
          .update({
            name: dish.name,
            description: dish.description || null,
            price: dish.price || null,
            allergens: dish.allergens || [],
            dietary_tags: dish.dietary_tags || [],
          })
          .eq("id", dish.id);
        if (error) throw error;
      }
    }
  }

  // Delete removed dishes
  for (const dish of origDishMap.values()) {
    if (!editedDishMap.has(dish.id)) {
      const { error } = await supabase
        .from("menu_items")
        .delete()
        .eq("id", dish.id);
      if (error) throw error;
    }
  }

  return true;
}

/**
 * Variant CRUD (for items with variants)
 */
export async function createVariant(variant: MenuItemVariant) {
  const { error } = await supabase.from("menu_item_variants").insert([variant]);
  if (error) throw error;
}

export async function updateVariant(variant: MenuItemVariant) {
  if (!variant.id) throw new Error("Variant id is required for update");

  const { error } = await supabase
    .from("menu_item_variants")
    .update({
      name: variant.name,
      price: variant.price,
    })
    .eq("id", variant.id);

  if (error) throw error;
}

export async function deleteVariant(id: string) {
  const { error } = await supabase.from("menu_item_variants").delete().eq("id", id);
  if (error) throw error;
}

// ✅ Helper function to convert Section[] to MenuData format expected by RestaurantMenuPage
export function convertSectionsToMenuData(
  sections: Section[], 
  restaurantName: string,
  language: 'en' | 'es' | 'fr' | 'zh' = 'en'
): {
  restaurantName: Record<string, string>;
  menuItems: Array<{
    id: string;
    section: string;
    name: Record<string, string>;
    description: Record<string, string>;
    price: number;
    allergens: string[];
    dietaryTags: string[];
    explanation: Record<string, string>;
    variants?: Array<{
      id: string;
      name: string;
      price: number;
    }>;
  }>;
  sections: Record<string, string[]>;
} {
  const menuItems = sections.flatMap(section =>
    section.dishes.map(dish => ({
      id: dish.id,
      section: section.name,
      name: {
        en: dish.name,
        es: dish.name, // You might want to add i18n support here
        fr: dish.name,
        zh: dish.name
      },
      description: {
        en: dish.description || '',
        es: dish.description || '',
        fr: dish.description || '',
        zh: dish.description || ''
      },
      price: dish.price,
      allergens: dish.allergens_i18n?.[language] || [],
      dietaryTags: dish.dietary_tags_i18n?.[language] || [],
      explanation: {
        en: dish.description || '',
        es: dish.description || '',
        fr: dish.description || '',
        zh: dish.description || ''
      },
      variants: dish.variants?.map(variant => ({
        id: variant.id!,
        name: variant.name,
        price: variant.price
      }))
    }))
  );

  const sectionMap = sections.reduce((acc, section) => {
    acc[section.name] = section.dishes.map(dish => dish.id);
    return acc;
  }, {} as Record<string, string[]>);

  return {
    restaurantName: {
      en: restaurantName,
      es: restaurantName,
      fr: restaurantName,
      zh: restaurantName
    },
    menuItems,
    sections: sectionMap
  };
}
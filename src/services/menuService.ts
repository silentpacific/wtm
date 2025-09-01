// src/services/menuService.ts
import { supabase } from "../services/supabaseClient";

export interface Dish {
  id?: string;
  section_id?: string;
  name: string;
  description?: string | null;
  price?: number | null;
  allergens?: string[];
  dietary_tags?: string[];
}

export interface Section {
  id?: string;
  menu_id?: string;
  name: string;
  display_order?: number;
  dishes: Dish[];
}

export interface MenuData {
  id: string;
  restaurant_id: string;
  name: string;
  url_slug: string; // ✅ ensure url_slug is always present
  sections: Section[];
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

  // Fetch items with variants
  const { data: items, error: itemError } = await supabase
    .from("menu_items")
    .select(`
      id,
      section_id,
      name_i18n,
      description_i18n,
      price,
      allergens,
      dietary_tags,
      menu_item_variants (
        id,
        name,
        price
      )
    `)
    .eq("menu_id", menuId);

  if (itemError) throw itemError;

  // Build structured sections
  const structuredSections: Section[] = (sections || []).map((s) => ({
    ...s,
    dishes: (items || [])
      .filter((i) => i.section_id === s.id)
      .map((i) => ({
        id: i.id,
        section_id: i.section_id,
        name: i.name_i18n || i.name,         // ✅ handle i18n if present
        description: i.description_i18n || i.description,
        price: i.price,
        allergens: i.allergens || [],
        dietary_tags: i.dietary_tags || [],
        variants: i.menu_item_variants || [] // ✅ attach variants
      })),
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

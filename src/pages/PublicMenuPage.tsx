// src/pages/PublicMenuPage.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import RestaurantMenuPage from "../components/RestaurantMenuPage";

// Match the shape expected by RestaurantMenuPage
interface MenuItem {
  id: string;
  section: string;
  name: Record<string, string>;
  description: Record<string, string>;
  price: number;
  allergens: string[];
  dietaryTags: string[];
  // Add language-aware versions for proper i18n
  allergensI18n: Record<string, string[]>;
  dietaryTagsI18n: Record<string, string[]>;
  explanation: Record<string, string>;
  variants?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
}

interface MenuData {
  restaurantName: Record<string, string>;
  menuItems: MenuItem[];
  sections: Record<string, string[]>;
}

const PublicMenuPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
	const fetchMenu = async () => {
	  if (!slug) return;

	  const { data: menu, error } = await supabase
		.from("menus")
		.select(`
		  id,
		  name,
		  name_i18n,
		  menu_sections (
			id,
			name,
			name_i18n,
			menu_items (
			  id,
			  name,
			  description,
			  long_description,
			  price,
			  allergens,
			  dietary_tags,
			  explanation,
			  name_i18n,
			  description_i18n,
			  long_description_i18n,
			  allergens_i18n,
			  dietary_tags_i18n,
			  explanation_i18n,
			  menu_item_variants (
				id,
				name,
				price
			  )
			)
		  )
		`)
		.eq("url_slug", slug)
		.single();

	  if (error) {
		console.error("Error fetching menu:", error);
		setLoading(false);
		return;
	  }

	  if (menu) {
		// Transform Supabase response into RestaurantMenuPage format
		const sections: Record<string, string[]> = {};
		const items: MenuItem[] = [];

		(menu.menu_sections || []).forEach((section: any) => {
		  sections[section.name] = section.menu_items.map((i: any) => i.id);
			section.menu_items.forEach((i: any) => {
			  items.push({
				id: i.id,
				section: section.name,
				name: {
				  en: i.name_i18n?.en || i.name || "",
				  zh: i.name_i18n?.zh || i.name || "",
				  es: i.name_i18n?.es || i.name || "",
				  fr: i.name_i18n?.fr || i.name || "",
				},
				description: {
				  en: i.description_i18n?.en || i.description || "",
				  zh: i.description_i18n?.zh || i.description || "",
				  es: i.description_i18n?.es || i.description || "",
				  fr: i.description_i18n?.fr || i.description || "",
				},
				price: i.price || 0,
				// Keep default English for backward compatibility
				allergens: i.allergens_i18n?.en || i.allergens || [],
				dietaryTags: i.dietary_tags_i18n?.en || i.dietary_tags || [],
				// Add language-aware versions
				allergensI18n: {
				  en: i.allergens_i18n?.en || i.allergens || [],
				  zh: i.allergens_i18n?.zh || i.allergens || [],
				  es: i.allergens_i18n?.es || i.allergens || [],
				  fr: i.allergens_i18n?.fr || i.allergens || [],
				},
				dietaryTagsI18n: {
				  en: i.dietary_tags_i18n?.en || i.dietary_tags || [],
				  zh: i.dietary_tags_i18n?.zh || i.dietary_tags || [],
				  es: i.dietary_tags_i18n?.es || i.dietary_tags || [],
				  fr: i.dietary_tags_i18n?.fr || i.dietary_tags || [],
				},
				explanation: {
				  en: i.long_description_i18n?.en || i.explanation_i18n?.en || i.long_description || i.explanation || "",
				  es: i.long_description_i18n?.es || i.explanation_i18n?.es || i.long_description || i.explanation || "",
				  fr: i.long_description_i18n?.fr || i.explanation_i18n?.fr || i.long_description || i.explanation || "",
				  zh: i.long_description_i18n?.zh || i.explanation_i18n?.zh || i.long_description || i.explanation || "",
				},
				variants: (i.menu_item_variants || []).map((variant: any) => ({
				  id: variant.id,
				  name: variant.name,
				  price: variant.price
				}))
			  });
			});
		});

		setMenuData({
		  restaurantName: {
			en: menu.name_i18n?.en || menu.name,
			zh: menu.name_i18n?.zh || menu.name,
			es: menu.name_i18n?.es || menu.name,
			fr: menu.name_i18n?.fr || menu.name,
		  },
		  menuItems: items,
		  sections,
		});
		setMenuId(menu.id);
	  }

	  setLoading(false);
	};

    fetchMenu();
  }, [slug]);

  if (loading) return <p className="p-6">Loading menu...</p>;
  if (!menuData) return <p className="p-6">Menu not found</p>;

  return (
    <div className="px-4 sm:px-6 lg:px-32 xl:px-48">
      <RestaurantMenuPage menuData={menuData} menuId={menuId || ""} />
    </div>
  );
};

export default PublicMenuPage;

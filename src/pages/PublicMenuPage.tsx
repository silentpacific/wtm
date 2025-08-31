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
  explanation: Record<string, string>;
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
        .select(
          `
          id,
          name,
          menu_sections (
            id,
            name,
            menu_items (
              id,
              name,
              description,
              price,
              allergens,
              dietary_tags,
              explanation
            )
          )
        `
        )
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
                en: i.name || "",
                zh: i.name || "",
                es: i.name || "",
                fr: i.name || "",
              },
              description: {
                en: i.description || "",
                zh: i.description || "",
                es: i.description || "",
                fr: i.description || "",
              },
              price: i.price || 0,
              allergens: i.allergens || [],
              dietaryTags: i.dietary_tags || [],
              explanation: {
                en: i.explanation || "",
                zh: i.explanation || "",
                es: i.explanation || "",
                fr: i.explanation || "",
              },
            });
          });
        });

        setMenuData({
          restaurantName: {
            en: menu.name,
            zh: menu.name,
            es: menu.name,
            fr: menu.name,
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

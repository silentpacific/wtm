// src/pages/PublicMenuPage.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

interface Dish {
  id: string;
  name: string;
  description?: string | null;
  price?: number | null;
  allergens?: string[];
  dietary_tags?: string[];
}

interface Section {
  id: string;
  name: string;
  dishes: Dish[];
}

interface Menu {
  id: string;
  name: string; // ✅ restaurant name from menus table
  url_slug: string;
  sections: Section[];
}

const PublicMenuPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      if (!slug) return;

      const { data: menus, error } = await supabase
        .from("menus")
        .select(
          `
          id,
          name,
          url_slug,
          menu_sections (
            id,
            name,
            menu_items (
              id,
              name,
              description,
              price,
              allergens,
              dietary_tags
            )
          )
        `
        )
        .eq("url_slug", slug)
        .single();

      if (error) {
        console.error("Error fetching menu:", error);
      } else if (menus) {
        const structuredSections: Section[] =
          (menus.menu_sections || []).map((s: any) => ({
            id: s.id,
            name: s.name,
            dishes: s.menu_items || [],
          }));

        setMenu({
          id: menus.id,
          name: menus.name, // ✅ restaurant’s name
          url_slug: menus.url_slug,
          sections: structuredSections,
        });
      }

      setLoading(false);
    };

    fetchMenu();
  }, [slug]);

  if (loading) return <p className="p-6">Loading menu...</p>;
  if (!menu) return <p className="p-6">Menu not found</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* ✅ Restaurant name as the header */}
      <h1 className="text-3xl font-bold mb-6 text-center">{menu.name}</h1>

      {/* Menu Sections */}
      {menu.sections.map((section) => (
        <div key={section.id} className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{section.name}</h2>
          <ul>
            {section.dishes.map((dish) => (
              <li key={dish.id} className="mb-3">
                <div className="flex justify-between">
                  <span className="font-medium">{dish.name}</span>
                  {dish.price !== null && dish.price !== undefined && (
                    <span>${dish.price.toFixed(2)}</span>
                  )}
                </div>
                {dish.description && (
                  <p className="text-sm text-gray-600">{dish.description}</p>
                )}

                {/* ✅ Show allergens & dietary tags */}
                <div className="mt-1 text-xs">
                  <p className="text-red-500">
                    Allergens:{" "}
                    {dish.allergens?.length
                      ? dish.allergens.join(", ")
                      : "None"}
                  </p>
                  <p className="text-green-600">
                    Dietary tags:{" "}
                    {dish.dietary_tags?.length
                      ? dish.dietary_tags.join(", ")
                      : "None"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* ✅ Powered by footer */}
      <footer className="mt-10 border-t pt-4 text-center text-sm text-gray-500">
        Powered by{" "}
        <a
          href="https://whatthemenu.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-orange-600"
        >
          WhatTheMenu.com
        </a>{" "}
        — Contact us to super-charge your menu
      </footer>
    </div>
  );
};

export default PublicMenuPage;

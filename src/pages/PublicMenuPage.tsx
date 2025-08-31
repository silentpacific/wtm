import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

export default function PublicMenuPage() {
  const { slug } = useParams<{ slug: string }>();
  const [menu, setMenu] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      // Get menu by slug, including restaurant profile info
      const { data: menuData, error: menuError } = await supabase
        .from("menus_with_profiles") // ✅ use the view we created
        .select("id, name, url_slug, restaurant_name")
        .eq("url_slug", slug)
        .single();

      if (menuError || !menuData) {
        console.error(menuError);
        setLoading(false);
        return;
      }
      setMenu(menuData);

      // Get sections
      const { data: sectionData, error: sectionError } = await supabase
        .from("menu_sections")
        .select("id, name, display_order")
        .eq("menu_id", menuData.id)
        .order("display_order");

      if (sectionError) {
        console.error(sectionError);
        setLoading(false);
        return;
      }

      // Get items
      const { data: itemData, error: itemError } = await supabase
        .from("menu_items")
        .select(
          "id, section_id, name, description, price, allergens, dietary_tags"
        )
        .eq("menu_id", menuData.id);

      if (itemError) {
        console.error(itemError);
        setLoading(false);
        return;
      }

      const structuredSections = (sectionData || []).map((s) => ({
        ...s,
        dishes: (itemData || []).filter((i) => i.section_id === s.id),
      }));

      setSections(structuredSections);
      setLoading(false);
    };

    fetchMenu();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        <p>Loading menu...</p>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        <p>Menu not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* ✅ Restaurant name at the top */}
      <h1 className="text-3xl font-bold text-center mb-8">
        {menu.restaurant_name || menu.name}
      </h1>

      {sections.map((section) => (
        <div key={section.id} className="mb-10">
          <h2 className="text-xl font-semibold mb-4">{section.name}</h2>
          <div className="space-y-6">
            {section.dishes.map((dish: any) => (
              <div key={dish.id} className="border-b pb-4">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-lg font-medium">{dish.name}</h3>
                  {dish.price && (
                    <span className="text-gray-700 font-semibold">
                      ${dish.price.toFixed(2)}
                    </span>
                  )}
                </div>
                {dish.description && (
                  <p className="text-gray-600 mb-2">{dish.description}</p>
                )}

                {/* Allergen tags */}
                {dish.allergens && dish.allergens.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {dish.allergens.map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Dietary tags */}
                {dish.dietary_tags && dish.dietary_tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {dish.dietary_tags.map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* ✅ Footer */}
      <p className="text-sm text-gray-500 text-center mt-12">
        Powered by{" "}
        <a
          href="https://whatthemenu.com"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          Whatthemenu.com
        </a>
        . Contact us to super-charge your menu.
      </p>
    </div>
  );
}

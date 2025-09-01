import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

type Menu = {
  id: string;
  name: string;
  url_slug: string;
  status: string;
  restaurants: {
    name: string;
    cuisine_type: string | null;
  };
};

const DemosPage: React.FC = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenus = async () => {
      const { data, error } = await supabase
        .from("menus")
        .select(`
          id,
          name,
          url_slug,
          status,
          restaurants (
            name,
            cuisine_type
          )
        `)
        .eq("status", "active");

      if (error) {
        console.error("Error fetching menus:", error.message);
      } else {
        setMenus(data || []);
      }
      setLoading(false);
    };

    fetchMenus();
  }, []);

  return (
    <div className="min-h-screen bg-white py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-4xl font-bold text-center mb-6">
          Explore Our Demo Menus
        </h1>
        <p className="text-lg text-gray-600 text-center mb-8">
          No app download required. Works on any phone.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
          <Link
            to="/faq"
            className="bg-transparent text-wtm-primary border-2 border-wtm-primary font-semibold px-8 py-4 rounded-2xl text-lg hover:bg-wtm-primary hover:text-white transition-all duration-200"
          >
            Have Questions?
          </Link>

          <Link
            to="/contact"
            className="bg-transparent text-wtm-primary border-2 border-wtm-primary font-semibold px-8 py-4 rounded-2xl text-lg hover:bg-wtm-primary hover:text-white transition-all duration-200"
          >
            Contact Us
          </Link>
        </div>

        {/* Demo Menus */}
        <h2 className="text-2xl font-semibold text-center mb-10">Restaurants</h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading menus...</p>
        ) : menus.length === 0 ? (
          <p className="text-center text-gray-500">No menus available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {menus.map((menu) => (
              <div
                key={menu.id}
                className="border rounded-2xl shadow p-6 flex flex-col justify-between"
              >
                <div>
                  {/* Restaurant Name */}
                  <h3 className="text-xl font-semibold mb-1">
                    {menu.restaurants?.name || "Unnamed Restaurant"}
                  </h3>
                  {/* Menu Name */}
                  <p className="text-gray-700 font-medium">{menu.name}</p>
                  {/* Cuisine Type */}
                  {menu.restaurants?.cuisine_type && (
                    <p className="text-gray-500 text-sm">
                      {menu.restaurants.cuisine_type}
                    </p>
                  )}
                </div>
                <div className="mt-6 text-right">
                  <Link
                    to={`/demos/${menu.id}`}
                    className="text-wtm-primary hover:underline"
                  >
                    View Full Menu →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DemosPage;

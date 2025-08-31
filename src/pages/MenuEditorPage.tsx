import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import {
  getMenusByRestaurant,
  getMenuWithSectionsAndItems,
  saveMenuDiff,
  Section,
  MenuData,
} from "../services/menuService";

// --- Tag Chip Component ---
function TagChips({
  tags,
  onChange,
  color,
  placeholder,
}: {
  tags: string[];
  onChange: (newTags: string[]) => void;
  color: string;
  placeholder: string;
}) {
  const [input, setInput] = useState("");

  const addTag = () => {
    if (input.trim() && !tags.includes(input.trim().toLowerCase())) {
      onChange([...tags, input.trim().toLowerCase()]);
      setInput("");
    }
  };

  const removeTag = (idx: number) => {
    const newTags = [...tags];
    newTags.splice(idx, 1);
    onChange(newTags);
  };

  return (
    <div className="mb-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${color}`}
          >
            {tag}
            <button
              type="button"
              className="ml-2 text-xs font-bold"
              onClick={() => removeTag(idx)}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        className="border rounded-lg p-2 w-full"
        placeholder={placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
      />
    </div>
  );
}

export default function MenuEditorPage() {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [menus, setMenus] = useState<MenuData[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<string>("");
  const [sections, setSections] = useState<Section[]>([]);
  const [originalSections, setOriginalSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingTags, setFetchingTags] = useState(false);

  // Fetch restaurants (profiles, just for display)
  useEffect(() => {
    const fetchRestaurants = async () => {
      const { data, error } = await supabase
        .from("user_restaurant_profiles")
        .select("id, restaurant_name");
      if (!error) setRestaurants(data || []);
    };
    fetchRestaurants();
  }, []);

  // Fetch menus when restaurant changes (always tied to Auth user)
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const data = await getMenusByRestaurant(user.id);
      setMenus(data);
      if (data.length) setSelectedMenu(data[0].id);
    })();
  }, [user?.id, selectedRestaurant]);

  // Fetch sections/items when menu changes
  useEffect(() => {
    if (!selectedMenu) return;
    (async () => {
      const data = await getMenuWithSectionsAndItems(selectedMenu);
      setSections(data);
      setOriginalSections(JSON.parse(JSON.stringify(data)));
    })();
  }, [selectedMenu]);

  // Upload new menu

const handleFileUpload = async (file: File) => {
  setLoading(true);
  setProgressText("Starting menu upload...");
  const reader = new FileReader();

  reader.onload = async () => {
    try {
      // 1️⃣ Scan menu (Gemini)
      setProgressText("Scanning menu with AI...");
      const scanRes = await fetch("/.netlify/functions/menu-scanner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileData: reader.result,
          fileName: file.name,
          mimeType: file.type,
          restaurantId: user.id,
        }),
      });

      if (!scanRes.ok) {
        const text = await scanRes.text();
        console.error("Menu scanner failed:", text);
        setProgressText("❌ Menu scan failed");
        alert("Menu scan failed: " + text);
        return;
      }

      const scanJson = await scanRes.json();
      if (!scanJson.success) {
        setProgressText("❌ Menu scan failed");
        alert("Menu scan failed: " + (scanJson.error || "Unknown error"));
        return;
      }
      const menuId = scanJson.menuId;
      console.log("✅ Menu scanned. ID:", menuId);
      setProgressText("✅ Menu scanned. Preparing sections...");

      // 2️⃣ Save sections
      const secRes = await fetch("/.netlify/functions/menu-save-sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuId }),
      });

      if (!secRes.ok) {
        const text = await secRes.text();
        console.error("Save sections failed:", text);
        setProgressText("❌ Saving sections failed");
        alert("Saving sections failed: " + text);
        return;
      }

      const secJson = await secRes.json();
      console.log("✅ Sections inserted:", secJson.sectionsInserted);
      setProgressText(`✅ ${secJson.sectionsInserted} sections saved. Adding dishes...`);

      // 3️⃣ Save dishes in batches
      let startIndex = 0;
      const batchSize = 5;
      let total = 0;

      while (true) {
        setProgressText(`Saving dishes ${startIndex + 1} → ${startIndex + batchSize}...`);

        const dishRes = await fetch("/.netlify/functions/menu-save-dishes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ menuId, startIndex, batchSize }),
        });

        if (!dishRes.ok) {
          const text = await dishRes.text();
          console.error("Save dishes failed:", text);
          setProgressText("❌ Saving dishes failed");
          alert("Saving dishes failed: " + text);
          return;
        }

        const dishJson = await dishRes.json();
        total = dishJson.total;
        console.log(
          `✅ Inserted ${dishJson.inserted}, nextIndex=${dishJson.nextIndex}/${total}`
        );

        setProgressText(
          `✅ Inserted ${dishJson.nextIndex} of ${total} dishes...`
        );

        if (dishJson.nextIndex >= total) {
          break;
        }
        startIndex = dishJson.nextIndex;

        // small delay to avoid hammering
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // 4️⃣ Refresh menus
      setProgressText("Refreshing menu...");
      const newMenus = await getMenusByRestaurant(user.id);
      setMenus(newMenus);
      setSelectedMenu(menuId);

      const data = await getMenuWithSectionsAndItems(menuId);
      setSections(data);
      setOriginalSections(JSON.parse(JSON.stringify(data)));

      setProgressText("🎉 Menu uploaded and saved successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
      setProgressText("❌ Upload failed. Please try again.");
      alert("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  reader.readAsDataURL(file);
};

  // --- Fetch Tags from Gemini ---
const [progressText, setProgressText] = useState<string>(""); // 👈 new state at top

const handleFetchTags = async () => {
  if (!selectedMenu) return;
  setFetchingTags(true);
  setProgressText("Starting tag analysis...");

  try {
    let startIndex = 0;
    const batchSize = 5; // keep in sync with dietary-analyzer.ts
    let totalItems = 0;

    while (true) {
      setProgressText(`Processing dishes ${startIndex + 1} → ${startIndex + batchSize}`);

      let success = false;
      let json: any = null;

      // ✅ Retry up to 3 times for this batch
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const res = await fetch("/.netlify/functions/dietary-analyzer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ menuId: selectedMenu, startIndex, batchSize }),
          });

          if (!res.ok) {
            const text = await res.text();
            console.warn(`Batch ${startIndex} failed (attempt ${attempt}):`, text);
            throw new Error(text);
          }

          json = await res.json();

          if (!json.success) {
            throw new Error(json.error || "Unknown error");
          }

          // ✅ Batch succeeded
          success = true;
          break;
        } catch (err) {
          console.warn(`Retrying batch ${startIndex} (attempt ${attempt})...`, err);
          await new Promise((r) => setTimeout(r, attempt * 3000)); // backoff 3s, 6s, 9s
        }
      }

      if (!success) {
        setProgressText(`⚠️ Skipping batch ${startIndex + 1} → ${startIndex + batchSize} after 3 failed attempts`);
        startIndex += batchSize;
        if (totalItems && startIndex >= totalItems) break;
        continue;
      }

      // ✅ Update counters
      totalItems = json.totalItems;
      startIndex = json.nextIndex;

      setProgressText(`✅ Processed ${startIndex} of ${totalItems} dishes...`);

      if (startIndex >= totalItems) {
        setProgressText("🎉 All dishes processed successfully!");
        break;
      }

      // Small delay before next batch
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    // Refresh UI
    const updatedData = await getMenuWithSectionsAndItems(selectedMenu);
    setSections(updatedData);
    setOriginalSections(JSON.parse(JSON.stringify(updatedData)));
  } catch (err) {
    console.error("Dietary analyzer loop error:", err);
    setProgressText("❌ Tag analysis failed unexpectedly. Please try again.");
  } finally {
    setFetchingTags(false);
  }
};




  // Save changes
  const handleSave = async () => {
    try {
      setLoading(true);
      await saveMenuDiff(selectedMenu, sections, originalSections);
      setOriginalSections(JSON.parse(JSON.stringify(sections)));
      alert("Menu saved!");
    } catch (err) {
      console.error(err);
      alert("Error saving");
    } finally {
      setLoading(false);
    }
  };

  // Helpers for editing tags in local state
  const updateTags = (
    sectionIdx: number,
    dishIdx: number,
    field: "allergens" | "dietary_tags",
    newTags: string[]
  ) => {
    const updated = [...sections];
    (updated[sectionIdx].dishes[dishIdx] as any)[field] = newTags;
    setSections(updated);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Menu Editor</h1>

      {/* Restaurant Selector (for display only) */}
      <div className="mb-6">
        <label className="block mb-2 font-semibold">Select Restaurant</label>
        <select
          value={selectedRestaurant}
          onChange={(e) => setSelectedRestaurant(e.target.value)}
          className="w-full border rounded-lg p-2"
        >
          <option value="">-- Choose a restaurant --</option>
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>
              {r.restaurant_name || r.id}
            </option>
          ))}
        </select>
      </div>

      {/* Upload */}
      <div className="mb-8">
        <label className="block mb-2 font-semibold">Upload New Menu</label>
        <input
		  type="file"
		  accept="image/*,application/pdf"
		  onChange={(e) => {
			if (e.target.files && e.target.files[0]) {
			  handleFileUpload(e.target.files[0]);
			}
		  }}
		/>
        {loading && <p className="text-sm text-gray-500 mt-2">Processing...</p>}
      </div>

      {/* Menu Selector */}
      {menus.length > 0 && (
        <div className="mb-6">
          <label className="block mb-2 font-semibold">Select Menu</label>
          <select
            value={selectedMenu}
            onChange={(e) => setSelectedMenu(e.target.value)}
            className="w-full border rounded-lg p-2"
          >
            {menus.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — {m.user_restaurant_profiles?.restaurant_name ?? "Unknown"} (
                {new Date(m.created_at!).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Save + Fetch Tags + Live links (top) */}
      {selectedMenu && (
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={handleSave}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
          >
            Save Menu
          </button>
          <button
			  onClick={handleFetchTags}
			  disabled={fetchingTags}
			  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
			>
			  {fetchingTags ? "Fetching Tags..." : "Fetch Tags"}
			</button>

			{progressText && (
			  <p className="text-sm text-gray-600 mt-2">{progressText}</p>
			)}
          <a
            href={`/r/${menus.find((m) => m.id === selectedMenu)?.url_slug}`}
            target="_blank"
            rel="noreferrer"
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            Visit Live Page
          </a>
        </div>
      )}

      {/* Editable Sections */}
      {sections.map((section, sectionIdx) => (
        <div key={section.id || sectionIdx} className="mb-8 border rounded-lg p-4">
          <input
            className="text-xl font-semibold w-full border-b p-2 mb-4"
            value={section.name}
            onChange={(e) => {
              const updated = [...sections];
              updated[sectionIdx].name = e.target.value;
              setSections(updated);
            }}
          />

          {/* Dishes */}
          <div className="ml-4">
            {section.dishes.map((dish: any, dishIdx: number) => (
              <div key={dish.id || dishIdx} className="mb-6 border-b pb-4">
                <input
                  className="border rounded-lg p-2 mb-2 w-full"
                  placeholder="Dish name"
                  value={dish.name}
                  onChange={(e) => {
                    const updated = [...sections];
                    updated[sectionIdx].dishes[dishIdx].name = e.target.value;
                    setSections(updated);
                  }}
                />
                <textarea
                  className="border rounded-lg p-2 mb-2 w-full"
                  placeholder="Description"
                  value={dish.description || ""}
                  onChange={(e) => {
                    const updated = [...sections];
                    updated[sectionIdx].dishes[dishIdx].description =
                      e.target.value;
                    setSections(updated);
                  }}
                />
                <input
                  className="border rounded-lg p-2 mb-2 w-full"
                  placeholder="$12.50"
                  value={dish.price ? `$${dish.price.toFixed(2)}` : ""}
                  onChange={(e) => {
                    const updated = [...sections];
                    const num = parseFloat(
                      e.target.value.replace(/[^0-9.]/g, "")
                    );
                    updated[sectionIdx].dishes[dishIdx].price = isNaN(num)
                      ? null
                      : num;
                    setSections(updated);
                  }}
                />

                {/* Allergen tags */}
                <TagChips
                  tags={dish.allergens || []}
                  onChange={(newTags) =>
                    updateTags(sectionIdx, dishIdx, "allergens", newTags)
                  }
                  color="bg-red-100 text-red-700"
                  placeholder="Add allergen and press Enter"
                />

                {/* Dietary tags */}
                <TagChips
                  tags={dish.dietary_tags || []}
                  onChange={(newTags) =>
                    updateTags(sectionIdx, dishIdx, "dietary_tags", newTags)
                  }
                  color="bg-green-100 text-green-700"
                  placeholder="Add dietary tag and press Enter"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Save + Fetch Tags + Live links (bottom) */}
      {selectedMenu && (
        <div className="flex flex-wrap gap-4 mt-6">
          <button
            onClick={handleSave}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
          >
            Save Menu
          </button>
          <button
            onClick={handleFetchTags}
            disabled={fetchingTags}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {fetchingTags ? "Fetching Tags..." : "Fetch Tags"}
          </button>
          <a
            href={`/r/${menus.find((m) => m.id === selectedMenu)?.url_slug}`}
            target="_blank"
            rel="noreferrer"
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            Visit Live Page
          </a>
        </div>
      )}
    </div>
  );
}

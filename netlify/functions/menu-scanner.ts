// netlify/functions/menu-scanner.ts
import type { Handler, HandlerEvent } from "@netlify/functions";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

const geminiApiKey = process.env.GEMINI_API_KEY;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// --- Schema for Gemini ---
const menuExtractionSchema = {
  type: Type.OBJECT,
  properties: {
    restaurant: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        address: { type: Type.STRING },
        phone: { type: Type.STRING },
        website: { type: Type.STRING },
      },
    },
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          dishes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                price: { type: Type.NUMBER },
              },
              required: ["name"],
            },
          },
        },
        required: ["name", "dishes"],
      },
    },
  },
  required: ["sections"],
};

// --- Helpers ---
function makeSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function generateMenuId(): string {
  return `menu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// --- Save parsed menu into Supabase ---
async function saveMenuToDatabase(
  menuId: string,
  restaurantId: string,
  menuData: any
) {
  // fetch selected restaurant profile (from dropdown)
  const { data: restProfile } = await supabaseAdmin
    .from("user_restaurant_profiles")
    .select("restaurant_name")
    .eq("id", restaurantId); // 👈 use the restaurant profile ID


  const safeName = makeSlug(menuData.restaurant?.name || "menu");
	const urlSlug = `${safeName}-${Math.random().toString(36).substring(2, 8)}`;

	const { data: menu, error: menuError } = await supabaseAdmin
	  .from("menus")
	  .insert({
		restaurant_id: restaurantId,
		name: restProfile?.restaurant_name || "Uploaded Menu",
		url_slug: urlSlug,
		status: "active",
	  })
	  .select();

  if (menuError) throw menuError;

  for (const [idx, section] of (menuData.sections || []).entries()) {
    const { data: sec, error: secErr } = await supabaseAdmin
      .from("menu_sections")
      .insert({
        menu_id: menuId,
        name: section.name,
        display_order: idx,
      })
      .select()

    if (secErr) {
      console.error("Section insert error:", secErr);
      continue;
    }

    if (section.dishes?.length) {
      const inserts = section.dishes.map((d: any) => ({
        menu_id: menuId,
        section_id: sec.id,
        name: d.name,
        description: d.description || null,
        price: d.price || null,
        allergens: [],
        dietary_tags: [],
        explanation: null,
        translations: {},
      }));
      const { error: dishErr } = await supabaseAdmin
        .from("menu_items")
        .insert(inserts);
      if (dishErr) console.error("Dish insert error:", dishErr);
    }
  }

  return menu;
}

// --- Handler ---
export const handler: Handler = async (event: HandlerEvent) => {
  const startTime = Date.now();

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: "POST only" }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Invalid JSON" }),
    };
  }

  const { fileData, fileName, mimeType, restaurantId } = body;
  if (!fileData || !fileName || !mimeType || !restaurantId) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "fileData, fileName, mimeType, and restaurantId are required",
      }),
    };
  }
  if (!geminiApiKey) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Server misconfigured" }),
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    const menuId = generateMenuId();

    const extractionPrompt = `
You are an AI that extracts restaurant menus from images. 
Output ONLY valid JSON following the schema. 
Rules:
- Always output parsable JSON (no extra text).
- Omit fields if not visible.
- Include all menu sections in order.
- Convert prices to numbers without currency symbols.
    `.trim();

    const parts = [
      { text: extractionPrompt },
      {
        inlineData: {
          data: fileData.replace(/^data:[^;]+;base64,/, ""),
          mimeType,
        },
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: menuExtractionSchema,
        temperature: 0.1,
        maxOutputTokens: 8192,
      },
    });

    const menuData = JSON.parse(response.text.trim());

    if (!menuData.sections?.length)
      throw new Error("No menu sections found");
    const totalDishes = menuData.sections.reduce(
      (sum, s) => sum + (s.dishes?.length || 0),
      0
    );
    if (totalDishes === 0) throw new Error("No dishes found");

    const menu = await saveMenuToDatabase(menuId, restaurantId, menuData);

    const processingTime = Date.now() - startTime;
		return {
		  statusCode: 200,
		  headers: { ...corsHeaders, "Content-Type": "application/json" },
		  body: JSON.stringify({
			success: true,
			menuId: menu.id,  // ✅ use the actual DB UUID
			urlSlug: menu.url_slug,
			data: { restaurant: menuData.restaurant, sections: menuData.sections },
			stats: { sections: menuData.sections.length, totalDishes, processingTime },
		  }),
		};
  } catch (err: any) {
    console.error("menu-scanner error:", err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: err.message || "Menu processing failed",
      }),
    };
  }
};

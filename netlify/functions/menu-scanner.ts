// netlify/functions/menu-scanner.ts
import type { Handler } from "@netlify/functions";
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

// Gemini schema
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

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders, body: "POST only" };
  }

  const { fileData, fileName, mimeType, restaurantId } = JSON.parse(event.body || "{}");
  if (!fileData || !fileName || !mimeType || !restaurantId) {
    return { statusCode: 400, headers: corsHeaders, body: "Missing parameters" };
  }
  if (!geminiApiKey) {
    return { statusCode: 500, headers: corsHeaders, body: "Server misconfigured" };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { text: "Extract menu JSON. Only return valid JSON." },
        {
          inlineData: {
            data: fileData.replace(/^data:[^;]+;base64,/, ""),
            mimeType,
          },
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: menuExtractionSchema,
      },
    });

    const menuJson = JSON.parse(response.text.trim());

// fetch the selected restaurant profile
const { data: restProfile } = await supabaseAdmin
  .from("user_restaurant_profiles")
  .select("restaurant_name")
  .eq("auth_user_id", restaurantId)
  .single();

const { data, error } = await supabaseAdmin
  .from("menus")
  .insert({
    restaurant_id: restaurantId,
    name: restProfile?.restaurant_name || "Uploaded Menu", // ✅ now tied to dropdown selection
    status: "processing",
  })
  .select("id")
  .single();

    if (error) throw error;

    // Save raw JSON into a drafts table (create if needed)
    await supabaseAdmin.from("menu_drafts").insert({
      menu_id: data.id,
      json_data: menuJson,
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, menuId: data.id }),
    };
  } catch (err: any) {
    console.error("menu-scanner error:", err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

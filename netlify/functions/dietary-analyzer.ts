// netlify/functions/dietary-analyzer.ts
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

// Schema for tag extraction
const tagSchema = {
  type: Type.OBJECT,
  properties: {
    dish: { type: Type.STRING },
    allergens: { type: Type.ARRAY, items: { type: Type.STRING } },
    dietary_tags: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["dish", "allergens", "dietary_tags"],
};

async function analyzeBatch(ai: any, dishes: any[]) {
  const prompt = `
You are an AI that extracts allergens and dietary tags from dish names and descriptions. 
Return ONLY valid JSON for each dish in this format:

{
  "dish": "Dish name",
  "allergens": ["list of allergens"],
  "dietary_tags": ["list of dietary/diet tags"]
}

Rules:
- "dish" must match the provided dish name exactly.
- If no allergens or dietary tags are clear, return empty arrays.
- Use lowercase terms for tags.
- No free text outside JSON.
`;

  const contents = [
    {
      parts: [
        { text: prompt },
        {
          text: JSON.stringify(
            dishes.map((d) => ({
              dish: d.name,
              description: d.description || "",
            }))
          ),
        },
      ],
    },
  ];

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents,
    config: {
      responseMimeType: "application/json",
      responseSchema: tagSchema,
      temperature: 0.1,
      maxOutputTokens: 2048,
    },
  });

  const text = response.text.trim();
  const parsed = JSON.parse(text);
  return Array.isArray(parsed) ? parsed : [parsed];
}

// ✅ wrapper with retry & exponential backoff
async function safeAnalyzeBatch(ai: any, batch: any[], retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await analyzeBatch(ai, batch);
    } catch (err: any) {
      const msg = err?.message || JSON.stringify(err);
      if (msg.includes("overloaded") || msg.includes("UNAVAILABLE")) {
        console.warn(
          `⚠️ Gemini overloaded (attempt ${attempt}/${retries}). Retrying...`
        );
        await new Promise((r) => setTimeout(r, attempt * 3000)); // 3s, 6s, 9s
      } else {
        throw err;
      }
    }
  }
  throw new Error("Gemini overloaded. Please try again later.");
}

export const handler: Handler = async (event) => {
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

  const body = JSON.parse(event.body || "{}");
  const { menuId, startIndex = 0, batchSize = 5 } = body;

  if (!menuId) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: "menuId is required" }),
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
    // Fetch all items
    const { data: items, error } = await supabaseAdmin
      .from("menu_items")
      .select("id, name, description")
      .eq("menu_id", menuId)
      .order("created_at");

    if (error) throw error;
    if (!items || items.length === 0) {
      throw new Error("No dishes found for menu");
    }

    // Pick slice
    const batch = items.slice(startIndex, startIndex + batchSize);
    if (batch.length === 0) {
      return {
        statusCode: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ success: true, updated: 0, items: [] }),
      };
    }

    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    const results = await safeAnalyzeBatch(ai, batch);

    const updatedItems: any[] = [];
    for (const result of results) {
      const item = batch.find((d) => d.name === result.dish);
      if (!item) continue;

      const { error: updateError } = await supabaseAdmin
        .from("menu_items")
        .update({
          allergens: result.allergens || [],
          dietary_tags: result.dietary_tags || [],
        })
        .eq("id", item.id);

      if (!updateError) {
        updatedItems.push({
          id: item.id,
          allergens: result.allergens || [],
          dietary_tags: result.dietary_tags || [],
        });
      }
    }

    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        updated: updatedItems.length,
        items: updatedItems,
        nextIndex: startIndex + batchSize, // ✅ for frontend loop
        totalItems: items.length,
      }),
    };
  } catch (err: any) {
    console.error("dietary-analyzer error:", err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message || "Processing failed" }),
    };
  }
};

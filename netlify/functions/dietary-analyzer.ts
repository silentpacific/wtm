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

const BATCH_SIZE = 5;

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
- "dish" must match the provided dish name.
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

  try {
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

    // Gemini may return array of dish objects
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (err) {
    console.error("analyzeBatch error:", err);
    throw err;
  }
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
  const { menuId } = body;
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
    // Fetch dishes
    const { data: items, error } = await supabaseAdmin
      .from("menu_items")
      .select("id, name, description")
      .eq("menu_id", menuId);

    if (error) throw error;
    if (!items || items.length === 0) {
      throw new Error("No dishes found for menu");
    }

    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    const updatedItems: any[] = [];

    // Process in batches
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const batch = items.slice(i, i + BATCH_SIZE);
      try {
        const results = await analyzeBatch(ai, batch);

        for (const result of results) {
          const item = items.find((d) => d.name === result.dish);
          if (!item) continue;

          const { error: updateError } = await supabaseAdmin
            .from("menu_items")
            .update({
              allergens: result.allergens || [],
              dietary_tags: result.dietary_tags || [],
            })
            .eq("id", item.id);

          if (updateError) {
            console.error("DB update error:", updateError);
          } else {
            updatedItems.push({
              id: item.id,
              allergens: result.allergens || [],
              dietary_tags: result.dietary_tags || [],
            });
          }
        }
      } catch (batchErr) {
        console.error("Batch failed, retrying:", batchErr);
        try {
          const results = await analyzeBatch(ai, batch); // retry once
          for (const result of results) {
            const item = items.find((d) => d.name === result.dish);
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
        } catch (finalErr) {
          console.error("Retry failed for batch:", finalErr);
        }
      }
    }

    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        updated: updatedItems.length,
        items: updatedItems,
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

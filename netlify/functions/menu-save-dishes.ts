// netlify/functions/menu-save-dishes.ts
import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders, body: "POST only" };
  }

  const { menuId, startIndex = 0, batchSize = 5 } = JSON.parse(event.body || "{}");
  if (!menuId) {
    return { statusCode: 400, headers: corsHeaders, body: "menuId required" };
  }

  try {
    // Get draft JSON
    const { data: draft, error: draftErr } = await supabaseAdmin
      .from("menu_drafts")
      .select("json_data")
      .eq("menu_id", menuId)
      .single();
    if (draftErr) throw draftErr;

    const allSections = draft.json_data.sections || [];
    const allDishes = allSections.flatMap((sec: any) =>
      sec.dishes.map((d: any) => ({ ...d, sectionName: sec.name }))
    );

    const slice = allDishes.slice(startIndex, startIndex + batchSize);

    // Find section IDs by name
    const { data: dbSections } = await supabaseAdmin
      .from("menu_sections")
      .select("id, name")
      .eq("menu_id", menuId);

    for (const dish of slice) {
      const section = dbSections?.find((s) => s.name === dish.sectionName);
      if (!section) continue;
      await supabaseAdmin.from("menu_items").insert({
        menu_id: menuId,
        section_id: section.id,
        name: dish.name,
        description: dish.description || null,
        price: dish.price || null,
      });
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        inserted: slice.length,
        nextIndex: startIndex + batchSize,
        total: allDishes.length,
      }),
    };
  } catch (err: any) {
    console.error("menu-save-dishes error:", err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

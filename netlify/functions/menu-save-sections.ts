// netlify/functions/menu-save-sections.ts
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

  const { menuId } = JSON.parse(event.body || "{}");
  if (!menuId) {
    return { statusCode: 400, headers: corsHeaders, body: "menuId required" };
  }

  try {
    // Get draft JSON
    const { data: draft, error: draftErr } = await supabaseAdmin
      .from("menu_drafts")
      .select("json_data")
      .eq("menu_id", menuId)
    if (draftErr) throw draftErr;

    const sections = draft.json_data.sections || [];

    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      await supabaseAdmin.from("menu_sections").insert({
        menu_id: menuId,
        name: sec.name,
        display_order: i,
      });
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, sectionsInserted: sections.length }),
    };
  } catch (err: any) {
    console.error("menu-save-sections error:", err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

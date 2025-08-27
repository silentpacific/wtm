// netlify/functions/save-menu.ts - Save menu changes to database
import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Dish {
  id?: string;
  name: string;
  description: string;
  price: number | null;
  allergens: string[];
  dietary_tags: string[];
}

interface MenuSection {
  name: string;
  dishes: Dish[];
}

interface MenuData {
  menuId?: string;
  restaurant: any;
  sections: MenuSection[];
}

export const handler: Handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Get user from Authorization header
    const authHeader = event.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Authorization required' })
      };
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid authorization' })
      };
    }

    const { menuId, menuData }: { menuId: string; menuData: MenuData } = JSON.parse(event.body || '{}');

    if (!menuId || !menuData) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Menu ID and data required' })
      };
    }

    // Start transaction by processing each section
    for (let sectionIndex = 0; sectionIndex < menuData.sections.length; sectionIndex++) {
      const section = menuData.sections[sectionIndex];
      
      // Get or create section
      const { data: existingSections, error: sectionError } = await supabase
        .from('menu_sections')
        .select('id')
        .eq('menu_id', menuId)
        .eq('name', section.name);

      if (sectionError) throw sectionError;

      let sectionId: string;

      if (existingSections && existingSections.length > 0) {
        sectionId = existingSections[0].id;
        
        // Update display order
        await supabase
          .from('menu_sections')
          .update({ display_order: sectionIndex })
          .eq('id', sectionId);
      } else {
        // Create new section
        const { data: newSection, error: createSectionError } = await supabase
          .from('menu_sections')
          .insert({
            menu_id: menuId,
            name: section.name,
            display_order: sectionIndex
          })
          .select('id')
          .single();

        if (createSectionError) throw createSectionError;
        sectionId = newSection.id;
      }

      // Process dishes in this section
      for (let dishIndex = 0; dishIndex < section.dishes.length; dishIndex++) {
        const dish = section.dishes[dishIndex];

        if (dish.id) {
          // Update existing dish
          const { error: updateError } = await supabase
            .from('menu_items')
            .update({
              name: dish.name,
              description: dish.description,
              price: dish.price,
              allergens: dish.allergens,
              dietary_tags: dish.dietary_tags,
              display_order: dishIndex,
              needs_dietary_analysis: false
            })
            .eq('id', dish.id);

          if (updateError) throw updateError;
        } else {
          // Create new dish
          const { error: createError } = await supabase
            .from('menu_items')
            .insert({
              menu_id: menuId,
              section_id: sectionId,
              name: dish.name,
              description: dish.description,
              price: dish.price,
              allergens: dish.allergens,
              dietary_tags: dish.dietary_tags,
              display_order: dishIndex,
              needs_dietary_analysis: false
            });

          if (createError) throw createError;
        }
      }

      // Remove dishes that are no longer in the section
      const currentDishIds = section.dishes
        .map(d => d.id)
        .filter(id => id !== undefined);

      if (currentDishIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('menu_items')
          .delete()
          .eq('section_id', sectionId)
          .not('id', 'in', `(${currentDishIds.join(',')})`);

        if (deleteError) throw deleteError;
      }
    }

    // Remove sections that are no longer in the menu
    const currentSectionNames = menuData.sections.map(s => s.name);
    const { error: deleteSectionsError } = await supabase
      .from('menu_sections')
      .delete()
      .eq('menu_id', menuId)
      .not('name', 'in', `(${currentSectionNames.map(name => `'${name}'`).join(',')})`);

    if (deleteSectionsError) throw deleteSectionsError;

    // Update menu status to active if it's not already
    const { error: menuUpdateError } = await supabase
      .from('menus')
      .update({ 
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', menuId);

    if (menuUpdateError) throw menuUpdateError;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: 'Menu saved successfully'
      })
    };

  } catch (error) {
    console.error('Save menu error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to save menu',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};
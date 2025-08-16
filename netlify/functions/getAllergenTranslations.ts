// =============================================
// FILE: netlify/functions/getAllergenTranslations.ts
// =============================================

import type { Handler } from "@netlify/functions";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { language = 'en' } = event.queryStringParameters || {};

    if (!['en', 'es', 'zh', 'fr'].includes(language)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Unsupported language' }),
      };
    }

    const { data: allergens, error } = await supabase
      .from('allergen_translations')
      .select('allergen_key, allergen_name')
      .eq('language_code', language);

    if (error) {
      console.error('Allergen translation fetch error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to fetch allergen translations' }),
      };
    }

    const allergenMap: { [key: string]: string } = {};
    allergens?.forEach((a) => {
      allergenMap[a.allergen_key] = a.allergen_name;
    });

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
      body: JSON.stringify(allergenMap),
    };
  } catch (error) {
    console.error('Allergen translation service error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
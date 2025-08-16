// =============================================
// FILE: netlify/functions/getTranslations.ts
// =============================================

import type { Handler } from "@netlify/functions";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

interface TranslationResponse {
  [key: string]: string;
}

export const handler: Handler = async (event) => {
  // Handle CORS
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
    const { language = 'en', category } = event.queryStringParameters || {};

    // Validate language
    if (!['en', 'es', 'zh', 'fr'].includes(language)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Unsupported language' }),
      };
    }

    // Build query
    let query = supabase
      .from('ui_translations')
      .select('translation_key, translation_value')
      .eq('language_code', language);

    if (category) {
      query = query.eq('category', category);
    }

    const { data: translations, error } = await query;

    if (error) {
      console.error('Translation fetch error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to fetch translations' }),
      };
    }

    // Convert to key-value object
    const translationMap: TranslationResponse = {};
    translations?.forEach((t) => {
      translationMap[t.translation_key] = t.translation_value;
    });

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
      body: JSON.stringify(translationMap),
    };
  } catch (error) {
    console.error('Translation service error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
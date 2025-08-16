// =============================================
// FILE: netlify/functions/getDietaryTagTranslations.ts
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

    const { data: tags, error } = await supabase
      .from('dietary_tag_translations')
      .select('tag_key, tag_name')
      .eq('language_code', language);

    if (error) {
      console.error('Dietary tag translation fetch error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to fetch dietary tag translations' }),
      };
    }

    const tagMap: { [key: string]: string } = {};
    tags?.forEach((t) => {
      tagMap[t.tag_key] = t.tag_name;
    });

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
      body: JSON.stringify(tagMap),
    };
  } catch (error) {
    console.error('Dietary tag translation service error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
// Translation dictionaries for tags and allergens
const dietaryTagTranslations: Record<string, Record<string, string>> = {
  'vegan': {
    en: 'vegan',
    zh: '纯素',
    es: 'vegano',
    fr: 'végétalien'
  },
  'gluten-free': {
    en: 'gluten-free',
    zh: '无麸质',
    es: 'sin gluten',
    fr: 'sans gluten'
  },
  'dairy-free': {
    en: 'dairy-free',
    zh: '无乳制品',
    es: 'sin lácteos',
    fr: 'sans produits laitiers'
  },
  'spicy': {
    en: 'spicy',
    zh: '辣',
    es: 'picante',
    fr: 'épicé'
  }
};

const allergenTranslations: Record<string, Record<string, string>> = {
  'fish': {
    en: 'fish',
    zh: '鱼',
    es: 'pescado',
    fr: 'poisson'
  },
  'nuts': {
    en: 'nuts',
    zh: '坚果',
    es: 'frutos secos',
    fr: 'noix'
  },
  'dairy': {
    en: 'dairy',
    zh: '乳制品',
    es: 'lácteos',
    fr: 'produits laitiers'
  }
};

export const translateDietaryTag = (tag: string, language: string): string => {
  return dietaryTagTranslations[tag]?.[language] || tag;
};

export const translateAllergen = (allergen: string, language: string): string => {
  return allergenTranslations[allergen]?.[language] || allergen;
};

// Currency formatting by language/region
const currencyFormats: Record<string, { currency: string; locale: string }> = {
  en: { currency: 'USD', locale: 'en-US' },
  zh: { currency: 'CNY', locale: 'zh-CN' },
  es: { currency: 'EUR', locale: 'es-ES' },
  fr: { currency: 'EUR', locale: 'fr-FR' }
};

// Currency formatting by language/region (same currency, different number formatting)
export const formatPrice = (price: number, language: string): string => {
  const locales: Record<string, string> = {
    en: 'en-AU', // Australian English
    zh: 'zh-CN', // Chinese number formatting
    es: 'es-ES', // Spanish number formatting  
    fr: 'fr-FR'  // French number formatting
  };
  
  const locale = locales[language] || locales.en;
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'AUD', // Always AUD
    }).format(price);
  } catch (error) {
    // Fallback to simple $ formatting
    return `$${price.toFixed(2)}`;
  }
};
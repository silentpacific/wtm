// =============================================
// FILE: hooks/useTranslation.ts
// =============================================

import { useState, useEffect } from 'react';
import { translationService } from '../services/translationService';

interface UseTranslationResult {
  t: (key: string, category?: string) => string;
  getAllergenName: (allergenKey: string) => string;
  getDietaryTagName: (tagKey: string) => string;
  isLoading: boolean;
  error: string | null;
}

export function useTranslation(language: string): UseTranslationResult {
  const [translations, setTranslations] = useState<{ [key: string]: string }>({});
  const [allergenTranslations, setAllergenTranslations] = useState<{ [key: string]: string }>({});
  const [dietaryTagTranslations, setDietaryTagTranslations] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTranslations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [uiTranslations, allergens, dietaryTags] = await Promise.all([
          translationService.getTranslations(language),
          translationService.getAllergenTranslations(language),
          translationService.getDietaryTagTranslations(language)
        ]);

        setTranslations(uiTranslations);
        setAllergenTranslations(allergens);
        setDietaryTagTranslations(dietaryTags);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load translations');
        console.error('Translation loading error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [language]);

  const t = (key: string, category?: string): string => {
    return translations[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getAllergenName = (allergenKey: string): string => {
    return allergenTranslations[allergenKey] || allergenKey.charAt(0).toUpperCase() + allergenKey.slice(1);
  };

  const getDietaryTagName = (tagKey: string): string => {
    return dietaryTagTranslations[tagKey] || tagKey.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return {
    t,
    getAllergenName,
    getDietaryTagName,
    isLoading,
    error
  };
}
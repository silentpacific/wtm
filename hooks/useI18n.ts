import { useState, useCallback, useMemo } from 'react'
import type { Dish, DishTranslations } from '../types'

const translationCache = new Map<string, DishTranslations>()

export function useI18n(language: string) {
  const [isLoading, setIsLoading] = useState(false)

  const translate = useCallback((text: string, context?: string): string => {
    // Stub implementation - in real app would call translation API
    return text
  }, [language])

  const translateDish = useCallback(async (dish: Dish): Promise<DishTranslations> => {
    const cacheKey = `${dish.id}-${language}`
    
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!
    }

    setIsLoading(true)
    try {
      // Stub implementation - in real app would call translation API
      const translations: DishTranslations = {
        name: dish.name,
        description: dish.description,
        originalName: dish.name,
        originalDescription: dish.description
      }
      
      translationCache.set(cacheKey, translations)
      return translations
    } finally {
      setIsLoading(false)
    }
  }, [language])

  return { translate, translateDish, isLoading }
}
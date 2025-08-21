import { useMemo } from 'react'
import type { Dish, MenuFilters, ActiveFilter } from '../types'

export function useMenuFilters(dishes: Dish[], filters: MenuFilters) {
  const filteredDishes = useMemo(() => {
    return dishes.filter(dish => {
      // Exclude dishes with selected allergens
      if (filters.excludeAllergens.length > 0) {
        const hasExcludedAllergen = dish.allergens?.some(allergen => 
          filters.excludeAllergens.includes(allergen)
        )
        if (hasExcludedAllergen) return false
      }

      // Include only dishes with selected diets (if any selected)
      if (filters.includeDiets.length > 0) {
        const hasIncludedDiet = dish.diets?.some(diet => 
          filters.includeDiets.includes(diet)
        )
        if (!hasIncludedDiet) return false
      }

      return true
    })
  }, [dishes, filters])

  const categoryCount = useMemo(() => {
    return filteredDishes.reduce((acc, dish) => {
      const category = dish.category || 'Other'
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }, [filteredDishes])

  const appliedFilters = useMemo((): ActiveFilter[] => {
    const filterArray: ActiveFilter[] = []

    // Add allergen filters
    filters.excludeAllergens.forEach(allergen => {
      filterArray.push({
        id: `allergen-${allergen}`,
        type: 'allergen',
        label: allergen.charAt(0).toUpperCase() + allergen.slice(1),
        value: allergen
      })
    })

    // Add diet filters
    filters.includeDiets.forEach(diet => {
      filterArray.push({
        id: `diet-${diet}`,
        type: 'diet',
        label: diet.replace('_', ' ').charAt(0).toUpperCase() + diet.replace('_', ' ').slice(1),
        value: diet
      })
    })

    return filterArray
  }, [filters])

  return {
    filteredDishes,
    categoryCount,
    appliedFilters
  }
}
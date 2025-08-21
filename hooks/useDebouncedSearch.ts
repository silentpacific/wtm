import { useState, useEffect, useMemo } from 'react'
import type { Dish } from '../types'

export function useDebouncedSearch(query: string, dishes: Dish[], delay: number = 300) {
  const [debouncedQuery, setDebouncedQuery] = useState(query)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    setIsSearching(true)
    const handler = setTimeout(() => {
      setDebouncedQuery(query)
      setIsSearching(false)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [query, delay])

  const searchResults = useMemo(() => {
    if (!debouncedQuery.trim()) return dishes

    const searchTerm = debouncedQuery.toLowerCase()
    return dishes.filter(dish => {
      return (
        dish.name.toLowerCase().includes(searchTerm) ||
        dish.description?.toLowerCase().includes(searchTerm) ||
        dish.aliases?.some(alias => alias.toLowerCase().includes(searchTerm)) ||
        dish.category.toLowerCase().includes(searchTerm)
      )
    })
  }, [debouncedQuery, dishes])

  return { searchResults, isSearching }
}
import { useState, useEffect, useCallback } from 'react'
import type { OrderItem, MenuFilters, SessionData } from '../types'

const SESSION_DURATION = 30 * 60 * 1000 // 30 minutes

export function useOrderSession(restaurantSlug: string) {
  const sessionKey = `wtm:${restaurantSlug}`
  
  const [order, setOrder] = useState<OrderItem[]>([])
  const [language, setLanguage] = useState('en')
  const [filters, setFilters] = useState<MenuFilters>({ excludeAllergens: [], includeDiets: [] })
  const [searchQuery, setSearchQuery] = useState('')
  const [sessionTimer, setSessionTimer] = useState('')

  // Load session on mount
  useEffect(() => {
    const stored = localStorage.getItem(sessionKey)
    if (stored) {
      try {
        const session: SessionData = JSON.parse(stored)
        const now = Date.now()
        
        if (now < session.expiresAt) {
          // Session valid, restore data and extend
          setOrder(session.order)
          setLanguage(session.language)
          setFilters(session.filters)
          setSearchQuery(session.searchQuery)
          extendSessionInternal(session)
        } else {
          // Session expired, clear
          localStorage.removeItem(sessionKey)
        }
      } catch (error) {
        console.error('Failed to restore session:', error)
        localStorage.removeItem(sessionKey)
      }
    }
  }, [sessionKey])

  // Update timer display
  useEffect(() => {
    const interval = setInterval(() => {
      const stored = localStorage.getItem(sessionKey)
      if (stored) {
        try {
          const session: SessionData = JSON.parse(stored)
          const remaining = Math.max(0, session.expiresAt - Date.now())
          const minutes = Math.floor(remaining / 60000)
          const seconds = Math.floor((remaining % 60000) / 1000)
          setSessionTimer(`${minutes}:${seconds.toString().padStart(2, '0')}`)
        } catch (error) {
          setSessionTimer('')
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [sessionKey])

  const extendSessionInternal = useCallback((currentSession?: SessionData) => {
    const now = Date.now()
    const session: SessionData = currentSession || {
      order,
      language,
      filters,
      searchQuery,
      expiresAt: now + SESSION_DURATION,
      lastActivity: now
    }
    
    session.expiresAt = now + SESSION_DURATION
    session.lastActivity = now
    
    localStorage.setItem(sessionKey, JSON.stringify(session))
  }, [sessionKey, order, language, filters, searchQuery])

  const extendSession = useCallback(() => {
    extendSessionInternal()
  }, [extendSessionInternal])

  const updateOrder = useCallback((newOrder: OrderItem[]) => {
    setOrder(newOrder)
    extendSession()
  }, [extendSession])

  const updateLanguage = useCallback((newLanguage: string) => {
    setLanguage(newLanguage)
    extendSession()
  }, [extendSession])

  const updateFilters = useCallback((newFilters: MenuFilters) => {
    setFilters(newFilters)
    extendSession()
  }, [extendSession])

  const updateSearch = useCallback((newQuery: string) => {
    setSearchQuery(newQuery)
    extendSession()
  }, [extendSession])

  const clearSession = useCallback(() => {
    localStorage.removeItem(sessionKey)
    setOrder([])
    setLanguage('en')
    setFilters({ excludeAllergens: [], includeDiets: [] })
    setSearchQuery('')
    setSessionTimer('')
  }, [sessionKey])

  return {
    order,
    language,
    filters,
    searchQuery,
    sessionTimer,
    updateOrder,
    updateLanguage,
    updateFilters,
    updateSearch,
    extendSession,
    clearSession
  }
}
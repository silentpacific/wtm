// pages/RestaurantPublicPage.tsx - Fixed with all 9 improvements
import React, { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { TopBar } from '../components/TopBar'
import { SearchBar } from '../components/SearchBar'
import { ActiveFilterChips } from '../components/ActiveFilterChips'
import { CategoryTabs } from '../components/CategoryTabs'
import { DishCard } from '../components/DishCard'
import { DishSheetModal } from '../components/DishSheetModal'
import { OrderDrawer } from '../components/OrderDrawer'
import { FilterSheet } from '../components/FilterSheet'
import { useOrderSession } from '../hooks/useOrderSession'
import { useDebouncedSearch } from '../hooks/useDebouncedSearch'
import { useI18n } from '../hooks/useI18n'
import { useMenuFilters } from '../hooks/useMenuFilters'
import { adaptDishToAccessible, adaptRestaurantToAccessible } from '../types'
import { supabase } from '../services/supabaseClient'
import type { AccessibleRestaurant, AccessibleDish, OrderItem, MenuFilters, ActiveFilter, Language } from '../types'

// FIX #3: Remove country codes, just show language names
const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' }
]

export default function RestaurantPublicPage() {
  const { slug } = useParams<{ slug: string }>()
  
  // Core data state
  const [restaurant, setRestaurant] = useState<AccessibleRestaurant | null>(null)
  const [dishes, setDishes] = useState<AccessibleDish[]>([])
  const [sections, setSections] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Session management
  const {
    order,
    language,
    filters,
    searchQuery,
    sessionTimer,
    updateOrder,
    updateLanguage,
    updateFilters,
    updateSearch,
    extendSession
  } = useOrderSession(slug || '')

  // UI state
  const [showFilterSheet, setShowFilterSheet] = useState(false)
  const [selectedDish, setSelectedDish] = useState<AccessibleDish | null>(null)
  const [showDishSheet, setShowDishSheet] = useState(false)
  const [orderDrawerExpanded, setOrderDrawerExpanded] = useState(false)
  const [activeCategory, setActiveCategory] = useState('')
  const [dishCustomizations, setDishCustomizations] = useState<Record<string, string[]>>({})
  const [dishNotes, setDishNotes] = useState<Record<string, string>>({})
  const [dishQuestions, setDishQuestions] = useState<Record<string, string>>({})
  const [showOriginalNames, setShowOriginalNames] = useState<Record<string, boolean>>({})

  // Hooks
  const { translate, translateDish } = useI18n(language)
  const { searchResults, isSearching } = useDebouncedSearch(searchQuery, dishes, 300)
  const { filteredDishes, categoryCount, appliedFilters } = useMenuFilters(searchResults, filters)

  // Load restaurant data
  useEffect(() => {
    if (slug) {
      loadRestaurantData()
    }
  }, [slug])

  // Set initial active category
  useEffect(() => {
    if (sections.length > 0 && !activeCategory) {
      setActiveCategory(sections[0])
    }
  }, [sections, activeCategory])

  const loadRestaurantData = async () => {
    try {
      setLoading(true)
      setError('')

      console.log('🔍 Loading restaurant data for slug:', slug)

      const response = await fetch(`/.netlify/functions/getRestaurantData?slug=${slug}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Restaurant not found')
        } else {
          setError(`Failed to load restaurant: ${response.status}`)
        }
        return
      }

      const data = await response.json()
      console.log('📋 Raw API response:', data)
      
      if (data.error) {
        setError(data.error)
        return
      }

      if (data.restaurant) {
        const adaptedRestaurant = adaptRestaurantToAccessible(data.restaurant)
        setRestaurant(adaptedRestaurant)
        console.log('✅ Adapted restaurant:', adaptedRestaurant)
      } else {
        setError('Restaurant data not found')
        return
      }

      const dishList = data.dishes || []
      const sectionList = data.sections || []
      
      console.log('🍽️ Raw dishes:', dishList.slice(0, 2)) // Log first 2 dishes
      console.log('📂 Raw sections:', sectionList)
      
      // Adapt dishes to new format
      const adaptedDishes = dishList.map(adaptDishToAccessible)
      console.log('✅ Adapted dishes:', adaptedDishes.slice(0, 2)) // Log first 2 adapted
      
      setDishes(adaptedDishes)
      setSections(sectionList)

    } catch (error) {
      console.error('❌ Error loading restaurant:', error)
      setError('Failed to load restaurant')
    } finally {
      setLoading(false)
    }
  }

  // Group dishes by category using the adapted data - FIX #7: Prevent infinite loop
  const groupedDishes = useMemo(() => {
    const grouped = filteredDishes.reduce((acc, dish) => {
      const category = dish.category || 'Other'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(dish)
      return acc
    }, {} as Record<string, AccessibleDish[]>)
    
    // Remove console.log that was causing infinite re-renders
    return grouped
  }, [filteredDishes])

  // Category data for tabs - FIX #7: Prevent infinite loop
  const categories = useMemo(() => {
    return sections.map(section => ({
      name: section,
      count: categoryCount[section] || 0
    }))
  }, [sections, categoryCount])

  // FIX #6: Scroll to section function
  const handleCategoryClick = (category: string) => {
    setActiveCategory(category)
    const element = document.getElementById(`section-${category.toLowerCase().replace(/\s+/g, '-')}`)
    if (element) {
      const headerOffset = 200 // Account for floating header
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  // Order management
  const handleAddToOrder = (dish: AccessibleDish) => {
    extendSession()
    const existingItem = order.find(item => item.dish.id === dish.id)
    
    if (existingItem) {
      updateOrder(order.map(item =>
        item.dish.id === dish.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      const newItem: OrderItem = {
        dish,
        quantity: 1,
        customizations: dishCustomizations[dish.id] || [],
        customNote: dishNotes[dish.id] || '',
        question: dishQuestions[dish.id] || '',
        translations: {
          name: dish.name,
          description: dish.description,
          originalName: dish.name,
          originalDescription: dish.description
        }
      }
      updateOrder([...order, newItem])
    }
  }

  const handleQuantityChange = (dishId: string, delta: number) => {
    extendSession()
    updateOrder(order.map(item => {
      if (item.dish.id === dishId) {
        const newQuantity = Math.max(0, item.quantity + delta)
        return newQuantity === 0 ? null : { ...item, quantity: newQuantity }
      }
      return item
    }).filter(Boolean) as OrderItem[])
  }

  const handleRemoveItem = (dishId: string) => {
    extendSession()
    updateOrder(order.filter(item => item.dish.id !== dishId))
  }

  // FIX #2: Enhanced dish explanation fetching (DB first, then Gemini fallback)
  const handleShowDishInfo = async (dish: AccessibleDish) => {
    console.log('🍽️ Fetching explanation for:', dish.name)
    setSelectedDish(dish)
    setShowDishSheet(true)
    extendSession()

    // Show loading state
    setSelectedDish(prev => prev ? {
      ...prev,
      description: 'Loading explanation...',
      allergens: prev.allergens || [],
      dietaryTags: prev.dietaryTags || []
    } : null)

    try {
      // Step 1: Check database cache first (restaurant-specific)
      console.log('🔍 Checking database cache...')
      const { data: cachedExplanation } = await supabase
        .from('dishes')
        .select('explanation, allergens, tags')
        .eq('name', dish.name)
        .eq('restaurant_id', restaurant?.id)
        .eq('language', language)
        .maybeSingle()

      if (cachedExplanation) {
        console.log('✅ Found cached explanation in database')
        setSelectedDish(prev => prev ? {
          ...prev,
          description: cachedExplanation.explanation || dish.description,
          allergens: cachedExplanation.allergens || prev.allergens || [],
          dietaryTags: cachedExplanation.tags || prev.dietaryTags || []
        } : null)
        return
      }

      // Step 2: Fallback to Gemini API if no cache found
      console.log('🧠 No cache found, calling Gemini API...')
      const response = await fetch('/.netlify/functions/getDishExplanation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dishName: dish.name,
          language: language,
          restaurantId: restaurant?.id?.toString(),
          restaurantName: restaurant?.name
        })
      })

      if (response.ok) {
        const explanation = await response.json()
        console.log('✅ Got AI explanation:', explanation)
        
        // Update the selected dish with detailed information
        setSelectedDish(prev => prev ? {
          ...prev,
          description: explanation.explanation || dish.description || 'Delicious dish from our menu',
          allergens: explanation.allergens || prev.allergens || [],
          dietaryTags: explanation.tags || prev.dietaryTags || []
        } : null)
      } else {
        console.error('❌ API call failed:', response.status)
        // Fallback to original description
        setSelectedDish(prev => prev ? {
          ...prev,
          description: dish.description || 'Delicious dish from our menu',
          allergens: prev.allergens || [],
          dietaryTags: prev.dietaryTags || []
        } : null)
      }
    } catch (error) {
      console.error('❌ Error fetching dish explanation:', error)
      // Fallback to original description
      setSelectedDish(prev => prev ? {
        ...prev,
        description: dish.description || 'Delicious dish from our menu',
        allergens: prev.allergens || [],
        dietaryTags: prev.dietaryTags || []
      } : null)
    }
  }

  const handleDishSheetClose = () => {
    setShowDishSheet(false)
    setSelectedDish(null)
  }

  // Filter management
  const handleFilterRemove = (filterId: string) => {
    extendSession()
    const filter = appliedFilters.find(f => f.id === filterId)
    if (!filter) return

    if (filter.type === 'allergen') {
      updateFilters({
        ...filters,
        excludeAllergens: filters.excludeAllergens.filter(a => a !== filter.value)
      })
    } else {
      updateFilters({
        ...filters,
        includeDiets: filters.includeDiets.filter(d => d !== filter.value)
      })
    }
  }

  // Order actions
  const handleCopyOrderSummary = () => {
    const summary = order.map(item => 
      `${item.quantity}x ${item.translations.name} - $${(item.dish.price * item.quantity).toFixed(2)}`
    ).join('\n')
    const total = order.reduce((sum, item) => sum + (item.dish.price * item.quantity), 0)
    const fullSummary = `${restaurant?.name}\n\n${summary}\n\nTotal: $${total.toFixed(2)}`
    
    navigator.clipboard.writeText(fullSummary)
  }

  const handleShareOrder = () => {
    if (navigator.share) {
      navigator.share({
        title: `Order from ${restaurant?.name}`,
        text: `Check out my order from ${restaurant?.name}!`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const handleShowToStaff = () => {
    const staffView = window.open('', '_blank')
    if (staffView) {
      const summary = order.map(item => 
        `${item.quantity}x ${item.translations.name}`
      ).join('\n')
      staffView.document.write(`
        <html>
          <head><title>Order Summary</title></head>
          <body style="font-family: Arial; padding: 20px; font-size: 18px;">
            <h2>${restaurant?.name}</h2>
            <pre>${summary}</pre>
            <h3>Total: $${order.reduce((sum, item) => sum + (item.dish.price * item.quantity), 0).toFixed(2)}</h3>
          </body>
        </html>
      `)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading restaurant...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Restaurant Not Found</h1>
          <p className="text-gray-600 mb-4">
            {error || `Restaurant '${slug}' not found`}
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const subtotal = order.reduce((sum, item) => sum + (item.dish.price * item.quantity), 0)

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* FIX #7: Floating Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white shadow-sm">
        {/* Top Bar */}
        <TopBar
          restaurantName={restaurant.name}
          currentLanguage={language}
          languages={LANGUAGES}
          activeFiltersCount={appliedFilters.length}
          onLanguageChange={updateLanguage}
          onFiltersClick={() => setShowFilterSheet(true)}
        />

        {/* FIX #1: Smaller, centered search bar */}
        <div className="flex justify-center px-4 py-2">
          <div className="w-full max-w-md">
            <SearchBar
              value={searchQuery}
              placeholder="Search dishes..."
              onChange={updateSearch}
            />
          </div>
        </div>

        {/* FIX #2: Single location for filter chips (removed duplicate) */}
        <ActiveFilterChips
          filters={appliedFilters}
          onRemove={handleFilterRemove}
          onAddFilters={() => setShowFilterSheet(true)}
        />

        {/* FIX #5: Centered Category Tabs */}
        {categories.length > 0 && (
          <div className="flex justify-center px-4 py-2 border-t border-gray-100">
            <CategoryTabs
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryClick}
            />
          </div>
        )}
      </div>

      {/* Main Content with top padding for floating header */}
      <div className="pt-48 max-w-4xl mx-auto px-4 py-6">
        {filteredDishes.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🍽️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery || appliedFilters.length > 0 ? 'No dishes found' : 'Menu Coming Soon'}
            </h2>
            <p className="text-gray-600">
              {searchQuery || appliedFilters.length > 0 
                ? 'Try adjusting your search or filters'
                : `${restaurant.name} is still setting up their digital menu. Please check back later!`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* FIX #2: Fixed "Our Menu" cutoff - Proper menu introduction */}
            <div className="bg-white rounded-lg p-6 shadow-sm text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Our Menu</h2>
              <p className="text-gray-600">
                Discover our selection of {filteredDishes.length} dishes • Tap a dish for details, allergens, and customizations.
              </p>
            </div>

            {/* FIX #4: Debug section removed completely */}

            {/* Menu Sections - FIX #7: Remove console.log causing infinite loop */}
            {sections.map(section => {
              const sectionDishes = groupedDishes[section] || []
              
              // FIX #7: Removed console.log that was causing infinite re-renders
              
              if (sectionDishes.length === 0) return null
              
              return (
                <div 
                  key={section} 
                  id={`section-${section.toLowerCase().replace(/\s+/g, '-')}`}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">{section}</h3>
                    <p className="text-sm text-gray-600">{sectionDishes.length} items</p>
                  </div>
                  
                  <div className="divide-y divide-gray-100">
                    {sectionDishes.map((dish) => {
                      const orderItem = order.find(item => item.dish.id === dish.id)
                      const quantity = orderItem?.quantity || 0
                      const showOriginal = showOriginalNames[dish.id] || false

                      return (
                        <DishCard
                          key={dish.id}
                          dish={dish}
                          quantity={quantity}
                          showOriginal={showOriginal}
                          translations={{
                            name: dish.name,
                            description: dish.description,
                            originalName: dish.name,
                            originalDescription: dish.description
                          }}
                          onToggleOriginal={() => 
                            setShowOriginalNames(prev => ({
                              ...prev,
                              [dish.id]: !prev[dish.id]
                            }))
                          }
                          onShowInfo={() => handleShowDishInfo(dish)}
                          onQuantityChange={(delta) => handleQuantityChange(dish.id, delta)}
                          onAddToOrder={() => handleAddToOrder(dish)}
                        />
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* FIX #9: Enhanced Dish Sheet Modal with allergens and dietary tags */}
      <DishSheetModal
        dish={selectedDish}
        isOpen={showDishSheet}
        quantity={order.find(item => item.dish.id === selectedDish?.id)?.quantity || 0}
        customizations={dishCustomizations[selectedDish?.id || ''] || []}
        customNote={dishNotes[selectedDish?.id || ''] || ''}
        question={dishQuestions[selectedDish?.id || ''] || ''}
        translations={selectedDish ? {
          name: selectedDish.name,
          description: selectedDish.description,
          originalName: selectedDish.name,
          originalDescription: selectedDish.description
        } : null}
        onClose={handleDishSheetClose}
        onQuantityChange={(newQty) => {
          if (selectedDish) {
            const currentQty = order.find(item => item.dish.id === selectedDish.id)?.quantity || 0
            handleQuantityChange(selectedDish.id, newQty - currentQty)
          }
        }}
        onCustomizationToggle={(customization) => {
          if (selectedDish) {
            const current = dishCustomizations[selectedDish.id] || []
            const updated = current.includes(customization)
              ? current.filter(c => c !== customization)
              : [...current, customization]
            setDishCustomizations(prev => ({ ...prev, [selectedDish.id]: updated }))
          }
        }}
        onCustomNoteChange={(note) => {
          if (selectedDish) {
            setDishNotes(prev => ({ ...prev, [selectedDish.id]: note }))
          }
        }}
        onQuestionChange={(question) => {
          if (selectedDish) {
            setDishQuestions(prev => ({ ...prev, [selectedDish.id]: question }))
          }
        }}
        onPronounce={() => {
          if (selectedDish && 'speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(selectedDish.name)
            utterance.lang = language
            speechSynthesis.speak(utterance)
          }
        }}
        onAddUpdate={handleDishSheetClose}
      />

      {/* Filter Sheet */}
      {showFilterSheet && (
        <FilterSheet
          isOpen={showFilterSheet}
          allergenFilters={filters.excludeAllergens}
          dietFilters={filters.includeDiets}
          matchingDishCount={filteredDishes.length}
          onClose={() => setShowFilterSheet(false)}
          onAllergenToggle={(allergen) => {
            const updated = filters.excludeAllergens.includes(allergen)
              ? filters.excludeAllergens.filter(a => a !== allergen)
              : [...filters.excludeAllergens, allergen]
            updateFilters({ ...filters, excludeAllergens: updated })
          }}
          onDietToggle={(diet) => {
            const updated = filters.includeDiets.includes(diet)
              ? filters.includeDiets.filter(d => d !== diet)
              : [...filters.includeDiets, diet]
            updateFilters({ ...filters, includeDiets: updated })
          }}
          onApply={() => setShowFilterSheet(false)}
          onClear={() => {
            updateFilters({ excludeAllergens: [], includeDiets: [] })
            setShowFilterSheet(false)
          }}
        />
      )}

      {/* FIX #8: Floating Order Drawer at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <OrderDrawer
          items={order}
          isExpanded={orderDrawerExpanded}
          sessionTimer={sessionTimer}
          subtotal={subtotal}
          currency="$"
          onToggleExpanded={() => setOrderDrawerExpanded(!orderDrawerExpanded)}
          onQuantityChange={handleQuantityChange}
          onRemoveItem={handleRemoveItem}
          onNotesChange={() => {}}
          onCopySummary={handleCopyOrderSummary}
          onShareOrder={handleShareOrder}
          onShowToStaff={handleShowToStaff}
        />
      </div>
    </div>
  )
}
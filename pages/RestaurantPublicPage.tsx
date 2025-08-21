// pages/RestaurantPublicPage.tsx - Fixed data mapping
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
import type { AccessibleRestaurant, AccessibleDish, OrderItem, MenuFilters, ActiveFilter, Language } from '../types'

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

  // Group dishes by category using the adapted data
  const groupedDishes = useMemo(() => {
    return filteredDishes.reduce((acc, dish) => {
      const category = dish.category || 'Other'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(dish)
      return acc
    }, {} as Record<string, AccessibleDish[]>)
  }, [filteredDishes])

  // Category data for tabs
  const categories = useMemo(() => {
    return sections.map(section => ({
      name: section,
      count: categoryCount[section] || 0
    }))
  }, [sections, categoryCount])

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

  // Dish sheet management
  const handleShowDishInfo = (dish: AccessibleDish) => {
    setSelectedDish(dish)
    setShowDishSheet(true)
    extendSession()
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
      {/* Top Bar */}
      <TopBar
        restaurantName={restaurant.name}
        currentLanguage={language}
        languages={LANGUAGES}
        activeFiltersCount={appliedFilters.length}
        onLanguageChange={updateLanguage}
        onFiltersClick={() => setShowFilterSheet(true)}
      />

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        placeholder="Search dishes, ingredients, allergens..."
        onChange={updateSearch}
      />

      {/* Active Filter Chips - SINGLE LOCATION */}
      <ActiveFilterChips
        filters={appliedFilters}
        onRemove={handleFilterRemove}
        onAddFilters={() => setShowFilterSheet(true)}
      />

      {/* Category Tabs - DYNAMIC FROM API */}
      {categories.length > 0 && (
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
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
            {/* Menu Introduction */}
            <div className="bg-white rounded-lg p-6 shadow-sm text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Our Menu</h2>
              <p className="text-gray-600">
                Discover our selection of {filteredDishes.length} dishes • Tap a dish for details, allergens, and customizations.
              </p>
            </div>

            {/* DEBUG INFO - Remove after testing */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
              <h4 className="font-medium text-yellow-800 mb-2">Debug Info:</h4>
              <p>Total dishes loaded: {dishes.length}</p>
              <p>Filtered dishes: {filteredDishes.length}</p>
              <p>Sections: {sections.join(', ')}</p>
              <p>Active category: {activeCategory}</p>
              <p>Sample dish: {dishes[0] ? JSON.stringify(dishes[0], null, 2) : 'No dishes'}</p>
            </div>

            {/* Menu Sections - DYNAMIC FROM API */}
            {sections.map(section => {
              const sectionDishes = groupedDishes[section] || []
              
              console.log(`🍽️ Section "${section}" dishes:`, sectionDishes.length)
              
              if (sectionDishes.length === 0) return null
              
              return (
                <div 
                  key={section} 
                  id={`section-${section.toLowerCase()}`}
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

      {/* All the modals and components remain the same... */}
      {/* Dish Sheet Modal */}
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

      {/* Order Drawer */}
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
  )
}
import React, { useRef, useEffect } from 'react'

interface Category {
  name: string
  count: number
}

interface CategoryTabsProps {
  categories: Category[]
  activeCategory: string
  onCategoryChange: (category: string) => void
}

export function CategoryTabs({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null)
  const activeTabRef = useRef<HTMLButtonElement>(null)

  // Scroll active tab into view
  useEffect(() => {
    if (activeTabRef.current && tabsRef.current) {
      const { offsetLeft, offsetWidth } = activeTabRef.current
      const { scrollLeft, clientWidth } = tabsRef.current
      
      if (offsetLeft < scrollLeft || offsetLeft + offsetWidth > scrollLeft + clientWidth) {
        tabsRef.current.scrollTo({
          left: offsetLeft - clientWidth / 2 + offsetWidth / 2,
          behavior: 'smooth'
        })
      }
    }
  }, [activeCategory])

  return (
    <div className="border-b border-gray-200 bg-white">
      <div 
        ref={tabsRef}
        className="flex overflow-x-auto scrollbar-hide px-4 py-2"
        role="tablist"
        aria-label="Menu categories"
      >
        {categories.map((category) => (
          <button
            key={category.name}
            ref={activeCategory === category.name ? activeTabRef : null}
            role="tab"
            aria-selected={activeCategory === category.name}
            aria-controls={`panel-${category.name.toLowerCase()}`}
            onClick={() => onCategoryChange(category.name)}
            className={`flex-shrink-0 px-4 py-2 mx-1 rounded-lg text-sm font-medium whitespace-nowrap min-h-[44px] transition-colors ${
              activeCategory === category.name
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name} ({category.count})
          </button>
        ))}
      </div>
    </div>
  )
}
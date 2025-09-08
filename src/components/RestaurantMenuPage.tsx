// src/components/RestaurantMenuPage.tsx (Minimal Version)
import React, { useEffect } from 'react';
import { ChevronDown, ChevronUp, Plus, MessageCircle, Filter } from 'lucide-react';
import ReactCountryFlag from "react-country-flag";

// Types and hooks
import { RestaurantMenuPageProps, LanguageOption } from '../types/menuTypes';
import { useMenuState } from '../hooks/useMenuState';
import { useOrderManagement } from '../hooks/useOrderManagement';

// Components
import WelcomeScreen from './menu/WelcomeScreen';
import LanguageSelector from './menu/LanguageSelector';
import ConfirmedOrderScreen from './menu/ConfirmedOrderScreen';
import OrderDrawer from './menu/OrderDrawer';
import ServerCommunicationModal from './ServerCommunicationModal';
import FilterPanel from './menu/FilterPanel';
import DishExplanationModal from './menu/DishExplanationModal';

const RestaurantMenuPage: React.FC<RestaurantMenuPageProps> = ({
  menuData,
  menuId,
  isDemo = false
}) => {
  // State management
  const menuState = useMenuState(isDemo);
  const orderManagement = useOrderManagement(
    menuState.orderItems,
    menuState.setOrderItems,
    menuData.menuItems,
    menuState.customRequestInput,
    menuState.setCustomRequestInput
  );

  // Language configurations
  const languages: LanguageOption[] = [
    { code: 'en', label: 'English', flag: 'GB' },
    { code: 'zh', label: '中文', flag: 'CN' },
    { code: 'es', label: 'Español', flag: 'ES' },
    { code: 'fr', label: 'Français', flag: 'FR' },
  ];

  // Translations (only for main page elements)
  const t = {
    en: { addToOrder: 'Add', moreInfo: 'Info', filters: 'Filters', yourOrder: 'Your Order', chooseVariant: "Choose a variant" },
    zh: { addToOrder: '添加', moreInfo: '更多信息', filters: '筛选', yourOrder: '您的订单', chooseVariant: "选择一个选项" },
    es: { addToOrder: 'Agregar', moreInfo: 'Info', filters: 'Filtros', yourOrder: 'Su Pedido', chooseVariant: "Elige una variante" },
    fr: { addToOrder: 'Ajouter', moreInfo: 'Info', filters: 'Filtres', yourOrder: 'Votre Commande', chooseVariant: "Choisir une variante" }
  }[menuState.language];

  // Initialize collapsed sections on mount
  useEffect(() => {
    const sections = Object.keys(menuData.menuItems.reduce((acc, item) => {
      acc[item.section] = true;
      return acc;
    }, {} as Record<string, boolean>));
    menuState.setCollapsedSections(new Set(sections.slice(1)));
  }, [menuData.menuItems]);

  // Get unique dietary tags and allergens for filters
  const allDietaryTags = [...new Set(
    menuData.menuItems.flatMap(item => 
      item.dietaryTagsI18n?.[menuState.language] || item.dietaryTags || []
    )
  )];

  const allAllergens = [...new Set(
    menuData.menuItems.flatMap(item => 
      item.allergensI18n?.[menuState.language] || item.allergens || []
    )
  )];

  // Filter menu items
  const filteredItems = menuData.menuItems.filter(item => {
    const currentAllergens = item.allergensI18n?.[menuState.language] || item.allergens || [];
    const currentDietaryTags = item.dietaryTagsI18n?.[menuState.language] || item.dietaryTags || [];

    if (menuState.dietaryFilters.length > 0) {
      const hasMatchingTag = menuState.dietaryFilters.some(filter => 
        currentDietaryTags.includes(filter)
      );
      if (!hasMatchingTag) return false;
    }

    if (menuState.allergenExclusions.length > 0) {
      const hasExcludedAllergen = menuState.allergenExclusions.some(allergen => 
        currentAllergens.includes(allergen)
      );
      if (hasExcludedAllergen) return false;
    }

    return true;
  });

  // Group filtered items by section
  const itemsBySection = filteredItems.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, typeof menuData.menuItems>);

  // Screen routing
  if (menuState.currentStep === 'welcome') {
    return (
      <WelcomeScreen
        menuData={menuData}
        language={menuState.language}
        onNext={() => menuState.setCurrentStep('language')}
      />
    );
  }

  if (menuState.currentStep === 'language') {
    return (
      <LanguageSelector
        currentLanguage={menuState.language}
        onLanguageSelect={menuState.setLanguage}
        onNext={() => menuState.setCurrentStep('menu')}
      />
    );
  }

  if (menuState.isOrderConfirmed) {
    return (
      <ConfirmedOrderScreen
        orderItems={menuState.orderItems}
        menuItems={menuData.menuItems}
        language={menuState.language}
        orderTotal={orderManagement.orderTotal}
        onBrowseAgain={() => {
          menuState.setIsOrderConfirmed(false);
          menuState.setOrderItems([]);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-wtm-bg">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => menuState.setCurrentStep('language')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ReactCountryFlag 
                countryCode={languages.find(l => l.code === menuState.language)?.flag || 'GB'}
                svg
                style={{ width: "1.5em", height: "1.5em" }}
              />
            </button>
            
            <h1 className="text-xl font-bold text-wtm-text tracking-tight">
              {menuData.restaurantName[menuState.language]}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Communication Button */}
            <button
              onClick={() => menuState.setIsCommunicationModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-100 hover:bg-blue-200 transition-colors"
              aria-label="Ask server"
            >
              <MessageCircle size={18} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-600 hidden sm:inline">Ask Server</span>
            </button>

            {/* Filter Button */}
            {(allDietaryTags.length > 0 || allAllergens.length > 0) && (
              <button
                onClick={() => menuState.setIsFiltersExpanded(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors relative"
              >
                <Filter size={18} className="text-wtm-muted" />
                <span className="text-sm font-medium text-wtm-muted">{t.filters}</span>
                {(menuState.dietaryFilters.length > 0 || menuState.allergenExclusions.length > 0) && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-wtm-primary text-white rounded-full text-xs font-bold flex items-center justify-center">
                    {menuState.dietaryFilters.length + menuState.allergenExclusions.length}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {Object.entries(itemsBySection).map(([section, items]) => (
          <div key={section} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <button
              onClick={() => menuState.toggleSection(section)}
              className="w-full flex justify-between items-center p-6 hover:bg-gray-50 transition-colors focus:outline-none"
            >
              <h2 className="text-2xl font-bold text-wtm-text tracking-tight">{section}</h2>
              {menuState.collapsedSections.has(section) ? 
                <ChevronDown size={24} className="text-wtm-muted" /> : 
                <ChevronUp size={24} className="text-wtm-muted" />
              }
            </button>

            {!menuState.collapsedSections.has(section) && (
              <div className="divide-y divide-gray-100">
                {items.map(item => (
                  <div key={item.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 pr-4">
                        <h3 className="font-bold text-xl text-wtm-text mb-2 tracking-tight leading-tight">
                          {item.name[menuState.language]}
                        </h3>
                        <p className="text-wtm-muted leading-relaxed">
                          {item.description[menuState.language]}
                        </p>
                      </div>
                      <div className="text-2xl font-bold text-wtm-primary shrink-0">
                        {(!item.variants || item.variants.length === 0) ? 
                          `${item.price.toFixed(2)}` : 
                          <span className="text-sm text-gray-500">Multiple options</span>
                        }
                      </div>
                    </div>

                    {/* Language-aware Tags */}
                    {(() => {
                      const currentDietaryTags = item.dietaryTagsI18n?.[menuState.language] || item.dietaryTags || [];
                      const currentAllergens = item.allergensI18n?.[menuState.language] || item.allergens || [];
                      
                      return (currentDietaryTags.length > 0 || currentAllergens.length > 0) && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {currentDietaryTags.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                              {tag}
                            </span>
                          ))}
                          {currentAllergens.map(allergen => (
                            <span key={allergen} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                              {allergen}
                            </span>
                          ))}
                        </div>
                      );
                    })()}

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                      {/* Variant selector */}
                      {item.variants && item.variants.length > 0 && (
                        <select
                          value={menuState.selectedVariants[item.id] || ""}
                          onChange={(e) =>
                            menuState.setSelectedVariants({
                              ...menuState.selectedVariants,
                              [item.id]: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-wtm-text font-medium focus:border-wtm-primary focus:ring-2 focus:ring-wtm-primary/20 focus:outline-none transition-all duration-200 cursor-pointer hover:bg-gray-100"
                        >
                          <option value="" className="text-gray-500">{t.chooseVariant}</option>
                          {item.variants.map((v) => (
                            <option key={v.id} value={v.id} className="text-wtm-text">
                              {v.name} - ${v.price.toFixed(2)}
                            </option>
                          ))}
                        </select>
                      )}
                      
                      {/* Info and Add buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => menuState.setShowDishExplanation(item.id)}
                          className="flex-1 px-4 py-3 bg-gray-100 text-wtm-text rounded-xl hover:bg-gray-200 transition-colors font-medium"
                        >
                          {t.moreInfo}
                        </button>
                        
                        <button
                          onClick={() =>
                            orderManagement.addToOrder(
                              item.id, 
                              item.variants && item.variants.length > 0 
                                ? menuState.selectedVariants[item.id] || undefined 
                                : undefined, 
                              1
                            )
                          }
                          disabled={item.variants && item.variants.length > 0 && !menuState.selectedVariants[item.id]}
                          className="flex-1 inline-flex items-center justify-center whitespace-nowrap gap-2 bg-wtm-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-wtm-primary-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-wtm-primary shadow-sm hover:shadow-md"
                        >
                          <Plus size={18} />
                          {t.addToOrder}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer - Only for non-demo menus */}
      {!isDemo && (
        <div className="max-w-2xl mx-auto px-6 py-8 text-center">
          <p className="text-sm text-wtm-muted">
            Powered by <a href="https://whatthemenu.com" className="text-wtm-primary hover:text-wtm-primary-600 font-medium transition-colors" target="_blank" rel="noopener noreferrer">WhatTheMenu.com</a>
          </p>
        </div>
      )}

      {/* All Modals and Drawers */}
      <ServerCommunicationModal
        isOpen={menuState.isCommunicationModalOpen}
        onClose={() => menuState.setIsCommunicationModalOpen(false)}
        language={menuState.language}
      />

      <FilterPanel
        isOpen={menuState.isFiltersExpanded}
        onClose={() => menuState.setIsFiltersExpanded(false)}
        language={menuState.language}
        allDietaryTags={allDietaryTags}
        allAllergens={allAllergens}
        dietaryFilters={menuState.dietaryFilters}
        allergenExclusions={menuState.allergenExclusions}
        onSetDietaryFilters={menuState.setDietaryFilters}
        onSetAllergenExclusions={menuState.setAllergenExclusions}
        onClearAllFilters={menuState.clearAllFilters}
      />

      <OrderDrawer
        isOpen={menuState.isOrderListExpanded}
        onClose={() => menuState.setIsOrderListExpanded(false)}
        orderItems={menuState.orderItems}
        menuItems={menuData.menuItems}
        language={menuState.language}
        orderTotal={orderManagement.orderTotal}
        customRequestInput={menuState.customRequestInput}
        selectedVariants={menuState.selectedVariants}
        onUpdateQuantity={orderManagement.updateQuantity}
        onRemoveFromOrder={orderManagement.removeFromOrder}
        onUpdateVariant={orderManagement.updateVariant}
        onSetCustomRequestInput={menuState.setCustomRequestInput}
        onSetSelectedVariants={menuState.setSelectedVariants}
        onAddCustomRequest={orderManagement.addCustomRequest}
        onHandleServerResponse={orderManagement.handleServerResponse}
        onConfirmOrder={() => {
          menuState.setIsOrderConfirmed(true);
          menuState.setIsOrderListExpanded(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <DishExplanationModal
        isOpen={!!menuState.showDishExplanation}
        onClose={() => menuState.setShowDishExplanation(null)}
        dish={menuData.menuItems.find(item => item.id === menuState.showDishExplanation)}
        language={menuState.language}
        onAddToOrder={(dishId) => {
          orderManagement.addToOrder(dishId);
          menuState.setShowDishExplanation(null);
        }}
      />

      {/* Sticky bottom Your Order button */}
      {orderManagement.totalItems > 0 && (
        <div className="sticky bottom-0 w-full bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => menuState.setIsOrderListExpanded(true)}
              className="w-full bg-wtm-primary text-white font-semibold px-6 py-4 rounded-xl flex items-center justify-center gap-2 text-lg"
            >
              {t.yourOrder} ({orderManagement.totalItems}) - ${orderManagement.orderTotal.toFixed(2)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantMenuPage;
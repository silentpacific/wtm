import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plus, Minus, Trash2, MessageCircle, X, Search } from 'lucide-react';

// Types and Interfaces (keeping your existing structure)
interface MenuItem {
  id: string;
  section: string;
  name: Record<string, string>;
  description: Record<string, string>;
  price: number;
  allergens: string[];
  dietaryTags: string[];
  explanation: Record<string, string>;
}

interface OrderItem {
  dishId: string;
  quantity: number;
  customRequest?: string;
  serverResponse?: 'yes' | 'no' | 'checking';
  responseTimestamp?: Date;
}

interface MenuData {
  restaurantName: Record<string, string>;
  menuItems: MenuItem[];
  sections: Record<string, string[]>;
}

type Language = 'en' | 'zh' | 'es' | 'fr';

type LanguageOption = {
  code: Language;
  label: string;
  flag: string;
};

interface RestaurantMenuPageProps {
  menuData: MenuData;
  menuId: string;
  isDemo?: boolean;
}

const RestaurantMenuPage: React.FC<RestaurantMenuPageProps> = ({
  menuData,
  menuId,
  isDemo = false
}) => {
  // State Management (keeping your existing state)
  const [language, setLanguage] = useState<Language>('en');
  const [dietaryFilters, setDietaryFilters] = useState<string[]>([]);
  const [allergenExclusions, setAllergenExclusions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isOrderListExpanded, setIsOrderListExpanded] = useState(false);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [showDishExplanation, setShowDishExplanation] = useState<string | null>(null);
  const [customRequestInput, setCustomRequestInput] = useState<Record<string, string>>({});

  // Language configurations (keeping your existing structure)
  const languages: LanguageOption[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
  ];

  // Translations (keeping your existing translations)
  const translations = {
    en: {
      addToOrder: 'Add',
      moreInfo: 'More info',
      yourOrder: 'Your Order',
      continueShopping: 'Continue Browsing',
      confirmOrder: 'Confirm Order',
      showToWaiter: 'SHOW THIS TO WAITER',
      total: 'Total (Indicative)',
      addQuestion: 'Add a note or customisation',
      serverResponse: 'Server Response',
      yes: 'Yes',
      no: 'No',
      letMeCheck: 'Let me check',
      browseMenuAgain: 'Browse Menu Again',
      confirmedOrder: 'CONFIRMED ORDER',
      noSpecialRequests: 'No special requests',
      contains: 'Contains:',
      items: 'items',
      search: 'Search menu...'
    },
    zh: {
      addToOrder: '添加',
      moreInfo: '更多信息',
      yourOrder: '您的订单',
      continueShopping: '继续浏览',
      confirmOrder: '确认订单',
      showToWaiter: '向服务员展示此页面',
      total: '总计（仅供参考）',
      addQuestion: '添加问题/要求',
      serverResponse: '服务员回复',
      yes: '是',
      no: '否',
      letMeCheck: '让我确认',
      browseMenuAgain: '重新浏览菜单',
      confirmedOrder: '已确认订单',
      noSpecialRequests: '无特殊要求',
      contains: '包含:',
      items: '项',
      search: '搜索菜单...'
    },
    es: {
      addToOrder: 'Agregar',
      moreInfo: 'Más info',
      yourOrder: 'Su Pedido',
      continueShopping: 'Seguir Navegando',
      confirmOrder: 'Confirmar Pedido',
      showToWaiter: 'MOSTRAR ESTO AL MESERO',
      total: 'Total (Indicativo)',
      addQuestion: 'Agregar nota o personalización',
      serverResponse: 'Respuesta del mesero',
      yes: 'Sí',
      no: 'No',
      letMeCheck: 'Déjame verificar',
      browseMenuAgain: 'Ver Menú Otra Vez',
      confirmedOrder: 'PEDIDO CONFIRMADO',
      noSpecialRequests: 'Sin solicitudes especiales',
      contains: 'Contiene:',
      items: 'elementos',
      search: 'Buscar en el menú...'
    },
    fr: {
      addToOrder: 'Ajouter',
      moreInfo: 'Plus d\'info',
      yourOrder: 'Votre Commande',
      continueShopping: 'Continuer',
      confirmOrder: 'Confirmer',
      showToWaiter: 'MONTRER AU SERVEUR',
      total: 'Total (Indicatif)',
      addQuestion: 'Ajouter une note ou personnalisation',
      serverResponse: 'Réponse du serveur',
      yes: 'Oui',
      no: 'Non',
      letMeCheck: 'Laisse-moi vérifier',
      browseMenuAgain: 'Parcourir le Menu',
      confirmedOrder: 'COMMANDE CONFIRMÉE',
      noSpecialRequests: 'Aucune demande spéciale',
      contains: 'Contient:',
      items: 'articles',
      search: 'Rechercher...'
    }
  };

  const t = translations[language];

  // Get unique dietary tags and allergens for filters
  const allDietaryTags = [...new Set(menuData.menuItems.flatMap(item => item.dietaryTags))];
  const allAllergens = [...new Set(menuData.menuItems.flatMap(item => item.allergens))];

  // Translation mappings (keeping your existing mappings)
  const dietaryTagTranslations = {
    'Vegetarian': { en: 'Vegetarian', zh: '素食', es: 'Vegetariano', fr: 'Végétarien' },
    'Vegan': { en: 'Vegan', zh: '纯素', es: 'Vegano', fr: 'Végétalien' },
    'Gluten-Free': { en: 'Gluten-Free', zh: '无麸质', es: 'Sin Gluten', fr: 'Sans Gluten' },
    'Dairy-Free': { en: 'Dairy-Free', zh: '无乳制品', es: 'Sin Lácteos', fr: 'Sans Produits Laitiers' },
    'Spicy': { en: 'Spicy', zh: '辣', es: 'Picante', fr: 'Épicé' },
  };

  const allergenTranslations = {
    'Gluten': { en: 'Gluten', zh: '麸质', es: 'Gluten', fr: 'Gluten' },
    'Dairy': { en: 'Dairy', zh: '乳制品', es: 'Lácteos', fr: 'Produits Laitiers' },
    'Nuts': { en: 'Nuts', zh: '坚果', es: 'Nueces', fr: 'Noix' },
    'Shellfish': { en: 'Shellfish', zh: '贝类', es: 'Mariscos', fr: 'Fruits de Mer' },
  };

  const translateDietaryTag = (tag: string) => {
    return dietaryTagTranslations[tag as keyof typeof dietaryTagTranslations]?.[language] || tag;
  };

  const translateAllergen = (allergen: string) => {
    return allergenTranslations[allergen as keyof typeof allergenTranslations]?.[language] || allergen;
  };

  // Filter menu items based on search, dietary filters and allergen exclusions
  const filteredItems = menuData.menuItems.filter(item => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nameMatch = item.name[language]?.toLowerCase().includes(query);
      const descMatch = item.description[language]?.toLowerCase().includes(query);
      if (!nameMatch && !descMatch) return false;
    }

    // Dietary filters (inclusion)
    if (dietaryFilters.length > 0) {
      const hasMatchingTag = dietaryFilters.some(filter => 
        item.dietaryTags.includes(filter)
      );
      if (!hasMatchingTag) return false;
    }

    // Allergen exclusions
    if (allergenExclusions.length > 0) {
      const hasExcludedAllergen = allergenExclusions.some(allergen => 
        item.allergens.includes(allergen)
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
  }, {} as Record<string, MenuItem[]>);

  // Calculate order total
  const orderTotal = orderItems.reduce((total, orderItem) => {
    const menuItem = menuData.menuItems.find(item => item.id === orderItem.dishId);
    return total + (menuItem ? menuItem.price * orderItem.quantity : 0);
  }, 0);

  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  // Your existing functions (keeping all the logic)
  const addToOrder = (dishId: string) => {
    const existingItem = orderItems.find(item => item.dishId === dishId);
    if (existingItem) {
      setOrderItems(orderItems.map(item => 
        item.dishId === dishId 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setOrderItems([...orderItems, { dishId, quantity: 1 }]);
    }
  };

  const updateQuantity = (dishId: string, change: number) => {
    setOrderItems(orderItems.map(item => {
      if (item.dishId === dishId) {
        const newQuantity = Math.max(0, item.quantity + change);
        return newQuantity === 0 ? null : { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean) as OrderItem[]);
  };

  const removeFromOrder = (dishId: string) => {
    setOrderItems(orderItems.filter(item => item.dishId !== dishId));
    delete customRequestInput[dishId];
    setCustomRequestInput({ ...customRequestInput });
  };

  const addCustomRequest = (dishId: string, request: string) => {
    setOrderItems(orderItems.map(item => 
      item.dishId === dishId 
        ? { ...item, customRequest: request }
        : item
    ));
    setCustomRequestInput({ ...customRequestInput, [dishId]: '' });
  };

  const handleServerResponse = (dishId: string, response: 'yes' | 'no' | 'checking') => {
    setOrderItems(orderItems.map(item => 
      item.dishId === dishId 
        ? { ...item, serverResponse: response, responseTimestamp: new Date() }
        : item
    ));
  };

  const toggleSection = (section: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(section)) {
      newCollapsed.delete(section);
    } else {
      newCollapsed.add(section);
    }
    setCollapsedSections(newCollapsed);
  };

  const confirmOrder = () => {
    setIsOrderConfirmed(true);
    setIsOrderListExpanded(false);
  };

  // Confirmed Order Screen (keeping your existing design but with new styles)
  if (isOrderConfirmed) {
    return (
      <div className="min-h-screen bg-warm p-4 max-w-4xl mx-auto">
        <div className="max-w-lg mx-auto bg-wtm-surface rounded-2xl shadow-lg">
          <div className="bg-red-600 text-white p-6 rounded-t-2xl text-center">
            <h1 className="text-2xl font-bold font-heading">{t.confirmedOrder}</h1>
          </div>
          
          <div className="bg-red-100 border-2 border-red-600 p-4 m-4 rounded-2xl text-center">
            <div className="text-red-800 font-bold text-lg">
              {t.showToWaiter}
            </div>
          </div>

          <div className="p-4 space-y-4">
            {orderItems.map(orderItem => {
              const menuItem = menuData.menuItems.find(item => item.id === orderItem.dishId);
              if (!menuItem) return null;

              return (
                <div key={orderItem.dishId} className="border-b border-gray-200 pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-wtm-text">
                        {menuItem.name[language]} ({orderItem.quantity}x)
                      </h3>
                    </div>
                    <div className="text-lg font-bold text-wtm-primary">
                      ${(menuItem.price * orderItem.quantity).toFixed(2)}
                    </div>
                  </div>

                  {/* Dietary Tags with new chip system */}
                  {menuItem.dietaryTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {menuItem.dietaryTags.map(tag => (
                        <span key={tag} className="chip chip--veg">
                          {translateDietaryTag(tag)}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Allergen Warnings */}
                  {menuItem.allergens.length > 0 && (
                    <div className="mb-2">
                      <span className="text-red-600 font-medium text-sm">
                        ⚠️ {t.contains} {menuItem.allergens.map(allergen => translateAllergen(allergen)).join(', ')}
                      </span>
                    </div>
                  )}

                  {/* Custom Request */}
                  {orderItem.customRequest ? (
                    <div className="bg-blue-50 p-3 rounded-xl">
                      <div className="text-blue-800">
                        "{orderItem.customRequest}"
                      </div>
                      {orderItem.serverResponse && (
                        <div className={`mt-2 font-medium ${
                          orderItem.serverResponse === 'yes' ? 'text-green-600' :
                          orderItem.serverResponse === 'no' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {orderItem.serverResponse === 'yes' ? '✅' :
                           orderItem.serverResponse === 'no' ? '❌' : '⏳'} 
                          {t.serverResponse} {
                            orderItem.serverResponse === 'yes' ? t.yes :
                            orderItem.serverResponse === 'no' ? t.no :
                            t.letMeCheck
                          }
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-wtm-muted text-sm">{t.noSpecialRequests}</div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="bg-wtm-bg p-4 rounded-b-2xl">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>{t.total}:</span>
              <span className="text-wtm-primary">${orderTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="p-4">
            <button
              onClick={() => {
                setIsOrderConfirmed(false);
                setOrderItems([]);
              }}
              className="btn btn-primary w-full"
            >
              {t.browseMenuAgain}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm pb-20">
      {/* Sticky Tools Bar - Updated with new design system */}
      <div className="sticky top-0 z-menu-header bg-wtm-surface shadow-sm border-b">
        {/* Restaurant Name */}
        <div className="text-center py-3 px-4 border-b">
          <h1 className="text-xl font-semibold text-wtm-text font-heading">
            {menuData.restaurantName[language]}
          </h1>
        </div>

        <div className="p-4 space-y-3">
          {/* Language Dropdown */}
          <div className="flex justify-center gap-1">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`language-chip ${
                  language === lang.code 
                    ? 'language-chip--active' 
                    : 'language-chip--inactive'
                }`}
              >
                {lang.flag} {lang.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-wtm-muted" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search}
              className="input-field pl-10"
            />
          </div>

          {/* Allergen Chips (toggle) */}
          {allAllergens.length > 0 && (
            <div>
              <p className="text-xs font-medium text-wtm-muted mb-2">Hide dishes with:</p>
              <div className="flex flex-wrap gap-1">
                {allAllergens.map(allergen => (
                  <button
                    key={allergen}
                    onClick={() => {
                      setAllergenExclusions(prev => 
                        prev.includes(allergen)
                          ? prev.filter(f => f !== allergen)
                          : [...prev, allergen]
                      );
                    }}
                    className={`chip ${
                      allergenExclusions.includes(allergen)
                        ? 'chip--gluten' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } transition-colors`}
                    aria-pressed={allergenExclusions.includes(allergen)}
                  >
                    {translateAllergen(allergen)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dietary Chips (toggle) */}
          {allDietaryTags.length > 0 && (
            <div>
              <p className="text-xs font-medium text-wtm-muted mb-2">Show only:</p>
              <div className="flex flex-wrap gap-1">
                {allDietaryTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      setDietaryFilters(prev => 
                        prev.includes(tag) 
                          ? prev.filter(f => f !== tag)
                          : [...prev, tag]
                      );
                    }}
                    className={`chip ${
                      dietaryFilters.includes(tag)
                        ? 'chip--veg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } transition-colors`}
                    aria-pressed={dietaryFilters.includes(tag)}
                  >
                    {translateDietaryTag(tag)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Review Order Button */}
          {totalItems > 0 && (
            <button
              onClick={() => setIsOrderListExpanded(true)}
              className="btn btn-primary w-full"
            >
              Review Order ({totalItems} {t.items})
            </button>
          )}
        </div>
      </div>

      {/* Dish Cards - Updated with new design system */}
      <div className="px-4 space-y-4 mt-4">
        {Object.entries(itemsBySection).map(([section, items]) => (
          <div key={section} className="card overflow-hidden">
            <button
              onClick={() => toggleSection(section)}
              className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
            >
              <h2 className="text-xl font-semibold text-wtm-text font-heading">{section}</h2>
              {collapsedSections.has(section) ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </button>

            {!collapsedSections.has(section) && (
              <div className="divide-y divide-gray-100">
                {items.map(item => (
                  <div key={item.id} className="menu-dish-card">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-wtm-text mb-1">
                          {item.name[language]}
                        </h3>
                        <p className="text-wtm-muted text-sm leading-relaxed line-clamp-2">
                          {item.description[language]}
                        </p>
                      </div>
                      <div className="text-lg font-bold text-wtm-primary ml-4 shrink-0">
                        ${item.price.toFixed(2)}
                      </div>
                    </div>

                    {/* Allergen/dietary chips directly under name */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.dietaryTags.map(tag => (
                        <span key={tag} className="chip chip--veg">
                          {translateDietaryTag(tag)}
                        </span>
                      ))}
                      {item.allergens.map(allergen => (
                        <span key={allergen} className="chip chip--gluten">
                          {translateAllergen(allergen)}
                        </span>
                      ))}
                    </div>

                    {/* Actions: More info, Add */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowDishExplanation(item.id)}
                        className="btn btn-ghost px-3 py-2 text-sm"
                      >
                        {t.moreInfo}
                      </button>
                      <button
                        onClick={() => addToOrder(item.id)}
                        className="btn btn-primary px-4 py-2 text-sm gap-1"
                      >
                        <Plus size={16} />
                        {t.addToOrder}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Order Drawer - Updated with new design system */}
      {isOrderListExpanded && (
        <div className="fixed inset-0 bg-black/50 z-menu-modal flex items-end">
          <div className="bg-wtm-surface w-full h-menu-modal rounded-t-2xl overflow-hidden flex flex-col animate-order-expand">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold font-heading">{t.yourOrder}</h2>
              <button
                onClick={() => setIsOrderListExpanded(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors focus-ring"
                aria-label="Close order"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {orderItems.map(orderItem => {
                const menuItem = menuData.menuItems.find(item => item.id === orderItem.dishId);
                if (!menuItem) return null;

                return (
                  <div key={orderItem.dishId} className="card p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-wtm-text">
                          {menuItem.name[language]}
                        </h3>
                        <p className="text-wtm-muted text-sm">
                          ${menuItem.price.toFixed(2)} each
                        </p>
                      </div>
                      <div className="text-lg font-bold text-wtm-primary">
                        ${(menuItem.price * orderItem.quantity).toFixed(2)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <button
                        onClick={() => updateQuantity(orderItem.dishId, -1)}
                        className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors focus-ring"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-semibold text-lg w-8 text-center">
                        {orderItem.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(orderItem.dishId, 1)}
                        className="w-8 h-8 bg-wtm-primary text-white rounded-full flex items-center justify-center hover:bg-wtm-primary-600 transition-colors focus-ring"
                        aria-label="Increase quantity"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={() => removeFromOrder(orderItem.dishId)}
                        className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors ml-2 focus-ring"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Custom Request with preset phrases */}
                    {orderItem.customRequest ? (
                      <div className="bg-blue-50 p-3 rounded-xl">
                        <p className="text-blue-800 mb-2">
                          "{orderItem.customRequest}"
                        </p>
                        
                        {!orderItem.serverResponse ? (
                          <div className="flex gap-2 flex-wrap">
                            <span className="text-sm text-blue-700 mr-2">{t.serverResponse}</span>
                            <button
                              onClick={() => handleServerResponse(orderItem.dishId, 'yes')}
                              className="btn btn-ghost px-3 py-1 text-sm text-green-600 hover:bg-green-50"
                            >
                              {t.yes}
                            </button>
                            <button
                              onClick={() => handleServerResponse(orderItem.dishId, 'no')}
                              className="btn btn-ghost px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                            >
                              {t.no}
                            </button>
                            <button
                              onClick={() => handleServerResponse(orderItem.dishId, 'checking')}
                              className="btn btn-ghost px-3 py-1 text-sm text-yellow-600 hover:bg-yellow-50"
                            >
                              {t.letMeCheck}
                            </button>
                          </div>
                        ) : (
                          <div className={`font-medium ${
                            orderItem.serverResponse === 'yes' ? 'text-green-600' :
                            orderItem.serverResponse === 'no' ? 'text-red-600' :
                            'text-yellow-600'
                          }`}>
                            {orderItem.serverResponse === 'yes' ? '✅' :
                             orderItem.serverResponse === 'no' ? '❌' : '⏳'} 
                            {t.serverResponse} {
                              orderItem.serverResponse === 'yes' ? t.yes :
                              orderItem.serverResponse === 'no' ? t.no :
                              t.letMeCheck
                            }
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder={t.addQuestion}
                          value={customRequestInput[orderItem.dishId] || ''}
                          onChange={(e) => setCustomRequestInput({
                            ...customRequestInput,
                            [orderItem.dishId]: e.target.value
                          })}
                          maxLength={300}
                          className="input-field flex-1 text-sm"
                        />
                        <button
                          onClick={() => addCustomRequest(orderItem.dishId, customRequestInput[orderItem.dishId] || '')}
                          disabled={!customRequestInput[orderItem.dishId]?.trim()}
                          className="btn btn-ghost px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <MessageCircle size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Sticky Footer with Total */}
            <div className="sticky-order-bar border-t bg-wtm-surface p-4 space-y-3">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>{t.total}:</span>
                <span className="text-wtm-primary">${orderTotal.toFixed(2)}</span>
              </div>
              <p className="text-xs text-wtm-muted text-center">Prices may exclude taxes/fees</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsOrderListExpanded(false)}
                  className="btn btn-ghost flex-1"
                >
                  {t.continueShopping}
                </button>
                <button
                  onClick={confirmOrder}
                  disabled={orderItems.length === 0}
                  className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t.confirmOrder}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dish Explanation Modal - Updated with new design system */}
      {showDishExplanation && (
        <div className="fixed inset-0 bg-black/50 z-menu-modal flex items-center justify-center p-4">
          <div className="card max-w-md w-full p-6">
            {(() => {
              const dish = menuData.menuItems.find(item => item.id === showDishExplanation);
              if (!dish) return null;
              
              return (
                <>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-wtm-text font-heading">
                      {dish.name[language]}
                    </h3>
                    <button
                      onClick={() => setShowDishExplanation(null)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors focus-ring"
                      aria-label="Close"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <p className="text-wtm-muted mb-4 leading-relaxed">
                    {dish.explanation[language]}
                  </p>
                  
                  {/* Dietary Tags */}
                  {dish.dietaryTags.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-wtm-text mb-2">Dietary:</p>
                      <div className="flex flex-wrap gap-1">
                        {dish.dietaryTags.map(tag => (
                          <span key={tag} className="chip chip--veg">
                            {translateDietaryTag(tag)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Allergens */}
                  {dish.allergens.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-wtm-text mb-2">{t.contains}</p>
                      <div className="flex flex-wrap gap-1">
                        {dish.allergens.map(allergen => (
                          <span key={allergen} className="chip chip--gluten">
                            {translateAllergen(allergen)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDishExplanation(null)}
                      className="btn btn-ghost flex-1"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        addToOrder(dish.id);
                        setShowDishExplanation(null);
                      }}
                      className="btn btn-primary flex-1 gap-1"
                    >
                      <Plus size={16} />
                      {t.addToOrder}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantMenuPage;
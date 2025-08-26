import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plus, Minus, Trash2, MessageCircle, X } from 'lucide-react';

// Types and Interfaces
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
  sections: Record<string, string[]>; // section names in different languages
}

type Language = 'en' | 'zh' | 'es' | 'fr';

type LanguageOption = {
  code: Language;
  label: string;
  flag: string; // emoji or short code
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
  // State Management
  const [language, setLanguage] = useState<Language>('en');
  const [dietaryFilters, setDietaryFilters] = useState<string[]>([]);
  const [allergenExclusions, setAllergenExclusions] = useState<string[]>([]);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isOrderListExpanded, setIsOrderListExpanded] = useState(false);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [showDishExplanation, setShowDishExplanation] = useState<string | null>(null);
  const [customRequestInput, setCustomRequestInput] = useState<Record<string, string>>({});
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);

  // Language configurations
	const languages: LanguageOption[] = [
	  { code: 'en', label: 'English',  flag: '🇬🇧' },
	  { code: 'zh', label: '中文',       flag: '🇨🇳' },
	  { code: 'es', label: 'Español',   flag: '🇪🇸' },
	  { code: 'fr', label: 'Français',  flag: '🇫🇷' },
	];

  // Translations
  const translations = {
    en: {
      instructions: [
        'Add dishes to your order, ask questions, and show to server when ready.'
      ],
      instructionsHeading: 'Instructions',
      filtersHeading: 'Filters',
      filterBy: 'Show only:',
      hideAllergens: 'Hide dishes with:',
      addToOrder: 'Add',
      moreInfo: 'More info',
      yourOrder: 'Your Order List',
      continueShopping: 'Continue Browsing',
      confirmOrder: 'Confirm Order',
      showToWaiter: 'SHOW THIS TO WAITER',
      total: 'Total (Indicative):',
      addQuestion: 'Add question/request',
      serverResponse: 'Server Response:',
      yes: 'Yes',
      no: 'No',
      letMeCheck: 'Let me check',
      browseMenuAgain: 'Browse Menu Again',
      confirmedOrder: 'CONFIRMED ORDER',
      noSpecialRequests: 'No special requests',
      contains: 'Contains:',
      items: 'items'
    },
    zh: {
      instructions: [
        '添加菜品到订单，提出问题，准备好时向服务员展示。'
      ],
      instructionsHeading: '说明',
      filtersHeading: '筛选',
      filterBy: '仅显示:',
      hideAllergens: '隐藏含有以下成分的菜品:',
      addToOrder: '添加',
      moreInfo: '更多信息',
      yourOrder: '您的订单列表',
      continueShopping: '继续浏览',
      confirmOrder: '确认订单',
      showToWaiter: '向服务员展示此页面',
      total: '总计（仅供参考）:',
      addQuestion: '添加问题/要求',
      serverResponse: '服务员回复:',
      yes: '是',
      no: '否',
      letMeCheck: '让我确认',
      browseMenuAgain: '重新浏览菜单',
      confirmedOrder: '已确认订单',
      noSpecialRequests: '无特殊要求',
      contains: '包含:',
      items: '项'
    },
    es: {
      instructions: [
        'Agregue platos a su pedido, haga preguntas y muestre al servidor cuando esté listo.'
      ],
      instructionsHeading: 'Instrucciones',
      filtersHeading: 'Filtros',
      filterBy: 'Mostrar solo:',
      hideAllergens: 'Ocultar platos con:',
      addToOrder: 'Agregar',
      moreInfo: 'Más info',
      yourOrder: 'Su Lista de Pedidos',
      continueShopping: 'Seguir Navegando',
      confirmOrder: 'Confirmar Pedido',
      showToWaiter: 'MOSTRAR ESTO AL MESERO',
      total: 'Total (Indicativo):',
      addQuestion: 'Agregar pregunta/solicitud',
      serverResponse: 'Respuesta del servidor:',
      yes: 'Sí',
      no: 'No',
      letMeCheck: 'Déjame verificar',
      browseMenuAgain: 'Ver Menú Otra Vez',
      confirmedOrder: 'PEDIDO CONFIRMADO',
      noSpecialRequests: 'Sin solicitudes especiales',
      contains: 'Contiene:',
      items: 'elementos'
    },
    fr: {
      instructions: [
        'Ajoutez des plats à votre commande, posez des questions et montrez au serveur quand vous êtes prêt.'
      ],
      instructionsHeading: 'Instructions',
      filtersHeading: 'Filtres',
      filterBy: 'Afficher seulement:',
      hideAllergens: 'Masquer les plats avec:',
      addToOrder: 'Ajouter',
      moreInfo: 'Plus d\'info',
      yourOrder: 'Votre Liste de Commandes',
      continueShopping: 'Continuer la Navigation',
      confirmOrder: 'Confirmer Commande',
      showToWaiter: 'MONTRER CECI AU SERVEUR',
      total: 'Total (Indicatif):',
      addQuestion: 'Ajouter question/demande',
      serverResponse: 'Réponse du serveur:',
      yes: 'Oui',
      no: 'Non',
      letMeCheck: 'Laisse-moi vérifier',
      browseMenuAgain: 'Parcourir le Menu Encore',
      confirmedOrder: 'COMMANDE CONFIRMÉE',
      noSpecialRequests: 'Aucune demande spéciale',
      contains: 'Contient:',
      items: 'articles'
    }
  };

  const t = translations[language];

  // Analytics tracking function
  const trackEvent = async (eventType: string, dishId?: string, metadata?: Record<string, any>) => {
    if (isDemo) return; // Skip analytics for demo menus
    
    try {
      // This would call your analytics API
      console.log('Analytics Event:', { eventType, sessionId, menuId, dishId, language, metadata });
      // await fetch('/api/track-menu-event', { ... });
    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }
  };

  // Effect for initial page load tracking and scroll to top
  useEffect(() => {
    trackEvent('view');
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Scroll handler for header collapse
	useEffect(() => {
	  const handleScroll = () => {
		const currentScrollY = window.scrollY;
		requestAnimationFrame(() => {
		  setIsHeaderCollapsed(currentScrollY > 100);
		});
	  };
	  window.addEventListener('scroll', handleScroll, { passive: true });
	  return () => window.removeEventListener('scroll', handleScroll);
	}, []);

  // Get unique dietary tags and allergens for filters
  const allDietaryTags = [...new Set(menuData.menuItems.flatMap(item => item.dietaryTags))];
  const allAllergens = [...new Set(menuData.menuItems.flatMap(item => item.allergens))];

  // Translation mappings for dietary tags and allergens
  const dietaryTagTranslations = {
    'Vegetarian': { en: 'Vegetarian', zh: '素食', es: 'Vegetariano', fr: 'Végétarien' },
    'Vegan': { en: 'Vegan', zh: '纯素', es: 'Vegano', fr: 'Végétalien' },
    'Gluten-Free': { en: 'Gluten-Free', zh: '无麸质', es: 'Sin Gluten', fr: 'Sans Gluten' },
    'Dairy-Free': { en: 'Dairy-Free', zh: '无乳制品', es: 'Sin Lácteos', fr: 'Sans Produits Laitiers' },
    'High-Protein': { en: 'High-Protein', zh: '高蛋白', es: 'Alto en Proteína', fr: 'Riche en Protéines' },
    'Organic': { en: 'Organic', zh: '有机', es: 'Orgánico', fr: 'Biologique' },
    'Spicy': { en: 'Spicy', zh: '辣', es: 'Picante', fr: 'Épicé' },
    'Medium Spicy': { en: 'Medium Spicy', zh: '中辣', es: 'Medianamente Picante', fr: 'Moyennement Épicé' },
    'Very Spicy': { en: 'Very Spicy', zh: '很辣', es: 'Muy Picante', fr: 'Très Épicé' },
    'Seasonal': { en: 'Seasonal', zh: '时令', es: 'De Temporada', fr: 'De Saison' },
    'Grass-Fed': { en: 'Grass-Fed', zh: '草饲', es: 'Alimentado con Pasto', fr: 'Nourri à l\'Herbe' }
  };

  const allergenTranslations = {
    'Gluten': { en: 'Gluten', zh: '麸质', es: 'Gluten', fr: 'Gluten' },
    'Dairy': { en: 'Dairy', zh: '乳制品', es: 'Lácteos', fr: 'Produits Laitiers' },
    'Nuts': { en: 'Nuts', zh: '坚果', es: 'Nueces', fr: 'Noix' },
    'Eggs': { en: 'Eggs', zh: '鸡蛋', es: 'Huevos', fr: 'Œufs' },
    'Soy': { en: 'Soy', zh: '大豆', es: 'Soja', fr: 'Soja' },
    'Fish': { en: 'Fish', zh: '鱼', es: 'Pescado', fr: 'Poisson' },
    'Shellfish': { en: 'Shellfish', zh: '贝类', es: 'Mariscos', fr: 'Fruits de Mer' },
    'Sesame': { en: 'Sesame', zh: '芝麻', es: 'Sésamo', fr: 'Sésame' },
    'Sulfites': { en: 'Sulfites', zh: '亚硫酸盐', es: 'Sulfitos', fr: 'Sulfites' },
    'Pork': { en: 'Pork', zh: '猪肉', es: 'Cerdo', fr: 'Porc' },
    'Garlic': { en: 'Garlic', zh: '大蒜', es: 'Ajo', fr: 'Ail' },
    'Alcohol': { en: 'Alcohol', zh: '酒精', es: 'Alcohol', fr: 'Alcool' },
    'Mustard': { en: 'Mustard', zh: '芥末', es: 'Mostaza', fr: 'Moutarde' }
  };

  // Helper function to translate dietary tags and allergens
  const translateDietaryTag = (tag: string) => {
    return dietaryTagTranslations[tag as keyof typeof dietaryTagTranslations]?.[language] || tag;
  };

  const translateAllergen = (allergen: string) => {
    return allergenTranslations[allergen as keyof typeof allergenTranslations]?.[language] || allergen;
  };

  // Filter menu items based on dietary filters and allergen exclusions
  const filteredItems = menuData.menuItems.filter(item => {
    // Apply dietary filters (inclusion)
    if (dietaryFilters.length > 0) {
      const hasMatchingTag = dietaryFilters.some(filter => 
        item.dietaryTags.includes(filter)
      );
      if (!hasMatchingTag) return false;
    }

    // Apply allergen exclusions
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

  // Add item to order
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
    trackEvent('item_added', dishId);
  };

  // Update item quantity
  const updateQuantity = (dishId: string, change: number) => {
    setOrderItems(orderItems.map(item => {
      if (item.dishId === dishId) {
        const newQuantity = Math.max(0, item.quantity + change);
        return newQuantity === 0 ? null : { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean) as OrderItem[]);
  };

  // Remove item from order
  const removeFromOrder = (dishId: string) => {
    setOrderItems(orderItems.filter(item => item.dishId !== dishId));
    delete customRequestInput[dishId];
    setCustomRequestInput({ ...customRequestInput });
  };

  // Add custom request to dish
  const addCustomRequest = (dishId: string, request: string) => {
    setOrderItems(orderItems.map(item => 
      item.dishId === dishId 
        ? { ...item, customRequest: request }
        : item
    ));
    setCustomRequestInput({ ...customRequestInput, [dishId]: '' });
  };

  // Handle server response
  const handleServerResponse = (dishId: string, response: 'yes' | 'no' | 'checking') => {
    setOrderItems(orderItems.map(item => 
      item.dishId === dishId 
        ? { ...item, serverResponse: response, responseTimestamp: new Date() }
        : item
    ));
    trackEvent('server_response', dishId, { response });
  };

  // Toggle section collapse
  const toggleSection = (section: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(section)) {
      newCollapsed.delete(section);
    } else {
      newCollapsed.add(section);
    }
    setCollapsedSections(newCollapsed);
  };

  // Confirm order
  const confirmOrder = () => {
    setIsOrderConfirmed(true);
    setIsOrderListExpanded(false);
    trackEvent('order_confirmed', undefined, { 
      totalItems, 
      totalAmount: orderTotal,
      itemsWithQuestions: orderItems.filter(item => item.customRequest).length
    });
  };

  if (isOrderConfirmed) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8 max-w-4xl mx-auto">
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="bg-red-600 text-white p-6 rounded-t-lg text-center">
            <h1 className="text-2xl font-bold">{t.confirmedOrder}</h1>
          </div>
          
          {/* Show to Waiter Banner */}
          <div className="bg-red-100 border-2 border-red-600 p-4 m-4 rounded-lg text-center">
            <div className="text-red-800 font-bold text-lg">
              🔴 {t.showToWaiter} 🔴
            </div>
          </div>

          {/* Order Items */}
          <div className="p-4 space-y-4">
            {orderItems.map(orderItem => {
              const menuItem = menuData.menuItems.find(item => item.id === orderItem.dishId);
              if (!menuItem) return null;

              return (
                <div key={orderItem.dishId} className="border-b pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">
                        {menuItem.name[language]} ({orderItem.quantity}x)
                      </h3>
                    </div>
                    <div className="text-lg font-bold text-coral-600">
                      ${(menuItem.price * orderItem.quantity).toFixed(2)}
                    </div>
                  </div>

                  {/* Dietary Tags */}
                  {menuItem.dietaryTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {menuItem.dietaryTags.map(tag => (
                        <span key={tag} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          🌱 {translateDietaryTag(tag)}
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
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-blue-800">
                        💬 "{orderItem.customRequest}"
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
                    <div className="text-gray-500 text-sm">{t.noSpecialRequests}</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div className="bg-gray-50 p-4 rounded-b-lg">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>{t.total}</span>
              <span className="text-coral-600">${orderTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Browse Again Button */}
          <div className="p-4">
            <button
              onClick={() => {
                setIsOrderConfirmed(false);
                setOrderItems([]);
              }}
              className="w-full bg-coral-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-coral-700 transition-colors"
            >
              🔄 {t.browseMenuAgain}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className={`bg-white shadow-sm sticky top-0 z-40 transition-all duration-300 ${
        isHeaderCollapsed ? 'py-2' : 'py-0'
      }`}>
        {/* Language Selector */}
        <div className={`flex justify-center gap-1 p-2 bg-coral-50 border-b transition-all duration-300 ${
          isHeaderCollapsed ? 'py-1' : ''
        }`}>
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                language === lang.code
                  ? 'bg-coral-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-coral-100'
              }`}
            >
              {lang.flag} {isHeaderCollapsed ? lang.code.toUpperCase() : (lang.code === 'en' ? lang.label : lang.label)}
            </button>
          ))}
        </div>

        {/* Restaurant Name - Hide when collapsed */}
        {!isHeaderCollapsed && (
          <div className="text-center py-3 px-4 transition-all duration-300">
            <h1 className="text-2xl font-bold text-gray-900">
              {menuData.restaurantName[language]}
            </h1>
          </div>
        )}

        {/* Instructions - Simplified with heading */}
        <div className={`bg-blue-50 border-l-4 border-blue-400 mx-4 transition-all duration-200 overflow-hidden ${
          isHeaderCollapsed ? 'py-2 px-3' : 'p-4 mb-4'
        }`}>
          {!isHeaderCollapsed && (
            <h3 className="text-blue-900 font-semibold text-sm mb-2">{t.instructionsHeading}</h3>
          )}
          <p className={`text-blue-800 ${isHeaderCollapsed ? 'text-xs' : 'text-sm'}`}>
            {t.instructions[0]}
          </p>
        </div>

        {/* Filters - With heading */}
        <div className={`px-4 transition-all duration-200 ${
          isHeaderCollapsed ? 'py-1 space-y-2' : 'pb-4 space-y-3'
        }`}>
          {!isHeaderCollapsed && (
            <h3 className="text-gray-900 font-semibold text-sm mb-3">{t.filtersHeading}</h3>
          )}
          
          {/* Dietary Filters */}
          {allDietaryTags.length > 0 && (
            <div>
              {!isHeaderCollapsed && (
                <p className="text-xs font-medium text-gray-600 mb-2">{t.filterBy}</p>
              )}
              <div className="flex flex-wrap gap-1">
                {allDietaryTags.slice(0, isHeaderCollapsed ? 3 : undefined).map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      setDietaryFilters(prev => 
                        prev.includes(tag) 
                          ? prev.filter(f => f !== tag)
                          : [...prev, tag]
                      );
                    }}
                    className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                      dietaryFilters.includes(tag)
                        ? 'bg-green-600 text-white'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    🌱 {translateDietaryTag(tag)}
                  </button>
                ))}
                {isHeaderCollapsed && allDietaryTags.length > 3 && (
                  <span className="text-xs text-gray-500 py-1">+{allDietaryTags.length - 3}</span>
                )}
              </div>
            </div>
          )}

          {/* Allergen Exclusions */}
          {allAllergens.length > 0 && (
            <div>
              {!isHeaderCollapsed && (
                <p className="text-xs font-medium text-gray-600 mb-2">{t.hideAllergens}</p>
              )}
              <div className="flex flex-wrap gap-1">
                {allAllergens.slice(0, isHeaderCollapsed ? 3 : undefined).map(allergen => (
                  <button
                    key={allergen}
                    onClick={() => {
                      setAllergenExclusions(prev => 
                        prev.includes(allergen)
                          ? prev.filter(f => f !== allergen)
                          : [...prev, allergen]
                      );
                    }}
                    className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                      allergenExclusions.includes(allergen)
                        ? 'bg-red-600 text-white'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    🚫 {translateAllergen(allergen)}
                  </button>
                ))}
                {isHeaderCollapsed && allAllergens.length > 3 && (
                  <span className="text-xs text-gray-500 py-1">+{allAllergens.length - 3}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Menu Sections */}
      <div className="px-4 sm:px-6 lg:px-32 xl:px-48 space-y-6">
        {Object.entries(itemsBySection).map(([section, items]) => (
          <div key={section} className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section)}
              className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <h2 className="text-xl font-bold text-gray-900">{section}</h2>
              {collapsedSections.has(section) ? <ChevronDown /> : <ChevronUp />}
            </button>

            {/* Section Items */}
            {!collapsedSections.has(section) && (
              <div className="divide-y divide-gray-100">
                {items.map(item => (
                  <div key={item.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {item.name[language]}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {item.description[language]}
                        </p>
                      </div>
                      <div className="text-lg font-bold text-coral-600 ml-4">
                        ${item.price.toFixed(2)}
                      </div>
                    </div>

                    {/* Dietary Tags */}
                    {item.dietaryTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {item.dietaryTags.map(tag => (
                          <span key={tag} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            🌱 {translateDietaryTag(tag)}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Allergen Warnings */}
                    {item.allergens.length > 0 && (
                      <div className="mb-3">
                        <span className="text-red-600 font-medium text-sm">
                          ⚠️ {t.contains} {item.allergens.map(allergen => translateAllergen(allergen)).join(', ')}
                        </span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowDishExplanation(item.id)}
                        className="text-blue-600 text-sm hover:text-blue-700 transition-colors"
                      >
                        ℹ️ {t.moreInfo}
                      </button>
                      <button
                        onClick={() => addToOrder(item.id)}
                        className="bg-coral-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-coral-700 transition-colors flex items-center gap-1"
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

      {/* Sticky Order Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
          <button
            onClick={() => setIsOrderListExpanded(true)}
            className="w-full p-4 bg-coral-600 text-white font-semibold hover:bg-coral-700 transition-colors flex justify-between items-center"
          >
            <span>🛒 {totalItems} {t.items}</span>
            <span>${orderTotal.toFixed(2)} ▲</span>
          </button>
        </div>
      )}

      {/* Order List Modal */}
      {isOrderListExpanded && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full h-4/5 rounded-t-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">{t.yourOrder}</h2>
              <button
                onClick={() => setIsOrderListExpanded(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Order Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {orderItems.map(orderItem => {
                const menuItem = menuData.menuItems.find(item => item.id === orderItem.dishId);
                if (!menuItem) return null;

                return (
                  <div key={orderItem.dishId} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {menuItem.name[language]}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          ${menuItem.price.toFixed(2)} each
                        </p>
                      </div>
                      <div className="text-lg font-bold text-coral-600">
                        ${(menuItem.price * orderItem.quantity).toFixed(2)}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 mb-3">
                      <button
                        onClick={() => updateQuantity(orderItem.dishId, -1)}
                        className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-semibold text-lg w-8 text-center">
                        {orderItem.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(orderItem.dishId, 1)}
                        className="w-8 h-8 bg-coral-600 text-white rounded-full flex items-center justify-center hover:bg-coral-700 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={() => removeFromOrder(orderItem.dishId)}
                        className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors ml-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Custom Request */}
                    {orderItem.customRequest ? (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-blue-800 mb-2">
                          💬 "{orderItem.customRequest}"
                        </p>
                        
                        {/* Server Response Buttons */}
                        {!orderItem.serverResponse ? (
                          <div className="flex gap-2">
                            <span className="text-sm text-blue-700 mr-2">{t.serverResponse}</span>
                            <button
                              onClick={() => handleServerResponse(orderItem.dishId, 'yes')}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                            >
                              {t.yes}
                            </button>
                            <button
                              onClick={() => handleServerResponse(orderItem.dishId, 'no')}
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                            >
                              {t.no}
                            </button>
                            <button
                              onClick={() => handleServerResponse(orderItem.dishId, 'checking')}
                              className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors"
                            >
                              {t.letMeCheck}
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <span className="text-sm text-blue-700 mr-2">{t.serverResponse}</span>
                            <button
                              onClick={() => handleServerResponse(orderItem.dishId, 'yes')}
                              disabled={orderItem.serverResponse === 'yes' || orderItem.serverResponse === 'no'}
                              className={`px-3 py-1 rounded text-sm transition-colors ${
                                orderItem.serverResponse === 'yes' 
                                  ? 'bg-green-600 text-white' 
                                  : orderItem.serverResponse === 'no' || orderItem.serverResponse === 'checking'
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                            >
                              {t.yes}
                            </button>
                            <button
                              onClick={() => handleServerResponse(orderItem.dishId, 'no')}
                              disabled={orderItem.serverResponse === 'no' || orderItem.serverResponse === 'yes'}
                              className={`px-3 py-1 rounded text-sm transition-colors ${
                                orderItem.serverResponse === 'no' 
                                  ? 'bg-red-600 text-white' 
                                  : orderItem.serverResponse === 'yes' || orderItem.serverResponse === 'checking'
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-red-600 text-white hover:bg-red-700'
                              }`}
                            >
                              {t.no}
                            </button>
                            {orderItem.serverResponse === 'checking' && (
                              <button
                                className="bg-gray-400 text-white px-3 py-1 rounded text-sm cursor-not-allowed"
                                disabled
                              >
                                {t.letMeCheck}
                              </button>
                            )}
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
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 text-sm"
                        />
                        <button
                          onClick={() => addCustomRequest(orderItem.dishId, customRequestInput[orderItem.dishId] || '')}
                          disabled={!customRequestInput[orderItem.dishId]?.trim()}
                          className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          <MessageCircle size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="border-t bg-white p-4 space-y-3">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>{t.total}</span>
                <span className="text-coral-600">${orderTotal.toFixed(2)}</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsOrderListExpanded(false)}
                  className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  🔄 {t.continueShopping}
                </button>
                <button
                  onClick={confirmOrder}
                  disabled={orderItems.length === 0}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                    orderItems.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-coral-600 text-white hover:bg-coral-700'
                  }`}
                >
                  ✅ {t.confirmOrder}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dish Explanation Modal */}
      {showDishExplanation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            {(() => {
              const dish = menuData.menuItems.find(item => item.id === showDishExplanation);
              if (!dish) return null;
              
              return (
                <>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold">{dish.name[language]}</h3>
                    <button
                      onClick={() => setShowDishExplanation(null)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <p className="text-gray-700 mb-4">{dish.explanation[language]}</p>
                  
                  {/* Dietary Tags */}
                  {dish.dietaryTags.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Dietary:</p>
                      <div className="flex flex-wrap gap-1">
                        {dish.dietaryTags.map(tag => (
                          <span key={tag} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            🌱 {translateDietaryTag(tag)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Allergens */}
                  {dish.allergens.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">⚠️ {t.contains}</p>
                      <div className="flex flex-wrap gap-1">
                        {dish.allergens.map(allergen => (
                          <span key={allergen} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                            {translateAllergen(allergen)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDishExplanation(null)}
                      className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        addToOrder(dish.id);
                        setShowDishExplanation(null);
                      }}
                      className="flex-1 bg-coral-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-coral-700 transition-colors flex items-center justify-center gap-1"
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
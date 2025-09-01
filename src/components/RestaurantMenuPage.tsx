import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plus, Minus, Trash2, MessageCircle, X, Globe, Filter, Info } from 'lucide-react';
import ReactCountryFlag from "react-country-flag";

// Types and Interfaces (keeping your existing structure)
interface MenuItemVariant {
  id: string;
  name: string;
  price: number;
}

interface MenuItem {
  id: string;
  section: string;
  name: Record<string, string>;
  description: Record<string, string>;
  price: number; // fallback for single-price dishes
  allergens: string[];
  dietaryTags: string[];
  explanation: Record<string, string>;
  variants?: MenuItemVariant[];
}

interface OrderItem {
  dishId: string;
  variantId?: string; // ✅ new
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
  // State Management
  const [currentStep, setCurrentStep] = useState<'welcome' | 'language' | 'menu'>(isDemo ? 'welcome' : 'menu');
  const [language, setLanguage] = useState<Language>('en');
  const [dietaryFilters, setDietaryFilters] = useState<string[]>([]);
  const [allergenExclusions, setAllergenExclusions] = useState<string[]>([]);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(() => {
    // Only expand first section by default
    const sections = Object.keys(menuData.menuItems.reduce((acc, item) => {
      acc[item.section] = true;
      return acc;
    }, {} as Record<string, boolean>));
    const firstSection = sections[0];
    return new Set(sections.slice(1)); // Collapse all except first
  });
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isOrderListExpanded, setIsOrderListExpanded] = useState(false);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [showDishExplanation, setShowDishExplanation] = useState<string | null>(null);
  const [customRequestInput, setCustomRequestInput] = useState<Record<string, string>>({});
  // ✅ Variant selection modal state
const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
const [selectedVariant, setSelectedVariant] = useState<MenuItemVariant | null>(null);
const [variantQuantity, setVariantQuantity] = useState(1);
const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});


  // Language configurations
	const languages: LanguageOption[] = [
	  { code: 'en', label: 'English', flag: 'GB' },
	  { code: 'zh', label: '中文', flag: 'CN' },
	  { code: 'es', label: 'Español', flag: 'ES' },
	  { code: 'fr', label: 'Français', flag: 'FR' },
	];

  // Translations
  const translations = {
    en: {
      welcome: 'Welcome',
      selectLanguage: 'Select your language',
      getStarted: 'Get Started',
      howItWorks: 'How it works',
      step1: '1. Browse dishes in your language',
      step2: '2. Filter by dietary needs',
      step3: '3. Add items to your order',
      step4: '4. Ask questions to your server',
      step5: '5. Show your final order',
      letsBegin: "Let's Begin",
      addToOrder: 'Add',
      moreInfo: 'Info',
      yourOrder: 'Your Order',
      continueShopping: 'Continue',
      confirmOrder: 'Confirm Order',
      showToWaiter: 'SHOW TO SERVER',
      total: 'Total',
      addQuestion: 'Ask server a question...',
      serverResponse: 'Server Response',
      showThisToServer: 'Show this to server',
      yes: 'Yes',
      no: 'No',
      letMeCheck: 'Let me check',
      browseMenuAgain: 'Browse Menu Again',
      confirmedOrder: 'CONFIRMED ORDER',
      noSpecialRequests: 'No questions',
      contains: 'Contains:',
      items: 'items',
      filters: 'Filters',
      showOnly: 'Show only:',
      hideWith: 'Hide dishes with:',
      applyFilters: 'Apply Filters',
      clearFilters: 'Clear All',
	  dietaryLabel: "Dietary",
	  close: "Close",
	  chooseVariant: "Choose a variant",
    },
    zh: {
      welcome: '欢迎',
      selectLanguage: '选择您的语言',
      getStarted: '开始',
      howItWorks: '使用方法',
      step1: '1. 用您的语言浏览菜品',
      step2: '2. 按饮食需求筛选',
      step3: '3. 将菜品添加到订单',
      step4: '4. 向服务员提问',
      step5: '5. 展示最终订单',
      letsBegin: '开始使用',
      addToOrder: '添加',
      moreInfo: '更多信息',
      yourOrder: '您的订单',
      continueShopping: '继续浏览',
      confirmOrder: '确认订单',
      showToWaiter: '向服务员展示此页面',
      total: '总计',
      addQuestion: '向服务员提问...',
      serverResponse: '服务员回复',
      showThisToServer: '向服务员展示此内容',
      yes: '是',
      no: '否',
      letMeCheck: '让我确认',
      browseMenuAgain: '重新浏览菜单',
      confirmedOrder: '已确认订单',
      noSpecialRequests: '无问题',
      contains: '包含:',
      items: '项',
      filters: '筛选',
      showOnly: '仅显示:',
      hideWith: '隐藏包含以下内容的菜品:',
      applyFilters: '应用筛选',
      clearFilters: '清除所有',
	  dietaryLabel: "饮食",
	  close: "关闭",
	  chooseVariant: "选择一个选项",
    },
    es: {
      welcome: 'Bienvenido',
      selectLanguage: 'Selecciona tu idioma',
      getStarted: 'Comenzar',
      howItWorks: 'Cómo funciona',
      step1: '1. Navega platos en tu idioma',
      step2: '2. Filtra por necesidades dietéticas',
      step3: '3. Agrega elementos a tu pedido',
      step4: '4. Haz preguntas a tu mesero',
      step5: '5. Muestra tu pedido final',
      letsBegin: 'Comencemos',
      addToOrder: 'Agregar',
      moreInfo: 'Info',
      yourOrder: 'Su Pedido',
      continueShopping: 'Continuar',
      confirmOrder: 'Confirmar',
      showToWaiter: 'MOSTRAR AL MESERO',
      total: 'Total',
      addQuestion: 'Pregunta al mesero...',
      serverResponse: 'Respuesta del mesero',
      showThisToServer: 'Mostrar esto al mesero',
      yes: 'Sí',
      no: 'No',
      letMeCheck: 'Déjame verificar',
      browseMenuAgain: 'Ver Menú Otra Vez',
      confirmedOrder: 'PEDIDO CONFIRMADO',
      noSpecialRequests: 'Sin preguntas',
      contains: 'Contiene:',
      items: 'elementos',
      filters: 'Filtros',
      showOnly: 'Mostrar solo:',
      hideWith: 'Ocultar platos con:',
      applyFilters: 'Aplicar Filtros',
      clearFilters: 'Limpiar Todo',
	  dietaryLabel: "Dieta",
	  close: "Cerrar",
	  chooseVariant: "Elige una variante",
    },
    fr: {
      welcome: 'Bienvenue',
      selectLanguage: 'Sélectionnez votre langue',
      getStarted: 'Commencer',
      howItWorks: 'Comment ça marche',
      step1: '1. Parcourez les plats dans votre langue',
      step2: '2. Filtrez par besoins alimentaires',
      step3: '3. Ajoutez des éléments à votre commande',
      step4: '4. Posez des questions à votre serveur',
      step5: '5. Montrez votre commande finale',
      letsBegin: 'Commençons',
      addToOrder: 'Ajouter',
      moreInfo: 'Info',
      yourOrder: 'Votre Commande',
      continueShopping: 'Continuer',
      confirmOrder: 'Confirmer',
      showToWaiter: 'MONTRER AU SERVEUR',
      total: 'Total',
      addQuestion: 'Question au serveur...',
      serverResponse: 'Réponse du serveur',
      showThisToServer: 'Montrer ceci au serveur',
      yes: 'Oui',
      no: 'Non',
      letMeCheck: 'Laisse-moi vérifier',
      browseMenuAgain: 'Parcourir le Menu',
      confirmedOrder: 'COMMANDE CONFIRMÉE',
      noSpecialRequests: 'Aucune question',
      contains: 'Contient:',
      items: 'articles',
      filters: 'Filtres',
      showOnly: 'Afficher seulement:',
      hideWith: 'Masquer les plats avec:',
      applyFilters: 'Appliquer les Filtres',
      clearFilters: 'Tout Effacer',
	  dietaryLabel: "Alimentation",
	  close: "Fermer",
	  chooseVariant: "Choisir une variante",
    }
  };

  const t = translations[language];

  // Get unique dietary tags and allergens for filters
  const allDietaryTags = [...new Set(menuData.menuItems.flatMap(item => item.dietaryTags))];
  const allAllergens = [...new Set(menuData.menuItems.flatMap(item => item.allergens))];

  // Translation mappings
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

  // Filter menu items based on dietary filters and allergen exclusions
  const filteredItems = menuData.menuItems.filter(item => {
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

  // Functions
	const addToOrder = (dishId: string, variantId?: string, qty: number = 1) => {
	  const existingItem = orderItems.find(
		item => item.dishId === dishId && item.variantId === variantId
	  );

	  if (existingItem) {
		setOrderItems(orderItems.map(item =>
		  item.dishId === dishId && item.variantId === variantId
			? { ...item, quantity: item.quantity + qty }
			: item
		));
	  } else {
		setOrderItems([
		  ...orderItems,
		  { dishId, variantId, quantity: qty }
		]);
	  }
	};


	const updateVariant = (dishId: string, variantId: string) => {
	  setOrderItems(prev =>
		prev.map(item =>
		  item.dishId === dishId
			? { ...item, variantId }
			: item
		)
	  );
	};


	const updateQuantity = (dishId: string, delta: number, variantId?: string) => {
	  setOrderItems(prev =>
		prev
		  .map(item =>
			item.dishId === dishId && item.variantId === variantId
			  ? { ...item, quantity: Math.max(1, item.quantity + delta) }
			  : item
		  )
		  .filter(item => item.quantity > 0)
	  );
	};



	const removeFromOrder = (dishId: string, variantId?: string) => {
	  setOrderItems(prev =>
		prev.filter(item => !(item.dishId === dishId && item.variantId === variantId))
	  );
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

  const clearAllFilters = () => {
    setDietaryFilters([]);
    setAllergenExclusions([]);
    setIsFiltersExpanded(false);
  };

  // Welcome Screen
  if (currentStep === 'welcome') {
    return (
      <div className="min-h-screen bg-wtm-bg flex items-center justify-center px-6">
        <div className="max-w-lg w-full text-center">
          <h1 className="text-4xl font-bold text-wtm-text mb-4 tracking-tight">
            {t.welcome}
          </h1>
          <p className="text-xl text-wtm-muted mb-12 font-light">
            {menuData.restaurantName.en}
          </p>
          
          <div className="bg-white rounded-3xl border border-gray-100 p-8 mb-8 shadow-sm">
            <div className="flex items-center justify-center mb-6">
              <Info size={32} className="text-wtm-primary" />
            </div>
            <h2 className="text-2xl font-bold text-wtm-text mb-6 tracking-tight">
              {t.howItWorks}
            </h2>
            <div className="space-y-4 text-left">
              <p className="text-wtm-muted">{t.step1}</p>
              <p className="text-wtm-muted">{t.step2}</p>
              <p className="text-wtm-muted">{t.step3}</p>
              <p className="text-wtm-muted">{t.step4}</p>
              <p className="text-wtm-muted">{t.step5}</p>
            </div>
          </div>
          
          <button
            onClick={() => setCurrentStep('language')}
            className="bg-wtm-primary text-white font-semibold px-12 py-5 rounded-2xl text-lg hover:bg-wtm-primary-600 hover:scale-[1.02] transition-all duration-200 shadow-lg w-full"
          >
            {t.letsBegin}
          </button>
        </div>
      </div>
    );
  }

  // Language Selection Screen
  if (currentStep === 'language') {
    return (
      <div className="min-h-screen bg-wtm-bg flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <h1 className="text-4xl font-bold text-wtm-text mb-12 tracking-tight">
            {t.selectLanguage}
          </h1>
          
          <div className="space-y-4">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setCurrentStep('menu');
                }}
                className="w-full bg-white border border-gray-100 rounded-2xl p-6 text-left hover:border-wtm-primary hover:bg-wtm-primary/5 transition-all duration-200 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <ReactCountryFlag 
					  countryCode={lang.flag}
					  svg
					  style={{ width: "2em", height: "2em" }}
					/>
                  <span className="text-xl font-medium text-wtm-text">{lang.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Confirmed Order Screen
if (isOrderConfirmed) {
  return (
    <div className="min-h-screen bg-wtm-bg px-6 py-8">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
          <div className="bg-wtm-secondary text-white p-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight">{t.confirmedOrder}</h1>
          </div>
          
          <div className="bg-red-100 border-2 border-red-600 p-4 m-6 rounded-2xl text-center">
            <div className="text-red-800 font-bold text-lg">
              {t.showToWaiter}
            </div>
          </div>

          <div className="px-6 space-y-6">
            {orderItems.map(orderItem => {
              const menuItem = menuData.menuItems.find(item => item.id === orderItem.dishId);
              if (!menuItem) return null;

              const variant = menuItem.variants?.find(v => v.id === orderItem.variantId);
              const unitPrice = variant ? variant.price : menuItem.price;
              const lineTotal = unitPrice * orderItem.quantity;

              return (
                <div
                  key={`${orderItem.dishId}-${orderItem.variantId || "std"}`}
                  className="border-b border-gray-100 pb-6 last:border-b-0"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-wtm-text">
                        {menuItem.name[language]}
                        {variant && (
                          <span className="text-base text-gray-600">
                            {" "}({variant.name})
                          </span>
                        )}{" "}
                        ({orderItem.quantity}x)
                      </h3>
                    </div>
                    <div className="text-xl font-bold text-wtm-primary">
                      ${lineTotal.toFixed(2)}
                    </div>
                  </div>

                  {/* Dietary Tags */}
                  {menuItem.dietaryTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {menuItem.dietaryTags.map(tag => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                        >
                          {translateDietaryTag(tag)}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Allergen Warnings */}
                  {menuItem.allergens.length > 0 && (
                    <div className="mb-3">
                      <span className="text-red-600 font-medium text-sm">
                        ⚠️ {t.contains}{" "}
                        {menuItem.allergens
                          .map(allergen => translateAllergen(allergen))
                          .join(", ")}
                      </span>
                    </div>
                  )}

                  {/* Custom Request */}
                  {orderItem.customRequest ? (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl">
                      <div className="text-blue-800 font-medium mb-2">
                        "{orderItem.customRequest}"
                      </div>
                      {orderItem.serverResponse && (
                        <div
                          className={`font-bold ${
                            orderItem.serverResponse === "yes"
                              ? "text-green-600"
                              : orderItem.serverResponse === "no"
                              ? "text-red-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {orderItem.serverResponse === "yes"
                            ? "✅"
                            : orderItem.serverResponse === "no"
                            ? "❌"
                            : "⏳"}{" "}
                          {t.serverResponse}:{" "}
                          {orderItem.serverResponse === "yes"
                            ? t.yes
                            : orderItem.serverResponse === "no"
                            ? t.no
                            : t.letMeCheck}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-wtm-muted">{t.noSpecialRequests}</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ✅ Variant-aware total */}
          <div className="bg-wtm-bg p-6 m-6 rounded-2xl">
            <div className="flex justify-between items-center text-2xl font-bold">
              <span>{t.total}:</span>
              <span className="text-wtm-primary">
                $
                {orderItems
                  .reduce((sum, orderItem) => {
                    const menuItem = menuData.menuItems.find(
                      item => item.id === orderItem.dishId
                    );
                    if (!menuItem) return sum;
                    const variant = menuItem.variants?.find(
                      v => v.id === orderItem.variantId
                    );
                    const unitPrice = variant ? variant.price : menuItem.price;
                    return sum + unitPrice * orderItem.quantity;
                  }, 0)
                  .toFixed(2)}
              </span>
            </div>
          </div>

          <div className="p-6">
            <button
              onClick={() => {
                setIsOrderConfirmed(false);
                setOrderItems([]);
              }}
              className="bg-wtm-primary text-white font-semibold px-8 py-4 rounded-2xl hover:bg-wtm-primary-600 transition-colors duration-200 w-full text-lg"
            >
              {t.browseMenuAgain}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



  return (
    <div className="min-h-screen bg-wtm-bg">
      {/* Minimal Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <button
              onClick={() => setCurrentStep('language')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Globe size={20} className="text-wtm-muted" />
              <span className="text-2xl">{languages.find(l => l.code === language)?.flag}</span>
            </button>
            
            <h1 className="text-xl font-bold text-wtm-text tracking-tight">
              {menuData.restaurantName[language]}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Button */}
            {(allDietaryTags.length > 0 || allAllergens.length > 0) && (
              <button
                onClick={() => setIsFiltersExpanded(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors relative"
              >
                <Filter size={18} className="text-wtm-muted" />
                <span className="text-sm font-medium text-wtm-muted">{t.filters}</span>
                {(dietaryFilters.length > 0 || allergenExclusions.length > 0) && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-wtm-primary text-white rounded-full text-xs font-bold flex items-center justify-center">
                    {dietaryFilters.length + allergenExclusions.length}
                  </span>
                )}
              </button>
            )}

            {/* Order Button */}
            {totalItems > 0 && (
              <button
                onClick={() => setIsOrderListExpanded(true)}
                className="bg-wtm-primary text-white font-semibold px-4 py-2 rounded-xl hover:bg-wtm-primary-600 transition-colors relative"
              >
                {t.yourOrder} ({totalItems})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Menu Content with Generous Margins */}
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {Object.entries(itemsBySection).map(([section, items]) => (
          <div key={section} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection(section)}
              className="w-full flex justify-between items-center p-6 hover:bg-gray-50 transition-colors focus:outline-none"
            >
              <h2 className="text-2xl font-bold text-wtm-text tracking-tight">{section}</h2>
              {collapsedSections.has(section) ? 
                <ChevronDown size={24} className="text-wtm-muted" /> : 
                <ChevronUp size={24} className="text-wtm-muted" />
              }
            </button>

            {!collapsedSections.has(section) && (
              <div className="divide-y divide-gray-100">
                {items.map(item => (
                  <div key={item.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 pr-4">
                        <h3 className="font-bold text-xl text-wtm-text mb-2 tracking-tight leading-tight">
                          {item.name[language]}
                        </h3>
                        <p className="text-wtm-muted leading-relaxed">
                          {item.description[language]}
                        </p>
                      </div>
					<div className="text-2xl font-bold text-wtm-primary shrink-0">
					  {(!item.variants || item.variants.length === 0) ? 
						`$${item.price.toFixed(2)}` : 
						<span className="text-sm text-gray-500">Multiple options</span>
					  }
					</div>
                    </div>

                    {/* Tags */}
                    {(item.dietaryTags.length > 0 || item.allergens.length > 0) && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.dietaryTags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            {translateDietaryTag(tag)}
                          </span>
                        ))}
                        {item.allergens.map(allergen => (
                          <span key={allergen} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                            {translateAllergen(allergen)}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowDishExplanation(item.id)}
                        className="px-4 py-2 bg-gray-100 text-wtm-text rounded-xl hover:bg-gray-200 transition-colors font-medium"
                      >
                        {t.moreInfo}
                      </button>
						{item.variants && item.variants.length > 0 ? (
						  <div className="flex flex-col gap-2">
							<select
							  value={selectedVariants[item.id] || ""}
							  onChange={(e) =>
								setSelectedVariants({
								  ...selectedVariants,
								  [item.id]: e.target.value,
								})
							  }
							  className="border rounded-lg px-3 py-2 text-sm"
							>
							  <option value="">{t.chooseVariant}</option>
							  {item.variants.map((v) => (
								<option key={v.id} value={v.id}>
								  {v.name} - ${v.price.toFixed(2)}
								</option>
							  ))}
							</select>

							<button
							  onClick={() =>
								addToOrder(item.id, selectedVariants[item.id] || undefined, 1)
							  }
							  disabled={!selectedVariants[item.id]}
							  className="inline-flex items-center justify-center whitespace-nowrap gap-2 bg-wtm-primary text-white font-semibold px-6 py-2 rounded-xl hover:bg-wtm-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
							  <Plus size={18} />
							  {t.addToOrder}
							</button>
						  </div>
						) : (
						  <button
							onClick={() => addToOrder(item.id)}
							className="inline-flex items-center justify-center whitespace-nowrap gap-2 bg-wtm-primary text-white font-semibold px-6 py-2 rounded-xl hover:bg-wtm-primary-600 transition-colors"
						  >
							<Plus size={18} />
							{t.addToOrder}
						  </button>
						)}
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

      {/* Filter Panel - Pull-down style */}
      {isFiltersExpanded && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl max-w-lg w-full mx-6 overflow-hidden animate-slide-up">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-wtm-text tracking-tight">{t.filters}</h3>
              <button
                onClick={() => setIsFiltersExpanded(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close filters"
              >
                <X size={24} className="text-wtm-muted" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Dietary Filters */}
              {allDietaryTags.length > 0 && (
                <div>
                  <h4 className="font-semibold text-wtm-text mb-3">{t.showOnly}</h4>
                  <div className="flex flex-wrap gap-2">
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
                        className={`px-4 py-2 rounded-xl font-medium transition-all ${
                          dietaryFilters.includes(tag)
                            ? 'bg-green-100 text-green-700 border-2 border-green-300'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {translateDietaryTag(tag)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Allergen Exclusions */}
              {allAllergens.length > 0 && (
                <div>
                  <h4 className="font-semibold text-wtm-text mb-3">{t.hideWith}</h4>
                  <div className="flex flex-wrap gap-2">
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
                        className={`px-4 py-2 rounded-xl font-medium transition-all ${
                          allergenExclusions.includes(allergen)
                            ? 'bg-red-100 text-red-700 border-2 border-red-300'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {translateAllergen(allergen)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={clearAllFilters}
                className="flex-1 px-4 py-3 bg-gray-100 text-wtm-text rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                {t.clearFilters}
              </button>
              <button
                onClick={() => setIsFiltersExpanded(false)}
                className="flex-1 bg-wtm-primary text-white font-semibold px-4 py-3 rounded-xl hover:bg-wtm-primary-600 transition-colors"
              >
                {t.applyFilters}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Drawer - Redesigned to match menu width */}
      {isOrderListExpanded && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full max-h-[85vh] rounded-t-3xl overflow-hidden flex flex-col animate-slide-up">
            <div className="max-w-2xl mx-auto w-full">
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-wtm-text tracking-tight">{t.yourOrder}</h2>
                <button
                  onClick={() => setIsOrderListExpanded(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close order"
                >
                  <X size={24} className="text-wtm-muted" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
{orderItems.map(orderItem => {
  const menuItem = menuData.menuItems.find(item => item.id === orderItem.dishId);
  if (!menuItem) return null;

  const variant = menuItem.variants?.find(v => v.id === orderItem.variantId);
  const unitPrice = variant ? variant.price : menuItem.price;
  const lineTotal = unitPrice * orderItem.quantity;

  return (
    <div
      key={`${orderItem.dishId}-${orderItem.variantId || "std"}`}
      className="bg-gray-50 rounded-2xl p-4"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-wtm-text">
            {menuItem.name[language]}
            {variant && (
              <span className="text-sm text-gray-600"> ({variant.name})</span>
            )}
          </h3>
          <p className="text-wtm-muted text-sm">
            ${unitPrice.toFixed(2)} each
          </p>
        </div>
        <div className="text-lg font-bold text-wtm-primary">
          ${lineTotal.toFixed(2)}
        </div>
      </div>

      {/* ✅ Variant Selector */}
		{menuItem.variants && menuItem.variants.length > 0 && (
		  <select
			className="mt-2 w-full border rounded-lg px-3 py-2 text-sm"
			value={selectedVariants[menuItem.id] || orderItem.variantId || ""}
			onChange={(e) => {
			  const variantId = e.target.value;
			  setSelectedVariants({
				...selectedVariants,
				[menuItem.id]: variantId,
			  });
			  updateVariant(menuItem.id, variantId); // ✅ keeps orderItems in sync
			}}
		  >
			<option value="">{t.chooseVariant}</option>
			{menuItem.variants.map((v) => (
			  <option key={v.id} value={v.id}>
				{v.name} - ${v.price.toFixed(2)}
			  </option>
			))}
		  </select>
		)}



      <div className="flex items-center justify-between mb-4">
        {/* ✅ Quantity Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => updateQuantity(orderItem.dishId, -1, orderItem.variantId)}
            className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400"
          >
            <Minus size={16} />
          </button>
          <span className="font-bold text-lg w-6 text-center">
            {orderItem.quantity}
          </span>
          <button
            onClick={() => updateQuantity(orderItem.dishId, 1, orderItem.variantId)}
            className="w-8 h-8 bg-wtm-primary text-white rounded-full flex items-center justify-center hover:bg-wtm-primary-600"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* ✅ Remove Button */}
        <button
          onClick={() => removeFromOrder(orderItem.dishId, orderItem.variantId)}
          className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* ✅ Custom Request & Server Response */}
      {orderItem.customRequest ? (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
          <p className="text-blue-800 font-medium mb-3">
            "{orderItem.customRequest}"
          </p>
          <div className="text-xs text-blue-600 mb-3 font-medium">
            {t.showThisToServer}
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleServerResponse(orderItem.dishId, "yes")}
              className={`px-3 py-2 rounded-xl font-medium text-sm ${
                orderItem.serverResponse === "yes"
                  ? "bg-green-600 text-white"
                  : orderItem.serverResponse && orderItem.serverResponse !== "checking"
                  ? "bg-gray-200 text-gray-500"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}
              disabled={
                orderItem.serverResponse &&
                orderItem.serverResponse !== "checking" &&
                orderItem.serverResponse !== "yes"
              }
            >
              {t.yes}
            </button>
            <button
              onClick={() => handleServerResponse(orderItem.dishId, "no")}
              className={`px-3 py-2 rounded-xl font-medium text-sm ${
                orderItem.serverResponse === "no"
                  ? "bg-red-600 text-white"
                  : orderItem.serverResponse && orderItem.serverResponse !== "checking"
                  ? "bg-gray-200 text-gray-500"
                  : "bg-red-100 text-red-700 hover:bg-red-200"
              }`}
              disabled={
                orderItem.serverResponse &&
                orderItem.serverResponse !== "checking" &&
                orderItem.serverResponse !== "no"
              }
            >
              {t.no}
            </button>
            <button
              onClick={() => handleServerResponse(orderItem.dishId, "checking")}
              className={`px-3 py-2 rounded-xl font-medium text-sm ${
                orderItem.serverResponse === "checking"
                  ? "bg-yellow-600 text-white"
                  : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
              }`}
            >
              {t.letMeCheck}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={t.addQuestion}
            value={customRequestInput[orderItem.dishId] || ""}
            onChange={(e) =>
              setCustomRequestInput({
                ...customRequestInput,
                [orderItem.dishId]: e.target.value,
              })
            }
            maxLength={200}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-white focus:border-wtm-primary focus:ring-2 focus:ring-wtm-primary/20 focus:outline-none transition-all duration-200"
          />
          <button
            onClick={() =>
              addCustomRequest(orderItem.dishId, customRequestInput[orderItem.dishId] || "")
            }
            disabled={!customRequestInput[orderItem.dishId]?.trim()}
            className="px-4 py-3 bg-wtm-primary text-white rounded-xl hover:bg-wtm-primary-600 transition-colors disabled:opacity-50"
          >
            <MessageCircle size={16} />
          </button>
        </div>
      )}
    </div>
  );
})}


              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 bg-white p-6 space-y-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>{t.total}:</span>
                  <span className="text-wtm-primary">${orderTotal.toFixed(2)}</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsOrderListExpanded(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-wtm-text rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  >
                    {t.continueShopping}
                  </button>
                  <button
                    onClick={confirmOrder}
                    disabled={orderItems.length === 0}
                    className="flex-1 bg-wtm-primary text-white font-semibold px-4 py-3 rounded-xl hover:bg-wtm-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t.confirmOrder}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dish Explanation Modal - Updated styling */}
      {showDishExplanation && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl max-w-md w-full p-6">
            {(() => {
              const dish = menuData.menuItems.find(item => item.id === showDishExplanation);
              if (!dish) return null;
              
              return (
                <>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-wtm-text tracking-tight">
                      {dish.name[language]}
                    </h3>
                    <button
                      onClick={() => setShowDishExplanation(null)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      aria-label="Close"
                    >
                      <X size={24} className="text-wtm-muted" />
                    </button>
                  </div>
                  <p className="text-wtm-muted mb-6 leading-relaxed">
                    {dish.explanation[language]}
                  </p>
                  
                  {/* Dietary Tags */}
                  {dish.dietaryTags.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-wtm-text mb-2">{t.dietaryLabel}:</p>
                      <div className="flex flex-wrap gap-2">
                        {dish.dietaryTags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            {translateDietaryTag(tag)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Allergens */}
                  {dish.allergens.length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm font-semibold text-wtm-text mb-2">{t.contains}</p>
                      <div className="flex flex-wrap gap-2">
                        {dish.allergens.map(allergen => (
                          <span key={allergen} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                            {translateAllergen(allergen)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDishExplanation(null)}
                      className="flex-1 px-4 py-3 bg-gray-100 text-wtm-text rounded-xl hover:bg-gray-200 transition-colors font-medium"
                    >
                      {t.close}
                    </button>
                    <button
                      onClick={() => {
                        addToOrder(dish.id);
                        setShowDishExplanation(null);
                      }}
                      className="flex-1 bg-wtm-primary text-white font-semibold px-4 py-3 rounded-xl hover:bg-wtm-primary-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus size={18} />
                      {t.addToOrder}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
	  {/* ✅ Variant Selector Modal */}
{selectedDish && (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl max-w-md w-full p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-2xl font-bold text-wtm-text">{selectedDish.name[language]}</h3>
        <button
          onClick={() => setSelectedDish(null)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <X size={24} className="text-wtm-muted" />
        </button>
      </div>

      {selectedDish.variants?.map(variant => (
		  <label
			key={variant.id}
			className="flex items-center justify-between border rounded-lg p-3 mb-2 cursor-pointer"
		  >
          <input
            type="radio"
            name="variant"
            checked={selectedVariant?.id === variant.id}
            onChange={() => setSelectedVariant(variant)}
          />
          <span>{variant.name}</span>
          <span>${variant.price.toFixed(2)}</span>
        </label>
      ))}

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVariantQuantity(q => Math.max(1, q - 1))}
            className="px-3 py-1 border rounded-lg"
          >
            -
          </button>
          <span>{variantQuantity}</span>
          <button
            onClick={() => setVariantQuantity(q => q + 1)}
            className="px-3 py-1 border rounded-lg"
          >
            +
          </button>
        </div>
        <button
          disabled={!selectedVariant}
          onClick={() => {
            if (selectedVariant) {
              addToOrder(selectedDish.id, selectedVariant.id, variantQuantity);
              setSelectedDish(null);
              setSelectedVariant(null);
              setVariantQuantity(1);
            }
          }}
          className="bg-wtm-primary text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {t.addToOrder}
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default RestaurantMenuPage;
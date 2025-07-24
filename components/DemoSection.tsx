import React, { useState, useEffect } from 'react';

// Sample menu data extracted from the provided French menu
const SAMPLE_MENU_DATA = {
  restaurant: {
    name: "Brasserie Française",
    cuisine: "French"
  },
  dishes: [
    {
      name: "STEAK D'ESPADON AU POIVRE VERT",
      originalName: "STEAK D'ESPADON AU POIVRE VERT, FRITES",
      price: "24",
      section: "LES PLATS",
      description: "Pan-Seared North Atlantic Sword Fish Steak, GreenPeppercorn Sauce, Haricots Verts, Garlic Fries"
    },
    {
      name: "COQ AU VIN, PÂTES FRAÎCHES", 
      originalName: "COQ AU VIN, PÂTES FRAÎCHES",
      price: "18",
      section: "LES PLATS",
      description: "Braised Organic Chicken In A Cabernet Wine Sauce, Mushrooms, Carrots, Pearl Onions, With Fresh Fettuccine"
    },
    {
      name: "OSSO BUCO D'AGNEAU À LA PROVENÇALE",
      originalName: "OSSO BUCO D'AGNEAU À LA PROVENÇALE",
      price: "22", 
      section: "LES PLATS",
      description: "Braised Lamb Shank, Spicy Harissa Jus, Gratin Dauphinois, Ratatouille"
    },
    {
      name: "CHOUCROUTE GARNIE ALSACIENNE",
      originalName: "CHOUCROUTE GARNIE ALSACIENNE", 
      price: "22",
      section: "LES CLASSIQUES",
      description: "Alsacian Stew Of Imported French Sausages, Charcuterie And Homemade Sauerkraut"
    },
    {
      name: "CASSOULET TOULOUSAIN",
      originalName: "CASSOULET TOULOUSAIN",
      price: "22",
      section: "LES CLASSIQUES", 
      description: "Slow-Cooked Casserole Of White Beans, Duck Confit, Imported Lyonnaise Organic Sausages And Pork"
    },
    {
      name: "FOIE DE VEAU À LA PROVENÇALE",
      originalName: "FOIE DE VEAU À LA PROVENÇALE",
      price: "16",
      section: "LES CLASSIQUES",
      description: "Pan Seared Calf's Liver, Roasted Grenailles Potatoes, Grilled Asparagus, Tomate Confit, Shallots, Garlic, Parsley"
    },
    {
      name: "ESCARGOTS DE BOURGOGNE",
      originalName: "ESCARGOTS DE BOURGOGNE",
      price: "7", 
      section: "POUR COMMENCER",
      description: "1/2 dz Burgundy Snails, Garlic Parsley Butter Sauce"
    },
    {
      name: "COCKTAIL DE CREVETTES CLASSIQUE",
      originalName: "COCKTAIL DE CREVETTES CLASSIQUE",
      price: "12",
      section: "POUR COMMENCER", 
      description: "Classic Jumbo Shrimp Cocktail"
    }
  ]
};

// Sample dish explanations (these would normally come from your API)
const SAMPLE_EXPLANATIONS = {
  "STEAK D'ESPADON AU POIVRE VERT": {
    en: {
      explanation: "Grilled swordfish steak with green peppercorn sauce, served with French green beans and garlic fries.",
      tags: ["Seafood", "Grilled", "French"],
      allergens: ["Fish"],
      cuisine: "French"
    },
    es: {
      explanation: "Filete de pez espada a la plancha con salsa de pimienta verde, servido con judías verdes francesas y papas fritas al ajo.",
      tags: ["Mariscos", "A la plancha", "Francés"],
      allergens: ["Pescado"],
      cuisine: "Francés"
    },
    zh: {
      explanation: "烤剑鱼配绿胡椒酱，配法式青豆和蒜蓉薯条。",
      tags: ["海鲜", "烧烤", "法式"],
      allergens: ["鱼类"],
      cuisine: "法式"
    },
    fr: {
      explanation: "Steak d'espadon grillé avec sauce aux grains de poivre vert, servi avec haricots verts français et frites à l'ail.",
      tags: ["Fruits de mer", "Grillé", "Français"],
      allergens: ["Poisson"],
      cuisine: "Français"
    }
  },
  "COQ AU VIN, PÂTES FRAÎCHES": {
    en: {
      explanation: "Traditional French braised chicken in red wine sauce with mushrooms, carrots, and pearl onions, served over fresh pasta.",
      tags: ["Chicken", "Braised", "Traditional", "French"],
      allergens: ["Gluten", "Contains Alcohol"],
      cuisine: "French"
    },
    es: {
      explanation: "Pollo tradicional francés estofado en salsa de vino tinto con champiñones, zanahorias y cebollitas, servido sobre pasta fresca.",
      tags: ["Pollo", "Estofado", "Tradicional", "Francés"],
      allergens: ["Gluten", "Contiene Alcohol"],
      cuisine: "Francés"
    },
    zh: {
      explanation: "传统法式红酒炖鸡，配蘑菇、胡萝卜和珍珠洋葱，配新鲜意面。",
      tags: ["鸡肉", "炖煮", "传统", "法式"],
      allergens: ["麸质", "含酒精"],
      cuisine: "法式"
    },
    fr: {
      explanation: "Poulet traditionnel français braisé dans une sauce au vin rouge avec champignons, carottes et oignons perles, servi sur pâtes fraîches.",
      tags: ["Volaille", "Braisé", "Traditionnel", "Français"],
      allergens: ["Gluten", "Contient de l'alcool"],
      cuisine: "Français"
    }
  },
  "OSSO BUCO D'AGNEAU À LA PROVENÇALE": {
    en: {
      explanation: "Slow-braised lamb shank with spicy harissa sauce, served with potato gratin and traditional ratatouille.",
      tags: ["Lamb", "Braised", "Spicy", "Provençal"],
      allergens: ["Dairy"],
      cuisine: "French"
    },
    es: {
      explanation: "Jarrete de cordero estofado lentamente con salsa harissa picante, servido con gratín de papas y ratatouille tradicional.",
      tags: ["Cordero", "Estofado", "Picante", "Provenzal"],
      allergens: ["Lácteos"],
      cuisine: "Francés"
    },
    zh: {
      explanation: "慢炖羊腿配辛辣哈里萨酱，配土豆焗烤和传统杂菜煲。",
      tags: ["羊肉", "炖煮", "辛辣", "普罗旺斯风味"],
      allergens: ["乳制品"],
      cuisine: "法式"
    },
    fr: {
      explanation: "Jarret d'agneau braisé lentement avec sauce harissa épicée, servi avec gratin de pommes de terre et ratatouille traditionnelle.",
      tags: ["Agneau", "Braisé", "Épicé", "Provençal"],
      allergens: ["Produits laitiers"],
      cuisine: "Français"
    }
  },
  "CHOUCROUTE GARNIE ALSACIENNE": {
    en: {
      explanation: "Traditional Alsatian sauerkraut stew with imported French sausages, charcuterie, and homemade fermented cabbage.",
      tags: ["Pork", "Traditional", "Alsatian", "Fermented"],
      allergens: ["Nitrates"],
      cuisine: "French"
    },
    es: {
      explanation: "Estofado tradicional alsaciano de chucrut con salchichas francesas importadas, charcutería y repollo fermentado casero.",
      tags: ["Cerdo", "Tradicional", "Alsaciano", "Fermentado"],
      allergens: ["Nitratos"],
      cuisine: "Francés"
    },
    zh: {
      explanation: "传统阿尔萨斯酸菜炖肉，配进口法式香肠、熟食和自制发酵卷心菜。",
      tags: ["猪肉", "传统", "阿尔萨斯风味", "发酵"],
      allergens: ["硝酸盐"],
      cuisine: "法式"
    },
    fr: {
      explanation: "Choucroute traditionnelle alsacienne avec saucisses françaises importées, charcuterie et choucroute maison fermentée.",
      tags: ["Porc", "Traditionnel", "Alsacien", "Fermenté"],
      allergens: ["Nitrates"],
      cuisine: "Français"
    }
  },
  "CASSOULET TOULOUSAIN": {
    en: {
      explanation: "Slow-cooked white bean casserole with duck confit, imported Lyonnaise sausages, and pork - a classic from Toulouse.",
      tags: ["Duck", "Pork", "Slow-cooked", "Traditional", "Beans"],
      allergens: ["May contain sulfites"],
      cuisine: "French"
    },
    es: {
      explanation: "Cazuela de alubias blancas cocida lentamente con confit de pato, salchichas lionesas importadas y cerdo - un clásico de Toulouse.",
      tags: ["Pato", "Cerdo", "Cocción lenta", "Tradicional", "Legumbres"],
      allergens: ["Puede contener sulfitos"],
      cuisine: "Francés"
    },
    zh: {
      explanation: "慢煮白豆砂锅配鸭腿肉、进口里昂香肠和猪肉 - 图卢兹经典菜。",
      tags: ["鸭肉", "猪肉", "慢煮", "传统", "豆类"],
      allergens: ["可能含亚硫酸盐"],
      cuisine: "法式"
    },
    fr: {
      explanation: "Cassoulet de haricots blancs cuit lentement avec confit de canard, saucisses lyonnaises importées et porc - un classique de Toulouse.",
      tags: ["Canard", "Porc", "Cuisson lente", "Traditionnel", "Légumineuses"],
      allergens: ["Peut contenir des sulfites"],
      cuisine: "Français"
    }
  },
  "FOIE DE VEAU À LA PROVENÇALE": {
    en: {
      explanation: "Pan-seared calf's liver with roasted small potatoes, grilled asparagus, tomato confit, shallots, garlic, and parsley.",
      tags: ["Organ meat", "Pan-seared", "Provençal", "Vegetables"],
      allergens: ["None"],
      cuisine: "French"
    },
    es: {
      explanation: "Hígado de ternera sellado con papas pequeñas asadas, espárragos a la parrilla, tomate confitado, chalotes, ajo y perejil.",
      tags: ["Vísceras", "Sellado", "Provenzal", "Vegetales"],
      allergens: ["Ninguno"],
      cuisine: "Francés"
    },
    zh: {
      explanation: "煎小牛肝配烤小土豆、烤芦笋、番茄蜜饯、青葱、大蒜和香菜。",
      tags: ["内脏", "煎制", "普罗旺斯风味", "蔬菜"],
      allergens: ["无"],
      cuisine: "法式"
    },
    fr: {
      explanation: "Foie de veau poêlé avec grenailles rôties, asperges grillées, tomate confite, échalotes, ail et persil.",
      tags: ["Abats", "Poêlé", "Provençal", "Légumes"],
      allergens: ["Aucun"],
      cuisine: "Français"
    }
  },
  "ESCARGOTS DE BOURGOGNE": {
    en: {
      explanation: "Six Burgundy snails baked in shells with garlic, parsley, and butter sauce - a classic French appetizer.",
      tags: ["Snails", "Appetizer", "Baked", "Traditional", "Garlic butter"],
      allergens: ["Dairy", "Mollusks"],
      cuisine: "French"
    },
    es: {
      explanation: "Seis caracoles de Borgoña horneados en sus conchas con salsa de ajo, perejil y mantequilla - un aperitivo francés clásico.",
      tags: ["Caracoles", "Aperitivo", "Horneado", "Tradicional", "Mantequilla al ajo"],
      allergens: ["Lácteos", "Moluscos"],
      cuisine: "Francés"
    },
    zh: {
      explanation: "六只勃艮第蜗牛，在壳中烘烤，配大蒜、香菜和黄油酱 - 经典法式开胃菜。",
      tags: ["蜗牛", "开胃菜", "烘烤", "传统", "蒜蓉黄油"],
      allergens: ["乳制品", "软体动物"],
      cuisine: "法式"
    },
    fr: {
      explanation: "Six escargots de Bourgogne cuits au four dans leurs coquilles avec ail, persil et beurre - un classique apéritif français.",
      tags: ["Escargots", "Entrée", "Cuit au four", "Traditionnel", "Beurre à l'ail"],
      allergens: ["Produits laitiers", "Mollusques"],
      cuisine: "Français"
    }
  },
  "COCKTAIL DE CREVETTES CLASSIQUE": {
    en: {
      explanation: "Fresh jumbo shrimp served chilled with classic cocktail sauce and lemon wedges.",
      tags: ["Shrimp", "Appetizer", "Cold", "Classic", "Seafood"],
      allergens: ["Shellfish"],
      cuisine: "French"
    },
    es: {
      explanation: "Langostinos jumbo frescos servidos fríos con salsa de cóctel clásica y gajos de limón.",
      tags: ["Langostinos", "Aperitivo", "Frío", "Clásico", "Mariscos"],
      allergens: ["Mariscos"],
      cuisine: "Francés"
    },
    zh: {
      explanation: "新鲜大虾冷盘，配经典鸡尾酒酱和柠檬角。",
      tags: ["虾", "开胃菜", "冷盘", "经典", "海鲜"],
      allergens: ["贝类"],
      cuisine: "法式"
    },
    fr: {
      explanation: "Grosses crevettes fraîches servies froides avec sauce cocktail classique et quartiers de citron.",
      tags: ["Crevettes", "Entrée", "Froid", "Classique", "Fruits de mer"],
      allergens: ["Fruits de mer"],
      cuisine: "Français"
    }
  }
};

interface DishExplanation {
  explanation: string;
  tags: string[];
  allergens: string[];
  cuisine: string;
}

interface ExplanationState {
  [dishName: string]: {
    [language: string]: DishExplanation;
  };
}

interface DemoSectionProps {
  selectedLanguage?: string;
}

const DemoSection: React.FC<DemoSectionProps> = ({ selectedLanguage = 'en' }) => {
  const [clickedDishes, setClickedDishes] = useState<Set<string>>(new Set());
  const [loadingDishes, setLoadingDishes] = useState<Set<string>>(new Set());
  const [explanations, setExplanations] = useState<ExplanationState>(SAMPLE_EXPLANATIONS);
  const [currentLanguage, setCurrentLanguage] = useState(selectedLanguage);

  const handleDishClick = async (dishName: string) => {
    if (clickedDishes.has(dishName) || loadingDishes.has(dishName)) return;

    // Add to loading state
    setLoadingDishes(prev => new Set(prev).add(dishName));

    // Simulate 1 second delay
    setTimeout(() => {
      setClickedDishes(prev => new Set(prev).add(dishName));
      setLoadingDishes(prev => {
        const newSet = new Set(prev);
        newSet.delete(dishName);
        return newSet;
      });
    }, 1000);
  };

  const getDishExplanation = (dishName: string): DishExplanation | null => {
    const dishExplanations = explanations[dishName];
    if (!dishExplanations) return null;
    return dishExplanations[currentLanguage] || dishExplanations['en'] || null;
  };

  const formatTags = (tags: string[]): string => {
    return tags.join(' • ');
  };

  const formatAllergens = (allergens: string[]): string => {
    if (allergens.length === 0 || (allergens.length === 1 && allergens[0] === "None")) {
      return currentLanguage === 'en' ? 'No common allergens' :
             currentLanguage === 'es' ? 'Sin alérgenos comunes' :
             currentLanguage === 'zh' ? '无常见过敏原' :
             'Aucun allergène commun';
    }
    return allergens.join(', ');
  };

  const getLanguageLabel = (lang: string): string => {
    const labels = {
      'en': 'English',
      'es': 'Español', 
      'zh': '中文',
      'fr': 'Français'
    };
    return labels[lang as keyof typeof labels] || lang;
  };

  return (
    <section className="py-16 bg-gradient-to-br from-cream-50 to-cream-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-charcoal-800 mb-4">
            See How It Works
          </h2>
          <p className="text-lg text-charcoal-600 max-w-2xl mx-auto">
            Watch our AI analyze a real French menu in real-time. Click on any dish to get instant explanations, ingredients, and allergen information.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start max-w-7xl mx-auto">
          {/* Desktop: Menu Image, Mobile: Hidden */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-2xl shadow-brutal p-8">
              <h3 className="text-2xl font-bold text-charcoal-800 mb-6 text-center">
                Original Menu
              </h3>
              <div className="relative overflow-hidden rounded-xl">
                <img 
                  src="/api/placeholder/600/800" 
                  alt="French Restaurant Menu"
                  className="w-full h-auto object-cover"
                  style={{
                    background: `url("data:image/svg+xml,${encodeURIComponent(`
                      <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg">
                        <rect width="600" height="800" fill="#f8f6f1"/>
                        <text x="300" y="50" font-family="serif" font-size="24" font-weight="bold" text-anchor="middle" fill="#2d3748">BRASSERIE FRANÇAISE</text>
                        
                        <!-- LES SOUPES Section -->
                        <text x="50" y="100" font-family="serif" font-size="18" font-weight="bold" fill="#1a365d">- LES SOUPES -</text>
                        <text x="50" y="125" font-family="serif" font-size="12" fill="#2d3748">ESCAROLE ET HARICOTS 6</text>
                        <text x="50" y="140" font-family="serif" font-size="10" fill="#4a5568">Escarole, Beans, Fresh Parmesan</text>
                        
                        <text x="50" y="170" font-family="serif" font-size="12" fill="#2d3748">À L'OIGNON 7</text>
                        <text x="50" y="185" font-family="serif" font-size="10" fill="#4a5568">Classic French Onion Soup</text>
                        
                        <text x="50" y="215" font-family="serif" font-size="12" fill="#2d3748">LENTILLES 6</text>
                        <text x="50" y="230" font-family="serif" font-size="10" fill="#4a5568">Classic French Lentils</text>
                        
                        <!-- POUR COMMENCER Section -->
                        <text x="50" y="270" font-family="serif" font-size="18" font-weight="bold" fill="#1a365d">- POUR COMMENCER -</text>
                        <text x="50" y="295" font-family="serif" font-size="12" fill="#2d3748">ESCARGOTS DE BOURGOGNE 7</text>
                        <text x="50" y="310" font-family="serif" font-size="10" fill="#4a5568">1/2 dz Burgundy Snails, Garlic Parsley Butter Sauce</text>
                        
                        <text x="50" y="340" font-family="serif" font-size="12" fill="#2d3748">COCKTAIL DE CREVETTES CLASSIQUE 12</text>
                        <text x="50" y="355" font-family="serif" font-size="10" fill="#4a5568">Classic Jumbo Shrimp Cocktail</text>
                        
                        <!-- LES PLATS Section -->
                        <text x="320" y="100" font-family="serif" font-size="18" font-weight="bold" fill="#1a365d">- LES PLATS -</text>
                        <text x="320" y="125" font-family="serif" font-size="12" fill="#2d3748">STEAK D'ESPADON AU POIVRE VERT, FRITES 24</text>
                        <text x="320" y="140" font-family="serif" font-size="10" fill="#4a5568">Pan-Seared North Atlantic Sword Fish Steak, GreenPeppercorn Sauce,</text>
                        <text x="320" y="155" font-family="serif" font-size="10" fill="#4a5568">Haricots Verts, Garlic Fries</text>
                        
                        <text x="320" y="185" font-family="serif" font-size="12" fill="#2d3748">COQ AU VIN, PÂTES FRAÎCHES 18</text>
                        <text x="320" y="200" font-family="serif" font-size="10" fill="#4a5568">Braised Organic Chicken In A Cabernet Wine Sauce, Mushrooms,</text>
                        <text x="320" y="215" font-family="serif" font-size="10" fill="#4a5568">Carrots, Pearl Onions, With Fresh Fettuccine</text>
                        
                        <text x="320" y="245" font-family="serif" font-size="12" fill="#2d3748">OSSO BUCO D'AGNEAU À LA PROVENÇALE 22</text>
                        <text x="320" y="260" font-family="serif" font-size="10" fill="#4a5568">Braised Lamb Shank, Spicy Harissa Jus, Gratin Dauphinois, Ratatouille</text>
                        
                        <!-- LES CLASSIQUES Section -->
                        <text x="320" y="310" font-family="serif" font-size="18" font-weight="bold" fill="#1a365d">- LES CLASSIQUES -</text>
                        <text x="320" y="335" font-family="serif" font-size="12" fill="#2d3748">CHOUCROUTE GARNIE ALSACIENNE 22</text>
                        <text x="320" y="350" font-family="serif" font-size="10" fill="#4a5568">Alsacian Stew Of Imported French Sausages, Charcuterie And</text>
                        <text x="320" y="365" font-family="serif" font-size="10" fill="#4a5568">Homemade Sauerkraut</text>
                        
                        <text x="320" y="395" font-family="serif" font-size="12" fill="#2d3748">CASSOULET TOULOUSAIN 22</text>
                        <text x="320" y="410" font-family="serif" font-size="10" fill="#4a5568">Slow-Cooked Casserole Of White Beans, Duck Confit, Imported</text>
                        <text x="320" y="425" font-family="serif" font-size="10" fill="#4a5568">Lyonnaise Organic Sausages And Pork</text>
                        
                        <text x="320" y="455" font-family="serif" font-size="12" fill="#2d3748">FOIE DE VEAU À LA PROVENÇALE 16</text>
                        <text x="320" y="470" font-family="serif" font-size="10" fill="#4a5568">Pan Seared Calf's Liver, Roasted Grenailles Potatoes, Grilled Asparagus,</text>
                        <text x="320" y="485" font-family="serif" font-size="10" fill="#4a5568">Tomate Confit, Shallots, Garlic, Parsley</text>
                        
                        <!-- Decorative border -->
                        <rect x="20" y="20" width="560" height="760" fill="none" stroke="#8b4513" stroke-width="2"/>
                        <rect x="30" y="30" width="540" height="740" fill="none" stroke="#8b4513" stroke-width="1"/>
                      </svg>
                    `)}")`
                  }}
                />
              </div>
            </div>
          </div>

          {/* iPhone Frame with Menu Results */}
          <div className="flex justify-center lg:justify-start">
            <div className="relative">
              {/* iPhone Frame */}
              <div className="relative bg-black rounded-[3rem] p-2 shadow-2xl" style={{ width: '375px', height: '812px' }}>
                {/* Screen */}
                <div className="bg-white rounded-[2.5rem] w-full h-full overflow-hidden relative">
                  {/* Status Bar */}
                  <div className="bg-white px-6 py-3 flex justify-between items-center text-black text-sm font-medium">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-black rounded-full"></div>
                        <div className="w-1 h-1 bg-black rounded-full"></div>
                        <div className="w-1 h-1 bg-black rounded-full"></div>
                        <div className="w-1 h-1 bg-black rounded-full"></div>
                      </div>
                      <svg className="w-6 h-4 ml-1" viewBox="0 0 24 16" fill="none">
                        <rect x="1" y="3" width="22" height="10" rx="2" stroke="black" strokeWidth="1" fill="none"/>
                        <rect x="2" y="4" width="18" height="8" fill="black" rx="1"/>
                        <rect x="23" y="6" width="1" height="4" fill="black" rx="0.5"/>
                      </svg>
                    </div>
                  </div>

                  {/* App Content */}
                  <div className="flex-1 overflow-hidden bg-gradient-to-br from-cream-50 to-cream-100">
                    {/* Header */}
                    <div className="bg-white shadow-sm px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h1 className="text-lg font-bold text-charcoal-800">Menu Results</h1>
                        <div className="flex items-center gap-2">
                          <select 
                            value={currentLanguage}
                            onChange={(e) => setCurrentLanguage(e.target.value)}
                            className="text-sm border border-gray-300 rounded-lg px-2 py-1 bg-white"
                          >
                            <option value="en">🇺🇸 EN</option>
                            <option value="es">🇪🇸 ES</option>
                            <option value="zh">🇨🇳 ZH</option>
                            <option value="fr">🇫🇷 FR</option>
                          </select>
                        </div>
                      </div>
                      
                      {/* Restaurant Info */}
                      <div className="mt-2 text-center">
                        <h2 className="text-lg font-semibold text-charcoal-700">{SAMPLE_MENU_DATA.restaurant.name}</h2>
                        <span className="inline-block bg-teal-100 text-teal-800 px-2 py-1 rounded-full text-xs font-medium">
                          {SAMPLE_MENU_DATA.restaurant.cuisine} Cuisine
                        </span>
                      </div>
                    </div>

                    {/* Scrollable Menu Results */}
                    <div className="flex-1 overflow-y-auto p-4" style={{ height: 'calc(100vh - 200px)' }}>
                      <div className="space-y-3">
                        {SAMPLE_MENU_DATA.dishes.map((dish, index) => {
                          const isClicked = clickedDishes.has(dish.name);
                          const isLoading = loadingDishes.has(dish.name);
                          const explanation = getDishExplanation(dish.name);

                          return (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                              {/* Dish Header */}
                              <div 
                                className={`p-4 cursor-pointer transition-all duration-200 ${
                                  isLoading ? 'bg-gray-50' : 'hover:bg-gray-50'
                                }`}
                                onClick={() => handleDishClick(dish.name)}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1 pr-3">
                                    <h3 className="font-semibold text-charcoal-800 text-sm leading-snug">
                                      {dish.name}
                                    </h3>
                                    <p className="text-xs text-charcoal-600 mt-1 opacity-75">
                                      {dish.description}
                                    </p>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <span className="text-lg font-bold text-coral-600">${dish.price}</span>
                                    <div className="mt-1">
                                      {isLoading ? (
                                        <div className="animate-spin w-4 h-4 border-2 border-coral-500 border-t-transparent rounded-full"></div>
                                      ) : isClicked ? (
                                        <div className="w-4 h-4 bg-teal-500 rounded-full flex items-center justify-center">
                                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                          </svg>
                                        </div>
                                      ) : (
                                        <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Explanation */}
                              {isClicked && explanation && (
                                <div className="border-t border-gray-200 bg-gray-50 p-4 animate-fadeIn">
                                  <div className="space-y-3">
                                    <p className="text-sm text-charcoal-700 leading-relaxed">
                                      {explanation.explanation}
                                    </p>
                                    
                                    <div className="flex flex-wrap gap-1">
                                      {explanation.tags.map((tag, tagIndex) => (
                                        <span 
                                          key={tagIndex}
                                          className="inline-block bg-teal-100 text-teal-800 px-2 py-1 rounded-full text-xs font-medium"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                    
                                    <div className="text-xs text-charcoal-600">
                                      <span className="font-medium">
                                        {currentLanguage === 'en' ? 'Allergens:' :
                                         currentLanguage === 'es' ? 'Alérgenos:' :
                                         currentLanguage === 'zh' ? '过敏原:' :
                                         'Allergènes:'}
                                      </span>
                                      <span className="ml-1">{formatAllergens(explanation.allergens)}</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Bottom spacing for scroll */}
                      <div className="h-20"></div>
                    </div>
                  </div>
                </div>

                {/* Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-lg text-charcoal-600 mb-6">
            Ready to try it with your own menu?
          </p>
          <button 
            onClick={() => document.getElementById('hero-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-coral-500 hover:bg-coral-600 text-white px-8 py-3 rounded-full font-semibold text-lg transition-colors duration-200 shadow-brutal hover:shadow-brutal-hover transform hover:scale-105"
          >
            Upload Your Menu
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </section>
  );
};

export default DemoSection;
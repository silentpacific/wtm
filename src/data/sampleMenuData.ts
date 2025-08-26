// Sample menu data for the 4 demo restaurants
// This data structure matches the RestaurantMenuPage component interface

export const sampleMenuData = {
  // Sample Menu 1: Bella Vista Italian
  menu1: {
    restaurantName: {
      en: "Bella Vista Italian",
      zh: "贝拉维斯塔意大利餐厅",
      es: "Bella Vista Italiano",
      fr: "Bella Vista Italien"
    },
    menuItems: [
      // APPETIZERS
      {
        id: "appetizer-1",
        section: "Appetizers",
        name: {
          en: "Bruschetta Classica",
          zh: "经典布鲁斯凯塔",
          es: "Bruschetta Clásica",
          fr: "Bruschetta Classique"
        },
        description: {
          en: "Grilled bread topped with fresh tomatoes, garlic, basil and olive oil",
          zh: "烤面包配新鲜番茄、大蒜、罗勒和橄榄油",
          es: "Pan tostado con tomates frescos, ajo, albahaca y aceite de oliva",
          fr: "Pain grillé garni de tomates fraîches, ail, basilic et huile d'olive"
        },
        price: 8.99,
        allergens: ["Gluten", "Garlic"],
        dietaryTags: ["Vegetarian", "Vegan"],
        explanation: {
          en: "A classic Italian appetizer featuring crispy bread rubbed with garlic and topped with a mixture of diced tomatoes, fresh basil, and extra virgin olive oil. Simple yet bursting with authentic Mediterranean flavors.",
          zh: "经典意大利开胃菜，酥脆面包涂抹大蒜，配上番茄丁、新鲜罗勒和特级初榨橄榄油。简单却充满正宗地中海风味。",
          es: "Un aperitivo italiano clásico con pan crujiente frotado con ajo y cubierto con una mezcla de tomates en cubitos, albahaca fresca y aceite de oliva extra virgen.",
          fr: "Un apéritif italien classique avec du pain croustillant frotté à l'ail et garni d'un mélange de tomates en dés, basilic frais et huile d'olive extra vierge."
        }
      },
      {
        id: "appetizer-2",
        section: "Appetizers", 
        name: {
          en: "Antipasto Platter",
          zh: "意式拼盘",
          es: "Plato de Antipasto",
          fr: "Plateau d'Antipasti"
        },
        description: {
          en: "Selection of cured meats, cheeses, olives, and marinated vegetables",
          zh: "精选腌制肉类、奶酪、橄榄和腌制蔬菜",
          es: "Selección de embutidos, quesos, aceitunas y verduras marinadas",
          fr: "Sélection de charcuteries, fromages, olives et légumes marinés"
        },
        price: 16.99,
        allergens: ["Dairy", "Sulfites", "Pork"],
        dietaryTags: [],
        explanation: {
          en: "A traditional Italian sharing platter featuring an assortment of premium cured meats like prosciutto and salami, aged cheeses, mixed olives, roasted peppers, and artichoke hearts.",
          zh: "传统意大利分享拼盘，包含各种优质腌制肉类如火腿和萨拉米、陈年奶酪、混合橄榄、烤辣椒和朝鲜蓟心。",
          es: "Un plato tradicional italiano para compartir con una selección de embutidos premium como prosciutto y salami, quesos curados, aceitunas mixtas y corazones de alcachofa.",
          fr: "Un plateau de partage italien traditionnel avec un assortiment de charcuteries premium comme le prosciutto et salami, fromages affinés, olives mélangées et cœurs d'artichaut."
        }
      },
      
      // PASTA
      {
        id: "pasta-1",
        section: "Pasta",
        name: {
          en: "Spaghetti Carbonara",
          zh: "培根蛋意面",
          es: "Espaguetis Carbonara", 
          fr: "Spaghetti Carbonara"
        },
        description: {
          en: "Classic Roman pasta with eggs, pecorino cheese, pancetta and black pepper",
          zh: "经典罗马面条配鸡蛋、佩科里诺奶酪、培根和黑胡椒",
          es: "Pasta romana clásica con huevos, queso pecorino, pancetta y pimienta negra",
          fr: "Pâtes romaines classiques aux œufs, fromage pecorino, pancetta et poivre noir"
        },
        price: 18.99,
        allergens: ["Gluten", "Eggs", "Dairy", "Pork"],
        dietaryTags: [],
        explanation: {
          en: "An authentic Roman dish made with al dente spaghetti tossed with crispy pancetta, creamy egg yolk sauce, aged pecorino Romano cheese, and freshly cracked black pepper. No cream used - just tradition!",
          zh: "正宗罗马菜，用煮得恰到好处的意面配酥脆培根、奶油蛋黄酱、陈年佩科里诺罗马奶酪和新鲜黑胡椒。不用奶油 - 只有传统！",
          es: "Un plato romano auténtico hecho con espaguetis al dente mezclados con pancetta crujiente, salsa cremosa de yema de huevo, queso pecorino Romano añejo y pimienta negra recién molida.",
          fr: "Un plat romain authentique fait avec des spaghetti al dente mélangés avec de la pancetta croustillante, sauce crémeuse au jaune d'œuf, fromage pecorino Romano vieilli et poivre noir fraîchement moulu."
        }
      },
      {
        id: "pasta-2",
        section: "Pasta",
        name: {
          en: "Penne Arrabbiata",
          zh: "愤怒笔管面",
          es: "Penne Arrabbiata",
          fr: "Penne Arrabbiata"
        },
        description: {
          en: "Spicy tomato sauce with garlic, red chili peppers and fresh herbs",
          zh: "辣番茄酱配大蒜、红辣椒和新鲜香草",
          es: "Salsa de tomate picante con ajo, chiles rojos y hierbas frescas",
          fr: "Sauce tomate épicée à l'ail, piments rouges et herbes fraîches"
        },
        price: 15.99,
        allergens: ["Gluten"],
        dietaryTags: ["Vegetarian", "Vegan", "Spicy"],
        explanation: {
          en: "A fiery Italian classic meaning \"angry\" pasta, featuring penne tubes coated in a vibrant tomato sauce infused with garlic, crushed red peppers, and fresh parsley. Perfect for spice lovers!",
          zh: "火辣的意大利经典菜，意为\"愤怒\"意面，笔管面涂抹鲜艳的番茄酱，注入大蒜、碎红辣椒和新鲜欧芹。非常适合喜欢辣味的人！",
          es: "Un clásico italiano picante que significa pasta \"enojada\", con penne cubierto en una salsa de tomate vibrante infundida con ajo, pimientos rojos triturados y perejil fresco.",
          fr: "Un classique italien épicé signifiant pâtes \"en colère\", avec des penne enrobées d'une sauce tomate vibrante infusée à l'ail, piments rouges broyés et persil frais."
        }
      },

      // PIZZA
      {
        id: "pizza-1", 
        section: "Pizza",
        name: {
          en: "Margherita",
          zh: "玛格丽特披萨",
          es: "Pizza Margherita",
          fr: "Pizza Margherita"
        },
        description: {
          en: "San Marzano tomatoes, fresh mozzarella, basil, extra virgin olive oil",
          zh: "圣马尔扎诺番茄、新鲜马苏里拉奶酪、罗勒、特级初榨橄榄油",
          es: "Tomates San Marzano, mozzarella fresca, albahaca, aceite de oliva extra virgen",
          fr: "Tomates San Marzano, mozzarella fraîche, basilic, huile d'olive extra vierge"
        },
        price: 19.99,
        allergens: ["Gluten", "Dairy"],
        dietaryTags: ["Vegetarian"],
        explanation: {
          en: "The queen of pizzas! A Neapolitan classic topped with sweet San Marzano tomatoes, creamy buffalo mozzarella, fresh basil leaves, and a drizzle of extra virgin olive oil on thin, crispy crust.",
          zh: "披萨女王！那不勒斯经典披萨，配甜美的圣马尔扎诺番茄、奶油水牛马苏里拉奶酪、新鲜罗勒叶，在薄脆饼皮上淋上特级初榨橄榄油。",
          es: "¡La reina de las pizzas! Un clásico napolitano cubierto con tomates San Marzano dulces, mozzarella de búfala cremosa, hojas de albahaca fresca y aceite de oliva extra virgen.",
          fr: "La reine des pizzas ! Un classique napolitain garni de tomates San Marzano sucrées, mozzarella de bufflonne crémeuse, feuilles de basilic frais et huile d'olive extra vierge."
        }
      },
      {
        id: "pizza-2",
        section: "Pizza", 
        name: {
          en: "Quattro Formaggi",
          zh: "四奶酪披萨",
          es: "Pizza Cuatro Quesos",
          fr: "Pizza Quatre Fromages"
        },
        description: {
          en: "Mozzarella, gorgonzola, parmesan, and ricotta cheese on white base",
          zh: "白底披萨配马苏里拉、戈尔根朱拉、帕尔马干酪和里科塔奶酪",
          es: "Mozzarella, gorgonzola, parmesano y queso ricotta sobre base blanca",
          fr: "Mozzarella, gorgonzola, parmesan et ricotta sur base blanche"
        },
        price: 22.99,
        allergens: ["Gluten", "Dairy"],
        dietaryTags: ["Vegetarian"],
        explanation: {
          en: "A cheese lover's dream! Four premium Italian cheeses - mild mozzarella, tangy gorgonzola, sharp parmesan, and creamy ricotta - melted together on a white sauce base for ultimate indulgence.",
          zh: "奶酪爱好者的梦想！四种优质意大利奶酪 - 温和的马苏里拉、浓郁的戈尔根朱拉、尖锐的帕尔马干酪和奶油里科塔 - 在白酱底上融化在一起，极致享受。",
          es: "¡El sueño de los amantes del queso! Cuatro quesos italianos premium - mozzarella suave, gorgonzola picante, parmesano fuerte y ricotta cremosa - derretidos juntos sobre base de salsa blanca.",
          fr: "Le rêve des amateurs de fromage ! Quatre fromages italiens premium - mozzarella douce, gorgonzola piquant, parmesan fort et ricotta crémeuse - fondus ensemble sur une base de sauce blanche."
        }
      }
    ],
    sections: {
      en: ["Appetizers", "Pasta", "Pizza"],
      zh: ["开胃菜", "意面", "披萨"],
      es: ["Aperitivos", "Pasta", "Pizza"], 
      fr: ["Apéritifs", "Pâtes", "Pizza"]
    }
  },

  // Sample Menu 2: Tokyo Sushi Bar
  menu2: {
    restaurantName: {
      en: "Tokyo Sushi Bar",
      zh: "东京寿司吧",
      es: "Bar de Sushi Tokyo",
      fr: "Bar à Sushi Tokyo"
    },
    menuItems: [
      // SASHIMI
      {
        id: "sashimi-1",
        section: "Sashimi",
        name: {
          en: "Salmon Sashimi",
          zh: "三文鱼刺身",
          es: "Sashimi de Salmón",
          fr: "Sashimi de Saumon"
        },
        description: {
          en: "Fresh Atlantic salmon, thinly sliced, served with wasabi and soy sauce",
          zh: "新鲜大西洋三文鱼，切成薄片，配芥末和酱油",
          es: "Salmón atlántico fresco, cortado finamente, servido con wasabi y salsa de soja",
          fr: "Saumon atlantique frais, tranché finement, servi avec wasabi et sauce soja"
        },
        price: 14.99,
        allergens: ["Fish", "Soy"],
        dietaryTags: ["Gluten-Free"],
        explanation: {
          en: "Premium grade Atlantic salmon, expertly sliced to showcase the fish's natural marbling and buttery texture. Served with traditional accompaniments of wasabi, pickled ginger, and premium soy sauce.",
          zh: "优质大西洋三文鱼，专业切片展示鱼类天然大理石纹理和黄油质地。配传统芥末、腌姜和优质酱油。",
          es: "Salmón atlántico de grado premium, cortado expertamente para mostrar el marmoleo natural y textura mantecosa del pescado. Servido con acompañamientos tradicionales.",
          fr: "Saumon atlantique de qualité premium, tranché expertement pour révéler le persillage naturel et la texture beurrée du poisson. Servi avec les accompagnements traditionnels."
        }
      },
      {
        id: "sashimi-2",
        section: "Sashimi",
        name: {
          en: "Tuna Sashimi",
          zh: "金枪鱼刺身", 
          es: "Sashimi de Atún",
          fr: "Sashimi de Thon"
        },
        description: {
          en: "Yellowfin tuna, sushi-grade, with traditional accompaniments",
          zh: "黄鳍金枪鱼，寿司级，配传统佐料",
          es: "Atún aleta amarilla, grado sushi, con acompañamientos tradicionales",
          fr: "Thon albacore, qualité sushi, avec accompagnements traditionnels"
        },
        price: 16.99,
        allergens: ["Fish", "Soy"],
        dietaryTags: ["Gluten-Free"],
        explanation: {
          en: "Sushi-grade yellowfin tuna with a deep red color and clean, oceanic flavor. Cut against the grain to ensure the perfect texture and served at optimal temperature for the best sashimi experience.",
          zh: "寿司级黄鳍金枪鱼，深红色，清爽的海洋风味。逆纹切割确保完美质地，在最佳温度下提供最佳刺身体验。",
          es: "Atún aleta amarilla grado sushi con color rojo profundo y sabor oceánico limpio. Cortado contra la veta para asegurar la textura perfecta.",
          fr: "Thon albacore qualité sushi avec une couleur rouge profonde et une saveur océanique pure. Coupé contre le grain pour assurer la texture parfaite."
        }
      },

      // SUSHI ROLLS
      {
        id: "roll-1",
        section: "Sushi Rolls",
        name: {
          en: "California Roll",
          zh: "加州卷",
          es: "Rollo California",
          fr: "Rouleau California"
        },
        description: {
          en: "Crab, avocado, cucumber, sesame seeds, with spicy mayo",
          zh: "蟹肉、牛油果、黄瓜、芝麻，配辣蛋黄酱",
          es: "Cangrejo, aguacate, pepino, semillas de sésamo, con mayo picante",
          fr: "Crabe, avocat, concombre, graines de sésame, avec mayo épicée"
        },
        price: 12.99,
        allergens: ["Shellfish", "Eggs", "Sesame", "Soy"],
        dietaryTags: [],
        explanation: {
          en: "The classic American-style sushi roll featuring sweet crab meat, creamy avocado, and crisp cucumber wrapped in seasoned sushi rice and nori, topped with sesame seeds and served with spicy mayo.",
          zh: "经典美式寿司卷，包含甜蟹肉、奶油牛油果和酥脆黄瓜，用调味寿司米和紫菜包裹，撒芝麻，配辣蛋黄酱。",
          es: "El clásico rollo de sushi estilo americano con carne de cangrejo dulce, aguacate cremoso y pepino crujiente envuelto en arroz de sushi sazonado y nori.",
          fr: "Le rouleau de sushi classique de style américain avec de la chair de crabe sucrée, avocat crémeux et concombre croquant enroulé dans du riz à sushi assaisonné et nori."
        }
      },
      {
        id: "roll-2",
        section: "Sushi Rolls",
        name: {
          en: "Spicy Salmon Roll",
          zh: "辣三文鱼卷",
          es: "Rollo de Salmón Picante", 
          fr: "Rouleau de Saumon Épicé"
        },
        description: {
          en: "Fresh salmon, spicy sauce, cucumber, scallions, tobiko",
          zh: "新鲜三文鱼、辣酱、黄瓜、葱、飞鱼子",
          es: "Salmón fresco, salsa picante, pepino, cebolletas, tobiko",
          fr: "Saumon frais, sauce épicée, concombre, échalotes, tobiko"
        },
        price: 13.99,
        allergens: ["Fish", "Eggs", "Soy"],
        dietaryTags: ["Spicy"],
        explanation: {
          en: "Fresh salmon mixed with our signature spicy mayo sauce, cucumber for crunch, scallions for freshness, and topped with orange tobiko (flying fish roe) for a burst of briny flavor.",
          zh: "新鲜三文鱼配我们招牌辣蛋黄酱、黄瓜增加脆度、葱增加新鲜感，顶部撒橙色飞鱼子增加咸鲜味。",
          es: "Salmón fresco mezclado con nuestra salsa mayo picante especial, pepino para el crujiente, cebolletas para frescura, y cubierto con tobiko naranja.",
          fr: "Saumon frais mélangé avec notre sauce mayo épicée signature, concombre pour le croquant, échalotes pour la fraîcheur, et garni de tobiko orange."
        }
      },

      // RAMEN
      {
        id: "ramen-1",
        section: "Ramen",
        name: {
          en: "Tonkotsu Ramen",
          zh: "豚骨拉面",
          es: "Ramen Tonkotsu",
          fr: "Ramen Tonkotsu"
        },
        description: {
          en: "Rich pork bone broth, chashu pork, soft-boiled egg, scallions, nori",
          zh: "浓郁猪骨汤、叉烧肉、溏心蛋、葱、紫菜",
          es: "Caldo rico de hueso de cerdo, cerdo chashu, huevo cocido, cebolletas, nori",
          fr: "Bouillon riche d'os de porc, porc chashu, œuf mollet, échalotes, nori"
        },
        price: 16.99,
        allergens: ["Gluten", "Eggs", "Soy", "Pork"],
        dietaryTags: [],
        explanation: {
          en: "Our signature ramen featuring a creamy, rich pork bone broth simmered for 24 hours, tender chashu pork belly, perfectly soft-boiled egg, fresh scallions, and crisp nori seaweed.",
          zh: "我们的招牌拉面，24小时慢炖的奶油浓郁猪骨汤，嫩滑叉烧五花肉，完美溏心蛋，新鲜葱花和酥脆紫菜。",
          es: "Nuestro ramen característico con caldo cremoso y rico de hueso de cerdo cocido a fuego lento por 24 horas, panceta de cerdo chashu tierna y huevo perfectamente cocido.",
          fr: "Notre ramen signature avec un bouillon crémeux et riche d'os de porc mijoté pendant 24 heures, poitrine de porc chashu tendre et œuf parfaitement mollet."
        }
      },
      {
        id: "ramen-2",
        section: "Ramen",
        name: {
          en: "Vegetable Miso Ramen",
          zh: "蔬菜味噌拉面",
          es: "Ramen Miso Vegetariano",
          fr: "Ramen Miso Végétarien"
        },
        description: {
          en: "Miso broth, seasonal vegetables, tofu, corn, scallions, sesame oil",
          zh: "味噌汤、时令蔬菜、豆腐、玉米、葱、芝麻油",
          es: "Caldo de miso, verduras de temporada, tofu, maíz, cebolletas, aceite de sésamo",
          fr: "Bouillon de miso, légumes de saison, tofu, maïs, échalotes, huile de sésame"
        },
        price: 14.99,
        allergens: ["Gluten", "Soy", "Sesame"],
        dietaryTags: ["Vegetarian", "Vegan"],
        explanation: {
          en: "A hearty plant-based ramen with umami-rich miso broth, seasonal vegetables, silky tofu, sweet corn kernels, fresh scallions, and a drizzle of aromatic sesame oil.",
          zh: "丰盛的植物性拉面，配鲜味浓郁的味噌汤、时令蔬菜、丝滑豆腐、甜玉米粒、新鲜葱花和香芝麻油。",
          es: "Un ramen abundante a base de plantas con caldo de miso rico en umami, verduras de temporada, tofu sedoso, granos de maíz dulce y aceite de sésamo aromático.",
          fr: "Un ramen copieux à base de plantes avec bouillon de miso riche en umami, légumes de saison, tofu soyeux, grains de maïs sucré et huile de sésame aromatique."
        }
      }
    ],
    sections: {
      en: ["Sashimi", "Sushi Rolls", "Ramen"],
      zh: ["刺身", "寿司卷", "拉面"],
      es: ["Sashimi", "Rollos de Sushi", "Ramen"],
      fr: ["Sashimi", "Rouleaux de Sushi", "Ramen"]
    }
  },

  // Sample Menu 3: Garden Bistro (Farm-to-Table)
  menu3: {
    restaurantName: {
      en: "Garden Bistro",
      zh: "花园小酒馆",
      es: "Bistró del Jardín",
      fr: "Bistrot du Jardin"
    },
    menuItems: [
      // SALADS
      {
        id: "salad-1",
        section: "Salads",
        name: {
          en: "Farm Fresh Greens",
          zh: "农场新鲜蔬菜",
          es: "Verduras Frescas de Granja",
          fr: "Légumes Verts de la Ferme"
        },
        description: {
          en: "Mixed organic greens, heirloom tomatoes, cucumber, carrots, house vinaigrette",
          zh: "有机混合蔬菜、传家番茄、黄瓜、胡萝卜、自制醋汁",
          es: "Mezcla de verduras orgánicas, tomates reliquia, pepino, zanahorias, vinagreta casera",
          fr: "Mélange de légumes verts bio, tomates anciennes, concombre, carottes, vinaigrette maison"
        },
        price: 11.99,
        allergens: [],
        dietaryTags: ["Vegetarian", "Vegan", "Gluten-Free", "Organic"],
        explanation: {
          en: "A vibrant salad featuring locally sourced organic mixed greens, colorful heirloom tomatoes, crisp cucumber, shredded carrots, all tossed with our signature house-made vinaigrette.",
          zh: "充满活力的沙拉，配当地采购的有机混合蔬菜、彩色传家番茄、酥脆黄瓜、胡萝卜丝，配我们招牌自制醋汁。",
          es: "Una ensalada vibrante con verduras mixtas orgánicas de origen local, tomates reliquia coloridos, pepino crujiente, zanahorias ralladas, todo mezclado con nuestra vinagreta casera.",
          fr: "Une salade vibrante avec des légumes verts mélangés biologiques locaux, tomates anciennes colorées, concombre croquant, carottes râpées, le tout mélangé avec notre vinaigrette maison."
        }
      },
      {
        id: "salad-2",
        section: "Salads",
        name: {
          en: "Quinoa Power Bowl",
          zh: "藜麦能量碗",
          es: "Bowl de Poder de Quinoa",
          fr: "Bol de Quinoa Énergisant"
        },
        description: {
          en: "Quinoa, roasted vegetables, chickpeas, avocado, tahini dressing",
          zh: "藜麦、烤蔬菜、鹰嘴豆、牛油果、芝麻酱",
          es: "Quinoa, verduras asadas, garbanzos, aguacate, aderezo de tahini",
          fr: "Quinoa, légumes rôtis, pois chiches, avocat, vinaigrette au tahini"
        },
        price: 15.99,
        allergens: ["Sesame"],
        dietaryTags: ["Vegetarian", "Vegan", "Gluten-Free", "High-Protein"],
        explanation: {
          en: "A nutritious and filling bowl with fluffy quinoa, colorful roasted seasonal vegetables, protein-rich chickpeas, creamy avocado, and a nutty tahini dressing for complete satisfaction.",
          zh: "营养丰富的饱腹碗，配蓬松藜麦、彩色烤时令蔬菜、富含蛋白质的鹰嘴豆、奶油牛油果和坚果芝麻酱。",
          es: "Un bowl nutritivo y abundante con quinoa esponjosa, verduras de temporada asadas coloridas, garbanzos ricos en proteína, aguacate cremoso y aderezo de tahini.",
          fr: "Un bol nutritif et rassasiant avec du quinoa moelleux, légumes de saison rôtis colorés, pois chiches riches en protéines, avocat crémeux et vinaigrette au tahini."
        }
      },

      // MAINS
      {
        id: "main-1",
        section: "Main Courses",
        name: {
          en: "Grass-Fed Beef Burger",
          zh: "草饲牛肉汉堡",
          es: "Hamburguesa de Res de Pasto",
          fr: "Burger de Bœuf Nourri à l'Herbe"
        },
        description: {
          en: "Grass-fed beef patty, organic greens, tomato, onion, house-made bun",
          zh: "草饲牛肉饼、有机蔬菜、番茄、洋葱、自制面包",
          es: "Hamburguesa de res de pasto, verduras orgánicas, tomate, cebolla, pan casero",
          fr: "Galette de bœuf nourri à l'herbe, légumes verts bio, tomate, oignon, pain fait maison"
        },
        price: 18.99,
        allergens: ["Gluten", "Dairy"],
        dietaryTags: ["Grass-Fed", "Organic"],
        explanation: {
          en: "Juicy grass-fed beef burger on our house-made brioche bun, topped with organic lettuce, vine-ripened tomatoes, red onion, and served with hand-cut sweet potato fries.",
          zh: "多汁草饲牛肉汉堡配自制蛋奶面包，配有机生菜、藤熟番茄、红洋葱，配手切红薯薯条。",
          es: "Jugosa hamburguesa de res de pasto en nuestro pan brioche casero, cubierta con lechuga orgánica, tomates maduros en la vid, cebolla roja y papas fritas de batata cortadas a mano.",
          fr: "Burger juteux de bœuf nourri à l'herbe sur notre brioche maison, garni de laitue biologique, tomates mûries sur pied, oignon rouge et frites de patate douce coupées à la main."
        }
      },
      {
        id: "main-2",
        section: "Main Courses",
        name: {
          en: "Wild Mushroom Risotto",
          zh: "野生蘑菇烩饭",
          es: "Risotto de Hongos Silvestres",
          fr: "Risotto aux Champignons Sauvages"
        },
        description: {
          en: "Arborio rice, wild mushrooms, parmesan, white wine, herbs",
          zh: "阿尔博里奥大米、野生蘑菇、帕尔马干酪、白酒、香草",
          es: "Arroz arborio, hongos silvestres, parmesano, vino blanco, hierbas",
          fr: "Riz arborio, champignons sauvages, parmesan, vin blanc, herbes"
        },
        price: 19.99,
        allergens: ["Dairy", "Alcohol"],
        dietaryTags: ["Vegetarian"],
        explanation: {
          en: "Creamy arborio rice slowly cooked with a medley of wild mushrooms including shiitake, oyster, and chanterelle, finished with aged parmesan, white wine, and fresh herbs.",
          zh: "奶油阿尔博里奥大米慢煮配野生蘑菇混合包括香菇、牡蛎菇和鸡油菌，配陈年帕尔马干酪、白酒和新鲜香草。",
          es: "Arroz arborio cremoso cocido lentamente con una mezcla de hongos silvestres incluyendo shiitake, ostra y chanterelle, terminado con parmesano añejo, vino blanco y hierbas frescas.",
          fr: "Riz arborio crémeux cuit lentement avec un mélange de champignons sauvages incluant shiitake, pleurote et chanterelle, fini avec du parmesan vieilli, vin blanc et herbes fraîches."
        }
      },

      // DESSERTS  
      {
        id: "dessert-1",
        section: "Desserts",
        name: {
          en: "Seasonal Fruit Tart",
          zh: "时令水果塔",
          es: "Tarta de Fruta de Temporada",
          fr: "Tarte aux Fruits de Saison"
        },
        description: {
          en: "Pastry crust, vanilla custard, fresh seasonal fruits, berry coulis",
          zh: "酥皮、香草蛋挞、新鲜时令水果、浆果果酱",
          es: "Corteza de pastelería, natilla de vainilla, frutas frescas de temporada, coulis de bayas",
          fr: "Pâte feuilletée, crème pâtissière vanille, fruits frais de saison, coulis de baies"
        },
        price: 9.99,
        allergens: ["Gluten", "Eggs", "Dairy"],
        dietaryTags: ["Seasonal"],
        explanation: {
          en: "A beautiful seasonal dessert featuring a buttery pastry crust filled with vanilla custard and topped with the freshest seasonal fruits, finished with a vibrant berry coulis.",
          zh: "美丽的时令甜点，酥脆糕点皮配香草蛋挞，配最新鲜的时令水果，配鲜艳浆果果酱。",
          es: "Un hermoso postre de temporada con una corteza de pastelería mantecosa rellena de natilla de vainilla y cubierta con las frutas más frescas de temporada.",
          fr: "Un beau dessert saisonnier avec une pâte feuilletée beurrée garnie de crème pâtissière vanille et surmontée des fruits de saison les plus frais."
        }
      }
    ],
    sections: {
      en: ["Salads", "Main Courses", "Desserts"],
      zh: ["沙拉", "主菜", "甜点"],
      es: ["Ensaladas", "Platos Principales", "Postres"],
      fr: ["Salades", "Plats Principaux", "Desserts"]
    }
  },

  // Sample Menu 4: Spice Route (Indian)
  menu4: {
    restaurantName: {
      en: "Spice Route",
      zh: "香料之路",
      es: "Ruta de Especias",
      fr: "Route des Épices"
    },
    menuItems: [
      // APPETIZERS
      {
        id: "appetizer-1",
        section: "Appetizers",
        name: {
          en: "Samosa (2 pieces)",
          zh: "萨摩萨（2块）",
          es: "Samosa (2 piezas)",
          fr: "Samosa (2 pièces)"
        },
        description: {
          en: "Crispy pastry filled with spiced potatoes and peas, served with tamarind chutney",
          zh: "酥脆糕点配调味土豆和豌豆，配罗望子酸辣酱",
          es: "Masa crujiente rellena de papas y guisantes especiados, servida con chutney de tamarindo",
          fr: "Pâte croustillante farcie de pommes de terre et petits pois épicés, servie avec chutney de tamarin"
        },
        price: 6.99,
        allergens: ["Gluten"],
        dietaryTags: ["Vegetarian", "Vegan", "Spicy"],
        explanation: {
          en: "Traditional triangular pastries with a golden, flaky exterior and savory filling of spiced potatoes, green peas, and aromatic herbs, served with sweet and tangy tamarind chutney.",
          zh: "传统三角糕点，金黄酥脆外皮，配调味土豆、青豌豆和芳香香草的咸味馅料，配甜酸罗望子酸辣酱。",
          es: "Pasteles triangulares tradicionales con exterior dorado y hojaldrado y relleno salado de papas especiadas, guisantes verdes y hierbas aromáticas.",
          fr: "Pâtisseries triangulaires traditionnelles avec un extérieur doré et feuilleté et une garniture savoureuse de pommes de terre épicées, petits pois verts et herbes aromatiques."
        }
      },
      {
        id: "appetizer-2",
        section: "Appetizers",
        name: {
          en: "Chicken Tikka",
          zh: "印度烤鸡块",
          es: "Pollo Tikka",
          fr: "Poulet Tikka"
        },
        description: {
          en: "Marinated chicken pieces grilled in tandoor, served with mint chutney",
          zh: "腌制鸡块在坦杜炉烤制，配薄荷酸辣酱",
          es: "Trozos de pollo marinados a la parrilla en tandoor, servidos con chutney de menta",
          fr: "Morceaux de poulet marinés grillés au tandoor, servis avec chutney à la menthe"
        },
        price: 9.99,
        allergens: ["Dairy"],
        dietaryTags: ["Gluten-Free", "High-Protein"],
        explanation: {
          en: "Tender chicken pieces marinated in yogurt and aromatic spices, grilled to perfection in our traditional tandoor oven, resulting in smoky, flavorful meat with a beautiful char.",
          zh: "嫩鸡块用酸奶和芳香香料腌制，在传统坦杜炉中烤至完美，产生烟熏、美味的肉类和美丽的焦糖色。",
          es: "Tiernos trozos de pollo marinados en yogur y especias aromáticas, asados a la perfección en nuestro horno tandoor tradicional, resultando en carne ahumada y sabrosa.",
          fr: "Tendres morceaux de poulet marinés dans du yaourt et des épices aromatiques, grillés à la perfection dans notre four tandoor traditionnel, donnant une viande fumée et savoureuse."
        }
      },

      // CURRIES
      {
        id: "curry-1",
        section: "Curries",
        name: {
          en: "Butter Chicken",
          zh: "黄油鸡",
          es: "Pollo Mantequilla",
          fr: "Poulet au Beurre"
        },
        description: {
          en: "Tender chicken in creamy tomato-based sauce with aromatic spices",
          zh: "嫩鸡肉配奶油番茄汁和芳香香料",
          es: "Pollo tierno en salsa cremosa a base de tomate con especias aromáticas",
          fr: "Poulet tendre dans une sauce crémeuse à base de tomate avec épices aromatiques"
        },
        price: 16.99,
        allergens: ["Dairy"],
        dietaryTags: ["Gluten-Free", "Medium Spicy"],
        explanation: {
          en: "The most beloved Indian curry featuring succulent pieces of chicken in a rich, creamy tomato-based sauce infused with butter, cream, and a perfect blend of garam masala spices. Mild and approachable.",
          zh: "最受喜爱的印度咖喱，多汁鸡块配浓郁奶油番茄汁，注入黄油、奶油和完美的印度综合香料。温和易接受。",
          es: "El curry indio más querido con trozos suculentos de pollo en una salsa rica y cremosa a base de tomate infundida con mantequilla, crema y una mezcla perfecta de especias garam masala.",
          fr: "Le curry indien le plus aimé avec des morceaux succulents de poulet dans une sauce riche et crémeuse à base de tomate infusée de beurre, crème et un mélange parfait d'épices garam masala."
        }
      },
      {
        id: "curry-2",
        section: "Curries", 
        name: {
          en: "Vindaloo",
          zh: "文达鲁咖喱",
          es: "Vindaloo",
          fr: "Vindaloo"
        },
        description: {
          en: "Spicy curry with pork, vinegar, garlic, and red chilies - traditional Goan style",
          zh: "辣味咖喱配猪肉、醋、大蒜和红辣椒 - 传统果阿风味",
          es: "Curry picante con cerdo, vinagre, ajo y chiles rojos - estilo tradicional de Goa",
          fr: "Curry épicé avec porc, vinaigre, ail et piments rouges - style traditionnel de Goa"
        },
        price: 17.99,
        allergens: ["Pork"],
        dietaryTags: ["Gluten-Free", "Very Spicy"],
        explanation: {
          en: "A fiery Goan specialty featuring tender pork marinated in vinegar, garlic, and red chilies, slow-cooked in a tangy, intensely spiced sauce. This is our spiciest dish - proceed with caution!",
          zh: "火辣的果阿特色菜，嫩猪肉用醋、大蒜和红辣椒腌制，在酸辣、浓烈调料汁中慢煮。这是我们最辣的菜 - 请小心！",
          es: "Una especialidad ardiente de Goa con cerdo tierno marinado en vinagre, ajo y chiles rojos, cocido lentamente en una salsa ácida e intensamente especiada.",
          fr: "Une spécialité ardente de Goa avec du porc tendre mariné dans du vinaigre, ail et piments rouges, cuit lentement dans une sauce acidulée et intensément épicée."
        }
      },
      {
        id: "curry-3",
        section: "Curries",
        name: {
          en: "Palak Paneer",
          zh: "菠菜芝士咖喱",
          es: "Palak Paneer", 
          fr: "Palak Paneer"
        },
        description: {
          en: "Fresh spinach curry with homemade cottage cheese cubes and aromatic spices",
          zh: "新鲜菠菜咖喱配自制农家奶酪块和芳香香料",
          es: "Curry de espinacas frescas con cubos de queso cottage casero y especias aromáticas",
          fr: "Curry d'épinards frais avec cubes de fromage cottage maison et épices aromatiques"
        },
        price: 14.99,
        allergens: ["Dairy"],
        dietaryTags: ["Vegetarian", "Gluten-Free", "Medium Spicy"],
        explanation: {
          en: "A classic North Indian vegetarian dish featuring fresh spinach puree simmered with cubes of soft, homemade paneer cheese, ginger, garlic, and traditional spices for a wholesome, nutritious meal.",
          zh: "经典北印度素食菜，新鲜菠菜泥配柔软自制印度奶酪块、生姜、大蒜和传统香料，营养丰富的健康餐。",
          es: "Un plato vegetariano clásico del norte de India con puré de espinacas frescas cocido a fuego lento con cubos de queso paneer casero suave, jengibre, ajo y especias tradicionales.",
          fr: "Un plat végétarien classique du nord de l'Inde avec de la purée d'épinards frais mijotée avec des cubes de fromage paneer maison tendre, gingembre, ail et épices traditionnelles."
        }
      },

      // BREADS & RICE
      {
        id: "bread-1",
        section: "Breads & Rice",
        name: {
          en: "Garlic Naan",
          zh: "蒜味印度饼",
          es: "Naan de Ajo",
          fr: "Naan à l'Ail"
        },
        description: {
          en: "Soft leavened bread brushed with garlic butter and fresh herbs",
          zh: "柔软发酵面包刷蒜蓉黄油和新鲜香草",
          es: "Pan suave leudado cepillado con mantequilla de ajo y hierbas frescas",
          fr: "Pain moelleux levé badigeonné de beurre à l'ail et herbes fraîches"
        },
        price: 4.99,
        allergens: ["Gluten", "Dairy", "Eggs"],
        dietaryTags: ["Vegetarian"],
        explanation: {
          en: "Traditional Indian leavened flatbread baked in our tandoor oven, brushed with aromatic garlic butter and sprinkled with fresh cilantro. Perfect for sopping up curry sauces.",
          zh: "传统印度发酵扁面包在坦杜炉烘烤，刷芳香蒜蓉黄油，撒新鲜香菜。非常适合蘸咖喱汁。",
          es: "Pan plano tradicional indio leudado horneado en nuestro horno tandoor, cepillado con mantequilla de ajo aromática y espolvoreado con cilantro fresco.",
          fr: "Pain plat traditionnel indien levé cuit dans notre four tandoor, badigeonné de beurre à l'ail aromatique et saupoudré de coriandre fraîche."
        }
      },
      {
        id: "rice-1",
        section: "Breads & Rice",
        name: {
          en: "Basmati Rice",
          zh: "印度香米",
          es: "Arroz Basmati",
          fr: "Riz Basmati"
        },
        description: {
          en: "Fragrant long-grain basmati rice, steamed to perfection",
          zh: "香喷喷长粒印度香米，蒸至完美",
          es: "Arroz basmati fragante de grano largo, cocido al vapor a la perfección",
          fr: "Riz basmati parfumé à grain long, cuit à la vapeur à la perfection"
        },
        price: 3.99,
        allergens: [],
        dietaryTags: ["Vegetarian", "Vegan", "Gluten-Free"],
        explanation: {
          en: "Premium aged basmati rice known for its distinctive aroma and fluffy texture, steamed with care to complement our rich curries and provide the perfect base for your meal.",
          zh: "优质陈年印度香米，以其独特香味和蓬松质地著称，精心蒸制配我们浓郁咖喱，为您的餐点提供完美基础。",
          es: "Arroz basmati premium envejecido conocido por su aroma distintivo y textura esponjosa, cocido al vapor con cuidado para complementar nuestros ricos currys.",
          fr: "Riz basmati premium vieilli connu pour son arôme distinctif et sa texture moelleuse, cuit à la vapeur avec soin pour compléter nos riches currys."
        }
      }
    ],
    sections: {
      en: ["Appetizers", "Curries", "Breads & Rice"],
      zh: ["开胃菜", "咖喱", "面包和米饭"],
      es: ["Aperitivos", "Currys", "Panes y Arroz"],
      fr: ["Apéritifs", "Currys", "Pains et Riz"]
    }
  }
};

// Export individual menus for easy import
export const bellaVistaMenu = sampleMenuData.menu1;
export const tokyoSushiMenu = sampleMenuData.menu2;
export const gardenBistroMenu = sampleMenuData.menu3;
export const spiceRouteMenu = sampleMenuData.menu4;
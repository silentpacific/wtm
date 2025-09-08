// src/components/menu/WelcomeScreen.tsx
import React from 'react';
import { Info } from 'lucide-react';
import { Language, MenuData } from '../../types/menuTypes';

interface WelcomeScreenProps {
  menuData: MenuData;
  language: Language;
  onNext: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  menuData,
  language,
  onNext
}) => {
  const translations = {
    en: {
      welcome: 'Welcome',
      howItWorks: 'How it works',
      step1: '1. Browse dishes in your language',
      step2: '2. Filter by dietary needs',
      step3: '3. Add items to your order',
      step4: '4. Ask questions to your server',
      step5: '5. Show your final order',
      letsBegin: "Let's Begin",
    },
    zh: {
      welcome: '欢迎',
      howItWorks: '使用方法',
      step1: '1. 用您的语言浏览菜品',
      step2: '2. 按饮食需求筛选',
      step3: '3. 将菜品添加到订单',
      step4: '4. 向服务员提问',
      step5: '5. 展示最终订单',
      letsBegin: '开始使用',
    },
    es: {
      welcome: 'Bienvenido',
      howItWorks: 'Cómo funciona',
      step1: '1. Navega platos en tu idioma',
      step2: '2. Filtra por necesidades dietéticas',
      step3: '3. Agrega elementos a tu pedido',
      step4: '4. Haz preguntas a tu mesero',
      step5: '5. Muestra tu pedido final',
      letsBegin: 'Comencemos',
    },
    fr: {
      welcome: 'Bienvenue',
      howItWorks: 'Comment ça marche',
      step1: '1. Parcourez les plats dans votre langue',
      step2: '2. Filtrez par besoins alimentaires',
      step3: '3. Ajoutez des éléments à votre commande',
      step4: '4. Posez des questions à votre serveur',
      step5: '5. Montrez votre commande finale',
      letsBegin: 'Commençons',
    }
  };

  const t = translations[language];

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
          onClick={onNext}
          className="bg-wtm-primary text-white font-semibold px-12 py-5 rounded-2xl text-lg hover:bg-wtm-primary-600 hover:scale-[1.02] transition-all duration-200 shadow-lg w-full"
        >
          {t.letsBegin}
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
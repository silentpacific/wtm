// src/components/menu/ConfirmedOrderScreen.tsx
import React from 'react';
import { OrderItem, MenuItem, Language } from '../../types/menuTypes';

interface ConfirmedOrderScreenProps {
  orderItems: OrderItem[];
  menuItems: MenuItem[];
  language: Language;
  orderTotal: number;
  onBrowseAgain: () => void;
}

const ConfirmedOrderScreen: React.FC<ConfirmedOrderScreenProps> = ({
  orderItems,
  menuItems,
  language,
  orderTotal,
  onBrowseAgain
}) => {
  const translations = {
    en: {
      confirmedOrder: 'CONFIRMED ORDER',
      showToWaiter: 'SHOW TO SERVER',
      total: 'Total',
      serverResponse: 'Server Response',
      yes: 'Yes',
      no: 'No',
      letMeCheck: 'Let me check',
      browseMenuAgain: 'Browse Menu Again',
      noSpecialRequests: 'No questions',
      contains: 'Contains:',
    },
    zh: {
      confirmedOrder: '已确认订单',
      showToWaiter: '向服务员展示此页面',
      total: '总计',
      serverResponse: '服务员回复',
      yes: '是',
      no: '否',
      letMeCheck: '让我确认',
      browseMenuAgain: '重新浏览菜单',
      noSpecialRequests: '无问题',
      contains: '包含:',
    },
    es: {
      confirmedOrder: 'PEDIDO CONFIRMADO',
      showToWaiter: 'MOSTRAR AL MESERO',
      total: 'Total',
      serverResponse: 'Respuesta del mesero',
      yes: 'Sí',
      no: 'No',
      letMeCheck: 'Déjame verificar',
      browseMenuAgain: 'Ver Menú Otra Vez',
      noSpecialRequests: 'Sin preguntas',
      contains: 'Contiene:',
    },
    fr: {
      confirmedOrder: 'COMMANDE CONFIRMÉE',
      showToWaiter: 'MONTRER AU SERVEUR',
      total: 'Total',
      serverResponse: 'Réponse du serveur',
      yes: 'Oui',
      no: 'Non',
      letMeCheck: 'Laisse-moi vérifier',
      browseMenuAgain: 'Parcourir le Menu',
      noSpecialRequests: 'Aucune question',
      contains: 'Contient:',
    }
  };

  const t = translations[language];

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
              const menuItem = menuItems.find(item => item.id === orderItem.dishId);
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

                  {/* Language-aware Dietary Tags */}
                  {(() => {
                    const currentDietaryTags = menuItem.dietaryTagsI18n?.[language] || menuItem.dietaryTags || [];
                    return currentDietaryTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {currentDietaryTags.map(tag => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Language-aware Allergen Warnings */}
                  {(() => {
                    const currentAllergens = menuItem.allergensI18n?.[language] || menuItem.allergens || [];
                    return currentAllergens.length > 0 && (
                      <div className="mb-3">
                        <span className="text-red-600 font-medium text-sm">
                          ⚠️ {t.contains}{" "}
                          {currentAllergens.join(", ")}
                        </span>
                      </div>
                    );
                  })()}

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

          {/* Order Total */}
          <div className="bg-wtm-bg p-6 m-6 rounded-2xl">
            <div className="flex justify-between items-center text-2xl font-bold">
              <span>{t.total}:</span>
              <span className="text-wtm-primary">
                ${orderTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="p-6">
            <button
              onClick={onBrowseAgain}
              className="bg-wtm-primary text-white font-semibold px-8 py-4 rounded-2xl hover:bg-wtm-primary-600 transition-colors duration-200 w-full text-lg"
            >
              {t.browseMenuAgain}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmedOrderScreen;
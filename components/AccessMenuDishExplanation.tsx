import React from 'react';
import { AccessMenuDish } from '../services/accessMenuService';
import { translateDietaryTag, translateAllergen, formatPrice } from '../services/accessMenuTranslationService';

interface DishExplanationProps {
  dish: AccessMenuDish;
  currentLanguage: string;
  isOpen: boolean;
  onClose: () => void;
}

// Translation dictionary for UI elements
const uiTranslations: Record<string, Record<string, string>> = {
  'description': {
    en: 'Description',
    zh: '描述',
    es: 'Descripción',
    fr: 'Description'
  },
  'whats_this': {
    en: 'What\'s this?',
    zh: '这是什么？',
    es: '¿Qué es esto?',
    fr: 'Qu\'est-ce que c\'est ?'
  },
  'close': {
    en: 'Close',
    zh: '关闭',
    es: 'Cerrar',
    fr: 'Fermer'
  },
  'close_dish_details': {
    en: 'Close dish details',
    zh: '关闭菜品详情',
    es: 'Cerrar detalles del plato',
    fr: 'Fermer les détails du plat'
  },
  'contains_allergens': {
    en: 'Contains Allergens',
    zh: '含有过敏原',
    es: 'Contiene Alérgenos',
    fr: 'Contient des Allergènes'
  },
  'dietary_information': {
    en: 'Dietary Information',
    zh: '饮食信息',
    es: 'Información Dietética',
    fr: 'Information Diététique'
  },
  'need_more_info': {
    en: 'Need more information?',
    zh: '需要更多信息？',
    es: '¿Necesitas más información?',
    fr: 'Besoin de plus d\'informations ?'
  },
  'ask_server_tip': {
    en: 'Ask your server about ingredients, preparation method, or spice level by adding a note when you add this dish to your order.',
    zh: '将此菜品添加到订单时，您可以通过添加备注询问服务员有关食材、制作方法或辣度的问题。',
    es: 'Pregúntale a tu mesero sobre ingredientes, método de preparación o nivel de picante agregando una nota cuando añadas este plato a tu pedido.',
    fr: 'Demandez à votre serveur des informations sur les ingrédients, la méthode de préparation ou le niveau d\'épices en ajoutant une note lorsque vous ajoutez ce plat à votre commande.'
  },
  'tip': {
    en: 'Tip',
    zh: '提示',
    es: 'Consejo',
    fr: 'Conseil'
  },
  'tip_message': {
    en: 'You can add questions or special requests when adding this dish to your order. Your server will be able to answer them directly.',
    zh: '将此菜品添加到订单时，您可以添加问题或特殊要求。您的服务员将能够直接回答。',
    es: 'Puedes agregar preguntas o solicitudes especiales al añadir este plato a tu pedido. Tu mesero podrá responderlas directamente.',
    fr: 'Vous pouvez ajouter des questions ou des demandes spéciales lors de l\'ajout de ce plat à votre commande. Votre serveur pourra y répondre directement.'
  },
  'no_description': {
    en: 'No description available.',
    zh: '暂无描述。',
    es: 'No hay descripción disponible.',
    fr: 'Aucune description disponible.'
  },
  'no_explanation': {
    en: 'No detailed explanation available.',
    zh: '暂无详细说明。',
    es: 'No hay explicación detallada disponible.',
    fr: 'Aucune explication détaillée disponible.'
  },
  'dish_details': {
    en: 'Dish Details',
    zh: '菜品详情',
    es: 'Detalles del Plato',
    fr: 'Détails du Plat'
  }
};

const getTranslation = (key: string, language: string): string => {
  return uiTranslations[key]?.[language] || uiTranslations[key]?.en || key;
};

const AccessMenuDishExplanation: React.FC<DishExplanationProps> = ({
  dish,
  currentLanguage,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-t-lg max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-white rounded-t-lg sticky top-0">
          <h2 className="text-xl font-bold text-gray-900">
            {dish.dish_name[currentLanguage] || dish.dish_name.en || getTranslation('dish_details', currentLanguage)}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:text-gray-700 text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
            aria-label={getTranslation('close_dish_details', currentLanguage)}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Price */}
          <div className="mb-4">
            <span className="text-2xl font-bold text-green-600">
              {formatPrice(dish.price, currentLanguage)}
            </span>
          </div>

          {/* Description */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2 text-gray-900">
              {getTranslation('description', currentLanguage)}
            </h3>
            <p className="text-gray-800 leading-relaxed">
              {dish.description[currentLanguage] || dish.description.en || getTranslation('no_description', currentLanguage)}
            </p>
          </div>

          {/* Detailed Explanation - if available */}
          {dish.explanation && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2 text-gray-900">
                {getTranslation('whats_this', currentLanguage)}
              </h3>
              <p className="text-gray-800 leading-relaxed">
                {dish.explanation[currentLanguage] || dish.explanation.en || getTranslation('no_explanation', currentLanguage)}
              </p>
            </div>
          )}

          {/* If no detailed explanation, provide a helpful message */}
          {!dish.explanation && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-blue-800">
                {getTranslation('need_more_info', currentLanguage)}
              </h3>
              <p className="text-blue-700 text-sm">
                {getTranslation('ask_server_tip', currentLanguage)}
              </p>
            </div>
          )}

          {/* Allergens */}
          {dish.allergens && dish.allergens.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2 text-red-700">
                ⚠️ {getTranslation('contains_allergens', currentLanguage)}
              </h3>
              <div className="flex flex-wrap gap-2">
                {dish.allergens.map(allergen => (
                  <span 
                    key={allergen}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium border border-red-300"
                  >
                    {translateAllergen(allergen, currentLanguage)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Dietary Tags */}
          {dish.dietary_tags && dish.dietary_tags.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2 text-green-700">
                🌱 {getTranslation('dietary_information', currentLanguage)}
              </h3>
              <div className="flex flex-wrap gap-2">
                {dish.dietary_tags.map(tag => (
                  <span 
                    key={tag}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-300"
                  >
                    {translateDietaryTag(tag, currentLanguage)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold mb-2 text-gray-900">
              💡 {getTranslation('tip', currentLanguage)}
            </h3>
            <p className="text-gray-700 text-sm">
              {getTranslation('tip_message', currentLanguage)}
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px]"
          >
            {getTranslation('close', currentLanguage)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessMenuDishExplanation;
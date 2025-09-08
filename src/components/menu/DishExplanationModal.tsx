// src/components/menu/DishExplanationModal.tsx
import React from 'react';
import { X, Plus } from 'lucide-react';
import { MenuItem, Language } from '../../types/menuTypes';

interface DishExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  dish: MenuItem | undefined;
  language: Language;
  onAddToOrder: (dishId: string) => void;
}

const DishExplanationModal: React.FC<DishExplanationModalProps> = ({
  isOpen,
  onClose,
  dish,
  language,
  onAddToOrder
}) => {
  const translations = {
    en: {
      dietaryLabel: "Dietary",
      close: "Close",
      addToOrder: 'Add',
      contains: 'Contains:',
    },
    zh: {
      dietaryLabel: "饮食",
      close: "关闭",
      addToOrder: '添加',
      contains: '包含:',
    },
    es: {
      dietaryLabel: "Dieta",
      close: "Cerrar",
      addToOrder: 'Agregar',
      contains: 'Contiene:',
    },
    fr: {
      dietaryLabel: "Alimentation",
      close: "Fermer",
      addToOrder: 'Ajouter',
      contains: 'Contient:',
    }
  };

  const t = translations[language];

  if (!isOpen || !dish) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-bold text-wtm-text tracking-tight">
            {dish.name[language]}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={24} className="text-wtm-muted" />
          </button>
        </div>
        <p className="text-wtm-muted mb-6 leading-relaxed">
          {dish.explanation[language]}
        </p>
        
        {/* Language-aware Dietary Tags in modal */}
        {(() => {
          const currentDietaryTags = dish.dietaryTagsI18n?.[language] || dish.dietaryTags || [];
          return currentDietaryTags.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-wtm-text mb-2">{t.dietaryLabel}:</p>
              <div className="flex flex-wrap gap-2">
                {currentDietaryTags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Language-aware Allergens in modal */}
        {(() => {
          const currentAllergens = dish.allergensI18n?.[language] || dish.allergens || [];
          return currentAllergens.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-semibold text-wtm-text mb-2">{t.contains}</p>
              <div className="flex flex-wrap gap-2">
                {currentAllergens.map(allergen => (
                  <span key={allergen} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                    {allergen}
                  </span>
                ))}
              </div>
            </div>
          );
        })()}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-100 text-wtm-text rounded-xl hover:bg-gray-200 transition-colors font-medium"
          >
            {t.close}
          </button>
          <button
            onClick={() => onAddToOrder(dish.id)}
            className="flex-1 bg-wtm-primary text-white font-semibold px-4 py-3 rounded-xl hover:bg-wtm-primary-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            {t.addToOrder}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DishExplanationModal;
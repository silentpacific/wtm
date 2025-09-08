// src/components/menu/FilterPanel.tsx
import React from 'react';
import { X } from 'lucide-react';
import { Language } from '../../types/menuTypes';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  allDietaryTags: string[];
  allAllergens: string[];
  dietaryFilters: string[];
  allergenExclusions: string[];
  onSetDietaryFilters: (filters: string[]) => void;
  onSetAllergenExclusions: (exclusions: string[]) => void;
  onClearAllFilters: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  isOpen,
  onClose,
  language,
  allDietaryTags,
  allAllergens,
  dietaryFilters,
  allergenExclusions,
  onSetDietaryFilters,
  onSetAllergenExclusions,
  onClearAllFilters
}) => {
  const translations = {
    en: {
      filters: 'Filters',
      showOnly: 'Show only:',
      hideWith: 'Hide dishes with:',
      applyFilters: 'Apply Filters',
      clearFilters: 'Clear All',
    },
    zh: {
      filters: '筛选',
      showOnly: '仅显示:',
      hideWith: '隐藏包含以下内容的菜品:',
      applyFilters: '应用筛选',
      clearFilters: '清除所有',
    },
    es: {
      filters: 'Filtros',
      showOnly: 'Mostrar solo:',
      hideWith: 'Ocultar platos con:',
      applyFilters: 'Aplicar Filtros',
      clearFilters: 'Limpiar Todo',
    },
    fr: {
      filters: 'Filtres',
      showOnly: 'Afficher seulement:',
      hideWith: 'Masquer les plats avec:',
      applyFilters: 'Appliquer les Filtres',
      clearFilters: 'Tout Effacer',
    }
  };

  const t = translations[language];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl max-w-lg w-full mx-6 overflow-hidden animate-slide-up">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-wtm-text tracking-tight">{t.filters}</h3>
          <button
            onClick={onClose}
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
                      onSetDietaryFilters(
                        dietaryFilters.includes(tag) 
                          ? dietaryFilters.filter(f => f !== tag)
                          : [...dietaryFilters, tag]
                      );
                    }}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      dietaryFilters.includes(tag)
                        ? 'bg-green-100 text-green-700 border-2 border-green-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
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
                      onSetAllergenExclusions(
                        allergenExclusions.includes(allergen)
                          ? allergenExclusions.filter(f => f !== allergen)
                          : [...allergenExclusions, allergen]
                      );
                    }}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      allergenExclusions.includes(allergen)
                        ? 'bg-red-100 text-red-700 border-2 border-red-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {allergen}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClearAllFilters}
            className="flex-1 px-4 py-3 bg-gray-100 text-wtm-text rounded-xl hover:bg-gray-200 transition-colors font-medium"
          >
            {t.clearFilters}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-wtm-primary text-white font-semibold px-4 py-3 rounded-xl hover:bg-wtm-primary-600 transition-colors"
          >
            {t.applyFilters}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
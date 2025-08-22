import React from 'react';
import { translateDietaryTag, translateAllergen } from '../services/accessMenuTranslationService';

interface FilterBarProps {
  selectedAllergens: string[];
  selectedDietaryTags: string[];
  onAllergenToggle: (allergen: string) => void;
  onDietaryTagToggle: (tag: string) => void;
  onClearFilters: () => void;
  currentLanguage: string;
  availableAllergens: string[];
  availableDietaryTags: string[];
}

const AccessMenuFilterBar: React.FC<FilterBarProps> = ({
  selectedAllergens,
  selectedDietaryTags,
  onAllergenToggle,
  onDietaryTagToggle,
  onClearFilters,
  currentLanguage,
  availableAllergens,
  availableDietaryTags
}) => {
  const hasActiveFilters = selectedAllergens.length > 0 || selectedDietaryTags.length > 0;

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-800">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Allergen filters (exclude) */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Exclude allergens:</h4>
        <div className="flex flex-wrap gap-2">
          {availableAllergens.map(allergen => (
            <button
              key={allergen}
              onClick={() => onAllergenToggle(allergen)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedAllergens.includes(allergen)
                  ? 'bg-red-500 text-white'
                  : 'bg-white border border-red-300 text-red-600 hover:bg-red-50'
              }`}
            >
              {translateAllergen(allergen, currentLanguage)}
            </button>
          ))}
        </div>
      </div>

      {/* Dietary tag filters (include) */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Show only:</h4>
        <div className="flex flex-wrap gap-2">
          {availableDietaryTags.map(tag => (
            <button
              key={tag}
              onClick={() => onDietaryTagToggle(tag)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedDietaryTags.includes(tag)
                  ? 'bg-green-500 text-white'
                  : 'bg-white border border-green-300 text-green-600 hover:bg-green-50'
              }`}
            >
              {translateDietaryTag(tag, currentLanguage)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccessMenuFilterBar;
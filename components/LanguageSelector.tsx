// src/components/LanguageSelector.tsx
import React from 'react';

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (languageCode: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  selectedLanguage, 
  onLanguageChange 
}) => {
  return (
    <div className="bg-white/50 border-2 border-charcoal rounded-2xl p-4 mb-6">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <span className="font-bold text-charcoal text-lg">
          🌍 Language:
        </span>
        <div className="flex flex-wrap justify-center gap-3">
          {SUPPORTED_LANGUAGES.map((language) => (
            <button
              key={language.code}
              onClick={() => onLanguageChange(language.code)}
              className={`px-4 py-2 rounded-full border-2 border-charcoal font-bold transition-all ${
                selectedLanguage === language.code
                  ? 'bg-coral text-white shadow-[4px_4px_0px_#292524]'
                  : 'bg-white text-charcoal hover:bg-cream shadow-[2px_2px_0px_#292524] hover:shadow-[4px_4px_0px_#292524]'
              }`}
            >
              {language.flag} {language.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
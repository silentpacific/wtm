// src/components/menu/LanguageSelector.tsx
import React from 'react';
import ReactCountryFlag from "react-country-flag";
import { Language, LanguageOption } from '../../types/menuTypes';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageSelect: (language: Language) => void;
  onNext: () => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageSelect,
  onNext
}) => {
  const languages: LanguageOption[] = [
    { code: 'en', label: 'English', flag: 'GB' },
    { code: 'zh', label: '中文', flag: 'CN' },
    { code: 'es', label: 'Español', flag: 'ES' },
    { code: 'fr', label: 'Français', flag: 'FR' },
  ];

  const translations = {
    en: { selectLanguage: 'Select your language' },
    zh: { selectLanguage: '选择您的语言' },
    es: { selectLanguage: 'Selecciona tu idioma' },
    fr: { selectLanguage: 'Sélectionnez votre langue' }
  };

  const t = translations[currentLanguage];

  const handleLanguageSelect = (language: Language) => {
    onLanguageSelect(language);
    onNext();
  };

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
              onClick={() => handleLanguageSelect(lang.code)}
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
};

export default LanguageSelector;
// src/components/compiler/LanguageSelector.tsx  

import React from 'react';
import { Language, SUPPORTED_LANGUAGES } from '@/lib/compiler/languages';
import { ChevronDown } from 'lucide-react';

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onLanguageChange: (language: Language) => void;
  disabled?: boolean;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`relative ${className}`}>
      <select
        value={selectedLanguage.name}
        onChange={(e) => {
          const language = SUPPORTED_LANGUAGES.find(lang => lang.name === e.target.value);
          if (language) {
            onLanguageChange(language);
          }
        }}
        disabled={disabled}
        className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-0.5 pr-6 text-xs font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {SUPPORTED_LANGUAGES.map((language) => (
          <option key={language.name} value={language.name}>
            {language.name}
          </option>
        ))}
      </select>
      <ChevronDown 
        size={10} 
        className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none" 
      />
    </div>
  );
};
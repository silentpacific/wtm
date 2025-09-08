// src/hooks/useMenuState.ts
import { useState } from 'react';
import { Language, OrderItem } from '../types/menuTypes';

export const useMenuState = (isDemo: boolean = false) => {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'language' | 'menu'>(isDemo ? 'welcome' : 'menu');
  const [language, setLanguage] = useState<Language>('en');
  const [dietaryFilters, setDietaryFilters] = useState<string[]>([]);
  const [allergenExclusions, setAllergenExclusions] = useState<string[]>([]);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isOrderListExpanded, setIsOrderListExpanded] = useState(false);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [isCommunicationModalOpen, setIsCommunicationModalOpen] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [showDishExplanation, setShowDishExplanation] = useState<string | null>(null);
  const [customRequestInput, setCustomRequestInput] = useState<Record<string, string>>({});
  const [selectedDish, setSelectedDish] = useState<any | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [variantQuantity, setVariantQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const toggleSection = (section: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(section)) {
      newCollapsed.delete(section);
    } else {
      newCollapsed.add(section);
    }
    setCollapsedSections(newCollapsed);
  };

  const clearAllFilters = () => {
    setDietaryFilters([]);
    setAllergenExclusions([]);
    setIsFiltersExpanded(false);
  };

  return {
    // State
    currentStep,
    language,
    dietaryFilters,
    allergenExclusions,
    collapsedSections,
    orderItems,
    isOrderListExpanded,
    isOrderConfirmed,
    isFiltersExpanded,
    isCommunicationModalOpen,
    sessionId,
    showDishExplanation,
    customRequestInput,
    selectedDish,
    selectedVariant,
    variantQuantity,
    selectedVariants,
    
    // Setters
    setCurrentStep,
    setLanguage,
    setDietaryFilters,
    setAllergenExclusions,
    setCollapsedSections,
    setOrderItems,
    setIsOrderListExpanded,
    setIsOrderConfirmed,
    setIsFiltersExpanded,
    setIsCommunicationModalOpen,
    setShowDishExplanation,
    setCustomRequestInput,
    setSelectedDish,
    setSelectedVariant,
    setVariantQuantity,
    setSelectedVariants,
    
    // Helper functions
    toggleSection,
    clearAllFilters,
  };
};
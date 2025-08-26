// src/pages/FAQPage.tsx - Comprehensive FAQ
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Phone, Mail } from 'lucide-react';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQPage: React.FC = () => {
  const [openItems, setOpenItems] = useState<string[]>(['getting-started-1']);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Questions' },
    { id: 'getting-started', name: 'Getting Started' },
    { id: 'menu-management', name: 'Menu Management' },
    { id: 'qr-codes', name: 'QR Codes' },
    { id: 'customers', name: 'Customer Experience' },
    { id: 'billing', name: 'Billing & Pricing' },
    { id: 'technical', name: 'Technical Support' }
  ];

  const faqs: FAQItem[] = [
    // Getting Started
    {
      id: 'getting-started-1',
      category: 'getting-started',
      question: 'How do I get started with WhatTheMenu?',
      answer: 'Getting started is easy! Simply sign up for an account, upload your menu (PDF or image), and we\'ll process it with AI to create accessible versions in 4 languages. You\'ll get QR codes to print and place on your tables within minutes.'
    },
    {
      id: 'getting-started-2',
      category: 'getting-started',
      question: 'What types of restaurants can use WhatTheMenu?',
      answer: 'WhatTheMenu works for any type of restaurant - from casual dining to fine dining, cafes to food trucks. Whether you serve Italian, Asian, American, or fusion cuisine, our platform adapts to your menu and style.'
    },
    {
      id: 'getting-started-3',
      category: 'getting-started',
      question: 'Do I need technical skills to use WhatTheMenu?',
      answer: 'Not at all! WhatTheMenu is designed to be user-friendly. If you can send an email, you can use our platform. Our AI handles the technical complexity, and our interface is intuitive for restaurant owners.'
    },

    // Menu Management
    {
      id: 'menu-1',
      category: 'menu-management',
      question: 'What menu formats can I upload?',
      answer: 'You can upload PDF files, JPG images, or PNG images of your menu. Our AI can read text from photos, scanned documents, or digital menus. The clearer the image, the better the results.'
    },
    {
      id: 'menu-2',
      category: 'menu-management',
      question: 'How do I update my menu when prices change?',
      answer: 'You can update individual menu items through your dashboard at any time. Changes appear immediately on your customer-facing menu. You can edit dish names, descriptions, prices, and allergen information without re-uploading your entire menu.'
    },
    {
      id: 'menu-3',
      category: 'menu-management',
      question: 'Can I customize the translations?',
      answer: 'Yes! While our AI provides high-quality translations in Spanish, Chinese, and French, you can edit any translation to match your preferences or add cultural context that\'s specific to your restaurant.'
    },

    // QR Codes
    {
      id: 'qr-1',
      category: 'qr-codes',
      question: 'How do QR codes work for my customers?',
      answer: 'Customers simply point their phone camera at the QR code (no app needed). They\'ll see a link to tap, which opens your accessible menu in their browser. They can then choose their preferred language and browse your menu with full accessibility features.'
    },
    {
      id: 'qr-2',
      category: 'qr-codes',
      question: 'What sizes of QR codes can I download?',
      answer: 'We provide QR codes in 4 sizes: Small (200x200) for business cards, Medium (400x400) for table tents, Large (800x800) for posters, and Jumbo (1200x1200) for large displays. All formats are print-ready and high-resolution.'
    },
    {
      id: 'qr-3',
      category: 'qr-codes',
      question: 'Can I customize the appearance of my QR codes?',
      answer: 'Yes! You can change the colors of your QR codes to match your restaurant\'s branding. You can customize both the QR code color and background color, and download in PNG, SVG, or PDF formats.'
    },

    // Customer Experience
    {
      id: 'customer-1',
      category: 'customers',
      question: 'What languages are supported?',
      answer: 'We currently support English, Spanish (Español), Chinese (中文), and French (Français). These languages cover the majority of international visitors and are commonly requested by restaurants in Australia.'
    },
    {
      id: 'customer-2',
      category: 'customers',
      question: 'How does this help customers with hearing impairments?',
      answer: 'Our platform provides a completely visual experience. Customers can browse your menu, read detailed descriptions, filter by dietary needs, and even communicate their order visually - all without needing to hear or speak with staff.'
    },
    {
      id: 'customer-3',
      category: 'customers',
      question: 'What accessibility features are included?',
      answer: 'We include high contrast colors, large readable fonts, clear allergen warnings, dietary filtering (vegetarian, vegan, gluten-free), and a visual-only interface that works with screen readers for visually impaired customers.'
    },

    // Billing
    {
      id: 'billing-1',
      category: 'billing',
      question: 'How much does WhatTheMenu cost?',
      answer: 'We offer flexible pricing starting around $25/month, with a 30-day free trial. Pricing may vary based on your restaurant size and needs. Contact us for a personalized quote that fits your budget.'
    },
    {
      id: 'billing-2',
      category: 'billing',
      question: 'Is there a free trial?',
      answer: 'Yes! We offer a 30-day free trial so you can test all features with your actual menu before committing. No credit card required for the trial - just sign up and start using the platform immediately.'
    },
    {
      id: 'billing-3',
      category: 'billing',
      question: 'Can I cancel anytime?',
      answer: 'Absolutely. There are no long-term contracts or cancellation fees. You can cancel your subscription at any time through your dashboard, and you\'ll continue to have access until the end of your current billing period.'
    },

    // Technical
    {
      id: 'tech-1',
      category: 'technical',
      question: 'Do customers need to download an app?',
      answer: 'No! Customers just scan the QR code with their phone\'s built-in camera. The menu opens in their web browser - no app download required. This makes it accessible to everyone, regardless of their technical comfort level.'
    },
    {
      id: 'tech-2',
      category: 'technical',
      question: 'What if my internet connection is slow?',
      answer: 'Our menus are optimized for fast loading even on slow connections. We use compressed images and efficient loading techniques so customers can access your menu quickly, even in areas with poor cell coverage.'
    },
    {
      id: 'tech-3',
      category: 'technical',
      question: 'Is my restaurant data secure?',
      answer: 'Yes, we take security seriously. All data is encrypted in transit and at rest. We use enterprise-grade security practices and comply with Australian privacy laws. Your menu data and customer information are fully protected.'
    }
  ];

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about WhatTheMenu, or contact us if you need additional help.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="md:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Category Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <nav className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-coral-50 text-coral-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </nav>

              {/* Contact Info */}
              <div className="mt-8 p-4 bg-coral-50 rounded-lg">
                <h4 className="text-sm font-semibold text-coral-900 mb-2">Still need help?</h4>
                <div className="space-y-2">
                  <a 
                    href="/contact" 
                    className="flex items-center text-coral-700 hover:text-coral-800 text-sm"
                  >
                    <Mail size={14} className="mr-2" />
                    Contact Support
                  </a>
                  <a 
                    href="tel:+61812345678" 
                    className="flex items-center text-coral-700 hover:text-coral-800 text-sm"
                  >
                    <Phone size={14} className="mr-2" />
                    Call Us
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Items */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm">
              {filteredFaqs.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {filteredFaqs.map((faq) => {
                    const isOpen = openItems.includes(faq.id);
                    
                    return (
                      <div key={faq.id} className="p-6">
                        <button
                          onClick={() => toggleItem(faq.id)}
                          className="flex items-center justify-between w-full text-left"
                        >
                          <h3 className="text-lg font-semibold text-gray-900 pr-4">
                            {faq.question}
                          </h3>
                          {isOpen ? (
                            <ChevronUp className="text-coral-600 flex-shrink-0" size={24} />
                          ) : (
                            <ChevronDown className="text-gray-400 flex-shrink-0" size={24} />
                          )}
                        </button>
                        
                        {isOpen && (
                          <div className="mt-4 text-gray-600 leading-relaxed">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <p className="text-gray-500 mb-4">No FAQs found matching your search.</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                    className="text-coral-600 hover:text-coral-700 font-medium"
                  >
                    Clear search and filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
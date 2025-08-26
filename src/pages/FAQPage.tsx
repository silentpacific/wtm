// src/pages/FAQPage.tsx - Updated with new design system
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
      answer: 'Create an account, upload your menu (PDF or image), and we\'ll generate a shareable web menu with QR codes.'
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
      answer: 'Not at all! If you can send an email, you can use our platform. Our AI handles the technical complexity, and our interface is intuitive for restaurant owners.'
    },

    // Menu Management
    {
      id: 'menu-1',
      category: 'menu-management',
      question: 'Can I customize translations?',
      answer: 'Yes - review and edit any item name or description.'
    },
    {
      id: 'menu-2',
      category: 'menu-management',
      question: 'What menu formats can I upload?',
      answer: 'You can upload PDF files, JPG images, or PNG images of your menu. Our AI can read text from photos, scanned documents, or digital menus. The clearer the image, the better the results.'
    },
    {
      id: 'menu-3',
      category: 'menu-management',
      question: 'How do I update my menu when prices change?',
      answer: 'You can update individual menu items through your dashboard at any time. Changes appear immediately on your customer-facing menu.'
    },

    // QR Codes
    {
      id: 'qr-1',
      category: 'qr-codes',
      question: 'How do QR codes work for my customers?',
      answer: 'Customers simply point their phone camera at the QR code (no app needed). They\'ll see a link to tap, which opens your accessible menu in their browser.'
    },
    {
      id: 'qr-2',
      category: 'qr-codes',
      question: 'What sizes of QR codes can I download?',
      answer: 'We provide QR codes in 4 sizes: Small (200x200) for business cards, Medium (400x400) for table tents, Large (800x800) for posters, and Jumbo (1200x1200) for large displays.'
    },

    // Customer Experience
    {
      id: 'customer-1',
      category: 'customers',
      question: 'What languages are supported?',
      answer: 'English, Spanish, Chinese, French, and more as we expand. Ask us if you need a specific language.'
    },
    {
      id: 'customer-2',
      category: 'customers',
      question: 'How does this help Deaf customers?',
      answer: 'Menus are visual-first. Guests can point, use preset phrases, and confirm their order on screen.'
    },
    {
      id: 'customer-3',
      category: 'customers',
      question: 'What accessibility features are included?',
      answer: 'High contrast colors, large readable fonts, clear allergen warnings, dietary filtering (vegetarian, vegan, gluten-free), and a visual-only interface that works with screen readers.'
    },

    // Billing
    {
      id: 'billing-1',
      category: 'billing',
      question: 'How much does it cost? Is there a free trial?',
      answer: 'Simple monthly plan with a free trial. Cancel anytime.'
    },
    {
      id: 'billing-2',
      category: 'billing',
      question: 'Can I cancel anytime?',
      answer: 'Absolutely. There are no long-term contracts or cancellation fees. You can cancel your subscription at any time through your dashboard.'
    },

    // Technical
    {
      id: 'tech-1',
      category: 'technical',
      question: 'Do customers need to download an app?',
      answer: 'No! Customers just scan the QR code with their phone\'s built-in camera. The menu opens in their web browser - no app download required.'
    },
    {
      id: 'tech-2',
      category: 'technical',
      question: 'What if my internet connection is slow?',
      answer: 'Our menus are optimized for fast loading even on slow connections. We use compressed images and efficient loading techniques.'
    },
    {
      id: 'tech-3',
      category: 'technical',
      question: 'Is my restaurant data secure?',
      answer: 'Yes, we take security seriously. All data is encrypted in transit and at rest. We use enterprise-grade security practices and comply with Australian privacy laws.'
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
    <div className="min-h-screen bg-warm">
      {/* Header */}
      <div className="bg-wtm-surface shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="heading-primary mb-4">Frequently Asked Questions</h1>
            <p className="text-lg text-wtm-muted max-w-2xl mx-auto">
              Find answers to common questions about WhatTheMenu, or contact us if you need additional help.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search - Client-side search filters visible questions */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-wtm-muted" size={20} />
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="md:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field"
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
            <div className="card p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-wtm-text mb-4 font-heading">Categories</h3>
              <nav className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`block w-full text-left px-3 py-2 rounded-xl text-sm transition-colors focus-ring ${
                      selectedCategory === category.id
                        ? 'bg-wtm-primary/10 text-wtm-primary font-medium'
                        : 'text-wtm-muted hover:bg-gray-50'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </nav>

              {/* Contact Info */}
              <div className="mt-8 p-4 bg-wtm-primary/10 rounded-xl">
                <h4 className="text-sm font-semibold text-wtm-primary mb-2">Still need help?</h4>
                <div className="space-y-2">
                  <a 
                    href="/contact" 
                    className="flex items-center text-wtm-primary hover:text-wtm-primary-600 text-sm transition-colors focus-ring rounded px-2 py-1"
                  >
                    <Mail size={14} className="mr-2" />
                    Contact Support
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Items */}
          <div className="lg:col-span-3">
            <div className="card">
              {filteredFaqs.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {filteredFaqs.map((faq) => {
                    const isOpen = openItems.includes(faq.id);
                    
                    return (
                      <div key={faq.id} className="p-6">
                        <button
                          onClick={() => toggleItem(faq.id)}
                          className="flex items-center justify-between w-full text-left focus-ring rounded-lg p-2 -m-2"
                          aria-expanded={isOpen}
                        >
                          <h3 className="text-lg font-semibold text-wtm-text pr-4 font-heading">
                            {faq.question}
                          </h3>
                          {isOpen ? (
                            <ChevronUp className="text-wtm-primary flex-shrink-0 transition-transform" size={24} />
                          ) : (
                            <ChevronDown className="text-wtm-muted flex-shrink-0 transition-transform" size={24} />
                          )}
                        </button>
                        
                        {isOpen && (
                          <div className="mt-4 text-wtm-muted leading-relaxed animate-fade-in">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <p className="text-wtm-muted mb-4">No FAQs found matching your search.</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                    className="btn btn-ghost"
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
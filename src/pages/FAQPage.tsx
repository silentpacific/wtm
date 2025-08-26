// src/pages/FAQPage.tsx - Minimalist redesign
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Mail, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    { id: 'customers', name: 'Customer Experience' },
    { id: 'billing', name: 'Billing & Pricing' }
  ];

  const faqs: FAQItem[] = [
    // Getting Started
    {
      id: 'getting-started-1',
      category: 'getting-started',
      question: 'How quickly can I get my menu online?',
      answer: 'Upload your menu and it\'s live in minutes. Our system automatically processes PDF menus and images, creating an accessible digital version with QR codes ready for your tables.'
    },
    {
      id: 'getting-started-2',
      category: 'getting-started',
      question: 'Do I need technical skills?',
      answer: 'Not at all. If you can send an email, you can use our platform. Our AI handles the technical complexity, and our interface is intuitive for restaurant owners.'
    },
    {
      id: 'getting-started-3',
      category: 'getting-started',
      question: 'What types of restaurants can use WhatTheMenu?',
      answer: 'Any restaurant - from casual dining to fine dining, cafes to food trucks. Whether you serve Italian, Asian, American, or fusion cuisine, our platform adapts to your menu and style.'
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
      question: 'Can I customize translations?',
      answer: 'Yes - review and edit any item name or description. Our AI provides the initial translation, then you can refine it to match your restaurant\'s voice and style.'
    },
    {
      id: 'menu-3',
      category: 'menu-management',
      question: 'How do I update my menu when prices change?',
      answer: 'Update individual menu items through your dashboard at any time. Changes appear immediately on your customer-facing menu.'
    },

    // Customer Experience
    {
      id: 'customer-1',
      category: 'customers',
      question: 'Which languages are supported?',
      answer: 'English, Spanish, Chinese, French, German, Italian, and more. Languages are automatically detected and translated to provide seamless experiences for international guests.'
    },
    {
      id: 'customer-2',
      category: 'customers',
      question: 'How does this help Deaf customers?',
      answer: 'Menus are visual-first. Guests can point, use preset phrases, and confirm their order on screen without needing to speak with staff.'
    },
    {
      id: 'customer-3',
      category: 'customers',
      question: 'Do customers need to download an app?',
      answer: 'No app download required. Guests simply scan the QR code with their phone\'s built-in camera. The menu opens in their web browser instantly.'
    },
    {
      id: 'customer-4',
      category: 'customers',
      question: 'How do allergen filters work?',
      answer: 'Each menu item can be tagged with allergen information. Guests can filter the entire menu to show only items that are safe for their dietary restrictions, eliminating guesswork and reducing risk.'
    },

    // Billing
    {
      id: 'billing-1',
      category: 'billing',
      question: 'How much does it cost?',
      answer: 'Simple monthly plan with a free 14-day trial. No setup fees, no long-term contracts. Cancel anytime.'
    },
    {
      id: 'billing-2',
      category: 'billing',
      question: 'Can I cancel anytime?',
      answer: 'Absolutely. There are no long-term contracts or cancellation fees. You can cancel your subscription at any time through your dashboard.'
    },
    {
      id: 'billing-3',
      category: 'billing',
      question: 'Is there a setup fee?',
      answer: 'No setup fees. You only pay the monthly subscription after your free trial ends.'
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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 bg-wtm-bg">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-8 leading-tight text-wtm-text tracking-tight">
            Questions & Answers
          </h1>
          <p className="text-xl text-wtm-muted max-w-2xl mx-auto font-light">
            Everything you need to know about making your restaurant accessible.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Search */}
        <div className="mb-12">
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-wtm-muted" size={20} />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl bg-white focus:border-wtm-primary focus:ring-2 focus:ring-wtm-primary/20 focus:outline-none transition-all duration-200 text-lg"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-2xl font-medium text-sm transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-wtm-primary text-white shadow-sm'
                  : 'bg-gray-100 text-wtm-muted hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        {filteredFaqs.length > 0 ? (
          <div className="space-y-4">
            {filteredFaqs.map((faq) => {
              const isOpen = openItems.includes(faq.id);
              
              return (
                <div key={faq.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="flex items-center justify-between w-full text-left p-8 hover:bg-gray-50 transition-colors duration-200"
                    aria-expanded={isOpen}
                  >
                    <h3 className="text-xl font-semibold text-wtm-text pr-4 leading-tight">
                      {faq.question}
                    </h3>
                    {isOpen ? (
                      <ChevronUp className="text-wtm-primary flex-shrink-0" size={28} />
                    ) : (
                      <ChevronDown className="text-wtm-muted flex-shrink-0" size={28} />
                    )}
                  </button>
                  
                  {isOpen && (
                    <div className="px-8 pb-8 text-wtm-muted leading-relaxed text-lg font-light animate-fade-in">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <MessageCircle size={48} className="text-wtm-muted mx-auto mb-6" />
            <p className="text-xl text-wtm-muted mb-6">No questions found matching your search.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="bg-wtm-primary text-white font-semibold px-8 py-4 rounded-2xl hover:bg-wtm-primary-600 transition-colors duration-200"
            >
              Clear search and filters
            </button>
          </div>
        )}
      </div>

      {/* Contact Section */}
      <section className="py-20 bg-wtm-bg">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-wtm-text mb-6 tracking-tight">
            Still have questions?
          </h2>
          <p className="text-xl text-wtm-muted mb-12 font-light">
            We're here to help you make your restaurant accessible to everyone.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              to="/contact"
              className="bg-wtm-primary text-white font-semibold px-10 py-4 rounded-2xl hover:bg-wtm-primary-600 hover:scale-[1.02] transition-all duration-200 shadow-lg inline-flex items-center justify-center"
            >
              <Mail size={20} className="mr-3" />
              Contact Support
            </Link>
            <Link 
              to="/demos"
              className="bg-transparent text-wtm-primary border-2 border-wtm-primary font-semibold px-10 py-4 rounded-2xl hover:bg-wtm-primary hover:text-white transition-all duration-200 inline-flex items-center justify-center"
            >
              Try Demo Menus
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQPage;
// src/pages/FAQPage.tsx - Centered redesign with improved pills
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
  // ------------------------
  // Getting Started
  // ------------------------
  {
    id: 'getting-started-1',
    category: 'getting-started',
    question: 'How quickly can I get my menu online?',
    answer: 'We’ll have your menu ready within 1 working day, complete with a QR code for your guests to scan.'
  },
  {
    id: 'getting-started-2',
    category: 'getting-started',
    question: 'Do I need technical skills?',
    answer: 'Not at all. Send us your menu details and we’ll handle the rest. Your diners simply scan a QR code to view it on their phones.'
  },
  {
    id: 'getting-started-3',
    category: 'getting-started',
    question: 'Does this connect to my ordering system?',
    answer: 'No. There are no integrations or complex setups. Your ordering system stays the same — we keep it simple, and we do most of the work for you.'
  },
  {
    id: 'getting-started-4',
    category: 'getting-started',
    question: 'Do you provide printed QR codes for tables?',
    answer: 'We provide the digital QR code file. You can print as many copies as you need — for each table, at your entrance, or even on your printed menus.'
  },
  {
    id: 'getting-started-5',
    category: 'getting-started',
    question: 'What types of restaurants can use WhatTheMenu?',
    answer: 'Any restaurant — from cafes to fine dining, food trucks to franchises. If you serve guests, we make your menu accessible.'
  },

  // ------------------------
  // Menu Management
  // ------------------------
  {
    id: 'menu-1',
    category: 'menu-management',
    question: 'How do I update my menu when prices or items change?',
    answer: 'Just let us know and we’ll update your menu for you. The QR code stays the same — your guests always see the latest version.'
  },
  {
    id: 'menu-2',
    category: 'menu-management',
    question: 'How do allergen and dietary filters work?',
    answer: 'Menus are tagged with allergen and dietary information so guests can filter for safe options, reducing risk and saving staff time.'
  },
  {
    id: 'menu-3',
    category: 'menu-management',
    question: 'Which languages are supported?',
    answer: 'Guests can view menus in multiple languages including English, Spanish, Chinese, French, German, Italian, and more.'
  },

  // ------------------------
  // Customers & Staff
  // ------------------------
  {
    id: 'customers-1',
    category: 'customers',
    question: 'Do customers need to download an app?',
    answer: 'No. Guests simply scan your QR code with their phone’s camera and the menu opens instantly in their browser.'
  },
  {
    id: 'customers-2',
    category: 'customers',
    question: 'How does this help Deaf customers?',
    answer: 'Menus include clear icons and preset communication phrases, making it easy for Deaf diners to order confidently without barriers.'
  },
  {
    id: 'customers-3',
    category: 'customers',
    question: 'Do my staff need training to use this with Deaf customers?',
    answer: 'No training required. When a Deaf customer shows a question on their phone, staff can respond with simple preset replies like “Yes,” “No,” or “Let me check.” It’s very intuitive and easy to use.'
  },
  {
    id: 'customers-4',
    category: 'customers',
    question: 'Can I promote this as a feature of my restaurant?',
    answer: 'Yes. Restaurants often market this as an accessibility feature — showing that you welcome Deaf diners and international guests. It’s also a unique way to stand out as innovative and inclusive.'
  },

  // ------------------------
  // Billing
  // ------------------------
  {
    id: 'billing-1',
    category: 'billing',
    question: 'How much does it cost?',
    answer: 'Our simple pricing is $30 per month per menu. No setup fees, no hidden costs.'
  },
  {
    id: 'billing-2',
    category: 'billing',
    question: 'Can I cancel anytime?',
    answer: 'Yes. There are no long-term contracts or cancellation fees. You’re free to cancel at any time.'
  },
  {
    id: 'billing-3',
    category: 'billing',
    question: 'Is there a setup fee?',
    answer: 'No. Setup is included in your monthly fee.'
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
    const matchesSearch =
      searchTerm === '' ||
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
        <div className="mb-12 text-center">
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

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full font-medium text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-wtm-primary/40 ${
                selectedCategory === category.id
                  ? 'bg-wtm-primary text-white shadow'
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
                <div
                  key={faq.id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
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

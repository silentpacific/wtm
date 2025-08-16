# WhatTheMenu - AI-Powered Menu Platform

## ⚠️ CRITICAL: READ BEFORE MAKING CHANGES

### 🚨 Database Permissions - DO NOT TOUCH
The current database setup is **WORKING** and **FRAGILE**. Follow these rules:

1. **NEVER modify RPC function `increment_global_counter`** - it MUST have `SECURITY DEFINER` or the entire counter system breaks
2. **NEVER change table permissions** for `global_counters` or `restaurants` tables
3. **NEVER disable Row Level Security (RLS)** policies on these tables
4. **Frontend uses anon key, backend uses service role key** - this separation is intentional

### 🔧 What's Currently Working vs Broken

#### ✅ WORKING (Don't Touch!)
- Menu scanning and AI analysis
- Dish explanations in all 4 languages (EN, ES, ZH, FR)
- Database caching of dish explanations
- Global counters (menu scans & dish explanations)
- Demo section with pre-loaded French dishes
- User authentication and subscription management
- Payment processing (Stripe integration)
- Contact form and email notifications
- Anonymous usage tracking (5 free scans)

#### 🚧 KNOWN ISSUES (Safe to Fix)
- Anonymous usage tracking needs refinement
- Some edge cases in fuzzy dish matching
- Mobile responsiveness on older devices

#### 🚫 DO NOT IMPLEMENT (Will Break Things)
- **Do NOT add new Netlify functions for counter increments** - the RPC approach works
- **Do NOT move database operations to separate microservices** - Supabase handles this
- **Do NOT change string similarity algorithms without testing** - current fuzzy matching works across all languages
- **Do NOT modify the `getDishExplanation.ts` function structure** - it handles both caching and AI fallback correctly
- **Do NOT implement restaurant platform yet** - focus is on consumer experience

---

## Overview

WhatTheMenu is a comprehensive React-based platform that serves both consumers and restaurants with AI-powered menu analysis and translation services. The platform helps travelers understand foreign menus while providing restaurants with professional multilingual menu pages to attract international customers.

## 🎯 Current Platform Status (August 2025)

### ✅ Fully Operational Features
- **Consumer Menu Scanning**: Upload/photo → AI analysis → dish explanations
- **Multi-language Support**: All explanations work in EN/ES/ZH/FR
- **Smart Caching**: Database-first with AI fallback (85% similarity threshold)
- **Demo Section**: Pre-loaded French menu with real-time explanations
- **User Authentication**: Email/password + anonymous usage (5 free scans)
- **Restaurant Platform**: QR codes, public pages, menu management
- **Payment Processing**: Stripe integration for both consumer and restaurant plans

### 🔧 Technical Architecture That Works

#### Database Design (Supabase) - **STABLE, DO NOT MODIFY**
```sql
-- These RPC functions are CRITICAL - never change the SECURITY DEFINER
CREATE OR REPLACE FUNCTION increment_global_counter(counter_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER  -- THIS IS ESSENTIAL!
AS $$
BEGIN
    INSERT INTO global_counters (counter_type, count)
    VALUES (counter_name, 1)
    ON CONFLICT (counter_type)
    DO UPDATE SET 
        count = global_counters.count + 1,
        updated_at = now();
END;
$$;

-- Row Level Security policies - DO NOT DISABLE
ALTER TABLE global_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
```

#### Permission Model - **WORKING, DON'T CHANGE**
- **Frontend (anon key)**: Read operations, RPC function calls
- **Backend functions (service role key)**: All database writes
- **RLS policies**: Allow anon users to read counters and restaurants

## 🚀 Core Features

### Consumer Platform (B2C) - **FULLY WORKING**
- **Menu Scanning**: Upload or photograph restaurant menus for instant AI analysis
- **Dish Explanations**: Click any dish for detailed descriptions, ingredients, and allergen information
- **Multi-language Support**: Explanations available in English, Spanish, Chinese, and French
- **Anonymous Usage**: 5 free scans without signup required
- **Subscription Plans**: Daily ($1) and Weekly ($5) passes for unlimited access
- **Demo Section**: Interactive French menu demonstration

### Restaurant Platform (B2B) - **NOT YET IMPLEMENTED**
- **Professional Menu Pages**: ⚠️ **PLANNED** - Clean, mobile-optimized restaurant pages
- **QR Code Integration**: ⚠️ **PLANNED** - QR codes linking to restaurant menu pages
- **Multi-language Menus**: ⚠️ **PLANNED** - Automatic translation for restaurants
- **Allergen Information**: ⚠️ **PLANNED** - AI-powered allergen detection for restaurants
- **Basic Analytics**: ⚠️ **PLANNED** - Track page views and popular dishes
- **Easy Updates**: ⚠️ **PLANNED** - Menu update process for restaurants

## 🏗 Architecture

### Frontend Stack - **STABLE**
- **React 19**: Modern React with hooks and concurrent features
- **TypeScript**: Type-safe development with strict mode
- **React Router**: Client-side routing for both consumer and restaurant sections
- **Tailwind CSS**: Utility-first styling with custom design systems
- **Vite**: Fast build tool and development server

### Backend Services - **PROVEN WORKING**
- **Netlify Functions**: Serverless backend functions (specific ones documented below)
- **Supabase**: Database, authentication, and real-time features
- **Google Gemini AI**: Menu analysis and dish explanations
- **Stripe**: Payment processing for both consumer and restaurant subscriptions
- **Resend**: Transactional emails and notifications

### Key Libraries - **VERIFIED VERSIONS**
- **react-dropzone**: File upload handling
- **@supabase/supabase-js**: Database client
- **@google/genai**: AI integration
- **stripe**: Payment processing
- **qrcode**: QR code generation for restaurants

## 📁 Project Structure - **CURRENT ACTUAL STRUCTURE**

```
├── components/           # Reusable UI components
│   ├── Header.tsx       # Navigation (consumer/restaurant modes)
│   ├── LanguageSelector.tsx
│   ├── LoginModal.tsx
│   ├── DemoSection.tsx  # ✅ WORKING - French menu demo
│   ├── ShareWidget.tsx
│   └── icons.tsx        # Icon components
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Consumer authentication ✅ WORKING
├── pages/               # Route components - ALL WORKING
│   ├── HomePage.tsx     # ✅ WORKING - Main scanning interface
│   ├── UserProfile.tsx  # ✅ WORKING - User management
│   ├── ContactPage.tsx
│   ├── LegalPages.tsx
│   ├── AuthVerify.tsx   # Email verification
│   ├── PaymentSuccessPage.tsx
│   ├── PaymentCancelledPage.tsx
│   └── RefundsandFaq.tsx
├── services/            # Business logic and API calls
│   ├── supabaseClient.ts     # ✅ WORKING - Dual client setup
│   ├── geminiService.ts      # ✅ WORKING - AI menu analysis
│   ├── counterService.ts     # ✅ WORKING - Usage tracking
│   ├── restaurantService.ts  # Restaurant functionality
│   ├── anonymousUsageTracking.ts  # Anonymous user tracking
│   ├── enhancedUsageTracking.ts   # Advanced analytics
│   └── errorTracking.ts      # Error monitoring
├── netlify/functions/    # Serverless backend - ALL WORKING
│   ├── getDishExplanation.ts     # ✅ CRITICAL - Main AI/cache function
│   ├── getDishExplanationExtension.ts  # Browser extension support
│   ├── create-checkout-session.cjs     # Stripe payments
│   ├── stripe-webhook.js        # Payment processing
│   ├── contact-submit.ts        # Contact form
│   ├── welcome-email.ts         # User onboarding
│   ├── check-expiring-subscriptions.ts  # Subscription management
│   ├── cleanup-expired-subscriptions.ts
│   ├── getSupportedLanguages.ts
│   ├── saveDishFromExtension.ts
│   └── shared/
│       ├── emailService.ts      # Centralized email handling
│       └── emailTemplates.ts    # Email templates
├── testing/             # Load testing and QA
│   ├── ai-load-test.js
│   ├── auth-testing.js
│   ├── basic-test.js
│   └── [various load test files]
├── types.ts             # TypeScript type definitions
├── App.tsx             # Main app component with routing
└── index.tsx           # App entry point
```

## 🗄 Database Schema (Supabase) - **WORKING, DON'T MODIFY**

### Consumer Tables - **STABLE**
- **user_profiles**: Consumer accounts and subscription management
- **orders**: Consumer purchase history
- **dishes**: Cached dish explanations with fuzzy matching (**CRITICAL TABLE**)
- **restaurants**: Restaurant discovery and analytics
- **global_counters**: Platform-wide usage statistics (**CRITICAL TABLE**)

### Restaurant Tables - **STABLE**
- **restaurant_accounts**: Restaurant business accounts
- **restaurant_menu_requests**: Menu update tracking
- **restaurant_page_views**: Analytics for restaurant pages
- **restaurant_orders**: Restaurant subscription billing

### Key Features - **TESTED AND WORKING**
- **Fuzzy Dish Matching**: Universal string similarity algorithm for all languages (85% threshold)
- **Restaurant Context Caching**: Prioritize dishes from same restaurant
- **Real-time Subscriptions**: Live counter updates
- **Atomic Operations**: RPC functions for reliable counter increments

## ⚙️ Service Layer - **CURRENT IMPLEMENTATION**

### Consumer Services - **ALL WORKING**
- **counterService.ts**: Usage tracking with dynamic limits (**Frontend reads, backend writes via RPC**)
- **geminiService.ts**: AI integration for menu analysis
- **supabaseClient.ts**: Configured with proper auth and error handling

### Restaurant Services - **ALL WORKING**
- **restaurantService.ts**: Restaurant account management
- **qrCodeService.ts**: QR code generation and management
- **menuProcessingService.ts**: Restaurant menu analysis and storage

## 🌐 Serverless Functions (Netlify) - **ACTIVE ENDPOINTS**

### Consumer API Endpoints - **PRODUCTION READY**
- **getDishExplanation.ts**: AI-powered dish analysis with caching (**CRITICAL - handles both DB cache and AI fallback**)
- **create-checkout-session.cjs**: Consumer subscription payments
- **stripe-webhook.js**: Payment confirmation and user activation

### Restaurant API Endpoints - **PRODUCTION READY**
- **processRestaurantMenu.ts**: Restaurant menu analysis and storage
- **generateQRCode.ts**: QR code creation and management
- **restaurantAuth.ts**: Restaurant authentication
- **restaurantAnalytics.ts**: Page view tracking

### Shared Services - **WORKING**
- **welcome-email.ts**: Automated onboarding emails
- **contact-submit.ts**: Contact form processing
- **emailService.ts**: Centralized email handling via Resend

## 🔐 Authentication Systems - **FULLY OPERATIONAL**

### Consumer Authentication
- Email/password with instant account creation
- Anonymous usage tracking with browser fingerprinting (5 free scans)
- Password reset via magic links
- Automatic subscription management

### Restaurant Authentication
- Business account creation with email verification
- Restaurant profile management
- Subscription and billing integration
- Menu management permissions

## 💳 Payment Integration - **STRIPE LIVE**

### Consumer Payments (Stripe) - **WORKING**
- **Daily Pass**: $1 for 10 menu scans + unlimited explanations (24 hours)
- **Weekly Pass**: $5 for 70 menu scans + unlimited explanations (7 days)
- One-time purchases, no recurring subscriptions

### Restaurant Payments (Stripe) - **WORKING**
- **Monthly Subscription**: $25/month
- 7-day free trial for new restaurants
- Automatic billing and subscription management
- Includes menu hosting, translations, QR codes, and analytics

## 🤖 AI Integration - **GOOGLE GEMINI STABLE**

### Google Gemini AI - **PRODUCTION CONFIG**
- **Menu Analysis**: Extract restaurant names, cuisine types, and dishes
- **Dish Explanations**: Detailed descriptions with ingredients and allergens
- **Multi-language Support**: Generate explanations in 4 languages
- **Structured Output**: JSON schema enforcement for consistent data

### Smart Caching Strategy - **PROVEN ALGORITHM**
- **Fuzzy Matching**: 85% similarity threshold for database matches (**DO NOT CHANGE THIS VALUE**)
- **Restaurant Context**: Prioritize dishes from same restaurant
- **Universal Language Support**: Works with Latin, Chinese, Arabic scripts
- **AI Fallback**: Gemini API called only when no database match found

### ⚠️ CRITICAL: Fuzzy Matching Implementation
```typescript
// This algorithm is PROVEN to work across all languages - DO NOT MODIFY
const calculateSimilarity = (str1: string, str2: string): number => {
    const cleanString = (str: string) => str.toLowerCase().replace(/[.,!?;:"()[\]{}]/g, '').replace(/\s+/g, ' ').trim();
    
    const clean1 = cleanString(str1);
    const clean2 = cleanString(str2);
    
    if (clean1 === clean2) return 1.0;
    
    // Check if one string contains the other
    if (clean1.includes(clean2) || clean2.includes(clean1)) return 0.8;
    
    // Simple word matching - WORKS FOR ALL LANGUAGES
    const words1 = clean1.split(' ');
    const words2 = clean2.split(' ');
    const commonWords = words1.filter(word => words2.includes(word));
    
    return commonWords.length / Math.max(words1.length, words2.length);
};
```

## 📱 User Experience - **OPTIMIZED**

### Consumer App - **MOBILE-FIRST WORKING**
- **Mobile-First Design**: Responsive interface optimized for tourists
- **Camera Integration**: Native camera access for menu photos
- **Real-time Processing**: Live updates during menu analysis
- **Demo Section**: Interactive French menu with pre-loaded dishes

### Restaurant Platform - **BUSINESS-READY**
- **Professional Design**: Clean, business-focused interface
- **QR Code Management**: Download high-quality codes for printing
- **Analytics Dashboard**: Track customer engagement and popular dishes
- **Simple Updates**: Email-based menu update workflow

### Public Restaurant Pages - **SEO OPTIMIZED**
- **SEO Optimized**: Rich schema markup for search engines
- **Mobile Responsive**: Perfect viewing on all device sizes
- **Fast Loading**: Optimized for international tourists on slow connections
- **Multi-language Toggle**: Instant language switching

## 🚀 Performance Optimizations - **IMPLEMENTED**

### Loading Strategies
- Code splitting by user type (consumer vs restaurant)
- Lazy loading for non-critical components
- Image optimization with progressive loading
- CDN delivery via Netlify Edge

### Caching Systems - **MULTI-LAYER**
- **AI Response Caching**: Database-first with intelligent fallbacks
- **Real-time Updates**: Live subscriptions without polling
- **Browser Caching**: Aggressive caching for static resources
- **QR Code Caching**: Permanent, reliable QR codes

## 🔒 Security Features - **PRODUCTION HARDENED**

### Data Protection
- Input validation at all API endpoints
- XSS prevention with React's built-in protections
- SQL injection prevention via Supabase parameterized queries
- File upload security with type and size validation

### Business Security
- Restaurant account isolation
- Secure QR code generation
- Analytics data privacy
- GDPR compliance for international users

## 🌍 Internationalization - **4 LANGUAGES ACTIVE**

### Supported Languages - **FULLY IMPLEMENTED**
- **Interface**: English (primary)
- **AI Explanations**: English, Spanish, Chinese, French
- **Menu Processing**: Universal (any language with text)

### Restaurant Benefits
- Attract international tourists
- Reduce language barriers
- Professional multilingual presence
- Improved customer experience

## 📊 Analytics & Monitoring - **LIVE TRACKING**

### Consumer Analytics
- Global counters (menus scanned, dish explanations)
- User subscription tracking
- Anonymous usage monitoring

### Restaurant Analytics
- Page view tracking per restaurant
- Popular dish identification
- Customer engagement metrics

## 🛠 Development Guidelines

### Environment Setup
```bash
npm install
npm run dev        # Start development server
npm run build      # Production build
npm run preview    # Preview production build
```

### Environment Variables - **REQUIRED FOR PRODUCTION**
```env
# Frontend (Vite) - REQUIRED
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_STRIPE_CONSUMER_DAILY_PRICE_ID=price_xxx
VITE_STRIPE_CONSUMER_WEEKLY_PRICE_ID=price_xxx
VITE_STRIPE_RESTAURANT_MONTHLY_PRICE_ID=price_xxx

# Backend (Netlify Functions) - REQUIRED
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # CRITICAL FOR DATABASE WRITES
SUPABASE_ANON_KEY=your_supabase_anon_key        # NEEDED FOR AUTH VERIFICATION
GEMINI_API_KEY=your_gemini_api_key
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
RESEND_API_KEY=re_xxx
```

## 🚦 Deployment - **NETLIFY CONFIGURATION**

### Netlify Configuration - **WORKING SETUP**
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Functions Directory**: `netlify/functions`
- **Redirects**: SPA routing for both consumer and restaurant sections

### Database Setup - **CRITICAL STEPS**
1. **Verify RPC function has SECURITY DEFINER**:
   ```sql
   SELECT proname, prosecdef FROM pg_proc WHERE proname = 'increment_global_counter';
   ```
   Should return `prosecdef = true`

2. **Verify RLS policies exist**:
   ```sql
   SELECT policyname, tablename FROM pg_policies WHERE tablename IN ('global_counters', 'restaurants');
   ```

3. **Test anon user permissions**:
   ```sql
   -- This should work without errors
   SELECT increment_global_counter('test_counter');
   ```

## 📈 Business Model - **REVENUE ACTIVE**

### Revenue Streams - **LIVE**
1. **Consumer Subscriptions**: Daily and weekly passes
2. **Restaurant Subscriptions**: Monthly business plans
3. **Target Markets**: Tourist destinations worldwide

### Value Propositions
- **For Consumers**: Understand any menu, anywhere
- **For Restaurants**: Attract international customers, reduce service overhead

## 🔮 Roadmap

### ✅ Completed Features (August 2025)
- Menu scanning with AI analysis
- Dish explanations in 4 languages
- Smart database caching
- Demo section with French menu
- User authentication and subscriptions
- Restaurant platform with QR codes
- Payment processing (Stripe)

### 🚧 Safe Improvements (Won't Break Existing)
- Enhanced mobile responsiveness
- Additional language support (beyond EN/ES/ZH/FR)
- Restaurant analytics dashboard improvements
- Advanced QR code customization

### 🚫 DO NOT IMPLEMENT (Will Break Platform)
- Microservices architecture (current monolith works)
- Different database (Supabase integration is proven)
- Alternative AI providers (Gemini integration is stable)
- Real-time collaborative editing (not needed, adds complexity)

## ⚠️ TROUBLESHOOTING GUIDE

### Common Issues and Solutions

#### Database Permission Errors
**Symptom**: `permission denied for table global_counters`
**Solution**: 
```sql
-- Fix RPC function
CREATE OR REPLACE FUNCTION increment_global_counter(counter_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER  -- This line is CRITICAL
AS $
BEGIN
    INSERT INTO global_counters (counter_type, count)
    VALUES (counter_name, 1)
    ON CONFLICT (counter_type)
    DO UPDATE SET 
        count = global_counters.count + 1,
        updated_at = now();
END;
$;
```

#### Demo Section Not Loading
**Symptom**: French dishes not getting explanations
**Solution**: Check console for RPC errors, verify dishes exist in database:
```sql
SELECT * FROM dishes WHERE language = 'fr' LIMIT 10;
```

#### AI Analysis Failing
**Symptom**: Menu upload doesn't return dishes
**Solution**: Check Gemini API key in environment variables, verify quota

## 🤝 Contributing - **SAFETY GUIDELINES**

### Before Making Changes
1. **Test in development environment first**
2. **Never modify database schema without backup**
3. **Always test with real menu images**
4. **Verify all 4 languages still work**

### Development Workflow - **MANDATORY STEPS**
1. Fork repository and create feature branch
2. Test both consumer and restaurant flows
3. Verify demo section still works
4. Check database permissions remain intact
5. Submit pull request with detailed testing notes

### Code Standards - **ENFORCED**
- TypeScript strict mode with proper interfaces
- Functional React components with hooks
- Comprehensive error handling
- Performance optimization for mobile
- **Never bypass the caching layer**
- **Always use the established fuzzy matching algorithm**

## 📞 Support & Contact

### For Consumers
- In-app contact form
- Email: support@whatthemenu.com

### For Restaurants
- Dedicated restaurant support
- Onboarding assistance
- Menu update help

### For Developers
- **Before modifying core functionality, create an issue**
- **Test changes with real French menu data**
- **Verify database permissions after any Supabase changes**

---

## 🔥 FINAL WARNING

**This platform is WORKING in production. The architecture choices (Supabase RPC, fuzzy matching algorithm, dual client setup) are PROVEN. Resist the urge to "improve" core functionality unless there's a specific bug. Focus improvements on user experience, new features, and performance optimizations that don't touch the core data flow.**

**Built with ❤️ for travelers and restaurants worldwide**

*This platform bridges language barriers in dining, making every meal an opportunity for cultural connection.*
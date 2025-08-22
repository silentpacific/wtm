# WhatTheMenu - AI-Powered Menu Platform

## âš ï¸ CRITICAL: READ BEFORE MAKING CHANGES

### ðŸš¨ Database Permissions - DO NOT TOUCH
The current database setup is **WORKING** and **FRAGILE**. Follow these rules:

1. **NEVER modify RPC function `increment_global_counter`** - it MUST have `SECURITY DEFINER` or the entire counter system breaks
2. **NEVER change table permissions** for `global_counters` or `restaurants` tables
3. **NEVER disable Row Level Security (RLS)** policies on these tables
4. **Frontend uses anon key, backend uses service role key** - this separation is intentional

---

## Overview

WhatTheMenu is a comprehensive React-based platform consisting of **two distinct applications** that serve different user types with AI-powered menu analysis and translation services:

1. **WhatTheMenu (Consumer App)** - Helps travelers understand foreign menus
2. **AccessMenu (Business App)** - Provides restaurants with accessible, multilingual ordering interfaces

---

## ðŸ§³ **WhatTheMenu - Consumer App (B2C)**

### âœ… **Fully Operational Features**
The consumer-facing application that helps travelers understand menus anywhere in the world.

#### **Core Consumer Features**
- **Menu Scanning**: Upload or photograph restaurant menus for instant AI analysis
- **Dish Explanations**: Click any dish for detailed descriptions, ingredients, and allergen information
- **Multi-language Support**: Explanations available in English, Spanish, Chinese, and French
- **Anonymous Usage**: 5 free scans without signup required
- **Subscription Plans**: Daily ($1) and Weekly ($5) passes for unlimited access
- **Demo Section**: Interactive French menu demonstration

#### **Consumer User Journey**
1. **Upload/Photo** → Take picture of menu or upload image
2. **AI Analysis** → Gemini AI extracts and analyzes dishes
3. **Instant Results** → Get explanations in your language
4. **Smart Caching** → 85% similarity matching for faster responses

#### **Consumer Pricing (Stripe Live)**
- **Daily Pass**: $1 for 10 menu scans + unlimited explanations (24 hours)
- **Weekly Pass**: $5 for 70 menu scans + unlimited explanations (7 days)
- **Anonymous**: 5 free scans with browser fingerprinting
- One-time purchases, no recurring subscriptions

---

## ðŸ½ï¸ **AccessMenu - Business App (B2B)**

### ✅ **Fully Operational Features** 
A complete accessibility-focused ordering system for restaurants to serve international and disabled customers.

#### **Core Business Features**
- **Multilingual Menu Interface**: Complete menu display in 4 languages (EN/中文/ES/FR)
- **Smart Filtering System**: Allergen exclusion and dietary preference filtering
- **Visual-Only Communication**: Designed for deaf/hard-of-hearing customers
- **Server Q&A Interface**: Yes/No/Let me check buttons for staff communication
- **Order Management**: Complete ordering system with notes and special requests
- **WCAG AA Compliance**: Full accessibility features for all users

#### **AccessMenu User Journey**
1. **Browse Menu** → Customer views menu in their language with filtering
2. **Add Items** → Select dishes, add questions/notes, build order
3. **Review Order** → See complete order with questions highlighted  
4. **Server Communication** → Show screen to server for question answers
5. **Finalize Order** → Present final order to staff for processing

#### **AccessMenu Key Benefits**
- **Increased Accessibility**: Serves customers with hearing impairments
- **Language Barrier Solution**: No staff language training needed
- **Order Accuracy**: Visual confirmation reduces mistakes
- **Professional Image**: Shows commitment to inclusive service
- **Tourist Friendly**: Perfect for high-tourism areas

#### **Business Integration Options**
- **Standalone Implementation**: Independent AccessMenu deployment
- **WhatTheMenu Integration**: Add to existing restaurant subscriptions
- **QR Code Access**: Direct customer access via table QR codes
- **Staff Training Minimal**: Visual-only interface requires no language skills

---

## ðŸ"§ **What's Currently Working vs Status**

### **Consumer App (WhatTheMenu) - PRODUCTION READY** ✅
- Menu scanning and AI analysis ✅
- Dish explanations in all 4 languages (EN, ES, ZH, FR) ✅
- Database caching of dish explanations ✅
- Global counters (menu scans & dish explanations) ✅
- Demo section with pre-loaded French dishes ✅
- User authentication and subscription management ✅
- Payment processing (Stripe integration) ✅
- Contact form and email notifications ✅
- Anonymous usage tracking (5 free scans) ✅

### **Business App (AccessMenu) - PRODUCTION READY** ✅
- Complete multilingual menu system ✅
- Smart allergen and dietary filtering ✅
- Order management with notes ✅
- Server communication interface ✅
- Visual accessibility features ✅
- WCAG AA compliance ✅
- Mobile-first responsive design ✅

### **Known Issues (Safe to Fix)** ðŸš§
- Anonymous usage tracking needs refinement
- Some edge cases in fuzzy dish matching
- Mobile responsiveness on older devices

### **DO NOT IMPLEMENT (Will Break Things)** ðŸš«
- **Do NOT add new Netlify functions for counter increments** - the RPC approach works
- **Do NOT move database operations to separate microservices** - Supabase handles this
- **Do NOT change string similarity algorithms without testing** - current fuzzy matching works across all languages
- **Do NOT modify the `getDishExplanation.ts` function structure** - it handles both caching and AI fallback correctly

---

## ðŸ— **Technical Architecture**

### **Frontend Stack - STABLE**
- **React 19**: Modern React with hooks and concurrent features
- **TypeScript**: Type-safe development with strict mode
- **React Router**: Client-side routing for both consumer and restaurant sections
- **Tailwind CSS**: Utility-first styling with custom design systems
- **Vite**: Fast build tool and development server

### **Backend Services - PROVEN WORKING**
- **Netlify Functions**: Serverless backend functions
- **Supabase**: Database, authentication, and real-time features
- **Google Gemini AI**: Menu analysis and dish explanations
- **Stripe**: Payment processing for both consumer and restaurant subscriptions
- **Resend**: Transactional emails and notifications

---

## ðŸ" **Project Structure - DUAL APPLICATION ARCHITECTURE**

```
â"œâ"€â"€ components/           # Shared and app-specific components
â"‚   â"œâ"€â"€ CONSUMER APP (WhatTheMenu):
â"‚   â"‚   â"œâ"€â"€ Header.tsx       # Main navigation
â"‚   â"‚   â"œâ"€â"€ LanguageSelector.tsx
â"‚   â"‚   â"œâ"€â"€ LoginModal.tsx
â"‚   â"‚   â"œâ"€â"€ DemoSection.tsx  # âœ… WORKING - French menu demo
â"‚   â"‚   â""â"€â"€ ShareWidget.tsx
â"‚   â""â"€â"€ BUSINESS APP (AccessMenu):
â"‚       â"œâ"€â"€ AccessMenuTest.tsx           # âœ… COMPLETE - Main interface
â"‚       â"œâ"€â"€ AccessMenuLanguageSelector.tsx # âœ… COMPLETE - 4 languages
â"‚       â"œâ"€â"€ AccessMenuFilterBar.tsx      # âœ… COMPLETE - Smart filtering
â"‚       â"œâ"€â"€ AccessMenuDishExplanation.tsx # âœ… COMPLETE - Dish details
â"‚       â"œâ"€â"€ AccessMenuStickyOrderBar.tsx  # âœ… COMPLETE - Order tracking
â"‚       â"œâ"€â"€ AccessMenuOrderDrawer.tsx     # âœ… COMPLETE - Order management
â"‚       â""â"€â"€ EnhancedVisualComponents.tsx  # âœ… COMPLETE - Accessibility
â"œâ"€â"€ contexts/            # React contexts
â"‚   â""â"€â"€ AuthContext.tsx  # Consumer authentication âœ… WORKING
â"œâ"€â"€ pages/               # Route components - ALL WORKING
â"‚   â"œâ"€â"€ CONSUMER ROUTES:
â"‚   â"‚   â"œâ"€â"€ HomePage.tsx     # âœ… WORKING - Main scanning interface
â"‚   â"‚   â"œâ"€â"€ UserProfile.tsx  # âœ… WORKING - User management
â"‚   â"‚   â"œâ"€â"€ PaymentSuccessPage.tsx
â"‚   â"‚   â""â"€â"€ PaymentCancelledPage.tsx
â"‚   â""â"€â"€ SHARED ROUTES:
â"‚       â"œâ"€â"€ ContactPage.tsx
â"‚       â"œâ"€â"€ LegalPages.tsx
â"‚       â"œâ"€â"€ AuthVerify.tsx   # Email verification
â"‚       â""â"€â"€ RefundsandFaq.tsx
â"œâ"€â"€ services/            # Business logic and API calls
â"‚   â"œâ"€â"€ CONSUMER SERVICES:
â"‚   â"‚   â"œâ"€â"€ supabaseClient.ts     # âœ… WORKING - Dual client setup
â"‚   â"‚   â"œâ"€â"€ geminiService.ts      # âœ… WORKING - AI menu analysis
â"‚   â"‚   â"œâ"€â"€ counterService.ts     # âœ… WORKING - Usage tracking
â"‚   â"‚   â""â"€â"€ anonymousUsageTracking.ts
â"‚   â"œâ"€â"€ BUSINESS SERVICES:
â"‚   â"‚   â"œâ"€â"€ accessMenuService.ts         # âœ… COMPLETE - Data fetching
â"‚   â"‚   â""â"€â"€ accessMenuTranslationService.ts # âœ… COMPLETE - Translations
â"‚   â""â"€â"€ SHARED SERVICES:
â"‚       â"œâ"€â"€ restaurantService.ts  # Restaurant functionality
â"‚       â""â"€â"€ errorTracking.ts      # Error monitoring
â"œâ"€â"€ netlify/functions/    # Serverless backend - ALL WORKING
â"‚   â"œâ"€â"€ CONSUMER FUNCTIONS:
â"‚   â"‚   â"œâ"€â"€ getDishExplanation.ts     # âœ… CRITICAL - Main AI/cache function
â"‚   â"‚   â"œâ"€â"€ create-checkout-session.cjs # Stripe payments
â"‚   â"‚   â""â"€â"€ stripe-webhook.js        # Payment processing
â"‚   â""â"€â"€ SHARED FUNCTIONS:
â"‚       â"œâ"€â"€ contact-submit.ts        # Contact form
â"‚       â"œâ"€â"€ welcome-email.ts         # User onboarding
â"‚       â""â"€â"€ shared/emailService.ts   # Centralized email handling
â"œâ"€â"€ types.ts             # TypeScript type definitions
â"œâ"€â"€ App.tsx             # Main app component with routing
â""â"€â"€ index.tsx           # App entry point
```

---

## ðŸ—„ **Database Schema (Supabase) - WORKING, DON'T MODIFY**

### **Consumer App Tables - STABLE**
- **user_profiles**: Consumer accounts and subscription management
- **orders**: Consumer purchase history
- **dishes**: Cached dish explanations with fuzzy matching (**CRITICAL TABLE**)
- **restaurants**: Restaurant discovery and analytics
- **global_counters**: Platform-wide usage statistics (**CRITICAL TABLE**)

### **Business App Tables - STABLE**
- **accessmenu_menus**: Restaurant menu configurations for AccessMenu
- **accessmenu_dishes**: Multilingual dish data with allergen/dietary information
- **accessmenu_orders**: Order tracking and analytics (future use)

### **Restaurant Management Tables - STABLE**
- **restaurant_accounts**: Restaurant business accounts
- **restaurant_menu_requests**: Menu update tracking
- **restaurant_page_views**: Analytics for restaurant pages
- **restaurant_orders**: Restaurant subscription billing

---

## ðŸ¤– **AI Integration - GOOGLE GEMINI STABLE**

### **Consumer App AI Features**
- **Menu Analysis**: Extract restaurant names, cuisine types, and dishes
- **Dish Explanations**: Detailed descriptions with ingredients and allergens
- **Multi-language Support**: Generate explanations in 4 languages
- **Smart Caching**: 85% similarity threshold for database matches

### **Business App AI Features**
- **Menu Translation**: AI-powered translation of dish content
- **Allergen Detection**: Automatic allergen identification
- **Cuisine Analysis**: Cultural context and dish explanations
- **Content Optimization**: SEO-friendly descriptions

---

## ðŸ"± **User Experience - OPTIMIZED FOR DIFFERENT AUDIENCES**

### **Consumer App (WhatTheMenu) - TOURIST-FOCUSED**
- **Mobile-First Design**: Optimized for travelers on-the-go
- **Camera Integration**: Native camera access for menu photos
- **Real-time Processing**: Live updates during menu analysis
- **Demo Section**: Interactive French menu demonstration
- **Quick Onboarding**: Anonymous usage with instant results

### **Business App (AccessMenu) - ACCESSIBILITY-FOCUSED**
- **Visual-Only Interface**: Perfect for deaf/hard-of-hearing customers
- **Large Touch Targets**: WCAG AA compliant interactions
- **High Contrast Design**: Optimized for visual impairments
- **Server-Friendly**: Clear communication tools for staff
- **Professional Appearance**: Restaurant-quality design standards

---

## ðŸ'³ **Payment Integration - STRIPE LIVE**

### **Consumer Payments (WhatTheMenu) - WORKING**
- **Daily Pass**: $1 for 10 menu scans + unlimited explanations (24 hours)
- **Weekly Pass**: $5 for 70 menu scans + unlimited explanations (7 days)
- One-time purchases, no recurring subscriptions

### **Business Payments (AccessMenu) - PLANNED**
- **AccessMenu Add-on**: $10-15/month addition to restaurant subscriptions
- **Standalone AccessMenu**: $25/month for accessibility-focused restaurants
- **Enterprise Package**: Custom pricing for restaurant chains
- 7-day free trial for new restaurants

---

## ðŸŒ **Internationalization - 4 LANGUAGES ACTIVE**

### **Consumer App (WhatTheMenu)**
- **Interface**: English (primary)
- **AI Explanations**: English, Spanish, Chinese, French
- **Menu Processing**: Universal (any language with text)

### **Business App (AccessMenu)**
- **Complete UI Translation**: All interface elements in 4 languages
- **Menu Content**: Full dish information in 4 languages
- **Server Interface**: English-only for staff clarity
- **Customer Interface**: Customer's selected language

---

## ðŸ"Š **Analytics & Monitoring - LIVE TRACKING**

### **Consumer Analytics (WhatTheMenu)**
- Global counters (menus scanned, dish explanations)
- User subscription tracking
- Anonymous usage monitoring
- AI response times and accuracy

### **Business Analytics (AccessMenu)**
- Order completion rates
- Language usage statistics
- Accessibility feature usage
- Server response times
- Customer satisfaction metrics

---

## ðŸš€ **Performance Optimizations - IMPLEMENTED**

### **Shared Optimizations**
- Code splitting by application type (consumer vs business)
- Lazy loading for non-critical components
- Image optimization with progressive loading
- CDN delivery via Netlify Edge

### **Consumer App Optimizations**
- **AI Response Caching**: Database-first with intelligent fallbacks
- **Camera Optimization**: Efficient image processing
- **Real-time Updates**: Live subscriptions without polling

### **Business App Optimizations**
- **Accessibility Performance**: Optimized for screen readers
- **Touch Interface**: Smooth interactions on all devices
- **Visual Loading**: Clear progress indicators

---

## ðŸ"ˆ **Business Model - DUAL REVENUE STREAMS**

### **Consumer Revenue (WhatTheMenu) - LIVE**
1. **Individual Subscriptions**: Daily and weekly passes
2. **Target Market**: International travelers and tourists
3. **Value Proposition**: Understand any menu, anywhere

### **Business Revenue (AccessMenu) - READY TO LAUNCH**
1. **Restaurant Subscriptions**: Monthly accessibility packages
2. **Target Market**: Restaurants in tourist areas, accessibility-focused businesses
3. **Value Proposition**: Serve all customers, increase accessibility compliance

### **Combined Value Propositions**
- **For Consumers**: Understand any menu, anywhere
- **For Restaurants**: Attract international customers, serve all abilities
- **For Society**: Bridge language and accessibility barriers in dining

---

## ðŸ"® **Roadmap**

### **âœ… Completed Features (August 2025)**
**Consumer App (WhatTheMenu):**
- Menu scanning with AI analysis ✅
- Dish explanations in 4 languages ✅
- Smart database caching ✅
- User authentication and subscriptions ✅
- Payment processing (Stripe) ✅

**Business App (AccessMenu):**
- Complete multilingual interface ✅
- Smart filtering system ✅
- Order management with server communication ✅
- Full accessibility compliance (WCAG AA) ✅
- Visual-only communication system ✅

### **ðŸš§ Next Phase (Integration)**
- **AccessMenu Business Integration**: Add to WhatTheMenu restaurant admin
- **QR Code Generation**: Direct AccessMenu access for customers
- **Restaurant Onboarding**: Streamlined setup process
- **Analytics Dashboard**: Combined consumer and business insights

### **ðŸš« DO NOT IMPLEMENT (Will Break Platform)**
- Microservices architecture (current monolith works)
- Different database (Supabase integration is proven)
- Alternative AI providers (Gemini integration is stable)
- Real-time collaborative editing (not needed, adds complexity)

---

## ðŸ›  **Development Guidelines**

### **Environment Setup**
```bash
npm install
npm run dev        # Start development server (both apps)
npm run build      # Production build
npm run preview    # Preview production build
```

### **Environment Variables - REQUIRED FOR PRODUCTION**
```env
# Frontend (Vite) - REQUIRED FOR BOTH APPS
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

---

## ðŸ¤ **Contributing - SAFETY GUIDELINES**

### **Before Making Changes**
1. **Identify which app** you're modifying (Consumer vs Business)
2. **Test in development environment first**
3. **Never modify database schema without backup**
4. **Test both applications** to ensure no cross-contamination
5. **Verify all 4 languages still work in both apps**

### **Development Workflow - MANDATORY STEPS**
1. Fork repository and create feature branch
2. Test both consumer and restaurant flows
3. Verify demo section still works (consumer app)
4. Test AccessMenu system (business app)
5. Check database permissions remain intact
6. Submit pull request with detailed testing notes

---

## ðŸ"ž **Support & Contact**

### **For Consumers (WhatTheMenu Users)**
- In-app contact form
- Email: support@whatthemenu.com
- Focus: Menu scanning, dish explanations, subscriptions

### **For Restaurants (AccessMenu Users)**
- Dedicated restaurant support
- Email: restaurants@whatthemenu.com
- Focus: Accessibility setup, staff training, menu management

### **For Developers**
- **Before modifying core functionality, create an issue**
- **Specify which app** you're working on (Consumer vs Business)
- **Test changes with real data** from both applications
- **Verify database permissions** after any Supabase changes

---

## ðŸ"¥ **FINAL WARNING**

**This platform contains TWO WORKING APPLICATIONS in production:**

1. **WhatTheMenu (Consumer)** - Proven AI menu analysis system
2. **AccessMenu (Business)** - Complete accessibility ordering system

**Both share core infrastructure** (Supabase, AI, payments) but serve different purposes. The architecture choices (Supabase RPC, fuzzy matching algorithm, dual client setup) are PROVEN across both applications.

**Focus improvements on:**
- User experience enhancements
- New features for either application
- Integration between the two systems
- Performance optimizations that don't touch core data flow

**Built with â¤ï¸ for travelers and restaurants worldwide**

*This dual platform bridges language and accessibility barriers in dining, making every meal an opportunity for cultural connection and inclusive service.*
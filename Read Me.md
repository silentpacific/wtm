# WhatTheMenu - Restaurant Accessibility Platform

## âš ï¸ CRITICAL: READ BEFORE MAKING CHANGES

### ðŸ›¨ Database Permissions - DO NOT TOUCH
The current database setup is **WORKING** and **FRAGILE**. Follow these rules:

1. **NEVER modify RPC function `increment_global_counter`** - it MUST have `SECURITY DEFINER` or the entire counter system breaks
2. **NEVER change table permissions** for `global_counters` or `restaurants` tables
3. **NEVER disable Row Level Security (RLS)** policies on these tables
4. **Frontend uses anon key, backend uses service role key** - this separation is intentional

---

## ðŸŽ¯ **Platform Overview**

**WhatTheMenu** is transforming from a consumer menu scanning app into a **B2B restaurant accessibility platform** that helps restaurants serve customers with hearing impairments, language barriers, and visual needs.

### **ðŸ¢ Business Model**
- **Target Market**: Small to medium local restaurants
- **Revenue Model**: Flexible pricing starting around $25/month with 30-day free trials
- **Value Proposition**: Increase revenue while providing accessibility and multilingual support
- **Go-to-Market**: Cold email and calling restaurant owners with compelling demo experience

---

## ðŸ½ï¸ **WhatTheMenu Restaurant Platform (B2B Focus)**

### âœ… **Production Ready Features**
The business-facing platform that helps restaurants serve all customers with accessibility and multilingual support.

#### **ðŸŽ¯ Core Restaurant Features**
- **Restaurant Landing Page**: Professional B2B marketing page (`/restaurants`)
- **Accessible Menu System**: Complete multilingual menu display (EN/ä¸­æ–‡/ES/FR) 
- **QR Code Generation**: Print-ready codes for tables, menus, and windows âœ… **COMPLETE**
- **Visual-Only Communication**: Designed for deaf/hard-of-hearing customers
- **Smart Filtering**: Allergen exclusion and dietary preference filtering
- **AI Menu Processing**: Gemini AI extracts and analyzes restaurant menus
- **Multi-language Support**: Full accessibility in 4 languages

#### **ðŸª Restaurant Owner Journey**
1. **Discover Platform** â†’ Visit restaurant landing page
2. **See Demo** â†’ Experience perfect demo restaurant 
3. **Sign Up** â†’ Quick onboarding with menu upload
4. **Get QR Codes** â†’ Instant download of print-ready QR codes
5. **Go Live** â†’ Customers access accessible menus immediately
6. **Manage Menu** â†’ Edit dishes, prices, and translations

#### **ðŸ‘¥ Customer Experience**
1. **Scan QR Code** â†’ Access restaurant menu instantly
2. **Choose Language** â†’ Switch between EN/ä¸­æ–‡/ES/FR
3. **Filter Menu** â†’ Exclude allergens, dietary restrictions
4. **Visual Communication** â†’ Order without audio requirements
5. **Server Interface** â†’ Clear visual communication with staff

---

## ðŸ‘¥ **WhatTheMenu Consumer Demo (`/consumers`)**

### ðŸ“± **Consumer Demo Features**
The original consumer-facing application preserved as a demonstration of AI capabilities.

#### **Demo Capabilities**
- **Menu Scanning**: Upload or photograph restaurant menus for AI analysis
- **Dish Explanations**: Get detailed descriptions, ingredients, and allergen information
- **Multi-language Support**: Explanations available in English, Spanish, Chinese, and French
- **Anonymous Usage**: Free scanning without signup required
- **Interactive Demo**: French menu demonstration

> **Note**: Consumer functionality is maintained as a demonstration tool. The platform's primary focus is now on serving restaurants (B2B).

---

## ðŸŽ¨ **Current Platform Status**

### âœ… **Production Ready**
- [x] Restaurant landing page with professional B2B design
- [x] Complete accessibility system (WCAG AA compliant)
- [x] AI menu processing (Google Gemini integration)
- [x] QR code generation system âœ… **COMPLETE**
- [x] Multi-language support (4 languages)
- [x] Mobile-first responsive design
- [x] Database foundation (Supabase)
- [x] Payment processing (Stripe)

### ðŸ”„ **In Development**
- [ ] Platform pivot (homepage â†’ restaurant focus)
- [ ] Restaurant signup and onboarding flow
- [ ] Restaurant management portal
- [ ] Demo restaurant showcase
- [ ] Professional design system update

### ðŸŽ¯ **Planned Features**
- [ ] Restaurant directory/listings
- [ ] Geographic expansion (Australia-first)
- [ ] Referral system for restaurants
- [ ] Advanced analytics for restaurant owners
- [ ] Enhanced accessibility features

---

## ðŸ—ï¸ **Technical Architecture**

### **Frontend Stack - STABLE**
- **React 19**: Modern React with hooks and concurrent features
- **TypeScript**: Type-safe development with strict mode
- **React Router**: Client-side routing for restaurant and consumer sections
- **Tailwind CSS**: Utility-first styling transitioning to professional B2B design
- **Vite**: Fast build tool and development server

### **Backend Services - PROVEN WORKING**
- **Netlify Functions**: Serverless backend functions
- **Supabase**: Database, authentication, and real-time features
- **Google Gemini AI**: Menu analysis and dish explanations
- **Stripe**: Payment processing for restaurant subscriptions
- **Resend**: Transactional emails and notifications

### **AI Integration - GOOGLE GEMINI STABLE**
- **Menu Analysis**: Extract restaurant names, cuisine types, and dishes
- **Dish Explanations**: Detailed descriptions with ingredients and allergens
- **Multi-language Support**: Generate explanations in 4 languages
- **Accessibility Processing**: Automatic allergen detection and dietary analysis

---

## ðŸ“‚ **Project Structure**

```
â”œâ”€â”€ components/           # Shared and app-specific components
â”‚   â”œâ”€â”€ RESTAURANT COMPONENTS:
â”‚   â”‚   â”œâ”€â”€ RestaurantLandingPage.tsx    # âœ… B2B marketing page
â”‚   â”‚   â”œâ”€â”€ AccessMenuTest.tsx           # âœ… Customer accessibility interface
â”‚   â”‚   â”œâ”€â”€ AccessMenuLanguageSelector.tsx # âœ… 4-language switcher
â”‚   â”‚   â”œâ”€â”€ AccessMenuFilterBar.tsx      # âœ… Dietary/allergen filtering
â”‚   â”‚   â”œâ”€â”€ AccessMenuOrderDrawer.tsx    # âœ… Order management
â”‚   â”‚   â””â”€â”€ QRCodeGenerator.tsx          # âœ… QR code creation
â”‚   â””â”€â”€ SHARED COMPONENTS:
â”‚       â”œâ”€â”€ Header.tsx                   # Main navigation (updating)
â”‚       â”œâ”€â”€ LoginModal.tsx               # Authentication
â”‚       â””â”€â”€ DemoSection.tsx              # Consumer demo preserved
â”œâ”€â”€ pages/               # Route components
â”‚   â”œâ”€â”€ RESTAURANT ROUTES:
â”‚   â”‚   â”œâ”€â”€ RestaurantLandingPage.tsx    # âœ… /restaurants
â”‚   â”‚   â””â”€â”€ [Restaurant Signup - TBD]    # /restaurants/signup
â”‚   â”œâ”€â”€ CONSUMER ROUTES (Demo):
â”‚   â”‚   â”œâ”€â”€ HomePage.tsx â†’ ConsumersPage # Moving to /consumers
â”‚   â”‚   â””â”€â”€ UserProfile.tsx              # Consumer profiles
â”‚   â””â”€â”€ SHARED ROUTES:
â”‚       â”œâ”€â”€ ContactPage.tsx              # Contact form
â”‚       â”œâ”€â”€ LegalPages.tsx               # Terms, Privacy (updating for B2B)
â”‚       â””â”€â”€ RefundsandFaq.tsx            # FAQ and refunds
â”œâ”€â”€ services/            # Business logic and API calls
â”‚   â”œâ”€â”€ RESTAURANT SERVICES:
â”‚   â”‚   â”œâ”€â”€ accessMenuService.ts         # âœ… Restaurant data fetching
â”‚   â”‚   â”œâ”€â”€ accessMenuTranslationService.ts # âœ… Multi-language translations
â”‚   â”‚   â””â”€â”€ qrCodeService.ts             # âœ… QR code generation
â”‚   â”œâ”€â”€ CONSUMER SERVICES (Demo):
â”‚   â”‚   â”œâ”€â”€ geminiService.ts             # âœ… AI menu analysis
â”‚   â”‚   â”œâ”€â”€ counterService.ts            # Usage tracking (removing)
â”‚   â”‚   â””â”€â”€ anonymousUsageTracking.ts    # Anonymous usage (removing)
â”‚   â””â”€â”€ SHARED SERVICES:
â”‚       â”œâ”€â”€ supabaseClient.ts            # âœ… Database client
â”‚       â””â”€â”€ restaurantService.ts         # Restaurant functionality
â”œâ”€â”€ netlify/functions/   # Serverless backend
â”‚   â”œâ”€â”€ RESTAURANT FUNCTIONS:
â”‚   â”‚   â””â”€â”€ [Restaurant Functions - TBD] # Signup, billing, etc.
â”‚   â”œâ”€â”€ CONSUMER FUNCTIONS (Demo):
â”‚   â”‚   â”œâ”€â”€ getDishExplanation.ts        # âœ… AI/cache function
â”‚   â”‚   â”œâ”€â”€ create-checkout-session.cjs  # Stripe payments
â”‚   â”‚   â””â”€â”€ stripe-webhook.js            # Payment processing
â”‚   â””â”€â”€ SHARED FUNCTIONS:
â”‚       â”œâ”€â”€ contact-submit.ts            # Contact form
â”‚       â””â”€â”€ welcome-email.ts             # Email notifications
â””â”€â”€ types.ts             # TypeScript definitions
```

---

## ðŸ—‚ï¸ **Database Schema (Supabase) - WORKING, DON'T MODIFY**

### **Restaurant Platform Tables - STABLE**
- **restaurants**: Restaurant business accounts and analytics
- **accessmenu_menus**: Restaurant menu configurations
- **accessmenu_dishes**: Multilingual dish data with allergen/dietary information
- **accessmenu_orders**: Order tracking and analytics (future use)
- **restaurant_accounts**: Restaurant business accounts and subscriptions
- **restaurant_menu_requests**: Menu update tracking
- **restaurant_page_views**: Analytics for restaurant pages

### **Consumer Demo Tables - STABLE** 
- **user_profiles**: Consumer accounts (demo purposes)
- **dishes**: Cached dish explanations with fuzzy matching
- **global_counters**: Platform-wide usage statistics (being phased out)

### **Shared Tables - CRITICAL**
- **orders**: Payment processing and subscription management
- **contact_submissions**: Contact form submissions
- **error_logs**: Error monitoring and tracking

---

## ðŸš€ **Development Workflow**

### **Environment Setup**
```bash
npm install
npm run dev        # Start development server
npm run build      # Production build
npm run preview    # Preview production build
```

### **Environment Variables - REQUIRED**
```env
# Frontend (Vite)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_STRIPE_RESTAURANT_PRICE_ID=price_xxx

# Backend (Netlify Functions)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
RESEND_API_KEY=re_xxx
```

---

## ðŸŽ¯ **Business Goals & Metrics**

### **Target Metrics**
- **100 restaurants** by end of Q1 2025
- **$2,500 MRR** by end of Q1 2025
- **Break-even** by month 6
- **500 restaurants** by end of year 1

### **Key Performance Indicators**
- Demo conversion rate > 20%
- Trial to paid conversion > 40% 
- Customer lifetime value > $300
- Monthly churn rate < 5%
- Restaurant page load time < 2 seconds
- 99.9% uptime for customer-facing pages

---

## ðŸ“‹ **Current Development Priorities**

### **Phase 1: Platform Pivot (Weeks 1-2)**
1. **Move consumer content to `/consumers`** - Preserve demo functionality
2. **Replace homepage with restaurant landing** - B2B focus
3. **Clean up header/footer** - Remove consumer counters and elements
4. **Update design system** - More professional, less playful styling
5. **Create perfect demo restaurant** - Sales-ready showcase

### **Phase 2: Restaurant Onboarding (Weeks 3-4)**
1. **Build restaurant signup flow** - `/restaurants/signup`
2. **Menu upload and AI processing** - Automated menu digitization
3. **Restaurant authentication system** - Separate from consumer auth
4. **QR code integration** - Automatic generation and downloads
5. **Update legal documents** - B2B terms, privacy, refunds

### **Phase 3: Restaurant Management (Weeks 5-6)**
1. **Restaurant dashboard** - Overview and analytics
2. **Menu editing interface** - 4-language management
3. **Profile management** - Restaurant details and settings
4. **Billing integration** - Stripe subscriptions and trials

---

## ðŸ›¡ï¸ **Safety Guidelines**

### **âš ï¸ DO NOT MODIFY**
- Database RPC functions (especially `increment_global_counter`)
- Table permissions or Row Level Security policies
- Core AI processing functions (`getDishExplanation.ts`)
- Existing accessibility components (they work perfectly)

### **âœ… SAFE TO MODIFY**
- Header and footer styling/content
- Landing page content and design
- New restaurant-focused features
- Legal document content
- User interface improvements

### **ðŸ”§ DEVELOPMENT WORKFLOW**
1. Test changes in development environment first
2. Verify both restaurant and consumer demos still work
3. Check all 4 languages function correctly
4. Test mobile responsiveness
5. Verify accessibility compliance (WCAG AA)

---

## ðŸŽ¨ **Design System Evolution**

### **Current State** 
- Playful, consumer-focused design
- Bright colors (coral, yellow)
- Heavy drop shadows and borders
- Fun, approachable styling

### **Target State**
- Professional B2B appearance
- Maintained friendly WhatTheMenu brand
- Softer, sophisticated color palette
- Clean, trustworthy visual identity
- Restaurant owner confidence in showing to customers

---

## ðŸ“ž **Support & Contact**

### **For Restaurant Owners**
- **Website**: [whatthemenu.com/restaurants](https://whatthemenu.com/restaurants)
- **Email**: restaurants@whatthemenu.com
- **Focus**: Accessibility setup, menu management, billing support

### **For Developers**
- **Documentation**: This README and project roadmap
- **Issue Reporting**: Create detailed bug reports with steps to reproduce
- **Feature Requests**: Include business justification and user stories

### **For General Inquiries**
- **Contact Form**: [whatthemenu.com/contact](https://whatthemenu.com/contact)
- **Email**: support@whatthemenu.com

---

## ðŸ† **Success Stories & Use Cases**

### **Target Restaurant Types**
- **Tourist Area Restaurants**: Serve international visitors in their language
- **Accessibility-Focused Establishments**: Support customers with hearing impairments
- **Diverse Community Restaurants**: Bridge language barriers in multicultural areas
- **Quality-Conscious Restaurants**: Show commitment to inclusive service

### **Customer Benefits**
- **Hearing Impaired Customers**: Visual-only ordering without audio requirements
- **International Tourists**: Menu access in native language (EN/ä¸­æ–‡/ES/FR)
- **Dietary Restriction Customers**: Clear allergen information and filtering
- **All Customers**: Professional, accessible dining experience

---

## ðŸš§ **Known Limitations**

### **Current Constraints**
- Geographic focus: Australia initially (expanding globally later)
- Language support: 4 languages (English, Spanish, Chinese, French)
- Menu format: Image/PDF upload (no direct text input yet)
- Integration: Standalone system (no POS integration)

### **Future Enhancements**
- Additional languages based on market demand
- POS system integrations
- Advanced analytics and reporting
- Multi-location restaurant chains support
- Voice accessibility features

---

## ðŸ“œ **License & Legal**

### **Platform Ownership**
- **Owner**: LoFi Simplify Pty Ltd (ABN 35340346478)
- **Location**: Adelaide, South Australia
- **Legal Structure**: Australian proprietary limited company

### **Usage Rights**
- Restaurant customers: Access to accessibility features through QR codes
- Restaurant owners: License to use platform for accessibility compliance
- Developers: Internal development and maintenance only

---

## ðŸŒŸ **Vision Statement**

**"Making every restaurant accessible to every customer, regardless of hearing ability or language."**

WhatTheMenu bridges the gap between restaurants and customers who face accessibility or language barriers. By providing visual-only ordering in multiple languages, we're creating inclusive dining experiences that benefit both businesses and their customers.

**Built with â¤ï¸ for restaurants and their customers worldwide.**

*This platform transforms dining from a potential barrier into an opportunity for connection, understanding, and excellent service for all.*
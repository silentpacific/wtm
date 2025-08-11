# WhatTheMenu - AI-Powered Menu Platform

## Overview

WhatTheMenu is a comprehensive React-based platform that serves both consumers and restaurants with AI-powered menu analysis and translation services. The platform helps travelers understand foreign menus while providing restaurants with professional multilingual menu pages to attract international customers.

## 🚀 Core Features

### Consumer Platform (B2C)
- **Menu Scanning**: Upload or photograph restaurant menus for instant AI analysis
- **Dish Explanations**: Click any dish for detailed descriptions, ingredients, and allergen information
- **Multi-language Support**: Explanations available in English, Spanish, Chinese, and French
- **Anonymous Usage**: 5 free scans without signup required
- **Subscription Plans**: Daily ($1) and Weekly ($5) passes for unlimited access

### Restaurant Platform (B2B)
- **Professional Menu Pages**: Clean, mobile-optimized restaurant pages at `whatthemenu.com/restaurants/{slug}`
- **QR Code Integration**: Permanent QR codes linking to restaurant menu pages
- **Multi-language Menus**: Automatic translation into English, Spanish, Chinese, and French
- **Allergen Information**: AI-powered allergen detection and display
- **Basic Analytics**: Track page views and popular dishes
- **Easy Updates**: Simple menu update process via email or dashboard upload

## 🏗 Architecture

### Frontend Stack
- **React 19**: Modern React with hooks and concurrent features
- **TypeScript**: Type-safe development with strict mode
- **React Router**: Client-side routing for both consumer and restaurant sections
- **Tailwind CSS**: Utility-first styling with custom design systems
- **Vite**: Fast build tool and development server

### Backend Services
- **Netlify Functions**: Serverless backend functions
- **Supabase**: Database, authentication, and real-time features
- **Google Gemini AI**: Menu analysis and dish explanations
- **Stripe**: Payment processing for both consumer and restaurant subscriptions
- **Resend**: Transactional emails and notifications

### Key Libraries
- **react-dropzone**: File upload handling
- **@supabase/supabase-js**: Database client
- **@google/genai**: AI integration
- **stripe**: Payment processing
- **qrcode**: QR code generation for restaurants

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Header.tsx       # Navigation (consumer/restaurant modes)
│   ├── LanguageSelector.tsx
│   ├── LoginModal.tsx
│   ├── DemoSection.tsx
│   ├── ShareWidget.tsx
│   └── RestaurantComponents/  # Restaurant-specific components
├── contexts/            # React contexts
│   ├── AuthContext.tsx  # Consumer authentication
│   └── RestaurantAuthContext.tsx  # Restaurant authentication
├── pages/               # Route components
│   ├── consumer/        # Consumer-facing pages
│   │   ├── HomePage.tsx
│   │   ├── UserProfile.tsx
│   │   └── PaymentPages.tsx
│   ├── restaurant/      # Restaurant-facing pages
│   │   ├── RestaurantSignUp.tsx
│   │   ├── RestaurantDashboard.tsx
│   │   ├── MenuUpload.tsx
│   │   └── RestaurantPublicPage.tsx
│   ├── ContactPage.tsx
│   └── LegalPages.tsx
├── services/            # Business logic and API calls
│   ├── supabaseClient.ts
│   ├── geminiService.ts
│   ├── counterService.ts
│   ├── restaurantService.ts
│   ├── qrCodeService.ts
│   └── analyticsService.ts
├── types/               # TypeScript type definitions
├── App.tsx             # Main app component with routing
└── index.tsx           # App entry point
```

## 🗄 Database Schema (Supabase)

### Consumer Tables
- **user_profiles**: Consumer accounts and subscription management
- **orders**: Consumer purchase history
- **dishes**: Cached dish explanations with fuzzy matching
- **restaurants**: Restaurant discovery and analytics
- **global_counters**: Platform-wide usage statistics

### Restaurant Tables
- **restaurant_accounts**: Restaurant business accounts
- **restaurant_menu_requests**: Menu update tracking
- **restaurant_page_views**: Analytics for restaurant pages
- **restaurant_orders**: Restaurant subscription billing

### Key Features
- **Fuzzy Dish Matching**: Universal string similarity algorithm for all languages
- **Restaurant Context Caching**: Prioritize dishes from same restaurant
- **Real-time Subscriptions**: Live counter updates
- **Atomic Operations**: RPC functions for reliable counter increments

## ⚙ Service Layer

### Consumer Services
- **counterService.ts**: Usage tracking with dynamic limits
- **anonymousUsageTracking.ts**: Browser-based usage for non-registered users
- **enhancedUsageTracking.ts**: Advanced analytics for registered users
- **geminiService.ts**: AI integration for menu analysis

### Restaurant Services
- **restaurantService.ts**: Restaurant account management
- **qrCodeService.ts**: QR code generation and management
- **menuProcessingService.ts**: Restaurant menu analysis and storage
- **restaurantAnalytics.ts**: Page view and engagement tracking

## 🌐 Serverless Functions (Netlify)

### Consumer API Endpoints
- **getDishExplanation.ts**: AI-powered dish analysis with caching
- **create-checkout-session.cjs**: Consumer subscription payments
- **stripe-webhook.js**: Payment confirmation and user activation

### Restaurant API Endpoints
- **processRestaurantMenu.ts**: Restaurant menu analysis and storage
- **generateQRCode.ts**: QR code creation and management
- **restaurantAuth.ts**: Restaurant authentication
- **restaurantAnalytics.ts**: Page view tracking

### Shared Services
- **welcome-email.ts**: Automated onboarding emails
- **contact-submit.ts**: Contact form processing
- **emailService.ts**: Centralized email handling via Resend

## 🔐 Authentication Systems

### Consumer Authentication
- Email/password with instant account creation
- Anonymous usage tracking with browser fingerprinting
- Password reset via magic links
- Automatic subscription management

### Restaurant Authentication
- Business account creation with email verification
- Restaurant profile management
- Subscription and billing integration
- Menu management permissions

## 💳 Payment Integration

### Consumer Payments (Stripe)
- **Daily Pass**: $1 for 10 menu scans + unlimited explanations (24 hours)
- **Weekly Pass**: $5 for 70 menu scans + unlimited explanations (7 days)
- One-time purchases, no recurring subscriptions

### Restaurant Payments (Stripe)
- **Monthly Subscription**: $25/month
- 7-day free trial for new restaurants
- Automatic billing and subscription management
- Includes menu hosting, translations, QR codes, and analytics

## 🤖 AI Integration

### Google Gemini AI
- **Menu Analysis**: Extract restaurant names, cuisine types, and dishes
- **Dish Explanations**: Detailed descriptions with ingredients and allergens
- **Multi-language Support**: Generate explanations in 4 languages
- **Structured Output**: JSON schema enforcement for consistent data

### Smart Caching Strategy
- **Fuzzy Matching**: 85% similarity threshold for database matches
- **Restaurant Context**: Prioritize dishes from same restaurant
- **Universal Language Support**: Works with Latin, Chinese, Arabic scripts
- **AI Fallback**: Gemini API called only when no database match found

## 📱 User Experience

### Consumer App
- **Mobile-First Design**: Responsive interface optimized for tourists
- **Camera Integration**: Native camera access for menu photos
- **Real-time Processing**: Live updates during menu analysis
- **Offline Support**: Cached explanations for repeated visits

### Restaurant Platform
- **Professional Design**: Clean, business-focused interface
- **QR Code Management**: Download high-quality codes for printing
- **Analytics Dashboard**: Track customer engagement and popular dishes
- **Simple Updates**: Email-based menu update workflow

### Public Restaurant Pages
- **SEO Optimized**: Rich schema markup for search engines
- **Mobile Responsive**: Perfect viewing on all device sizes
- **Fast Loading**: Optimized for international tourists on slow connections
- **Multi-language Toggle**: Instant language switching

## 🚀 Performance Optimizations

### Loading Strategies
- Code splitting by user type (consumer vs restaurant)
- Lazy loading for non-critical components
- Image optimization with progressive loading
- CDN delivery via Netlify Edge

### Caching Systems
- **AI Response Caching**: Database-first with intelligent fallbacks
- **Real-time Updates**: Live subscriptions without polling
- **Browser Caching**: Aggressive caching for static resources
- **QR Code Caching**: Permanent, reliable QR codes

## 🔒 Security Features

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

## 🌍 Internationalization

### Supported Languages
- **Interface**: English (primary)
- **AI Explanations**: English, Spanish, Chinese, French
- **Menu Processing**: Universal (any language with text)

### Restaurant Benefits
- Attract international tourists
- Reduce language barriers
- Professional multilingual presence
- Improved customer experience

## 📊 Analytics & Monitoring

### Consumer Analytics
- Google Analytics integration
- Microsoft Clarity for UX insights
- Error tracking with smart filtering
- Performance monitoring

### Restaurant Analytics
- Page view tracking
- Popular dish identification
- Customer engagement metrics
- Revenue impact measurement

## 🛠 Development Guidelines

### Environment Setup
```bash
npm install
npm run dev        # Start development server
npm run build      # Production build
npm run preview    # Preview production build
```

### Environment Variables
```env
# Frontend (Vite)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_CONSUMER_DAILY_PRICE_ID=price_xxx
VITE_STRIPE_CONSUMER_WEEKLY_PRICE_ID=price_xxx
VITE_STRIPE_RESTAURANT_MONTHLY_PRICE_ID=price_xxx

# Backend (Netlify Functions)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
RESEND_API_KEY=re_xxx
```

## 🚦 Deployment

### Netlify Configuration
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Functions Directory**: `netlify/functions`
- **Redirects**: SPA routing for both consumer and restaurant sections

### Database Migrations
- Supabase migrations for schema updates
- RPC functions for atomic operations
- Indexes for performance optimization

## 📈 Business Model

### Revenue Streams
1. **Consumer Subscriptions**: Daily and weekly passes
2. **Restaurant Subscriptions**: Monthly business plans
3. **Target Markets**: Tourist destinations worldwide

### Value Propositions
- **For Consumers**: Understand any menu, anywhere
- **For Restaurants**: Attract international customers, reduce service overhead

## 🔮 Roadmap

### Immediate Features (Next 30 days)
- Restaurant onboarding automation
- Advanced QR code customization
- Daily specials management
- Email notification system

### Future Enhancements
- Photo menus for restaurants
- Multi-location restaurant support
- Custom branding options
- POS system integrations
- Wine pairing suggestions
- Nutritional information

## 🤝 Contributing

### Development Workflow
1. Fork repository and create feature branch
2. Follow TypeScript best practices
3. Test both consumer and restaurant flows
4. Submit pull request with detailed description

### Code Standards
- TypeScript strict mode with proper interfaces
- Functional React components with hooks
- Comprehensive error handling
- Performance optimization for mobile

## 📞 Support & Contact

### For Consumers
- In-app contact form
- Email: support@whatthemenu.com
- FAQ section with common issues

### For Restaurants
- Dedicated restaurant support
- Onboarding assistance
- Menu update help
- Technical integration support

---

**Built with ❤️ for travelers and restaurants worldwide**

*This platform bridges language barriers in dining, making every meal an opportunity for cultural connection.*
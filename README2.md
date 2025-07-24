## 🤝 Contributing

### Development Workflow
1. **Fork Repository**: Create personal fork of the main repository
2. **Feature Branch**: Create descriptive branch names (feature/dish-explanation-caching)
3. **Development**: Implement changes with comprehensive testing
4. **Code Quality**: Ensure TypeScript compilation and linting passes
5. **Pull Request**: Submit with detailed description and test results
6. **Review Process**: Code review with automated CI/CD checks
7. **Deployment**: Automatic Netlify deployment on merge to main

### Coding Standards
- **TypeScript Best Practices**: Strict type checking with proper interfaces
- **React Patterns**: Functional components with hooks, proper state management
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Code Documentation**: JSDoc comments for complex functions and services
- **Testing Requirements**: Unit tests for utilities, integration tests for APIs
- **Performance Considerations**: Optimize for Core Web Vitals and mobile

### Project Structure Guidelines
```
src/
├── components/     # Reusable UI components (Header, LoginModal, etc.)
├── pages/         # Route-specific components (HomePage, UserProfile)
├── services/      # Business logic and API integrations
├── contexts/      # React context providers (AuthContext)
├── types/         # TypeScript type definitions
├── utils/         # Pure utility functions
└── assets/        # Static files and images

netlify/functions/ # Serverless backend functions
├── shared/        # Shared utilities and templates
├── *.ts          # TypeScript functions
└── *.js          # JavaScript functions (legacy)
```

### Development Environment Setup
1. **Prerequisites**: Node.js 18+, npm/yarn, Git
2. **Clone & Install**: `git clone` and `npm install`
3. **Environment**: Copy `.env.example` to `.env.local` and configure
4. **Database**: Set up Supabase project and run migrations
5. **Development**: `npm run dev` for local development server
6. **Testing**: `npm test` for unit tests, manual testing for UI

---

## 📱 Mobile & Accessibility

### Mobile-First Design
- **Responsive Breakpoints**: Tailwind's mobile-first approach
- **Touch Interactions**: Large tap targets (44px minimum)
- **Camera Integration**: Native camera access with permissions
- **Gesture Support**: Swipe navigation and pinch-to-zoom for menu images
- **Performance**: Optimized for 3G networks and budget devices

### Accessibility Features
- **Screen Reader Support**: Semantic HTML with ARIA labels
- **Keyboard Navigation**: Full keyboard accessibility
- **High Contrast**: Accessible color combinations (WCAG AA compliant)
- **Text Scaling**: Responsive to user font size preferences
- **Focus Management**: Clear focus indicators and logical tab order

---

## 🌍 Internationalization

### Current Language Support
- **Interface**: English (primary)
- **AI Explanations**: English, Spanish, Chinese, French
- **Menu Processing**: Universal (any language with text)

### Technical Implementation
- **Language Detection**: Automatic cuisine type detection
- **Script Support**: Latin, Chinese characters, Arabic (planned)
- **Cultural Context**: Region-specific dietary preferences
- **Currency**: USD (expandable to local currencies)

### Expansion Roadmap
- **Additional Languages**: German, Italian, Japanese, Korean
- **Right-to-Left**: Arabic and Hebrew language support
- **Regional Customization**: Local cuisine preferences and allergen standards
- **Currency Localization**: Regional pricing with Stripe international support

---

## 🏗 System Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Netlify       │    │   Supabase      │
│   (React/Vite)  │────│   Functions     │────│   Database      │
│                 │    │                 │    │                 │
│ • HomePage      │    │ • Payment       │    │ • User Profiles │
│ • Header        │    │ • Dish Analysis │    │ • Restaurants   │
│ • UserProfile   │    │ • Email Service │    │ • Dishes Cache  │
│ • Auth System   │    │ • Webhooks      │    │ • Analytics     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   External      │    │   Google        │    │   Stripe        │
│   Services      │    │   Gemini AI     │    │   Payments      │
│                 │    │                 │    │                 │
│ • Resend Email  │    │ • Menu Analysis │    │ • Subscriptions │
│ • Analytics     │    │ • Dish Explain  │    │ • Webhooks      │
│ • Clarity       │    │ • Multi-lang    │    │ • Billing       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

*This comprehensive documentation covers the complete WhatTheMenu application architecture, features, and implementation details as of the provided codebase. The system demonstrates advanced React patterns, intelligent AI integration, robust payment processing, and scalable serverless architecture.*# WhatTheMenu - AI-Powered Menu Scanner & Translator

## Overview

WhatTheMenu is a React-based web application that uses AI to scan restaurant menus and provide instant dish explanations, ingredient breakdowns, and allergen information. The app supports multiple languages and helps travelers and food enthusiasts understand unfamiliar menu items.

## 🚀 Core Features

### Menu Scanning
- **Photo Upload**: Users can upload menu images or take photos directly through the camera
- **AI Analysis**: Uses Google Gemini AI to analyze menu content and extract dish information
- **Restaurant Detection**: Automatically identifies restaurant names and cuisine types
- **Multi-language Support**: Processes menus in 80+ languages

### Dish Explanations
- **Instant Analysis**: Click any dish to get detailed explanations
- **Ingredient Breakdown**: Lists main ingredients and cooking methods
- **Allergen Detection**: Identifies common allergens (nuts, dairy, gluten, etc.)
- **Dietary Tags**: Labels dishes as vegetarian, vegan, gluten-free, etc.
- **Multi-language Output**: Explanations available in English, Spanish, Chinese, and French

### User Management
- **Anonymous Usage**: 5 free menu scans without signup
- **Account System**: Supabase-based authentication with magic links
- **Usage Tracking**: Per-user limits and subscription management
- **Profile Management**: User preferences and usage statistics

### Subscription System
- **Free Tier**: 5 menu scans + 5 dish explanations per menu
- **Daily Pass ($1)**: 10 menu scans + unlimited dish explanations for 24 hours
- **Weekly Pass ($5)**: 70 menu scans + unlimited dish explanations for 7 days
- **Stripe Integration**: Secure payment processing

## 🏗 Architecture

### Frontend Stack
- **React 19**: Modern React with hooks and concurrent features
- **TypeScript**: Type-safe development
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first styling
- **Vite**: Fast build tool and development server

### Backend Services
- **Netlify Functions**: Serverless backend functions
- **Supabase**: Database, authentication, and real-time features
- **Google Gemini AI**: Menu analysis and dish explanations
- **Stripe**: Payment processing
- **Resend**: Transactional emails

### Key Libraries
- **react-dropzone**: File upload handling
- **@supabase/supabase-js**: Database client
- **@google/genai**: AI integration
- **stripe**: Payment processing

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Header.tsx       # Navigation and user status
│   ├── LanguageSelector.tsx
│   └── LoginModal.tsx
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication state management
├── pages/               # Route components
│   ├── HomePage.tsx     # Main menu scanning interface
│   ├── UserProfile.tsx  # User account management
│   ├── ContactPage.tsx  # Contact form
│   ├── LegalPages.tsx   # Terms, Privacy Policy
│   ├── RefundsandFaq.tsx
│   ├── PaymentSuccessPage.tsx
│   └── PaymentCancelledPage.tsx
├── services/            # Business logic and API calls
│   ├── supabaseClient.ts
│   ├── counterService.ts
│   ├── enhancedUsageTracking.ts
│   ├── anonymousUsageTracking.ts
│   └── errorTracking.ts
├── types/               # TypeScript type definitions
├── App.tsx             # Main app component
└── index.tsx           # App entry point
```

## 🔧 Core Components

### HomePage.tsx
The main interface featuring:
- **HeroSection**: File upload and camera capture
- **MenuResults**: Displays analyzed menu with clickable dishes
- **PricingSection**: Subscription plans
- **ReviewsSection**: Customer testimonials

Key features:
- Drag-and-drop file upload
- Camera integration for mobile
- Real-time dish explanation loading
- Responsive design (desktop table, mobile accordion)
- Language switching for explanations
- Restaurant detection and linking
- Anonymous usage tracking

### Header.tsx
Navigation component with:
- Logo and branding
- User authentication status
- Usage counters (scans remaining)
- Login/logout functionality
- Profile access
- Real-time counter updates
- Desktop and mobile responsive design
- Anonymous vs authenticated user handling

### UserProfile.tsx
Account management interface:
- Profile information editing
- Usage statistics and limits
- Subscription status
- Order history
- Dynamic scan limits based on subscription
- Account settings

### LoginModal.tsx
Authentication interface featuring:
- Email/password authentication
- Password reset functionality
- Automatic user login after signup
- Input validation and error handling
- Welcome email integration

## 🗄 Database Schema (Supabase)

### RPC Functions
Custom database procedures for atomic operations:

```sql
-- Atomic counter increment
CREATE OR REPLACE FUNCTION increment_global_counter(counter_name text)
RETURNS void AS $
BEGIN
  INSERT INTO global_counters (counter_type, count, updated_at)
  VALUES (counter_name, 1, NOW())
  ON CONFLICT (counter_type)
  DO UPDATE SET 
    count = global_counters.count + 1,
    updated_at = NOW();
END;
$ LANGUAGE plpgsql;

-- Restaurant explanation count increment
CREATE OR REPLACE FUNCTION increment_restaurant_explanation_count(restaurant_id integer)
RETURNS void AS $
BEGIN
  UPDATE restaurants 
  SET dishes_explained = COALESCE(dishes_explained, 0) + 1
  WHERE id = restaurant_id;
END;
$ LANGUAGE plpgsql;
```

### Tables

#### user_profiles
```sql
- id (uuid, primary key)
- email (text)
- full_name (text, optional)
- subscription_type (text: 'free', 'daily', 'weekly')
- subscription_status (text: 'active', 'inactive')
- subscription_expires_at (timestamp)
- scans_used (integer)
- scans_limit (integer) -- Now calculated dynamically: Free=5, Daily=10, Weekly=70
- current_menu_dish_explanations (integer) -- Per-menu limit (5 for free, unlimited for paid)
- lifetime_menus_scanned (integer)
- lifetime_dishes_explained (integer)
- stripe_customer_id (text)
- stripe_payment_intent_id (text)
- created_at (timestamp)
- updated_at (timestamp)
```

#### orders
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key)
- amount (integer, in cents)
- currency (text)
- status (text: 'pending', 'completed', 'failed')
- plan_type (text: 'daily', 'weekly')
- stripe_session_id (text)
- stripe_payment_intent_id (text)
- created_at (timestamp)
- updated_at (timestamp)
```

#### restaurants
```sql
- id (integer, primary key)
- name (text)
- cuisine_type (text)
- city (text)
- state (text)
- country (text)
- latitude (numeric)
- longitude (numeric)
- name_location_hash (text, unique) -- For deduplication
- total_scans (integer)
- dishes_scanned (integer) -- NEW: Track total dishes from this restaurant
- dishes_explained (integer) -- NEW: Track explanations for this restaurant
- first_scanned_at (timestamp)
- last_scanned_at (timestamp)
- created_at (timestamp)
```

#### dishes
```sql
- id (uuid, primary key)
- name (text)
- language (text: 'en', 'es', 'zh', 'fr')
- explanation (text)
- tags (text[]) -- Dietary tags, cooking methods
- allergens (text[]) -- Allergen information
- cuisine (text) -- Cuisine type
- restaurant_id (integer, foreign key) -- Link to restaurant
- restaurant_name (text) -- Restaurant name for reference
- created_at (timestamp)
```

#### contact_submissions
```sql
- id (uuid, primary key)
- name (text)
- email (text)
- message (text)
- status (text: 'new', 'responded', 'closed')
- created_at (timestamp)
```

#### email_logs
```sql
- id (uuid, primary key)
- email_type (text: 'welcome', 'purchase_confirmation', 'contact_confirmation', etc.)
- recipient (text)
- success (boolean)
- resend_id (text) -- Resend service ID
- error_message (text)
- sent_at (timestamp)
```

#### global_counters
```sql
- counter_type (text, primary key)
- count (bigint)
- updated_at (timestamp)
```

#### error_logs
```sql
- id (uuid, primary key)
- error_message (text)
- error_stack (text)
- user_id (uuid, optional)
- error_type (text)
- context (jsonb)
- created_at (timestamp)
```

## ⚙ Service Layer

### counterService.ts
Manages usage tracking and limits:
- **Global Counters**: Track total menus scanned and dishes explained
- **User Counters**: Individual user usage and subscription limits
- **Real-time Updates**: Supabase subscriptions for live counter updates
- **Dynamic Limits**: Scan limits based on subscription type (Free: 5, Daily: 10, Weekly: 70)
- **RPC Functions**: Atomic counter increments via database procedures

Key functions:
- `getUserCounters()`: Get user's current usage and limits
- `canUserScan()`: Check if user can scan more menus
- `canUserExplainDish()`: Check dish explanation limits (unlimited for paid users)
- `incrementMenuScans()`: Global counter increment
- `incrementDishExplanations()`: Global counter increment

### restaurantService.ts
Restaurant management and location services:
- **Geolocation**: GPS-based location detection with reverse geocoding
- **Restaurant Detection**: Create/find restaurants with deduplication
- **Analytics**: Track restaurant scan counts and dish explanations
- **Location Data**: City, state, country with coordinates

### geminiService.ts
AI integration for menu analysis:
- **Structured Output**: JSON schema enforcement for consistent responses
- **Restaurant Detection**: Extract restaurant names and cuisine types from menus
- **Multi-language Support**: Process menus in any language
- **Error Handling**: Robust error management with fallbacks

### enhancedUsageTracking.ts
Advanced user analytics:
- Lifetime statistics tracking
- Monthly usage reset with historical preservation
- Subscription-based limit calculation
- Dynamic scan limits (Free: 5, Daily: 10, Weekly: 70)
- Unlimited dish explanations for paid users

### anonymousUsageTracking.ts
Anonymous user handling:
- Browser fingerprinting for abuse prevention
- Local storage usage tracking with event dispatching
- Monthly limit resets
- Cross-tab synchronization
- Per-menu dish explanation limits (5 per menu)

### errorTracking.ts
Smart error monitoring:
- Filtered error capture (ignores non-critical errors)
- Manual error reporting for critical features
- Context-aware error categorization
- Database error logging with user context
- Enhanced console logging for development

## 🔐 Authentication Flow

### Email/Password Authentication
1. User enters email and password
2. Automatic account creation with instant login (no email verification required)
3. User profile created in database with free tier limits
4. Welcome email sent asynchronously via Resend service
5. User immediately has access to 5 free menu scans

### Anonymous to Authenticated Migration
- Anonymous usage preserved during signup
- Seamless transition without losing progress
- Usage limits upgraded based on account type
- Browser fingerprinting prevents abuse

### Password Reset
- Magic link sent via email for password recovery
- Secure token validation with expiration
- Redirect to app after successful reset

## 💳 Payment Integration

### Stripe Checkout Flow
1. User selects subscription plan (Daily/Weekly)
2. Stripe Checkout session created via Netlify function
3. User completes payment on Stripe-hosted page
4. Webhook processes successful payment
5. User subscription activated in database
6. Redirect to success page with confirmation

### Subscription Management
- **Dynamic Limits**: Scan limits adjust based on active subscription
- **Expiration Handling**: Automatic downgrade when subscription expires
- **Usage Tracking**: Different limits for free vs. paid users

## 🤖 AI Integration

### Google Gemini AI
Used for menu analysis with structured prompts:

```typescript
const response = await model.generateContent([
  {
    text: `Analyze this restaurant menu image and extract...
    - Restaurant name and cuisine type
    - All dishes organized by menu sections
    - Return as structured JSON`
  },
  {
    inlineData: {
      mimeType: "image/jpeg",
      data: base64Image
    }
  }
]);
```

### Dish Explanation System
Advanced multi-language dish analysis with intelligent caching:

#### Database-First Approach
- **Fuzzy Matching**: Universal string similarity algorithm working with all languages
- **Levenshtein Distance**: Character-level comparison for accurate matching
- **Restaurant Context**: Prioritize dishes from the same restaurant
- **Language Support**: English, Spanish, Chinese, French explanations

#### Smart Caching Strategy
1. **Universal Fuzzy Search**: Works with Latin, Chinese, Arabic, and other scripts
2. **Restaurant Preference**: Boost scores for dishes from the same restaurant  
3. **Similarity Threshold**: 85% confidence required for database matches
4. **Fallback to AI**: Gemini API called only when no good match found

#### Structured Output
```typescript
{
  explanation: "Concise dish description under 300 characters",
  tags: ["Vegetarian", "Spicy", "Grilled"], // Dietary & cooking method tags
  allergens: ["Contains Nuts", "Contains Dairy"], // Specific allergen warnings
  cuisine: "Italian" // Precise cuisine classification
}
```

#### Error Handling & Retry Logic
- Automatic retry with exponential backoff for rate limits
- User-friendly error messages with cultural context
- Graceful degradation when AI services are unavailable

## 📱 Responsive Design

### Desktop Experience
- Two-column layout (dish name | explanation)
- Hover effects and smooth animations
- Advanced UI components with glassmorphism effects
- Efficient table-based menu display

### Mobile Experience
- Accordion-style menu interface
- Touch-friendly controls
- Camera integration for menu capture
- Simplified navigation and forms

### Design System
- **Colors**: Cream background, charcoal text, coral accents, teal highlights
- **Typography**: Nunito font family with varied weights
- **Shadows**: Brutalist-style shadows for depth
- **Animations**: Smooth transitions and hover effects

## 🔧 Build & Deployment

### Development Setup
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
VITE_STRIPE_DAILY_PRICE_ID=price_xxx
VITE_STRIPE_WEEKLY_PRICE_ID=price_xxx
VITE_GEMINI_API_KEY=your_gemini_api_key

# Backend (Netlify Functions)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
RESEND_API_KEY=re_xxx
```

### Netlify Configuration
- **Build Command**: `rm -rf node_modules package-lock.json && npm install --prefer-offline=false && npm run build`
- **Publish Directory**: `dist`
- **Functions Directory**: `netlify/functions`
- **Redirects**: SPA routing configured in `netlify.toml`
- **Environment Variables**: Set in Netlify dashboard

### SEO Optimization
- **Sitemap**: Automatically generated with priority weighting
- **Robots.txt**: Configured to allow crawling with payment page exclusions
- **Meta Tags**: Dynamic OpenGraph and Twitter Card support
- **Schema.org**: Structured data for rich search results
- **Canonical URLs**: Prevent duplicate content issues

## 🌐 Serverless Functions (Netlify)

### Core API Endpoints

#### `create-checkout-session.cjs`
Stripe payment processing:
- Creates Stripe customer if needed
- Handles subscription plan validation
- Sets up checkout session with proper metadata
- Creates user profile automatically during checkout

#### `stripe-webhook.js`
Payment confirmation and user activation:
- Verifies Stripe webhook signatures
- Updates user subscription status and limits
- Resets scan counters on plan purchase
- Records orders in database
- Sends purchase confirmation emails

#### `getDishExplanation.ts`
AI-powered dish analysis:
- Universal fuzzy search across all languages (Chinese, Arabic, Latin scripts)
- Restaurant-aware caching with preference scoring
- Fallback to Gemini AI when no database match found
- Automatic dish saving with restaurant linking
- Multi-language prompt engineering (EN, ES, ZH, FR)

#### `contact-submit.ts`
Contact form processing:
- Form validation and spam prevention
- Database storage of submissions
- Dual email sending (admin notification + user confirmation)
- Email delivery tracking and error handling

#### `welcome-email.ts`
User onboarding:
- Automated welcome email for new signups
- User profile creation in custom table
- Duplicate prevention with email logs
- Template-based email generation

#### `check-expiring-subscriptions.ts`
Subscription management:
- Scheduled task to find expiring subscriptions
- Automated reminder emails before expiration
- Renewal link generation
- Email rate limiting to prevent spam

### Shared Services

#### `emailService.ts`
Centralized email handling:
- Resend API integration
- Template management
- Delivery tracking and logging
- Error handling and retry logic

#### `emailTemplates.ts`
Email template system:
- Welcome email templates
- Purchase confirmation templates
- Subscription expiry reminders
- Contact form confirmations
- Multi-language support planned

## 📊 Analytics & Monitoring

### Google Analytics (G-36SHN00S7N)
- Page view tracking with route change detection
- Event tracking for key user actions:
  - Menu upload method (camera vs file upload)
  - Scan success/failure with processing time
  - Dish explanation requests with language
  - Payment events with plan type
- Custom dimensions for user segmentation
- Conversion tracking for subscriptions

### Microsoft Clarity (shqg10vcxd)
- User session recordings for UX analysis
- Heatmap analysis on key pages
- Funnel analysis for conversion optimization
- Mobile vs desktop behavior patterns

### Error Monitoring
- Smart error filtering to avoid noise from browser extensions
- Critical error alerts for payment and AI failures
- Context-rich error reports with user journey
- User impact assessment and recovery tracking
- Enhanced console logging for development debugging

### Performance Monitoring
- API response time tracking
- Image upload performance metrics
- AI processing time optimization
- Database query performance analysis

## 🚀 Performance Optimizations

### Loading Strategies
- Image compression and optimization with progressive loading
- Lazy loading for non-critical components
- Code splitting by routes with preloading
- CDN delivery for static assets via Netlify Edge

### Intelligent Caching
- **AI Response Caching**: Database-first approach with 85% similarity threshold
- **Universal Fuzzy Matching**: Works across all language scripts (Latin, Chinese, Arabic)
- **Restaurant Context Caching**: Prioritize dishes from same restaurant
- **Browser Caching**: Aggressive caching for static resources
- **Real-time Subscriptions**: Live counter updates without polling

### Bundle Optimization
- Tree shaking for unused code elimination
- Dynamic imports for large libraries (Three.js, Chart.js)
- ESM imports with importmap for better bundling
- Vite's fast hot module replacement for development
- TypeScript compilation optimizations

### Database Performance
- **Atomic Operations**: RPC functions for counter increments
- **Indexed Queries**: Optimized for fuzzy search and user lookups
- **Connection Pooling**: Supabase handles connection management
- **Real-time Subscriptions**: Efficient WebSocket connections

## 🔒 Security Features

### Data Protection
- **Input Validation**: Comprehensive sanitization at all entry points
- **XSS Prevention**: React's built-in protections + manual encoding
- **CSRF Protection**: Supabase JWT tokens with secure headers
- **SQL Injection Prevention**: Supabase parameterized queries
- **File Upload Security**: Type validation and size limits

### Authentication Security
- **Password Requirements**: Minimum 6 characters with complexity options
- **Account Takeover Prevention**: Rate limiting on auth attempts
- **Session Management**: Secure JWT tokens with automatic refresh
- **Password Reset**: Secure token-based reset with expiration

### API Security
- **Webhook Verification**: Stripe signature validation
- **Environment Isolation**: Separate keys for development/production
- **Function Security**: Service role keys for admin operations
- **Rate Limiting**: Netlify edge functions with abuse prevention

### Privacy Compliance
- **GDPR Compliance**: Full user data control and deletion rights
- **Data Minimization**: Only collect necessary information
- **Consent Management**: Clear opt-in for data processing
- **Data Retention**: Automatic cleanup of expired data
- **Geographic Privacy**: Optional location sharing

### Abuse Prevention
- **Anonymous Limits**: 5 scans with browser fingerprinting
- **IP Rate Limiting**: Cloudflare protection via Netlify
- **Usage Pattern Analysis**: Detect and prevent automation
- **Graceful Degradation**: Service continues under load

## 🛠 Development Guidelines

### Code Quality Standards
- **TypeScript**: Strict mode with comprehensive type definitions
- **ESLint**: Custom rules for React and TypeScript best practices
- **Prettier**: Consistent code formatting across the codebase
- **Component Architecture**: Functional components with hooks
- **File Organization**: Feature-based folder structure

### Testing Strategy
- **Unit Tests**: Utility functions and service layer testing
- **Integration Tests**: API endpoint testing with mock data
- **E2E Tests**: Critical user flows (signup, payment, scanning)
- **Manual Testing**: UI/UX validation across devices
- **Error Boundary Testing**: Graceful failure handling

### Version Control & CI/CD
- **Git Flow**: Feature branches with protected main branch
- **Commit Standards**: Conventional commits with clear descriptions
- **Code Reviews**: Required for all changes with automated checks
- **Deployment Pipeline**: Automatic Netlify deployment on merge
- **Environment Management**: Separate staging and production configs

### Development Tools
- **Vite**: Fast development server with HMR
- **TypeScript**: Compile-time error detection
- **Tailwind CSS**: Utility-first styling with JIT compilation
- **Supabase Studio**: Database management and real-time testing
- **Stripe Dashboard**: Payment testing and webhook monitoring

## 📈 Future Enhancements

### Planned Features
- **Wine Pairing AI**: Suggest wines based on dish analysis
- **Nutritional Analysis**: Calorie and macro tracking with health insights
- **Social Features**: Share discoveries with friends and review system
- **Restaurant Discovery**: Find restaurants by cuisine and dietary preferences
- **Offline Caching**: PWA with offline menu access
- **Voice Integration**: Voice-activated explanations for accessibility
- **Dietary Restriction Alerts**: Personal allergen warning system

### Technical Roadmap
- **Progressive Web App**: Native app experience with offline support
- **Advanced AI Features**: Custom dish recognition models
- **Performance Monitoring**: Real User Monitoring (RUM) with Core Web Vitals
- **A/B Testing Framework**: Feature flag system for optimization
- **Microservices Migration**: Containerized services for better scalability
- **GraphQL API**: More efficient data fetching with subscriptions
- **Edge Computing**: Cloudflare Workers for global performance

---

*This documentation covers the current state of WhatTheMenu as of the provided codebase. For the most up-to-date information, refer to the source code and commit history.*
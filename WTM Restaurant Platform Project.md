# WhatTheMenu Restaurant Platform - Complete Project Roadmap

## 📋 **Project Overview**

**Vision:** Transform WhatTheMenu from a consumer-focused menu scanning app into a B2B accessibility platform that helps restaurants serve customers with hearing impairments, language barriers, and visual needs.

**Business Model:** $25/month recurring revenue from restaurants, with 30-day free trials for new customers.

**Go-to-Market Strategy:** Cold email and cold calling restaurant owners with a fantastic demo experience.

## 🎨 **Epic 9: Design System Overhaul**
**Goal:** Transform playful consumer design into professional B2B aesthetic while keeping friendly WhatTheMenu branding

### 🎯 **Tasks**

#### **9.1 Design System Updates**
- [ ] **Color palette refinement**
  - [ ] Keep coral accent color but make more professional
  - [ ] Soften bright yellows to more sophisticated tones
  - [ ] Add professional grays and darker backgrounds
  - [ ] Maintain accessibility standards (contrast ratios)

#### **9.2 Typography & Spacing**
- [ ] **Professional typography hierarchy**
  - [ ] Reduce excessive use of "font-black" (900 weight)
  - [ ] Balance bold headings with readable body text
  - [ ] Consistent spacing system (more white space)
  - [ ] Professional line heights and letter spacing

#### **9.3 Component Design Updates**
- [ ] **Professional component styling**
  - [ ] Reduce heavy drop shadows and borders
  - [ ] Soften rounded corners (less playful)
  - [ ] More subtle hover effects and transitions
  - [ ] Professional card designs and layouts
  - [ ] Cleaner form styling

#### **9.4 Layout & Visual Hierarchy**
- [ ] **B2B-appropriate layouts**
  - [ ] More structured, grid-based layouts
  - [ ] Professional section spacing
  - [ ] Business-appropriate imagery choices
  - [ ] Cleaner navigation and buttons
  - [ ] Professional iconography

#### **9.5 Brand Balance**
- [ ] **Maintain friendly approachability**
  - [ ] Keep "WhatTheMenu?" name and personality
  - [ ] Balance professional with approachable
  - [ ] Warm, welcoming but serious about business
  - [ ] Trustworthy and reliable visual identity

**Acceptance Criteria:**
- Design feels professional enough for B2B sales
- Maintains friendly, approachable WhatTheMenu brand
- Restaurant owners feel confident showing to customers
- Visual hierarchy guides users through conversion flow
- Accessibility standards maintained throughout

---

## 🎯 **Epic 1: Platform Pivot (Consumer → Restaurant Focus)**
**Goal:** Transform homepage from B2C to B2B without breaking existing functionality

### ✅ **Completed Tasks**
- [x] Created restaurant landing page (`/restaurants`)
- [x] Updated header with "For Restaurants" navigation  
- [x] Fixed import errors and routing issues
- [x] Established URL structure planning

### 🔄 **In Progress Tasks**
- [ ] **Create `/consumers` page** - Move current homepage content
  - [ ] Copy existing HomePage component to ConsumersPage
  - [ ] Preserve all existing functionality (menu scanning, AI explanations)
  - [ ] Update internal navigation and CTAs
  - [ ] Test all consumer features still work

### 🎯 **Remaining Tasks**

#### **1.1 Homepage Transformation**
- [ ] **Replace homepage route** (`/` → restaurant landing page)
  - [ ] Update App.tsx routing
  - [ ] Redirect old bookmarks gracefully
  - [ ] Update sitemap.xml
  - [ ] **Remove testimonial/review section from restaurant landing page**
  - [ ] **Make pricing section more flexible** (remove fixed $25/month, add "Contact for Pricing" or variable pricing)

#### **1.2 Header Cleanup**
- [ ] **Remove consumer-focused elements**
  - [ ] Remove counter pills (scans_used, dish_explanations)
  - [ ] Remove "Plan" indicator
  - [ ] Remove "Profile" button for non-authenticated users
  - [ ] Simplify to: Logo | For Restaurants | See Demo | Contact | FAQ

#### **1.3 Footer Cleanup** 
- [ ] **Remove consumer analytics**
  - [ ] Remove "Live Counters" section entirely
  - [ ] Keep legal links (Terms, Privacy, Refunds)
  - [ ] Add restaurant-focused messaging
  - [ ] Update copyright to reflect B2B focus

#### **1.4 Navigation Flow Updates**
- [ ] **Update internal links**
  - [ ] Change demo links to point to `/consumers`
  - [ ] Update "See Demo" button in header
  - [ ] Update restaurant landing page CTAs
  - [ ] Test all navigation paths

**Acceptance Criteria:**
- whatthemenu.com shows restaurant landing page
- All consumer functionality preserved at /consumers
- No broken links or missing pages
- Clean, professional restaurant-focused navigation

---

## 🎭 **Epic 2: Demo Restaurant Showcase**
**Goal:** Create compelling demo that closes deals during cold calls

### 🎯 **Tasks**

#### **2.1 Demo Restaurant Data Creation**
- [ ] **Create "Demo Bistro" test restaurant**
  - [ ] Design realistic menu with 20-30 items
  - [ ] Include variety: appetizers, mains, desserts, drinks
  - [ ] Add complex dishes that showcase AI explanations
  - [ ] Include common allergens and dietary restrictions

#### **2.2 Perfect AI Translations**
- [ ] **Generate 4-language explanations**
  - [ ] English (detailed, appetizing descriptions)
  - [ ] Spanish (authentic translations)
  - [ ] Chinese (culturally appropriate)
  - [ ] French (sophisticated descriptions)
  - [ ] Manual review and editing for perfection

#### **2.3 Demo Restaurant Page Enhancement**
- [ ] **Mobile-first design optimization**
  - [ ] Touch-friendly interface for phone users
  - [ ] Fast loading on slow connections
  - [ ] Accessible color contrast and fonts
  - [ ] Screen reader compatibility

#### **2.4 Demo UX Polish**
- [ ] **Professional visual design**
  - [ ] High-quality food imagery (stock photos)
  - [ ] Consistent styling across all languages
  - [ ] Loading states and smooth transitions
  - [ ] Error handling for edge cases

#### **2.5 Sales Support Materials**
- [ ] **Create sales assets**
  - [ ] Screenshot gallery of key features
  - [ ] Before/after menu comparisons
  - [ ] Mobile demo walkthrough guide
  - [ ] ROI calculator (revenue impact)

**Acceptance Criteria:**
- Demo restaurant looks professional enough for paid service
- All 4 languages display perfectly
- Mobile experience is flawless
- Loads quickly and handles errors gracefully
- Sales team can confidently demo to prospects

---

## 🏢 **Epic 3: Restaurant Onboarding System**
**Goal:** Convert "yes" prospects into paying customers

### 📋 **User Stories (from ACCESS MENU PLAN.md)**
- *As a restaurant owner, I want to sign up quickly with minimal fields, so I can test the product right away.*  
- *As a restaurant owner, I want to upload my menu and edit dishes, so I can control how my food is described.*  
- *As a restaurant owner, I want a QR code linked to my menu page, so I can print and share it easily.*  
- *As a restaurant owner, I want a free trial, so I can evaluate before paying.*  
- *As a restaurant owner, I want to edit translations and tags, so I can ensure accuracy for my customers.*

### 🎯 **Tasks**

#### **3.1 Restaurant Signup Flow**
- [ ] **Create signup page** (`/restaurants/signup`)
  - [ ] Step-by-step wizard interface
  - [ ] Restaurant info form (name, email, phone number, city, cuisine)
  - [ ] Owner info form (name, email, phone)
  - [ ] Menu upload interface (PDF, image, photo - drag & drop)
  - [ ] Terms acceptance and privacy consent
  - [ ] 1-month free trial → requires credit card only after trial

#### **3.2 Menu Upload & Processing**
- [ ] **File handling system**
  - [ ] Support JPG, PNG, PDF uploads
  - [ ] Image compression and optimization
  - [ ] **Menu Processing Pipeline:**
    - [ ] Scan menu → auto-detect sections, dish names, explanations, prices
    - [ ] Non-food details (timings, last order, etc.) saved separately in text field
    - [ ] Store everything in DB under restaurant ID
  - [ ] Progress indicators and error handling
  - [ ] Preview processed results before saving

#### **3.3 Restaurant Authentication**
- [ ] **Separate auth system for restaurants**
  - [ ] Restaurant account creation
  - [ ] Email verification flow
  - [ ] Password reset functionality
  - [ ] Session management
  - [ ] Role-based access control

#### **3.4 Unique URL + QR Code Generation**
- [ ] **Post-signup experience**
  - [ ] Generate unique restaurant URL (`whatthemenu.com/r/[restaurant-slug]`)
  - [ ] Auto-generate QR code linked to that URL
  - [ ] Provide QR codes in multiple sizes (A5, A6, square for stickers)
  - [ ] Download option (PNG, SVG, PDF)
  - [ ] Send welcome email with next steps
  - [ ] Dashboard first-time experience
  - [ ] 30-day trial activation

**Acceptance Criteria:**
- Restaurant owners can sign up in under 5 minutes
- Menu processing works reliably
- QR codes generate immediately
- Professional welcome experience
- Clear next steps provided

---

## 🛠️ **Epic 4: Restaurant Management Portal**
**Goal:** Enable restaurants to self-manage their accessible menus

### 🎯 **Tasks**

#### **4.1 Restaurant Dashboard**
- [ ] **Main dashboard page** (`/restaurant/dashboard`)
  - [ ] Overview of restaurant status
  - [ ] Quick stats (page views, QR scans)
  - [ ] Menu status and last updated
  - [ ] QR code download section
  - [ ] Support contact information

#### **4.2 Restaurant Menu Editing Interface**
- [ ] **Menu editing system** (`/restaurant/menu`)
  - [ ] **Editable fields (from ACCESS MENU PLAN.md):**
    - [ ] Dish names + explanations (in all 4 languages)
    - [ ] Prices
    - [ ] Allergen/dietary tags (multi-select, saved in all languages)
    - [ ] Restaurant misc info (bottom of menu page)
  - [ ] Live preview of changes
  - [ ] Dish list with edit/delete actions
  - [ ] Add new dish form
  - [ ] Bulk edit capabilities
  - [ ] Category/section management
  - [ ] Save/publish workflow

#### **4.3 Multilingual Content Management**
- [ ] **Translation editing tools**
  - [ ] Side-by-side editing (EN | ES | ZH | FR)
  - [ ] AI suggestion improvements
  - [ ] Manual override capabilities
  - [ ] Consistency checking
  - [ ] Preview in each language

#### **4.4 Restaurant Profile Management**
- [ ] **Basic profile editing**
  - [ ] Restaurant name and description
  - [ ] Address and contact info
  - [ ] Operating hours
  - [ ] Cuisine type and specialties
  - [ ] Upload logo/photos

#### **4.5 QR Code Management**
- [ ] **QR code generation and downloads**
  - [ ] Multiple sizes (A5, A6, square)
  - [ ] Different formats (PNG, SVG, PDF)
  - [ ] Print-ready templates
  - [ ] Customization options (colors, branding)
  - [ ] Usage tracking

#### **4.6 Free Trial & Billing Integration**
- [ ] **Subscription management**
  - [ ] Stripe integration for restaurants
  - [ ] Free trial → after 30 days, prompt for credit card
  - [ ] Flexible subscription pricing (starting ~$25/month)
  - [ ] Pro-rated billing and cancellations
  - [ ] Invoice generation and payment history

**Acceptance Criteria:**
- Restaurant owners can update menus independently
- All changes reflect immediately on public pages
- QR codes update automatically
- Interface is intuitive for non-technical users
- All 4 languages maintained consistently

---

## 🍽️ **Epic 5: Customer Experience (Restaurant Pages)**
**Goal:** Deliver the accessibility experience that justifies the monthly fee

### 🎯 **Tasks**

#### **5.1 Public Restaurant Page Optimization**
- [ ] **Mobile-first experience** (`/r/restaurant-slug`)
  - [ ] Touch-optimized interface
  - [ ] Large, readable fonts
  - [ ] High contrast accessibility
  - [ ] Voice-over compatibility
  - [ ] Offline menu caching

#### **5.2 Language Switching Interface**
- [ ] **Seamless multilingual experience**
  - [ ] Prominent language selector
  - [ ] Instant switching without reload
  - [ ] Remember language preference
  - [ ] Cultural design adaptations
  - [ ] Right-to-left language support prep

#### **5.3 Accessibility Features**
- [ ] **Visual accessibility enhancements**
  - [ ] WCAG 2.1 AA compliance
  - [ ] Keyboard navigation support
  - [ ] Screen reader optimization
  - [ ] High contrast mode toggle
  - [ ] Font size adjustment

#### **5.4 Dietary & Allergen Features**
- [ ] **Smart filtering system**
  - [ ] Allergen warning system
  - [ ] Dietary restriction filters
  - [ ] Ingredient highlighting
  - [ ] Custom dietary profiles
  - [ ] Clear warning disclaimers

#### **5.5 Server Communication Interface**
- [ ] **Visual-only ordering support**
  - [ ] Order building interface
  - [ ] Question/note system for servers
  - [ ] Visual confirmation screens
  - [ ] No-sound interaction design
  - [ ] Print-friendly order summaries

**Acceptance Criteria:**
- Customers can navigate menu without audio
- All dietary restrictions clearly marked
- Fast loading on slow mobile connections
- Works perfectly in 4 languages
- Professional appearance worthy of paid service

---

## 🌍 **Epic 10: Geographic Expansion & Growth** 
**Goal:** Implement referral system and geographic limitations for controlled growth

### 📋 **User Stories (from ACCESS MENU PLAN.md)**
- *As a restaurant owner, I want to invite a limited number of peers, so I feel exclusive and part of a special program.*  
- *As a restaurant owner, I want to know the service is limited to my region, so I understand its relevance.*
- *As a diner, I want to browse restaurants by city and cuisine, so I can find accessible menus near me.*
- *As a restaurant, I want my listing to appear, so I get more customers.*

### 🎯 **Tasks**

#### **10.1 Geographic Restrictions**
- [ ] **Australia-only launch**
  - [ ] Restrict signup form to Australian addresses
  - [ ] Soft-limiting: "Currently available only in Australia"
  - [ ] Australian business registration validation
  - [ ] Local phone number formatting

#### **10.2 Referral System**
- [ ] **Peer referral program**
  - [ ] Each restaurant gets a referral link after signup
  - [ ] Max 3 referrals per restaurant
  - [ ] Referrals must sign up to count
  - [ ] Referral tracking and rewards
  - [ ] Exclusive program messaging

#### **10.3 Restaurant Directory/Listings**
- [ ] **Public restaurant directory** (`/directory`)
  - [ ] Filter by City (Adelaide, Sydney, etc.)
  - [ ] Filter by Cuisine (Italian, Indian, etc.)
  - [ ] Each listing:
    - [ ] Restaurant name + logo
    - [ ] City, cuisine
    - [ ] Link to menu (unique URL)
  - [ ] Data source: info collected at signup

#### **10.4 Waitlist System (Optional)**
- [ ] **Capacity management**
  - [ ] If cap is reached, show "Join Waitlist" page
  - [ ] Collect email for future invites
  - [ ] Automated invitation system
  - [ ] Waitlist analytics and management

**Acceptance Criteria:**
- Only Australian restaurants can sign up initially
- Referral system drives organic growth
- Directory showcases participating restaurants
- Exclusive feel maintained throughout experience

---

## 📚 **Epic 6: Legal & Documentation Updates**
**Goal:** Update all legal documents and policies for B2B focus

### 🎯 **Tasks**

#### **6.1 Legal Document Overhaul**
- [ ] **Terms of Service updates**
  - [ ] B2B service agreement language
  - [ ] Restaurant responsibilities
  - [ ] Data processing terms
  - [ ] Service level agreements
  - [ ] Liability limitations for accessibility claims

- [ ] **Privacy Policy updates**  
  - [ ] Restaurant data collection
  - [ ] Customer data handling
  - [ ] GDPR compliance for EU restaurants
  - [ ] Data retention policies
  - [ ] Third-party AI processing disclosures

- [ ] **Refund Policy updates**
  - [ ] B2B refund terms
  - [ ] Trial period policies
  - [ ] Service cancellation terms
  - [ ] Pro-rated refund calculations
  - [ ] Technical issue resolution

#### **6.2 Business Documentation**
- [ ] **Service agreements**
  - [ ] Master service agreement template
  - [ ] Data processing agreement (DPA)
  - [ ] Service level agreement (SLA)
  - [ ] Implementation guide for restaurants

#### **6.3 Support Documentation**
- [ ] **Help center creation**
  - [ ] Setup guides for restaurants
  - [ ] Menu management tutorials
  - [ ] QR code implementation guide
  - [ ] Troubleshooting common issues
  - [ ] Best practices for accessibility

**Acceptance Criteria:**
- All legal documents reflect B2B business model
- Compliance with applicable regulations
- Clear service expectations set
- Professional legal foundation established

---

## 🚀 **Epic 7: Technical Infrastructure**
**Goal:** Robust backend systems for restaurant platform

### 🎯 **Tasks**

#### **7.1 Database Schema Updates**
- [ ] **Restaurant management tables**
  - [ ] restaurant_profiles table
  - [ ] restaurant_menus table  
  - [ ] restaurant_menu_items table
  - [ ] restaurant_analytics table
  - [ ] restaurant_qr_codes table

#### **7.2 AI Processing Pipeline**
- [ ] **Menu processing automation**
  - [ ] Image OCR and text extraction
  - [ ] Dish identification and parsing
  - [ ] AI translation to 4 languages
  - [ ] Allergen detection
  - [ ] Quality assurance checks

#### **7.3 Billing & Subscription Management**
- [ ] **Stripe integration for restaurants**
  - [ ] Subscription creation and management
  - [ ] 30-day free trial handling
  - [ ] Automatic billing and renewals
  - [ ] Invoice generation and emails
  - [ ] Failed payment handling

#### **7.4 Analytics & Monitoring**
- [ ] **Restaurant analytics system**
  - [ ] Page view tracking
  - [ ] QR code scan analytics
  - [ ] Language usage statistics
  - [ ] Customer interaction metrics
  - [ ] Revenue tracking and reporting

#### **7.5 Performance & Reliability**
- [ ] **Production optimization**
  - [ ] CDN setup for restaurant pages
  - [ ] Database query optimization
  - [ ] Caching strategy implementation
  - [ ] Error monitoring and alerting
  - [ ] Backup and disaster recovery

**Acceptance Criteria:**
- System handles 1000+ restaurants reliably
- Fast page loads (under 2 seconds)
- 99.9% uptime for restaurant pages
- Accurate billing and analytics
- Scalable architecture for growth

---

## 📈 **Epic 8: Sales & Marketing Support**
**Goal:** Tools and materials to accelerate restaurant acquisition

### 🎯 **Tasks**

#### **8.1 Sales Tools**
- [ ] **Demo booking system**
  - [ ] Calendar integration for sales calls
  - [ ] Demo restaurant customization
  - [ ] Lead capture and CRM integration
  - [ ] Follow-up email automation

#### **8.2 Marketing Materials**
- [ ] **Sales collateral**
  - [ ] Feature comparison sheets
  - [ ] ROI calculation tools
  - [ ] Case study templates
  - [ ] Implementation timeline guides
  - [ ] Success metrics tracking

#### **8.3 Onboarding Automation**
- [ ] **Email sequences**
  - [ ] Welcome series for new restaurants
  - [ ] Setup reminder emails
  - [ ] Best practices sharing
  - [ ] Success milestone celebrations
  - [ ] Renewal preparation sequences

#### **8.4 Analytics Dashboard**
- [ ] **Sales metrics tracking**
  - [ ] Lead conversion rates
  - [ ] Trial to paid conversion
  - [ ] Customer lifetime value
  - [ ] Churn analysis
  - [ ] Revenue forecasting

**Acceptance Criteria:**
- Sales team has all tools needed for success
- Automated onboarding reduces manual work
- Clear metrics for measuring growth
- Professional marketing materials available

---

## 🗓️ **Implementation Timeline**

### **Phase 1: Foundation (Weeks 1-2)**
- Epic 1: Platform Pivot ✅ (Partially complete)
- Epic 2: Demo Restaurant Showcase
- Epic 9: Design System Overhaul (Start)

### **Phase 2: Sales Ready (Weeks 3-4)** 
- Epic 3: Restaurant Onboarding System
- Epic 6: Legal & Documentation Updates (Basic)
- Epic 9: Design System Overhaul (Complete)

### **Phase 3: Customer Ready (Weeks 5-6)**
- Epic 4: Restaurant Management Portal
- Epic 5: Customer Experience Polish

### **Phase 4: Scale Ready (Weeks 7-8)**
- Epic 7: Technical Infrastructure
- Epic 8: Sales & Marketing Support

---

## ✅ **Completed Work Summary**

### **Already Built & Working:**
- [x] Restaurant landing page (`/restaurants`)
- [x] Consumer demo functionality (AccessMenu interface)
- [x] QR code generation system ✅ **COMPLETE**
- [x] AI menu processing (Gemini integration)
- [x] Multi-language support (4 languages)
- [x] Supabase database foundation
- [x] Stripe payment integration
- [x] Mobile-responsive design system
- [x] Legal page framework

### **Ready to Build On:**
- Existing AI translation pipeline
- QR code generation system
- Mobile-first design components
- Authentication system foundation
- Payment processing infrastructure

---

## 🎯 **Success Metrics**

### **Sales Metrics:**
- Demo conversion rate > 20%
- Trial to paid conversion > 40%
- Customer lifetime value > $300
- Monthly churn rate < 5%

### **Product Metrics:**
- Restaurant page load time < 2 seconds
- 99.9% uptime for customer-facing pages
- Customer satisfaction > 4.5/5 stars
- Support ticket volume < 2 per restaurant/month

### **Business Metrics:**
- 100 restaurants by end of Q1
- $2,500 MRR by end of Q1
- Break-even by month 6
- 500 restaurants by end of year 1

---

**Next Immediate Action:** Begin Epic 1 implementation by creating the `/consumers` page and cleaning up the header/footer components.
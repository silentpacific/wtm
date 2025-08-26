# WhatTheMenu Restaurant Platform - FINAL Project Plan

## 🗺️ **FINAL SITEMAP - NO OTHER PAGES**

```
Homepage (/)
├── Authentication
│   ├── /signup
│   ├── /login
│   └── /forgot-password
├── Dashboard (/dashboard) - Restaurant Owner Portal
│   ├── /dashboard/menu-editor
│   ├── /dashboard/qr-codes
│   ├── /dashboard/profile
│   ├── /dashboard/billing
│   └── /dashboard/settings
├── Demo Menus (/demos) - Landing page to view different menus
│   ├── /demos/sample-menu-1
│   ├── /demos/sample-menu-2
│   ├── /demos/sample-menu-3
│   └── /demos/sample-menu-4
└── Support Pages
    ├── /contact
    ├── /faq
    ├── /terms
    ├── /privacy
    ├── /disclaimer
    ├── /about
    └── /help

Consumers (/consumers) - HIDDEN from navigation, URL discovery only
```

---

## 🎯 **BUILD ORDER & PRIORITIES**

### **PHASE 1: Core Foundation ✅ DONE**
- [x] Homepage (/) - Restaurant marketing landing
- [x] /consumers - Hidden consumer page
- [x] Basic navigation and routing

### **PHASE 2: Demo System (NEXT)**
- [ ] **/demos** - Demo menus landing page
- [ ] **/demos/sample-menu-1** - Interactive restaurant menu #1
- [ ] **/demos/sample-menu-2** - Interactive restaurant menu #2  
- [ ] **/demos/sample-menu-3** - Interactive restaurant menu #3
- [ ] **/demos/sample-menu-4** - Interactive restaurant menu #4
- [ ] **4-language support** for all demo menus (EN/ES/ZH/FR)
- [ ] **Allergen filtering** and dietary restrictions
- [ ] **Visual-only interface** for accessibility

### **PHASE 3: Authentication System**
- [ ] **/signup** - Restaurant owner registration
- [ ] **/login** - Restaurant owner login
- [ ] **/forgot-password** - Password reset flow

### **PHASE 4: Restaurant Management Dashboard**
- [ ] **/dashboard** - Main dashboard overview
- [ ] **/dashboard/menu-editor** - Upload and edit restaurant menus
- [ ] **/dashboard/qr-codes** - Generate and download QR codes
- [ ] **/dashboard/profile** - Restaurant profile management
- [ ] **/dashboard/billing** - Subscription and payment management
- [ ] **/dashboard/settings** - Account settings and preferences

### **PHASE 5: Support Pages**
- [ ] **/contact** - Working contact form
- [ ] **/faq** - Frequently asked questions
- [ ] **/terms** - Terms of use (B2B focused)
- [ ] **/privacy** - Privacy policy
- [ ] **/disclaimer** - Legal disclaimer
- [ ] **/about** - About the platform
- [ ] **/help** - Help documentation

---

## 🏗️ **TECHNICAL ARCHITECTURE**

### **URL Structure**
```
whatthemenu.com/                    → Restaurant marketing (B2B acquisition)
whatthemenu.com/signup              → Restaurant signup
whatthemenu.com/login               → Restaurant login
whatthemenu.com/dashboard/*         → Restaurant management (authenticated)
whatthemenu.com/demos/*             → Demo restaurant menus (public)
whatthemenu.com/consumers           → Consumer explanation (HIDDEN, URL-only access)
whatthemenu.com/[support-pages]     → Legal/support content
```

### **Navigation Structure**
- **Header Navigation**: Homepage, Demos, Contact, FAQ, Login/Signup
- **Dashboard Navigation**: Menu Editor, QR Codes, Profile, Billing, Settings
- **Footer Navigation**: Terms, Privacy, Disclaimer, About, Help
- **Hidden Pages**: /consumers (no navigation links, URL discovery only)

---

## 📱 **USER FLOWS**

### **Restaurant Owner Flow**
1. **Homepage** → Learn about platform
2. **Demos** → View sample restaurant menus
3. **Signup** → Create restaurant account
4. **Dashboard** → Upload menu and manage account
5. **QR Codes** → Download and print QR codes
6. **Menu Editor** → Update dishes and prices

### **Customer Flow (Via QR Code)**
1. **Scan QR Code** → Goes directly to restaurant's menu page
2. **Choose Language** → Switch between EN/ES/ZH/FR
3. **Browse Menu** → Filter by allergens/dietary needs
4. **Visual Interface** → Order without audio requirements

### **Consumer Education Flow (Hidden)**
1. **Direct URL** → /consumers (not linked anywhere)
2. **Explanation** → How the system works
3. **Benefits** → For accessibility and language barriers

---

## 🚫 **WHAT WE'RE NOT BUILDING**

- ❌ No restaurant directory/listings
- ❌ No user profiles for consumers  
- ❌ No restaurant review system
- ❌ No integration with POS systems
- ❌ No mobile app (web-only)
- ❌ No social features
- ❌ No restaurant discovery features
- ❌ No consumer accounts/profiles

---

## 🎨 **DESIGN SYSTEM REQUIREMENTS**

### **Professional B2B Design**
- Clean, trustworthy appearance for restaurant owners
- Professional color scheme (coral accents, clean whites/grays)
- Mobile-first responsive design
- Accessible (WCAG AA compliance)

### **Demo Menu Design**
- Visual-first interface (no audio required)
- Clear, large typography
- High contrast for accessibility
- Touch-friendly mobile interface
- Instant language switching

---

## 📊 **SUCCESS METRICS**

### **Demo Effectiveness**
- Time spent on demo menus
- Language switching usage
- Contact form submissions after viewing demos

### **Restaurant Conversion**
- Signup rate after viewing demos
- Demo-to-paid conversion rate
- QR code download rate

### **Platform Usage**
- Restaurant dashboard engagement
- Menu update frequency
- Customer QR scan analytics

---

## 🔧 **DEVELOPMENT APPROACH**

### **Build Philosophy**
1. **Demo-first approach** - Perfect demo menus before building dashboard
2. **Mobile-first design** - Customer experience is primarily mobile
3. **Accessibility-first** - Visual-only interface requirements
4. **B2B focus** - Professional appearance for restaurant owners

### **Technology Stack**
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Netlify Functions + Supabase
- **Payments**: Stripe for restaurant subscriptions
- **AI**: Google Gemini for menu processing
- **Email**: Resend for transactional emails

---

## 📋 **DEVELOPMENT PHASES**

### **PHASE 1: Demo System ✅ NEXT**
1. **Perfect the demo system** - Build 4 sample restaurant menus
2. **Implement language switching** - EN/ES/ZH/FR for all demos
3. **Add accessibility features** - Visual-only interface, allergen filtering

### **PHASE 2: Authentication & Dashboard**
4. **Build authentication** - Restaurant signup/login system
5. **Create dashboard** - Restaurant management portal
6. **Complete support pages** - Contact, FAQ, Terms, Privacy, etc.

### **PHASE 3: Final Integration ⭐ FINAL STEP**
7. **Integrate original consumer platform** - Point `/consumers` to existing consumer app
   - **Source**: https://github.com/silentpacific/wtm/tree/backup/original-consumer-platform
   - **Action**: Replace current `/consumers` placeholder with full consumer app functionality
   - **Purpose**: Demo/reference for the original menu scanning and AI explanation features
   - **Status**: Hidden from navigation, URL discovery only

---

## 🔗 **FINAL INTEGRATION NOTES**

### **Consumer Platform Integration (Final Step)**
- **Current**: `/consumers` shows simple placeholder page
- **Final**: `/consumers` will load the complete original consumer platform
- **Source Code**: `backup/original-consumer-platform` branch
- **Integration Method**: Replace `ConsumersPage.tsx` with full consumer app components
- **Functionality**: Menu scanning, AI explanations, multi-language support
- **Visibility**: Remains hidden from navigation (URL discovery only)

### **Integration Steps (End of Project)**
1. Pull consumer platform code from backup branch
2. Integrate consumer components into current project structure
3. Ensure consumer app functionality works independently
4. Verify `/consumers` provides full demo experience
5. Test that consumer platform doesn't interfere with B2B platform

---

**This is the complete scope. No additional pages or features will be added.**
# 🍴 Accessible Menu — Product Development To-Do (Restaurant Onboarding + Listings)

---

## **Epic 1: Restaurant Onboarding Flow**
> Goal: Let restaurants easily sign up, upload menus, and start offering accessible menus with QR codes.

### Features
1. **Restaurant Landing Page**
   - Uses same styling as WhatTheMenu.com  
   - Content blocks:  
     - What this tool does  
     - Why it’s essential (accessibility, inclusivity, language support)  
     - Why it makes business sense (attracts tourists + Deaf diners, improves reviews)  
     - Steps to get started  
     - Pricing ($25/month after free trial)  
   - “Restaurant Sign-In” link in header nav.  
   - Footer link to this page.

2. **Signup & Account Creation**
   - Form: restaurant name, email, phone number, city, cuisine.  
   - Upload/scan menu (PDF, image, photo).  
   - 1-month free trial → requires credit card only after trial.  
   - Store restaurant info in DB.

3. **Unique URL + QR Code**
   - System generates a unique restaurant URL (`whatthemenu.com/r/[restaurant-slug]`).  
   - Auto-generate QR code linked to that URL.  
   - Provide QR codes in multiple sizes (A5, A6, square for stickers).  
   - Download option (PNG, SVG, PDF).

4. **Menu Processing**
   - Scan menu → auto-detect sections, dish names, explanations, prices.  
   - Non-food details (timings, last order, etc.) saved separately in a text field.  
   - Store everything in DB under that restaurant.  

5. **Restaurant Menu Editing**
   - Editable fields:  
     - Dish names + explanations (in all 4 languages)  
     - Prices  
     - Allergen/dietary tags (multi-select, saved in all languages)  
     - Restaurant misc info (bottom of menu page)  
   - Live preview of changes.  

6. **Free Trial & Billing**
   - Stripe (or similar) integration.  
   - Free trial → after 30 days, prompt for credit card.  
   - Subscription plan: $25/month.  

---

### **User Stories**
- *As a restaurant owner, I want to sign up quickly with minimal fields, so I can test the product right away.*  
- *As a restaurant owner, I want to upload my menu and edit dishes, so I can control how my food is described.*  
- *As a restaurant owner, I want a QR code linked to my menu page, so I can print and share it easily.*  
- *As a restaurant owner, I want a free trial, so I can evaluate before paying.*  
- *As a restaurant owner, I want to edit translations and tags, so I can ensure accuracy for my customers.*  

---

### Priority
1. Restaurant Landing Page + Signup  
2. Unique URL + QR Code  
3. Menu Processing + Editing  
4. Free Trial + Billing  

---

## **Epic 2: Referral & Growth**
> Goal: Drive demand, limit access, and encourage organic adoption.

### Features
1. **Limit signups (Aussie-only at first)**
   - Restrict signup form to Australian addresses.  
   - Soft-limiting: “Currently available only in Australia.”  

2. **Referral System**
   - Each restaurant gets a referral link after signup.  
   - Max 3 referrals per restaurant.  
   - Referrals must sign up to count.  

3. **Waitlist (optional)**
   - If cap is reached, show “Join Waitlist” page.  
   - Collect email for future invites.  

---

### **User Stories**
- *As a restaurant owner, I want to invite a limited number of peers, so I feel exclusive and part of a special program.*  
- *As a restaurant owner, I want to know the service is limited to my region, so I understand its relevance.*  

---

### Priority
1. Aussie-only restriction  
2. Referral system  
3. Waitlist (stretch goal)  

---

## **Epic 3: Restaurant Listings**
> Goal: Showcase participating restaurants → help diners discover them.

### Features
1. **Public Restaurant Directory**
   - `/restaurants` page.  
   - Filter by City (Adelaide, Sydney, etc.).  
   - Filter by Cuisine (Italian, Indian, etc.).  
   - Each listing:  
     - Restaurant name + logo  
     - City, cuisine  
     - Link to menu (unique URL).  

2. **Data Source**
   - Info collected at signup: restaurant name, city, cuisine.  

---

### **User Stories**
- *As a diner, I want to browse restaurants by city and cuisine, so I can find accessible menus near me.*  
- *As a restaurant, I want my listing to appear, so I get more customers.*  

---

### Priority
1. Basic list page  
2. Filters (city, cuisine)  
3. Enhanced profile (stretch: reviews, images)  

---

## **Epic 4: Menu Scanning & Data Handling**
> Goal: Automate parsing menus into structured data with multi-language support.

### Features
1. **OCR & Parsing**
   - Extract dish sections, names, descriptions, and prices.  
   - Extract misc info (timings, notes) separately.  

2. **Data Storage**
   - Save to DB under restaurant ID.  
   - Schema includes:  
     - Sections  
     - Dishes (name, desc, price)  
     - Explanations (all 4 languages)  
     - Allergen/dietary tags (all 4 languages)  
     - Misc info  

3. **Editing Interface**
   - After scan, restaurant can review & edit fields.  
   - Editable in all 4 languages.  

---

### **User Stories**
- *As a restaurant owner, I want my scanned menu to be auto-parsed, so I don’t need to retype everything.*  
- *As a restaurant owner, I want to edit scanned info, so I can fix errors.*  
- *As a restaurant owner, I want dish translations prefilled, so I save time localizing.*  

---

### Priority
1. OCR + parsing basic structure  
2. DB schema + storage  
3. Editing UI for menus  

---

# 🚀 Implementation Roadmap (Prioritized)

### **Phase 1 (MVP Onboarding)**
- Landing page + Sign-in/Sign-up  
- Signup form (restaurant name, email, phone, city, cuisine)  
- Unique URL + QR code generation  
- Basic menu scanning + storage  
- Menu editing interface  
- 1-month free trial (billing prompt disabled in MVP)

### **Phase 2 (Growth & Listings)**
- Add subscription billing ($25/month after trial)  
- Add referral system (max 3 per user)  
- Restrict to Australian restaurants only  
- Public restaurant listings page (city + cuisine filters)

### **Phase 3 (Enhancements)**
- Better OCR accuracy & AI menu parsing  
- Editable translations (in all 4 languages)  
- Downloadable QR code bundles (different formats)  
- Waitlist system when signups reach cap  
- Advanced restaurant profiles in directory  

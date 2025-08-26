**Audience:** Claude / Dev team  
**Purpose:** A single, step-by-step brief to implement the B2B version of WhatTheMenu without breaking existing flows.  
**Outcome:** Warmer, friendlier product that increases B2B sign-ups, stays accessible (WCAG AA+), and minimizes "AI-ish" icon usage.

---

## 0) Vision & Positioning

**One-liner:** *Make every guest feel welcome.*  
WhatTheMenu turns any restaurant menu into an **interactive, multilingual guide** with **clear allergen & dietary filters** and a **visual order-confirmation** flow that helps **tourists, expats, and Deaf diners** order confidently.

**Principles**
- Accessibility first (WCAG AA or better).
- Warm, human aesthetic (real photos > icons).
- Minimal icons (only where clarity truly improves).
- Conversational, benefit-driven copy.
- 1 strong primary CTA + 1 soft secondary CTA.
- Low page weight; Lighthouse ≥ 90 across P/A/BP/SEO.

---

## 1) Non-Breaking Delivery Plan (Phases)

### Phase 1 — Design System & Tokens ✅ COMPLETED
- ✅ Introduce semantic CSS variables and component classes **without removing** existing classes.  
- ✅ Create new `.btn-*`, `.card`, `.chip`, `.input-field`, `.stepper` classes and **progressively migrate** UIs.  
- ✅ Add a **feature flag** or environment gate if needed to ship pages incrementally.

### Phase 2 — Page Implementations ✅ COMPLETED
- ✅ Homepage → Demo Menus → Interactive Menu → Order Drawer & Confirm Screen → FAQ → QR Generator → Restaurant Profile
- ✅ Login, Signup, Forgot Password pages
- ✅ Dashboard and Menu Editor pages
- ✅ Header and DashboardLayout components
- ✅ ConsumersPage
- ✅ Profile page with Account section (email/password change)
- ✅ Billing page (simple subscription management)
- ✅ Navigation cleanup (Settings page removed)

### Phase 3 — Accessibility, Performance, Analytics ⏳ PENDING
- Add focus styles, ARIA, reduced-motion handling, and analytics events.  
- Run Lighthouse & keyboard-only QA. Fix regressions.

### Phase 4 — Cleanup ⏳ PENDING
- Remove deprecated styles and unused icons.  
- Verify zero visual regressions vs. screenshots for each page.

---

## 2) Design System (Tokens, Components, CSS Tasks) ✅ COMPLETED

> **Goal:** unify styling site-wide and make it feel friendly, trustworthy, and accessible.

### 2.1 Color Tokens ✅ IMPLEMENTED
```css
:root {
  --wtm-primary: #E75A2F;     /* warm orange CTAs */
  --wtm-primary-600: #d44e26; /* hover */
  --wtm-secondary: #2E7E6F;   /* calming teal (trust) */
  --wtm-bg: #FFF8F3;          /* warm paper tint sections */
  --wtm-surface: #FFFFFF;
  --wtm-text: #1C1C1C;
  --wtm-muted: #6B7280;

  /* Chips (tints with AA-compliant foregrounds) */
  --chip-gluten-bg:  #FCEDEA; --chip-gluten-fg:  #7A2E21;
  --chip-dairy-bg:   #E9F6F3; --chip-dairy-fg:   #1A5A50;
  --chip-nuts-bg:    #FFF4D6; --chip-nuts-fg:    #7A5A07;
  --chip-shell-bg:   #EAF2FF; --chip-shell-fg:   #1A3E73;
  --chip-veg-bg:     #EAF8E6; --chip-veg-fg:     #235A1E;
}
```

### 2.2 Typography ✅ IMPLEMENTED
Headings: Poppins (600/700).
Body/UI: Inter (400/500/600).
Base font size ≥ 16px; line height 1.6; letter-spacing normal.
Prefer rounded corners and softer weights for friendliness.

### 2.3 Core Components ✅ IMPLEMENTED
All component classes implemented and applied across pages:

**Buttons** ✅
```css
.btn { 
  display:inline-flex; align-items:center; justify-content:center; gap:.5rem;
  padding:.75rem 1.25rem; border-radius:1rem; font-weight:600;
  transition: box-shadow .2s ease, transform .08s ease;
}
.btn-primary { background:var(--wtm-primary); color:#fff; }
.btn-primary:hover { background:var(--wtm-primary-600); }
.btn-secondary {
  background:var(--wtm-surface); color:var(--wtm-primary);
  border:2px solid var(--wtm-primary);
}
.btn-ghost { background:transparent; color:var(--wtm-primary); }
.btn-danger-ghost { background:transparent; color:#B91C1C; }

.btn:focus-visible {
  outline:none;
  box-shadow:0 0 0 2px #fff, 0 0 0 4px var(--wtm-primary);
}
```

**Cards** ✅
```css
.card {
  background:var(--wtm-surface);
  border:1px solid #EFE7E2; border-radius:1rem;
  box-shadow:0 1px 2px rgba(0,0,0,.02);
  transition: box-shadow .2s ease;
}
.card:hover { box-shadow:0 8px 24px rgba(28,28,28,.06); }
```

**Inputs** ✅
```css
.input-field {
  border:1px solid #E5E7EB; border-radius:.75rem; padding:.65rem .9rem;
  background:#fff;
}
.input-field:focus {
  border-color:var(--wtm-primary);
  box-shadow:0 0 0 2px rgba(231,90,47,.2);
  outline:none;
}
```

**Chips (dietary/allergen)** ✅
```css
.chip { display:inline-flex; align-items:center; gap:.35rem;
  padding:.25rem .6rem; border-radius:999px; font-weight:600; font-size:.85rem; }
.chip--gluten { background:var(--chip-gluten-bg); color:var(--chip-gluten-fg); }
.chip--dairy  { background:var(--chip-dairy-bg);  color:var(--chip-dairy-fg);  }
.chip--nuts   { background:var(--chip-nuts-bg);   color:var(--chip-nuts-fg);   }
.chip--shell  { background:var(--chip-shell-bg);  color:var(--chip-shell-fg);  }
.chip--veg    { background:var(--chip-veg-bg);    color:var(--chip-veg-fg);    }
```

**Stepper (horizontal 1-4)** ✅
```css
.stepper { display:flex; align-items:center; gap:.75rem; }
.step { display:flex; align-items:center; gap:.5rem; color:var(--wtm-muted); }
.step__dot { width:28px; height:28px; border-radius:999px; background:var(--wtm-bg);
  display:grid; place-items:center; font-weight:700; }
.step[aria-current="step"] { color:var(--wtm-text); }
.step[aria-current="step"] .step__dot { background:var(--wtm-primary); color:#fff; }
@media (prefers-reduced-motion: reduce) { .stepper { transition:none; } }
```

**Global A11y** ✅
```css
:focus-visible { outline:none; box-shadow:0 0 0 3px var(--wtm-primary); }
@media (prefers-reduced-motion: reduce) { * { animation:none !important; transition:none !important; } }
```

---

## 3) Page Implementation Status

### ✅ COMPLETED PAGES
- **Homepage** - Hero, problem/solution, value props, CTA bands updated
- **Demo Menus** - Stepper and demo cards with new styling
- **Interactive Menu (Guest View)** - Sticky tools bar, dish cards, allergen chips
- **Order & Communication Drawer** - Preset phrases, sticky total, confirmation screen
- **FAQ** - Categorized, searchable, friendly tone
- **QR Generator** - Color pickers, live preview, export options
- **Restaurant Profile** - Edit profile, account section with password change
- **Login/Signup/Forgot Password** - All auth flows updated
- **Dashboard** - Stats overview, quick actions with new styling
- **Menu Editor** - File upload, scanning, editing with chip system
- **Header** - Navigation with design tokens and updated CTAs
- **DashboardLayout** - Sidebar navigation (Settings removed)
- **ConsumersPage** - Customer-facing explanation page
- **BillingPage** - Simple subscription management ($20/month, trial tracking)

### ⏳ PENDING PAGES/COMPONENTS
- **RestaurantMenuPage** - Main interactive menu component (referenced by SampleMenu1)
- **ContactPage** - Contact/support page
- **Any other components** not yet updated

---

## 4) Marketing Copy Updates ✅ COMPLETED

**Hero H1:** Make every guest feel welcome.  
**Hero Sub:** WhatTheMenu turns your menu into an interactive, multilingual guide with clear allergen and dietary info—so tourists, expats, and Deaf customers can order with confidence.  
**CTAs:** Start Free Trial (primary) • See a Live Demo (secondary)  
**Badges:** Setup in minutes • 5+ languages • Allergen filters • QR codes for tables  

**Problem/Solution headings:**
- The challenge in busy dining rooms
- WhatTheMenu does for you

**Value props:**
- Upload once, share everywhere — PDF or image in → accessible web menu out. QR codes for tables included.
- Safe choices, fewer mistakes — Guests filter allergens and see clear dietary tags before they order.
- Friendly for Deaf customers — Visual phrases and order confirmation help reduce back-and-forth.

**CTA band:**
- Heading: Ready to make your restaurant accessible?
- Buttons: Sign Up Your Restaurant | Ask Questions

---

## 5) Implementation Progress by Epic

### EPIC A — Design System & Global Styling ✅ COMPLETED
- ✅ US A1: Color/type tokens implemented across all pages
- ✅ US A2: Reusable component classes implemented and applied

### EPIC B — Homepage ✅ COMPLETED
- ✅ US B1: New hero + two CTAs + badges; above-the-fold on mobile
- ✅ US B2: Two-column problem/solution block; mobile stacks cleanly
- ✅ US B3: Three value prop cards with minimal iconography

### EPIC C — Demo Menus ✅ COMPLETED
- ✅ US C1: Horizontal stepper + demo cards with keyboard/screen reader support

### EPIC D — Interactive Menu (Guest) ✅ COMPLETED
- ✅ US D1: Sticky tools bar; chips togglable with ARIA
- ✅ US D2: Name/desc/price layout; chips under name; actions consistent

### EPIC E — Order & Communication ✅ COMPLETED
- ✅ US E1: Drawer with quantity, note, preset phrases; sticky total; focus trap
- ✅ US E2: Confirmed screen with "Show this to waiter"; large type; browse-again action

### EPIC F — QR Generator ✅ COMPLETED
- ✅ US F1: Preview reflects color/background; export PNG/SVG/PDF; usage tips

### EPIC G — Restaurant Profile ✅ COMPLETED
- ✅ US G1: Editable name/cuisine/account info; disabled states clear

### EPIC H — FAQ ✅ COMPLETED
- ✅ US H1: Categorised accordion; client-side search; friendly tone

### EPIC I — A11y, Performance & Analytics ⏳ PENDING
- ⏳ US I1: Tab order logical; :focus-visible; ARIA on chips/stepper/drawer; 44px min targets; reduced-motion supported
- ⏳ US I2: LCP < 2.5s (4G), CLS < 0.05; responsive/lazy images; minimal bundle
- ⏳ US I3: Analytics events fired: hero_primary_cta_click, demo_card_view, signup_start, order_drawer_open, language_change, allergen_filter_apply

---

## 6) Developer Task List Progress

### ✅ COMPLETED TASKS
1. ✅ Add color/type tokens to CSS; import fonts (Poppins + Inter)
2. ✅ Implement .btn-*, .card, .input-field, .chip, .stepper in index.css
3. ✅ Replace icon-heavy buttons with text variants where possible
4. ✅ Build TopToolsBar with language dropdown, allergen/dietary chips, search, Review Order
5. ✅ Build DishCard component (name, desc, price right, chips, actions)
6. ✅ Implement OrderDrawer with preset phrases, sticky total, a11y focus trap
7. ✅ Implement ConfirmedOrder view (large text, border-emphasis red, print-safe)
8. ✅ Refactor Demo Menus page with horizontal stepper and image cards
9. ✅ Group FAQ by categories; add client-side search
10. ✅ Implement QR Generator preview + token-mapped colors + PNG/SVG/PDF export
11. ✅ Implement Restaurant Profile edit flow and account management
12. ✅ Update all auth pages (Login/Signup/Forgot Password)
13. ✅ Update Dashboard and Menu Editor pages
14. ✅ Update Header and DashboardLayout components
15. ✅ Create BillingPage with subscription management
16. ✅ Remove Settings page from navigation

### ⏳ PENDING TASKS
12. ⏳ Add analytics events
13. ⏳ Run a11y/perf audits; fix failures; write short test plan

---

## 7) QA & Acceptance Checklists

### Accessibility ⏳ PENDING
- ⏳ Keyboard-only run-through of every page
- ⏳ Screen reader announces chip states and stepper progress
- ⏳ Focus ring visible on all interactives
- ⏳ Targets ≥ 44×44px; ESC closes drawers/modals
- ⏳ Reduced-motion respected

### Performance ⏳ PENDING
- ⏳ LCP < 2.5s (4G), CLS < 0.05 on key pages
- ⏳ Images responsive & lazy-loaded
- ⏳ Bundle size reviewed; dead icons removed

### Visual ✅ MOSTLY COMPLETED
- ✅ Buttons, cards, chips use new tokens
- ✅ Prices aligned and formatted consistently
- ✅ Total bar sticky on drawer
- ✅ Minimal icons; text-first UX

### Content ✅ COMPLETED
- ✅ Copy blocks match spec; tone consistent
- ✅ Alt text provided for imagery

### Analytics ⏳ PENDING
- ⏳ Listed events fire with useful properties
- ⏳ Dashboard sanity check in dev tools

---

## 8) Assets & Content Status

### ✅ PREPARED/IMPLEMENTED
- ✅ Marketing copy updated across all pages
- ✅ Component styling and tokens
- ✅ Navigation structure optimized

### ⏳ STILL NEEDED
- ⏳ 4–6 warm photos (tables/menus/people) with alt text
- ⏳ 4 thumbnail images for demo cards
- ⏳ Restaurant names & sample menus (existing OK)
- ⏳ Optional logo strip for social proof

---

## 9) Definition of Done Progress

### ✅ COMPLETED
- ✅ Tokens implemented and used by buttons/cards/inputs/chips/stepper
- ✅ All specified pages updated with layouts/copy above
- ✅ Navigation streamlined (Settings removed, Billing added)

### ⏳ PENDING
- ⏳ Accessibility & performance thresholds met
- ⏳ Analytics events integrated
- ⏳ Legacy styles/icons cleaned
- ⏳ README section added describing tokens & components

---

## Next Steps Summary

**Phase 3 Tasks Remaining:**
1. Implement analytics events (hero_primary_cta_click, demo_card_view, signup_start, order_drawer_open, language_change, allergen_filter_apply)
2. Run comprehensive accessibility audit with keyboard-only testing
3. Run Lighthouse performance audit and optimize
4. Ensure all interactive elements meet 44px minimum touch target size
5. Test reduced-motion preferences across all animated components

**Phase 4 Tasks Remaining:**
1. Remove any remaining hardcoded colors and deprecated CSS classes
2. Remove unused icons and optimize bundle size
3. Document the design system in README
4. Take screenshots for regression testing
5. Final visual QA across all pages

**Router Updates Needed:**
- Add `/dashboard/billing` route (BillingPage component)
- Remove `/dashboard/settings` route if it exists
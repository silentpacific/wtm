# Accessible Multilingual Menu — Requirements (v2)

## Scope
Mobile-first interactive menu page reached via QR code. Targets:
- Tourists who don’t speak the local language
- Deaf and hard-of-hearing diners

No search box. Core flows: language switch, allergen/dietary filtering, dish note/question, add to Order List, “Show this to the server” confirmation.

---

## 1) Global UX & Layout
- **Top header (fixed):**
  - Brand/restaurant name
  - **Language selector** (English, 中文, Español, Français)
- **Below header (translatable region):**
  - Filter bar (Allergens = exclude; Dietary tags = include)
  - Menu sections and dish cards
  - Sticky **Order List bar** at bottom

**Mobile-first:** all tappable elements ≥44×44 px; thumb-friendly spacing; high-contrast states.

---

## 2) Internationalization (i18n)
- **Language selector behavior**
  - When a language is selected, **everything under the header** (filters, section headings, dish names, descriptions, allergen/dietary labels, action buttons, instructional text like “Show this to the server”) **is rendered in that language**.
  - **Exceptions (always English):**
    - The custom note/question **entered by the user** (free text)
    - Server decision buttons: **“Yes” / “No” / “Let me check”**  
      - Rationale: standardize server-side interaction; reduces ambiguity for staff.
- **Copy model**
  - All translatable strings are pulled from i18n dictionaries.
  - Menu content supports per-field translations: `name`, `description`, `allergen_labels[]`, `dietary_labels[]`, `section_title`.
- **Fallbacks**
  - If a translation is missing, show English for that field **and** log a missing key event.

**Acceptance criteria**
- Selecting Español switches all UI text, filters, and menu content into Spanish within 200ms (perceived).
- Server buttons and user-entered notes remain in English regardless of selected language.

---

## 3) Filters
- **Allergens (exclude):** Selecting any allergen hides dishes containing it.
- **Dietary tags (include):** Selecting tags shows only dishes matching **all** selected tags (AND logic).
- **Clear filters** chip available.
- **Visual feedback:** empty state when no dishes match (localized).

**Acceptance criteria**
- With Peanut + Gluten selected under Allergens, dishes containing either are hidden.
- With Vegan + Halal selected under Dietary, only dishes with both tags remain.
- Filter labels are translated per language selection.

---

## 4) Dish Card (updated)
Each dish card shows:
- **Name** (localized)
- **Price**
- **Short description** (localized)
- **Allergen icons/labels** (localized)
- **Dietary tags** (localized)
- **Info/Explanation affordance**:  
  - A small “i” or “What’s this?” link that opens a bottom-sheet **Dish Explanation** with:
    - Localized description in plain terms
    - Localized allergen & dietary details
    - Common ingredients (localized)
    - “Typical taste & spice level” (localized, optional)
- **Customization / Question input**:
  - Collapsed input hint: “Add a note or ask a question (English)”  
  - Expands to single-line auto-grow (max 160 chars), shows character count.
  - Persist input on card until cleared.

- **Actions:**
  - **+ Add to Order** button (localized)
  - Quantity stepper only appears in Order List, not on the card (keeps card minimal)

**Acceptance criteria**
- Tapping “i / What’s this?” opens explanation sheet with localized content.
- Typing a note persists when navigating away and back to the list (session state).
- Pressing **+ Add to Order** attaches current note (if any) to that dish in the Order List.

---

## 5) Order List (sticky bottom → drawer)
- **Sticky bar** (always visible):
  - Shows item count and subtotal (localized)
  - Tap to open **Order Drawer** (slide-up sheet)
- **Order Drawer contents:**
  - List items: **Dish name (localized)**, **unit price**, **quantity stepper (+/–)**, **delete**
  - **User note** appears **under the dish name** in English; editable inline (single-line auto-grow)
  - **Instruction banner** (localized): “Show this to the server”
  - **Server response block** (only for items with a note):  
    - Buttons: **Yes** / **No** / **Let me check** (always **English**)
    - Interaction rules:
      - Tap **Yes** or **No** → chosen button stays active; the other two grey out and become disabled.
      - Tap **Let me check** → remains active; **Yes/No** still available.  
        - After tapping **Yes** or **No**, lock the remaining buttons.
  - **Totals**: Subtotal only (no taxes/fees in MVP).
  - **Close** (X) or swipe down to dismiss.

**Acceptance criteria**
- When a dish with a note is added, the note appears under the dish in the Order List.
- Quantity updates immediately affect subtotal and sticky bar count.
- Server buttons follow the exact enable/disable logic above and are always in English.

---

## 6) Data Model (MVP)
- **Dish**
  - `id`, `section_id`, `price`, `allergens[]`, `dietary_tags[]`
  - `i18n`: `{ en: { name, desc, section }, zh: {}, es: {}, fr: {} }`
- **Session state (client-side)**
  - `language` (default: device locale → fallback EN)
  - `filters: { allergens[], dietary[] }`
  - `notes: { [dishId]: string }` (English free text)
  - `order: { items: [{ dishId, qty, unitPrice, note, serverResponse: 'yes'|'no'|'check'|null }] }`
- **No server write** in MVP (same as WhatTheMenu tech): state stays client-side.  
  - Phase 2: sync to backend for analytics.

---

## 7) Accessibility
- **Visual**
  - WCAG AA color contrast
  - Focus ring for interactive elements
  - Button labels + aria-pressed for server buttons
- **Motion**
  - Reduced motion respects prefers-reduced-motion
- **Language**
  - `lang` attribute updates on container when language changes
  - Server buttons remain English; add `aria-label` explaining purpose for screen readers (e.g., “Server response: Yes”).

---

## 8) Error & Edge States
- Missing translation key → fall back to English and log `i18n_missing_key`.
- Note length >160 → prevent additional input, show counter in red.
- Order empty → sticky bar hidden; drawer shows localized empty state.

---

## 9) Tech & Implementation Notes
- **Stack:** Same as WhatTheMenu.com (reuse components/utilities, i18n framework, and Supabase/Gemini wiring if applicable).
- **State:** Client state in localStorage or Zustand/Redux; debounce note edits.
- **Perf:** Lazy-load sections; virtualize long lists; prefetch dictionary on language switch.
- **Analytics (anonymous)**
  - `lang_change`, `filter_change`, `add_to_order`, `edit_note`, `server_response`

---

## 10) Test Plan (Single Menu Upload)
**Setup**
- Upload one restaurant menu (10–20 dishes) with full i18n for EN/中文/ES/FR, allergen + dietary tags.

**Functional tests**
1. Language switch updates all UI and dish content (except notes & server buttons).
2. Allergen exclude / dietary include behave as specified.
3. Dish Explanation sheet shows correct localized details.
4. Add to Order → note appears under dish in Order Drawer.
5. Quantity +/– updates subtotal and sticky bar instantly.
6. Delete removes item and updates totals.
7. Server buttons logic locks/greys correctly; persists while drawer stays open.
8. Session persistence: reload page → order and notes remain (if using localStorage).

**Accessibility tests**
- Keyboard traversal works; focus visible.
- Screen reader announces button states and server responses.
- Contrast & hit targets validated.

**i18n tests**
- For each language: spot-check 10 keys, one forced missing-key fallback.

**Performance**
- First interaction under 200ms for language change and filter toggle on mid-tier Android.

---

## 11) Copy & Microcopy
- Note field (hint): **“Add a note or ask a question (English)”**
- Sticky bar: **“Order • {count} • {subtotal}”** (translated)
- Instruction in drawer (translated): **“Show this to the server.”**
- Server buttons (always English): **Yes / No / Let me check**
- Empty states: localized (“No dishes match your filters.”)

---

## 12) Out of Scope (MVP)
- Real-time staff console / KDS
- Auto-translation of user notes
- Taxes, tips, payments
- Multi-party cart sharing

---

## 13) Milestones
- **M1:** Dish card + Explanation + Filters + i18n switch
- **M2:** Notes + Add to Order + Sticky Drawer
- **M3:** Server response logic + persistence + full QA on 1 menu

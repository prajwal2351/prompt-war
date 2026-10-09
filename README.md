# CityPulse — Smart City Exploration & Safety Platform

> **Default City:** Pune, Maharashtra, India  
> **Coordinates:** `[18.5204, 73.8567]` (Easily configurable in `src/config/cityConfig.ts`)

CityPulse is an MVP web application designed for tourists, new residents, and budget travelers. It unifies verified place discovery, real-time crowdsourced safety maps, alternative safer route planning, multi-place comparisons, and Gemini-powered cultural storytelling.

---

## 🚀 How to Run the App

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   This launches the fullstack Express + Vite server on `http://localhost:3000`.

3. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

---

## 🔑 How to Add the Gemini API Key

The Gemini API calls are proxied securely through server-side endpoints in `server.ts` using the modern `@google/genai` TypeScript SDK (`gemini-3.8-flash`):

1. Set the environment variable in your `.env` file or hosting environment:
   ```env
   GEMINI_API_KEY="your_actual_gemini_api_key_here"
   ```
2. In Google AI Studio Build, the key is automatically injected into the server runtime via the **Settings > Secrets** panel.
3. If no key is provided, the application contains built-in resilient heuristic fallbacks so that all features (report classification, daily insight, compare verdicts, and cultural guides) continue to function smoothly without crashing.

---

## 🌟 The 5 Core Features

### 1. Explore Map
- **Interactive OpenStreetMap + Leaflet Map:** Displays 22+ curated locations categorized into Heritage, Food, Hotels, Budget Stays, and Sights.
- **Synced List View:** Side-by-side on desktop, stacked on mobile with Map/List/Both tabs.
- **Filters & Search:** Filter by category chips, price levels (`₹`, `₹₹`, `₹₹₹`), wheelchair accessibility, or instant keyword search.
- **Detail Panel:** Desktop modal and mobile slide-up bottom sheet showing ratings, cleanliness scores, safety scores, wheelchair badges, opening hours, and direct links to route planning or comparison.

### 2. Safety Layer & Citizen Reports
- **Severity Visualization:** Displays incident pins with color halos (Red for High, Amber for Medium, Green for Low).
- **Incident Reporting Form:** Submit street hazards (poor lighting, accident zones, harassment, theft, dirty area, other) with a location picker ("Use my location", click-on-map pin drop, or quick landmark presets) and optional photo upload preview.
- **Gemini Severity Classifier:** Calls `/api/gemini/classify-report` to automatically determine severity (`low` | `medium` | `high`) and author a concise one-line summary. New reports are saved in React state and `localStorage` and immediately plotted on the map.

### 3. Safer Route Suggestion (OSRM)
- **Direct Route vs. Safer Bypass:** Queries the Open Source Routing Machine (OSRM) without requiring an API key.
- **Red-Zone Avoidance:** Evaluates route buffers against high-risk safety reports and calculates an alternative perimeter detour using well-lit arterial avenues.
- **Clear Error Messaging:** Displays friendly diagnostics if OSRM is unreachable or cannot compute a path instead of failing silently.

### 4. Compare Best vs Worst
- **Multi-Place Matrix:** Select 2 to 4 places to compare across Safety, Cleanliness, Affordability, User Rating, and Accessibility.
- **Composite Score:** Automatically computes an overall index (0–100) highlighting the best value in green and the lowest in red.
- **Plain-Language AI Verdict:** Gemini analyzes trade-offs, crowns the top budget pick and safest choice, and provides a customized visitor recommendation.

### 5. History & Culture Guide
- **Heritage & Traditions Directory:** Features Pune's 18th-century Peshwa wadas, 8th-century rock-cut Rashtrakuta shrines, and unique living traditions (Ganeshotsav Dhol Tasha, Puneri Misal Katta, Puneri Paati signboards).
- **Interactive "Tell me more" Guides:** Calls Gemini (`/api/gemini/culture-guide`) to generate lively local narratives, 3 practical insider secrets, etiquette tips, and fun trivia.

---

## ⚙️ Changing the Default City

To point CityPulse to any other city (e.g. Mumbai, Bengaluru, Delhi, or Tokyo), update a single configuration file:

**`src/config/cityConfig.ts`**
```typescript
export const CITY_CONFIG = {
  name: 'Pune',
  state: 'Maharashtra',
  country: 'India',
  coordinates: [18.5204, 73.8567],
  defaultZoom: 13,
  // ...
};
```

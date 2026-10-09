import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, PhoneCall, Info, Sparkles, ExternalLink, ShieldCheck, Heart } from 'lucide-react';
import { CITY_CONFIG } from '../config/cityConfig';

export const Footer: React.FC = () => {
  const [showDocsModal, setShowDocsModal] = useState(false);

  return (
    <>
      <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
            {/* Col 1: Brand & Tagline */}
            <div className="md:col-span-1 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white">
                  <Compass className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-lg text-white">CityPulse</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Smart city exploration platform for {CITY_CONFIG.name}, {CITY_CONFIG.state}. Built to empower tourists, students, and budget travelers with verified safety data, interactive maps, and AI insights.
              </p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Info className="w-3.5 h-3.5" />
                <span>Notice: Sample data for demo</span>
              </div>
            </div>

            {/* Col 2: Navigation Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                Features
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/explore" className="hover:text-amber-400 transition-colors">
                    Explore Map & Places
                  </Link>
                </li>
                <li>
                  <Link to="/safety" className="hover:text-amber-400 transition-colors">
                    Safety Layer & Citizen Reports
                  </Link>
                </li>
                <li>
                  <Link to="/routes" className="hover:text-amber-400 transition-colors">
                    Safer Route Suggestions (OSRM)
                  </Link>
                </li>
                <li>
                  <Link to="/compare" className="hover:text-amber-400 transition-colors">
                    Best vs Worst Place Comparison
                  </Link>
                </li>
                <li>
                  <Link to="/culture" className="hover:text-amber-400 transition-colors">
                    History & Culture Guide
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Emergency Contacts */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
                {CITY_CONFIG.name} Helplines
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li className="flex justify-between py-0.5 border-b border-slate-800">
                  <span>Emergency Police:</span>
                  <span className="font-mono text-slate-200 font-semibold">{CITY_CONFIG.emergencyContacts.police}</span>
                </li>
                <li className="flex justify-between py-0.5 border-b border-slate-800">
                  <span>Women Helpline:</span>
                  <span className="font-mono text-slate-200 font-semibold">{CITY_CONFIG.emergencyContacts.womenHelpline}</span>
                </li>
                <li className="flex justify-between py-0.5 border-b border-slate-800">
                  <span>Traffic Control:</span>
                  <span className="font-mono text-slate-200 font-semibold">{CITY_CONFIG.emergencyContacts.trafficPolice}</span>
                </li>
                <li className="flex justify-between py-0.5 border-b border-slate-800">
                  <span>Ambulance:</span>
                  <span className="font-mono text-slate-200 font-semibold">{CITY_CONFIG.emergencyContacts.ambulance}</span>
                </li>
              </ul>
            </div>

            {/* Col 4: Platform & Config info */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Config & AI Integration
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Configured for coordinates [{CITY_CONFIG.coordinates[0]}, {CITY_CONFIG.coordinates[1]}]. Changeable in <code className="text-amber-300 font-mono text-[10px]">src/config/cityConfig.ts</code>.
              </p>
              <button
                type="button"
                onClick={() => setShowDocsModal(true)}
                className="w-full text-left px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors flex items-center justify-between"
              >
                <span>Read Architecture & Docs</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
            <p>
              CityPulse MVP &bull; Default City: {CITY_CONFIG.name}, India &bull; OpenStreetMap &bull; Leaflet &bull; Gemini 3.8 Flash
            </p>
            <p className="flex items-center gap-1">
              Built for seamless smart city exploration <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" />
            </p>
          </div>
        </div>
      </footer>

      {/* Docs Modal */}
      {showDocsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl text-slate-900 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  CityPulse &bull; Project Overview & Setup
                </h3>
                <p className="text-xs text-slate-500">Smart city exploration & safety platform</p>
              </div>
              <button
                type="button"
                onClick={() => setShowDocsModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <div>
                <h4 className="font-bold text-slate-900 mb-1">1. How to Run</h4>
                <p>
                  Start dev server: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono">npm run dev</code> (runs fullstack Express + Vite on port 3000). Production build: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono">npm run build</code>.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">2. Adding the Gemini API Key</h4>
                <p>
                  Set <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono">GEMINI_API_KEY</code> in your environment or <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono">.env</code> file. The fullstack server proxies all Gemini calls through secure endpoints (<code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono">/api/gemini/*</code>) using <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono">gemini-3.8-flash</code>. Fallback logic automatically safeguards operation if the key is missing.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">3. The 5 Core Features</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Explore Map:</strong> Interactive Leaflet map with OpenStreetMap, category filters, search, and synced cards & detail sheets.</li>
                  <li><strong>Safety Layer & Citizen Reports:</strong> Color-coded severity pins (Red/Amber/Green), live incident reporting with Gemini classification and instant map pin drop.</li>
                  <li><strong>Safer Route Suggestion:</strong> Real OSRM driving routes calculating direct path vs safer bypass avoiding red zones.</li>
                  <li><strong>Compare Best vs Worst:</strong> Compare 2 to 4 places side-by-side with safety, cleanliness, and price indices, best/worst highlighting, and Gemini plain-language verdict.</li>
                  <li><strong>History & Culture Guide:</strong> Heritage landmarks and Pune traditions with "Tell me more" calling Gemini for insider guides and fun facts.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">4. Changing Default City</h4>
                <p>
                  Open <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono">src/config/cityConfig.ts</code> and update <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono">CITY_CONFIG.name</code> and <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono">CITY_CONFIG.coordinates</code>.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDocsModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

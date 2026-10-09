import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  MapPin,
  ShieldAlert,
  Navigation,
  GitCompare,
  BookOpen,
  Sparkles,
  CloudSun,
  Activity,
  ArrowRight,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
} from 'lucide-react';
import { CITY_CONFIG } from '../config/cityConfig';
import { useApp } from '../context/AppContext';
import { fetchCityWeather, WeatherData } from '../services/weather';
import { geminiService, CityInsightResult } from '../services/gemini';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { places, safetyReports } = useApp();

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  const [insight, setInsight] = useState<CityInsightResult | null>(null);
  const [insightLoading, setInsightLoading] = useState(true);

  const [heroSearch, setHeroSearch] = useState('');

  // Fetch live weather from Open-Meteo
  useEffect(() => {
    let isMounted = true;
    fetchCityWeather(CITY_CONFIG.coordinates[0], CITY_CONFIG.coordinates[1])
      .then((data) => {
        if (isMounted) {
          setWeather(data);
          setWeatherLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setWeatherLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch City Insight of the Day from Gemini
  const loadInsight = async (weatherDesc?: string) => {
    setInsightLoading(true);
    try {
      const res = await geminiService.getCityInsight({
        city: CITY_CONFIG.name,
        weatherSummary: weatherDesc || weather?.weatherDescription || 'mild and clear',
      });
      setInsight(res);
    } catch (e) {
      console.warn('Failed to fetch insight:', e);
    } finally {
      setInsightLoading(false);
    }
  };

  useEffect(() => {
    loadInsight(weather?.weatherDescription);
  }, [weather?.weatherDescription]);

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/explore?search=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  const highSeverityCount = safetyReports.filter((r) => r.severity === 'high').length;

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.18),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.12),transparent_50%)] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-amber-300 border border-white/15 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>Live City Intelligence Platform</span>
            <span className="text-white/40">&bull;</span>
            <span className="text-white font-medium">{CITY_CONFIG.name}, {CITY_CONFIG.country}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Explore <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400 bg-clip-text text-transparent">{CITY_CONFIG.name}</span> with Confidence & Real-Time Safety
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
            Discover verified heritage landmarks, iconic street food, and budget stays while navigating safely around accident zones and citizen-reported hazards.
          </p>

          {/* Quick Search Bar */}
          <form
            onSubmit={handleHeroSearchSubmit}
            className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-xl"
          >
            <div className="relative flex-1 w-full flex items-center">
              <Search className="w-5 h-5 text-slate-300 absolute left-3.5" />
              <input
                type="text"
                placeholder="Search Shaniwar Wada, Misal Pav, FC Road, budget hostels..."
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-transparent text-white placeholder-slate-400 text-sm focus:outline-hidden"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 font-bold text-sm text-white shadow-md transition-all active:scale-95 shrink-0 flex items-center justify-center gap-2"
            >
              <span>Explore</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Stat Pills */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs sm:text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <strong className="text-white font-bold">{places.length}+</strong> Curated Places
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <strong className="text-white font-bold">{safetyReports.length}</strong> Citizen Safety Pins
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <strong className="text-white font-bold">100%</strong> Free Open Routing
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              <span>Gemini 3.8 Intelligence</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Real-Time City Pulse Dashboard: Weather + Traffic Simulation + Gemini City Insight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Weather Alert (Open-Meteo) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <CloudSun className="w-4 h-4 text-amber-500" />
                  Live Weather Alert &bull; Open-Meteo
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  {weatherLoading ? (
                    <span className="animate-pulse text-slate-300">Checking Pune weather...</span>
                  ) : (
                    `${weather?.temperature}°C &bull; ${weather?.weatherDescription}`
                  )}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                Live API
              </span>
            </div>

            <div className="my-3 py-3 border-y border-slate-100 text-xs text-slate-600 space-y-1">
              <p className="font-medium text-slate-800">
                {weather?.safetyAlert || 'Loading meteorological advisory for Pune streets...'}
              </p>
              <div className="flex items-center gap-4 text-slate-500 pt-1">
                <span>Humidity: <strong>{weather?.humidity ?? 55}%</strong></span>
                <span>Wind: <strong>{weather?.windSpeed ?? 12} km/h</strong></span>
                <span>Range: <strong>{weather?.tempMin}° - {weather?.tempMax}°C</strong></span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Walking suitability:</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> High / Comfortable
              </span>
            </div>
          </div>

          {/* Traffic Note (Demo) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  Live Traffic Note
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  Moderate Peak Flow
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Demo Simulation
              </span>
            </div>

            <div className="my-3 py-3 border-y border-slate-100 text-xs text-slate-600 space-y-1.5">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p>
                  <strong>Swargate & JM Road Junction:</strong> Moderate delays due to metro corridor interchange traffic.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p>
                  <strong>Koregaon Park & Senapati Bapat Road:</strong> Free-flowing transit lanes.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Auto-updates every 15m
              </span>
              <Link to="/routes" className="font-semibold text-indigo-600 hover:text-indigo-800">
                View Safer Routes &rarr;
              </Link>
            </div>
          </div>

          {/* Gemini Insight of the Day */}
          <div className="bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-purple-500/10 rounded-2xl p-6 shadow-sm border border-amber-200/70 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Gemini Insight of the Day
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  Today's Pulse & Tip
                </h3>
              </div>
              <button
                type="button"
                onClick={() => loadInsight()}
                disabled={insightLoading}
                className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-200 text-xs transition-transform active:rotate-180"
                title="Regenerate Gemini Insight"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${insightLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="my-3 py-3 border-y border-amber-200/60 text-xs space-y-2">
              {insightLoading ? (
                <div className="space-y-2">
                  <div className="h-3 bg-amber-200/50 rounded-sm animate-pulse w-full"></div>
                  <div className="h-3 bg-amber-200/50 rounded-sm animate-pulse w-4/5"></div>
                  <div className="h-3 bg-amber-200/50 rounded-sm animate-pulse w-3/4"></div>
                </div>
              ) : (
                <>
                  <p className="text-slate-800 font-medium leading-relaxed">
                    "{insight?.insight}"
                  </p>
                  <p className="text-rose-900 bg-rose-100/60 p-2 rounded-lg text-[11px]">
                    <strong>Local Tip:</strong> {insight?.tip}
                  </p>
                </>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Recommended Zone:</span>
              <span className="font-bold text-slate-900">
                {insight?.highlightZone || 'FC Road & Old Peths'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The 5 Core Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
              Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Everything You Need to Navigate Pune
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-sm">
            Interactive Leaflet maps, citizen safety alerts, OSRM safer routing, multi-place comparison, and AI cultural guides.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. Explore Map */}
          <Link
            to="/explore"
            className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                1. Explore Map & Curated Places
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filter 22+ landmarks, authentic Puneri eateries, stays, and budget spots. Instant details with cleanliness, wheelchair access, and price levels.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
              <span>Open Interactive Map</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          {/* 2. Safety Layer & Citizen Reports */}
          <Link
            to="/safety"
            className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-rose-400 hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                2. Safety Layer & Citizen Reports
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                View color-coded danger zones (Red/Amber/Green). Report street issues with location picker and get immediate Gemini severity classification.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-rose-600 group-hover:translate-x-1 transition-transform">
              <span>View Safety Map & Report</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          {/* 3. Safer Route Suggestion */}
          <Link
            to="/routes"
            className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Navigation className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                3. Safer Route Suggestions
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Plan trips with OSRM routing. CityPulse computes both a direct path and a safer alternative detour that steers around high-risk accident blackspots.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
              <span>Plan Safer Route</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          {/* 4. Compare Best vs Worst */}
          <Link
            to="/compare"
            className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <GitCompare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                4. Compare Best vs Worst
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Compare 2 to 4 places side-by-side on safety index, cleanliness, rating, and affordability. Highlights best value in green and worst in red with Gemini verdict.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
              <span>Launch Place Comparison</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          {/* 5. History and Culture Guide */}
          <Link
            to="/culture"
            className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-purple-400 hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                5. History & Culture Guide
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Explore 18th-century Peshwa heritage, rock-cut Rashtrakuta shrines, and famous local traditions. Click "Tell me more" for AI-curated insider stories.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-purple-600 group-hover:translate-x-1 transition-transform">
              <span>Discover Heritage & AI Guides</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          {/* 6. Active Safety Alert Banner */}
          <div className="bg-gradient-to-br from-rose-950 to-slate-900 text-white p-6 rounded-2xl flex flex-col justify-between border border-rose-900/60 shadow-md">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Active Safety Watch</span>
              </div>
              <h3 className="text-lg font-bold">
                {highSeverityCount} High-Severity Zones Active
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Crowdsourced incident data is helping keep Pune commuters and tourists safe. Check active accident blindspots before evening travel.
              </p>
            </div>
            <div className="pt-4">
              <Link
                to="/safety?action=report"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white text-center block transition-colors"
              >
                + Submit Citizen Report
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Highlighted Pune Places Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Must-Visit Landmarks
            </span>
            <h2 className="text-2xl font-bold text-slate-900">
              Iconic Spots in {CITY_CONFIG.name}
            </h2>
          </div>
          <Link
            to="/explore"
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
          >
            <span>View all {places.length} places</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {places.slice(0, 4).map((place) => (
            <div
              key={place.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="p-5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 capitalize">
                    {place.category}
                  </span>
                  <span className="text-xs font-bold text-amber-500">
                    ★ {place.rating}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">{place.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {place.description}
                </p>
              </div>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">Price: {place.priceLevel}</span>
                <Link
                  to={`/explore?place=${place.id}`}
                  className="font-bold text-rose-600 hover:text-rose-700"
                >
                  Inspect &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Demo & Config Notice Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-900">
                Customizable City Architecture & Sample Data Notice
              </p>
              <p>
                CityPulse is currently set to <strong>{CITY_CONFIG.name}, India</strong>. All data can be changed in <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[11px]">src/config/cityConfig.ts</code>. All incident reports and ratings are seed sample data for demonstration.
              </p>
            </div>
          </div>
          <Link
            to="/explore"
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shrink-0"
          >
            Start Exploring
          </Link>
        </div>
      </section>
    </div>
  );
};

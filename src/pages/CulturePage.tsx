import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  MapPin,
  Clock,
  Ticket,
  Lightbulb,
  X,
  RefreshCw,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CITY_CONFIG } from '../config/cityConfig';
import { Place, Tradition } from '../data/places';
import { geminiService, CultureGuideResult } from '../services/gemini';

export const CulturePage: React.FC = () => {
  const { places, traditions } = useApp();

  const heritagePlaces = places.filter((p) => p.isHeritage);

  const [activeTab, setActiveTab] = useState<'all' | 'heritage' | 'traditions'>('all');
  const [activeGuideModal, setActiveGuideModal] = useState<{
    title: string;
    type: 'heritage' | 'tradition';
    summary: string;
  } | null>(null);

  const [guideResult, setGuideResult] = useState<CultureGuideResult | null>(null);
  const [guideLoading, setGuideLoading] = useState(false);

  // Trigger Gemini AI Guide
  const handleTellMeMore = async (title: string, type: 'heritage' | 'tradition', summary: string, context?: string) => {
    setActiveGuideModal({ title, type, summary });
    setGuideLoading(true);
    setGuideResult(null);

    try {
      const res = await geminiService.getCultureGuide({
        name: title,
        type,
        summary,
        context,
      });
      setGuideResult(res);
    } catch (e) {
      console.warn('Failed to load culture guide:', e);
    } finally {
      setGuideLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-purple-600" />
              History & Culture Guide
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200">
              {CITY_CONFIG.name} Heritage
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Centuries of Maratha valor, Peshwa architecture, freedom struggle sanctuaries, and living street traditions.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 text-xs font-bold shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Guides ({heritagePlaces.length + traditions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('heritage')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'heritage' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🏛️ Heritage ({heritagePlaces.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('traditions')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'traditions' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🥁 Traditions ({traditions.length})
          </button>
        </div>
      </div>

      {/* Historical Timeline Milestone Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
          <Compass className="w-4 h-4" />
          <span>Historical Timeline of {CITY_CONFIG.name}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black">
          From 8th-Century Basalt Caves to Maratha Imperial Capital
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-white/10 text-xs">
          <div>
            <span className="text-amber-400 font-extrabold text-base sm:text-lg block">8th Century CE</span>
            <span className="text-slate-300">Pataleshwar Cave Monoliths carved from Deccan basalt.</span>
          </div>
          <div>
            <span className="text-amber-400 font-extrabold text-base sm:text-lg block">1630s CE</span>
            <span className="text-slate-300">Lal Mahal built for young Shivaji Maharaj & Jijabai.</span>
          </div>
          <div>
            <span className="text-amber-400 font-extrabold text-base sm:text-lg block">1732 CE</span>
            <span className="text-amber-400 font-extrabold text-base sm:text-lg hidden">1732 CE</span>
            <span className="text-slate-300">Peshwa Baji Rao I commissions Shaniwar Wada.</span>
          </div>
          <div>
            <span className="text-amber-400 font-extrabold text-base sm:text-lg block">1892–1942 CE</span>
            <span className="text-slate-300">Aga Khan Palace & Quit India Freedom Struggle.</span>
          </div>
        </div>
      </div>

      {/* Section 1: Heritage Landmarks */}
      {(activeTab === 'all' || activeTab === 'heritage') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="text-purple-600">🏛️</span> Heritage Landmarks ({heritagePlaces.length})
            </h3>
            <span className="text-xs text-slate-400">Click &quot;Tell me more&quot; for Gemini AI insights</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {heritagePlaces.map((place) => (
              <div
                key={place.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
                      Monument
                    </span>
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {place.priceLevel}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg font-extrabold text-slate-900">{place.name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{place.neighborhood} &bull; {place.address}</span>
                    </p>
                  </div>

                  {/* Short History */}
                  <div className="space-y-1 text-xs">
                    <strong className="text-slate-800 block font-bold text-[11px] uppercase tracking-wider text-slate-400">
                      History & Origins
                    </strong>
                    <p className="text-slate-600 leading-relaxed line-clamp-3">
                      {place.heritageHistory || place.description}
                    </p>
                  </div>

                  {/* Why It Matters */}
                  {place.whyItMatters && (
                    <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-xs">
                      <strong className="text-amber-900 block font-bold mb-0.5">
                        Why it matters:
                      </strong>
                      <p className="text-amber-800 leading-relaxed italic">
                        {place.whyItMatters}
                      </p>
                    </div>
                  )}

                  {/* Hours & Fees */}
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                    {place.openingHours && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{place.openingHours}</span>
                      </div>
                    )}
                    {place.entryFee && (
                      <div className="flex items-center gap-1.5">
                        <Ticket className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{place.entryFee}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* "Tell Me More" Button */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() =>
                      handleTellMeMore(
                        place.name,
                        'heritage',
                        place.description,
                        place.heritageHistory
                      )
                    }
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Tell me more (AI Guide)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 2: Local Traditions */}
      {(activeTab === 'all' || activeTab === 'traditions') && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="text-amber-600">🥁</span> Living Local Traditions ({traditions.length})
            </h3>
            <span className="text-xs text-slate-400">Punekar culture, food kattas & social heritage</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {traditions.map((tradition) => (
              <div
                key={tradition.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                      Living Tradition
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      {tradition.era}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg font-extrabold text-slate-900">{tradition.name}</h4>
                    <p className="text-xs text-amber-700 font-medium mt-0.5">
                      {tradition.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {tradition.summary}
                  </p>

                  <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-200/60 text-xs">
                    <strong className="text-purple-950 block font-bold mb-0.5">
                      Why it matters:
                    </strong>
                    <p className="text-purple-800 leading-relaxed italic">
                      {tradition.whyItMatters}
                    </p>
                  </div>

                  {tradition.insiderTip && (
                    <div className="text-[11px] text-slate-600 flex items-start gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>
                        <strong>Tip:</strong> {tradition.insiderTip}
                      </span>
                    </div>
                  )}
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() =>
                      handleTellMeMore(
                        tradition.name,
                        'tradition',
                        tradition.summary,
                        tradition.subtitle
                      )
                    }
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Tell me more (AI Guide)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* AI Guide Modal */}
      {activeGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Local AI Historian Guide &bull; Gemini 3.8
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {activeGuideModal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveGuideModal(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {guideLoading ? (
              <div className="space-y-4 py-6">
                <div className="flex items-center justify-center gap-3 text-purple-700 font-semibold text-sm">
                  <span className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></span>
                  <span>Asking our Pune local historian...</span>
                </div>
                <div className="h-4 bg-slate-100 rounded-sm animate-pulse w-full"></div>
                <div className="h-4 bg-slate-100 rounded-sm animate-pulse w-5/6"></div>
                <div className="h-4 bg-slate-100 rounded-sm animate-pulse w-3/4"></div>
              </div>
            ) : guideResult ? (
              <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                {/* Guide Story */}
                <p className="whitespace-pre-line text-slate-800 font-normal">
                  {guideResult.guide}
                </p>

                {/* Insider Tips */}
                {guideResult.insiderTips && guideResult.insiderTips.length > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                    <h4 className="font-bold text-amber-950 flex items-center gap-1.5 text-xs">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      3 Insider Tips from Locals:
                    </h4>
                    <ul className="space-y-1 pl-5 list-disc text-amber-900 text-xs">
                      {guideResult.insiderTips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Local Customs & Fun Fact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {guideResult.localCustoms && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <strong className="text-slate-900 block font-bold">Local Customs:</strong>
                      <p className="text-slate-600">{guideResult.localCustoms}</p>
                    </div>
                  )}
                  {guideResult.funFact && (
                    <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 text-xs space-y-1">
                      <strong className="text-purple-950 block font-bold">Surprising Trivia:</strong>
                      <p className="text-purple-900">{guideResult.funFact}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveGuideModal(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

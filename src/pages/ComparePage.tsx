import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GitCompare,
  Plus,
  X,
  Star,
  ShieldCheck,
  Sparkles,
  Accessibility,
  DollarSign,
  Trophy,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Place } from '../data/places';
import { geminiService, CompareVerdictResult } from '../services/gemini';

export const ComparePage: React.FC = () => {
  const { places, comparedPlaceIds, addToCompare, removeFromCompare, clearCompare } = useApp();

  const [aiVerdict, setAiVerdict] = useState<CompareVerdictResult | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState<string>('');

  // Selected places objects
  const comparedPlaces: Place[] = places.filter((p) => comparedPlaceIds.includes(p.id));

  // Compute composite score for a place (0 - 100 scale)
  const calculateCompositeScore = (place: Place): number => {
    // Rating (30 pts max): (rating / 5) * 30
    const ratingPts = (place.rating / 5) * 30;
    // Safety (35 pts max): (safetyScore / 10) * 35
    const safetyPts = (place.safetyScore / 10) * 35;
    // Cleanliness (20 pts max): (cleanlinessScore / 10) * 20
    const cleanPts = (place.cleanlinessScore / 10) * 20;
    // Affordability (15 pts max): ₹ = 15, ₹₹ = 10, ₹₹₹ = 5
    const pricePts = place.priceLevel === '₹' ? 15 : place.priceLevel === '₹₹' ? 10 : 5;

    return Math.round(ratingPts + safetyPts + cleanPts + pricePts);
  };

  // Find min and max for each metric to highlight best in green, worst in red
  const metricsMinMax = React.useMemo(() => {
    if (comparedPlaces.length < 2) return null;

    const scores = comparedPlaces.map((p) => calculateCompositeScore(p));
    const ratings = comparedPlaces.map((p) => p.rating);
    const safeties = comparedPlaces.map((p) => p.safetyScore);
    const cleans = comparedPlaces.map((p) => p.cleanlinessScore);
    const prices = comparedPlaces.map((p) => (p.priceLevel === '₹' ? 3 : p.priceLevel === '₹₹' ? 2 : 1));

    return {
      score: { max: Math.max(...scores), min: Math.min(...scores) },
      rating: { max: Math.max(...ratings), min: Math.min(...ratings) },
      safety: { max: Math.max(...safeties), min: Math.min(...safeties) },
      clean: { max: Math.max(...cleans), min: Math.min(...cleans) },
      price: { max: Math.max(...prices), min: Math.min(...prices) }, // higher means cheaper/more affordable
    };
  }, [comparedPlaces]);

  // Request AI verdict when compared places change
  const fetchVerdict = async () => {
    if (comparedPlaces.length < 2) return;
    setIsAiLoading(true);

    try {
      const summaryPayload = comparedPlaces.map((p) => ({
        name: p.name,
        category: p.category,
        rating: p.rating,
        priceLevel: p.priceLevel,
        cleanlinessScore: p.cleanlinessScore,
        safetyScore: p.safetyScore,
        accessibility: p.accessibility,
      }));

      const res = await geminiService.getCompareVerdict(summaryPayload);
      setAiVerdict(res);
    } catch (e) {
      console.warn('AI Compare Verdict error:', e);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    if (comparedPlaces.length >= 2) {
      fetchVerdict();
    } else {
      setAiVerdict(null);
    }
  }, [comparedPlaceIds]);

  const handleAddSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (id) {
      addToCompare(id);
      setSelectedToAdd('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <GitCompare className="w-7 h-7 text-indigo-600" />
              Compare Best vs Worst
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
              {comparedPlaces.length} / 4 Selected
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Analyze places side-by-side on safety, cleanliness, price, and accessibility. Best value highlighted in green, worst in red.
          </p>
        </div>

        {comparedPlaces.length > 0 && (
          <button
            type="button"
            onClick={clearCompare}
            className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors self-start md:self-auto"
          >
            Clear All Selections
          </button>
        )}
      </div>

      {/* Place Picker Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Select 2 to 4 places to compare:
          </span>

          {/* Add place dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedToAdd}
              onChange={handleAddSelect}
              disabled={comparedPlaces.length >= 4}
              className="w-full sm:w-72 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">+ Add a place to compare...</option>
              {places
                .filter((p) => !comparedPlaceIds.includes(p.id))
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.category} &bull; {p.priceLevel})
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Selected Place Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          {comparedPlaces.map((place) => (
            <div
              key={place.id}
              className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 shadow-2xs"
            >
              <span className="capitalize text-slate-500 text-[11px]">{place.category}:</span>
              <span>{place.name}</span>
              <button
                type="button"
                onClick={() => removeFromCompare(place.id)}
                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-200"
                title="Remove"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {comparedPlaces.length < 2 && (
            <div className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Please select at least 2 places to generate comparison and AI verdict.</span>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Table */}
      {comparedPlaces.length >= 2 ? (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-900 text-white divide-x divide-slate-800">
                    <th className="p-4 sm:p-5 font-bold uppercase tracking-wider text-xs w-44">
                      Metrics
                    </th>
                    {comparedPlaces.map((place) => (
                      <th key={place.id} className="p-4 sm:p-5 font-extrabold text-sm min-w-[200px]">
                        <div className="flex items-center justify-between">
                          <span className="truncate">{place.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFromCompare(place.id)}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-[11px] font-normal text-slate-300 capitalize mt-0.5">
                          {place.category} &bull; {place.neighborhood}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {/* Overall Composite Score */}
                  <tr className="divide-x divide-slate-200 bg-slate-50/70 font-bold">
                    <td className="p-4 sm:p-5 text-slate-900 flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-500" />
                      <span>Composite Score</span>
                    </td>
                    {comparedPlaces.map((place) => {
                      const score = calculateCompositeScore(place);
                      const isBest = metricsMinMax && score === metricsMinMax.score.max;
                      const isWorst = metricsMinMax && score === metricsMinMax.score.min;

                      return (
                        <td
                          key={place.id}
                          className={`p-4 sm:p-5 transition-colors ${
                            isBest
                              ? 'bg-emerald-50 text-emerald-900 font-extrabold border-l-4 border-l-emerald-500'
                              : isWorst
                              ? 'bg-rose-50 text-rose-900 font-bold border-l-4 border-l-rose-500'
                              : 'text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl sm:text-2xl font-black">{score}</span>
                            <span className="text-xs font-normal text-slate-400">/ 100</span>
                            {isBest && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 uppercase font-bold">
                                Best Value
                              </span>
                            )}
                            {isWorst && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-200 text-rose-800 uppercase font-bold">
                                Lowest
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Safety Score */}
                  <tr className="divide-x divide-slate-200">
                    <td className="p-4 sm:p-5 text-slate-700 font-semibold flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Safety Score</span>
                    </td>
                    {comparedPlaces.map((place) => {
                      const isBest = metricsMinMax && place.safetyScore === metricsMinMax.safety.max;
                      const isWorst = metricsMinMax && place.safetyScore === metricsMinMax.safety.min;

                      return (
                        <td
                          key={place.id}
                          className={`p-4 sm:p-5 ${
                            isBest
                              ? 'bg-emerald-50/60 text-emerald-900 font-bold'
                              : isWorst
                              ? 'bg-rose-50/60 text-rose-900'
                              : 'text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-base font-bold">{place.safetyScore}</span>
                            <span className="text-xs text-slate-400">/ 10</span>
                            {isBest && <span className="text-[11px] text-emerald-600 font-bold">★ High</span>}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Cleanliness Score */}
                  <tr className="divide-x divide-slate-200">
                    <td className="p-4 sm:p-5 text-slate-700 font-semibold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-sky-600" />
                      <span>Cleanliness</span>
                    </td>
                    {comparedPlaces.map((place) => {
                      const isBest = metricsMinMax && place.cleanlinessScore === metricsMinMax.clean.max;
                      const isWorst = metricsMinMax && place.cleanlinessScore === metricsMinMax.clean.min;

                      return (
                        <td
                          key={place.id}
                          className={`p-4 sm:p-5 ${
                            isBest
                              ? 'bg-emerald-50/60 text-emerald-900 font-bold'
                              : isWorst
                              ? 'bg-rose-50/60 text-rose-900'
                              : 'text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-base font-bold">{place.cleanlinessScore}</span>
                            <span className="text-xs text-slate-400">/ 10</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Affordability / Price Level */}
                  <tr className="divide-x divide-slate-200">
                    <td className="p-4 sm:p-5 text-slate-700 font-semibold flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-slate-500" />
                      <span>Affordability</span>
                    </td>
                    {comparedPlaces.map((place) => {
                      const val = place.priceLevel === '₹' ? 3 : place.priceLevel === '₹₹' ? 2 : 1;
                      const isBest = metricsMinMax && val === metricsMinMax.price.max;
                      const isWorst = metricsMinMax && val === metricsMinMax.price.min;

                      return (
                        <td
                          key={place.id}
                          className={`p-4 sm:p-5 ${
                            isBest
                              ? 'bg-emerald-50/60 text-emerald-900 font-bold'
                              : isWorst
                              ? 'bg-rose-50/60 text-rose-900'
                              : 'text-slate-700'
                          }`}
                        >
                          <span className="text-base font-bold">{place.priceLevel}</span>
                          <span className="text-xs text-slate-500 ml-1.5">
                            ({place.priceLevel === '₹' ? 'Budget' : place.priceLevel === '₹₹' ? 'Mid-range' : 'Premium'})
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* User Rating */}
                  <tr className="divide-x divide-slate-200">
                    <td className="p-4 sm:p-5 text-slate-700 font-semibold flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" />
                      <span>Rating</span>
                    </td>
                    {comparedPlaces.map((place) => {
                      const isBest = metricsMinMax && place.rating === metricsMinMax.rating.max;
                      const isWorst = metricsMinMax && place.rating === metricsMinMax.rating.min;

                      return (
                        <td
                          key={place.id}
                          className={`p-4 sm:p-5 ${
                            isBest
                              ? 'bg-emerald-50/60 text-emerald-900 font-bold'
                              : isWorst
                              ? 'bg-rose-50/60 text-rose-900'
                              : 'text-slate-700'
                          }`}
                        >
                          <span className="text-base font-bold">{place.rating}</span>
                          <span className="text-xs text-slate-400"> / 5.0</span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Wheelchair Accessibility */}
                  <tr className="divide-x divide-slate-200">
                    <td className="p-4 sm:p-5 text-slate-700 font-semibold flex items-center gap-2">
                      <Accessibility className="w-4 h-4 text-slate-700" />
                      <span>Accessibility</span>
                    </td>
                    {comparedPlaces.map((place) => (
                      <td key={place.id} className="p-4 sm:p-5">
                        {place.accessibility ? (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full text-xs">
                            <XCircle className="w-3.5 h-3.5 text-slate-400" /> No
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-emerald-700 font-bold">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Green = Best Value
                </span>
                <span className="flex items-center gap-1 text-rose-700 font-bold">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span> Red = Lowest Score
                </span>
              </div>
              <span>Composite score factors: Safety (35%), Rating (30%), Cleanliness (20%), Price (15%)</span>
            </div>
          </div>

          {/* AI Plain-Language Verdict by Gemini */}
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-5 border border-indigo-800/40 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Gemini Plain-Language Verdict
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-2">
                  AI Comparative Analysis
                </h3>
              </div>
              <button
                type="button"
                onClick={fetchVerdict}
                disabled={isAiLoading}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
                <span>Regenerate Verdict</span>
              </button>
            </div>

            {isAiLoading ? (
              <div className="space-y-3 py-4">
                <div className="h-4 bg-white/10 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-white/10 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-white/10 rounded animate-pulse w-5/6"></div>
              </div>
            ) : aiVerdict ? (
              <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-200">
                <p className="text-slate-100 font-normal whitespace-pre-line text-sm sm:text-base">
                  {aiVerdict.verdict}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                      Best For Budget
                    </span>
                    <p className="font-bold text-white text-sm sm:text-base">
                      {aiVerdict.bestForBudget}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                      Top Safety Choice
                    </span>
                    <p className="font-bold text-white text-sm sm:text-base">
                      {aiVerdict.bestForSafety}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/10 border border-white/15 text-xs text-amber-200">
                  <strong className="text-white">Recommendation:</strong> {aiVerdict.recommendation}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-4">
          <GitCompare className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">Select at least 2 places to compare</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Pick landmarks, cafes, or hotels from the dropdown above or explore cards on the Explore Map.
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            <span>Browse Places</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
};

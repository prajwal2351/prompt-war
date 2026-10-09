import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Star,
  ShieldCheck,
  Sparkles,
  Accessibility,
  DollarSign,
  MapPin,
  Clock,
  Ticket,
  GitCompare,
  Navigation,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Place } from '../data/places';
import { useApp } from '../context/AppContext';

interface PlaceDetailModalProps {
  place: Place | null;
  onClose: () => void;
}

export const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({ place, onClose }) => {
  const navigate = useNavigate();
  const { comparedPlaceIds, addToCompare, removeFromCompare } = useApp();

  if (!place) return null;

  const isCompared = comparedPlaceIds.includes(place.id);
  const isCompareFull = comparedPlaceIds.length >= 4 && !isCompared;

  const handleToggleCompare = () => {
    if (isCompared) {
      removeFromCompare(place.id);
    } else {
      addToCompare(place.id);
    }
  };

  const handleRouteTo = () => {
    onClose();
    navigate(`/routes?dest=${place.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity p-0 sm:p-4">
      {/* Container: Bottom sheet on mobile, centered modal on desktop */}
      <div
        className="w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in slide-in-from-bottom sm:slide-in-from-top-4 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="place-modal-title"
      >
        {/* Mobile Grab Handle */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        {/* Header */}
        <div className="px-6 pt-4 pb-3 flex items-start justify-between border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize">
                {place.category}
              </span>
              {place.isHeritage && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  Heritage Landmark
                </span>
              )}
            </div>
            <h2 id="place-modal-title" className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
              {place.name}
            </h2>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{place.address} &bull; {place.neighborhood}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="px-6 py-5 overflow-y-auto space-y-5">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Rating */}
            <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3">
              <span className="text-[11px] font-semibold text-amber-700 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Rating
              </span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">
                {place.rating} <span className="text-xs font-normal text-slate-500">/ 5.0</span>
              </div>
            </div>

            {/* Price Level */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-500" /> Price Level
              </span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">
                {place.priceLevel}{' '}
                <span className="text-xs font-normal text-slate-500">
                  ({place.priceLevel === '₹' ? 'Budget' : place.priceLevel === '₹₹' ? 'Moderate' : 'Premium'})
                </span>
              </div>
            </div>

            {/* Safety Score */}
            <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-3">
              <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Safety Index
              </span>
              <div className="text-lg font-bold text-emerald-900 mt-0.5">
                {place.safetyScore} <span className="text-xs font-normal text-slate-500">/ 10</span>
              </div>
            </div>

            {/* Cleanliness */}
            <div className="bg-sky-50/70 border border-sky-200/60 rounded-xl p-3">
              <span className="text-[11px] font-semibold text-sky-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" /> Cleanliness
              </span>
              <div className="text-lg font-bold text-sky-900 mt-0.5">
                {place.cleanlinessScore} <span className="text-xs font-normal text-slate-500">/ 10</span>
              </div>
            </div>
          </div>

          {/* Accessibility Badge */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <Accessibility className="w-4 h-4 text-slate-700" />
              <span className="font-medium text-slate-800">Wheelchair Accessibility</span>
            </div>
            {place.accessibility ? (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Yes (Accessible ramps & pathways)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                <XCircle className="w-3.5 h-3.5 text-amber-600" />
                No (Steps / Uneven stone terrain)
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              About this location
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">{place.description}</p>
          </div>

          {/* Heritage Highlights if applicable */}
          {place.isHeritage && (
            <div className="space-y-3 p-4 rounded-2xl bg-purple-50/60 border border-purple-200 text-xs">
              {place.heritageHistory && (
                <div>
                  <h4 className="font-bold text-purple-950 mb-1 flex items-center gap-1">
                    🏛️ Historical Background
                  </h4>
                  <p className="text-purple-900/90 leading-relaxed">{place.heritageHistory}</p>
                </div>
              )}
              {place.whyItMatters && (
                <div className="pt-2 border-t border-purple-200/80">
                  <h4 className="font-bold text-purple-950 mb-0.5">Why it matters:</h4>
                  <p className="text-purple-800 italic">{place.whyItMatters}</p>
                </div>
              )}
            </div>
          )}

          {/* Opening Hours & Entry Fee */}
          {(place.openingHours || place.entryFee) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
              {place.openingHours && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    <strong className="text-slate-800">Hours:</strong> {place.openingHours}
                  </span>
                </div>
              )}
              {place.entryFee && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Ticket className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    <strong className="text-slate-800">Entry/Cost:</strong> {place.entryFee}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {place.tags && place.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {place.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={handleToggleCompare}
            disabled={isCompareFull}
            className={`w-full sm:w-1/2 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              isCompared
                ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                : isCompareFull
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 shadow-xs'
            }`}
          >
            <GitCompare className="w-4 h-4" />
            <span>
              {isCompared ? 'Remove from Compare' : isCompareFull ? 'Compare Limit (4 max)' : 'Add to Compare'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleRouteTo}
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm hover:shadow-md flex items-center justify-center gap-2 transition-all"
          >
            <Navigation className="w-4 h-4" />
            <span>Plan Safer Route Here</span>
          </button>
        </div>
      </div>
    </div>
  );
};

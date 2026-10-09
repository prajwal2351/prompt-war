import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Star,
  ShieldCheck,
  Sparkles,
  Accessibility,
  DollarSign,
  MapPin,
  List,
  Map as MapIcon,
  GitCompare,
  SlidersHorizontal,
  X,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CITY_CONFIG } from '../config/cityConfig';
import { Place } from '../data/places';
import { LeafletMap } from '../components/LeafletMap';
import { PlaceDetailModal } from '../components/PlaceDetailModal';

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { places, safetyReports, comparedPlaceIds, addToCompare, removeFromCompare } = useApp();

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [wheelchairOnly, setWheelchairOnly] = useState<boolean>(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // Mobile tab toggle between "Map" and "List"
  const [mobileTab, setMobileTab] = useState<'both' | 'map' | 'list'>('both');

  // Handle URL place param
  useEffect(() => {
    const placeId = searchParams.get('place');
    if (placeId) {
      const match = places.find((p) => p.id === placeId);
      if (match) setSelectedPlace(match);
    }
  }, [searchParams, places]);

  // Categories
  const categories = [
    { id: 'all', label: 'All Places', count: places.length },
    { id: 'heritage', label: '🏛️ Heritage', count: places.filter((p) => p.category === 'heritage').length },
    { id: 'food', label: '🍲 Food & Street Eats', count: places.filter((p) => p.category === 'food').length },
    { id: 'budget', label: '🏷️ Budget Stays & Eats', count: places.filter((p) => p.category === 'budget').length },
    { id: 'hotel', label: '🏨 Hotels', count: places.filter((p) => p.category === 'hotel').length },
    { id: 'attraction', label: '✨ Sights', count: places.filter((p) => p.category === 'attraction').length },
  ];

  // Filtered places
  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      // Category filter
      if (categoryFilter !== 'all' && p.category !== categoryFilter) {
        return false;
      }
      // Price filter
      if (priceFilter !== 'all' && p.priceLevel !== priceFilter) {
        return false;
      }
      // Wheelchair
      if (wheelchairOnly && !p.accessibility) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesAddress = p.address.toLowerCase().includes(query);
        const matchesNeighborhood = p.neighborhood.toLowerCase().includes(query);
        const matchesDesc = p.description.toLowerCase().includes(query);
        const matchesTags = p.tags?.some((t) => t.toLowerCase().includes(query));
        if (!matchesName && !matchesAddress && !matchesNeighborhood && !matchesDesc && !matchesTags) {
          return false;
        }
      }
      return true;
    });
  }, [places, categoryFilter, priceFilter, wheelchairOnly, searchQuery]);

  const handlePlaceClick = (place: Place) => {
    setSelectedPlace(place);
  };

  const handleToggleCompare = (e: React.MouseEvent, placeId: string) => {
    e.stopPropagation();
    if (comparedPlaceIds.includes(placeId)) {
      removeFromCompare(placeId);
    } else {
      addToCompare(placeId);
    }
  };

  const resetFilters = () => {
    setCategoryFilter('all');
    setPriceFilter('all');
    setWheelchairOnly(false);
    setSearchQuery('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Explore {CITY_CONFIG.name}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 font-bold text-slate-600 border border-slate-200">
              {filteredPlaces.length} places
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse verified attractions, iconic cafes, budget stays, and heritage monuments.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, neighborhood, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips & Controls */}
      <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                categoryFilter === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  categoryFilter === cat.id ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Secondary Filters: Price, Accessibility, Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {/* Price Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Price:</span>
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                {['all', '₹', '₹₹', '₹₹₹'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setPriceFilter(lvl)}
                    className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                      priceFilter === lvl
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {lvl === 'all' ? 'Any' : lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Wheelchair Accessibility Toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={wheelchairOnly}
                onChange={(e) => setWheelchairOnly(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-amber-500 border-slate-300"
              />
              <Accessibility className="w-3.5 h-3.5 text-slate-500" />
              <span>Wheelchair Accessible Only</span>
            </label>
          </div>

          {/* Reset Filters */}
          {(categoryFilter !== 'all' || priceFilter !== 'all' || wheelchairOnly || searchQuery) && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Map / List View Switcher */}
      <div className="flex lg:hidden rounded-xl border border-slate-200 bg-white p-1">
        <button
          type="button"
          onClick={() => setMobileTab('both')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            mobileTab === 'both' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600'
          }`}
        >
          Stacked (Both)
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('map')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            mobileTab === 'map' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600'
          }`}
        >
          Map Only
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('list')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            mobileTab === 'list' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600'
          }`}
        >
          List Only
        </button>
      </div>

      {/* Main Grid: Interactive Map + Synced List View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Top: Interactive Leaflet Map */}
        <div
          className={`lg:col-span-7 sticky top-20 ${
            mobileTab === 'list' ? 'hidden lg:block' : 'block'
          }`}
        >
          <LeafletMap
            places={filteredPlaces}
            selectedPlaceId={selectedPlace?.id}
            onSelectPlace={handlePlaceClick}
            safetyReports={safetyReports}
            showSafetyLayer={true}
            center={selectedPlace ? selectedPlace.coordinates : CITY_CONFIG.coordinates}
            zoom={selectedPlace ? 15 : 13}
            heightClass="h-[420px] sm:h-[540px] lg:h-[680px]"
          />
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span>Click any marker to inspect safety, cleanliness & price</span>
            <span className="font-semibold text-rose-600">Sample data for demo</span>
          </div>
        </div>

        {/* Right / Bottom: Synced Cards List */}
        <div
          className={`lg:col-span-5 space-y-3.5 ${
            mobileTab === 'map' ? 'hidden lg:block' : 'block'
          }`}
        >
          {filteredPlaces.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-3">
              <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">No places match your filters</h3>
              <p className="text-xs text-slate-500">
                Try widening your price range or clearing search keywords.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            filteredPlaces.map((place) => {
              const isSelected = selectedPlace?.id === place.id;
              const isCompared = comparedPlaceIds.includes(place.id);

              return (
                <div
                  key={place.id}
                  onClick={() => handlePlaceClick(place)}
                  className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'border-amber-500 ring-2 ring-amber-400/40 shadow-md bg-amber-50/20'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
                          {place.category}
                        </span>
                        {place.isHeritage && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                            Heritage
                          </span>
                        )}
                        <span className="text-[11px] font-bold text-amber-500 flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-500" /> {place.rating}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-base group-hover:text-rose-600 transition-colors">
                        {place.name}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{place.neighborhood} &bull; {place.address}</span>
                      </p>
                    </div>

                    {/* Price Badge */}
                    <span className="px-2 py-1 rounded-lg bg-slate-100 font-extrabold text-xs text-slate-800 shrink-0">
                      {place.priceLevel}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 my-2.5 leading-relaxed">
                    {place.description}
                  </p>

                  {/* Badges footer */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Safety: {place.safetyScore}/10
                      </span>
                      <span className="text-sky-700 font-semibold bg-sky-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-sky-600" />
                        Clean: {place.cleanlinessScore}/10
                      </span>
                    </div>

                    {/* Quick Compare Button */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleCompare(e, place.id)}
                      className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                        isCompared
                          ? 'bg-rose-100 text-rose-700'
                          : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                      title={isCompared ? 'Remove from compare' : 'Add to compare'}
                    >
                      <GitCompare className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">
                        {isCompared ? 'Comparing' : 'Compare'}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Detail Modal / Bottom Sheet */}
      <PlaceDetailModal place={selectedPlace} onClose={() => setSelectedPlace(null)} />
    </div>
  );
};

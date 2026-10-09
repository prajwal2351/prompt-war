import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Navigation,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ArrowUpDown,
  MapPin,
  CheckCircle2,
  XCircle,
  Sparkles,
  Info,
} from 'lucide-react';
import { CITY_CONFIG } from '../config/cityConfig';
import { useApp } from '../context/AppContext';
import { computeRoutes, RouteResult, RouteLeg } from '../services/routing';
import { LeafletMap } from '../components/LeafletMap';

export const RoutesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { places, safetyReports } = useApp();

  // Preset default endpoints (e.g. Pune Station to Shaniwar Wada)
  const defaultStart = places.find((p) => p.name.includes('Shaniwar')) || places[0];
  const defaultDest = places.find((p) => p.name.includes('Aga Khan')) || places[1];

  const destParam = searchParams.get('dest');
  const matchedDest = destParam ? places.find((p) => p.id === destParam) : null;

  const [startPlaceId, setStartPlaceId] = useState<string>(defaultStart?.id || 'p-1');
  const [destPlaceId, setDestPlaceId] = useState<string>(matchedDest?.id || defaultDest?.id || 'p-2');

  const [activeRouteView, setActiveRouteView] = useState<'both' | 'safer' | 'direct'>('both');
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Map picking mode
  const [pickingTarget, setPickingTarget] = useState<'start' | 'dest' | null>(null);
  const [customStartCoords, setCustomStartCoords] = useState<[number, number] | null>(null);
  const [customDestCoords, setCustomDestCoords] = useState<[number, number] | null>(null);

  const selectedStartPlace = places.find((p) => p.id === startPlaceId);
  const selectedDestPlace = places.find((p) => p.id === destPlaceId);

  const startCoords: [number, number] =
    customStartCoords || (selectedStartPlace ? selectedStartPlace.coordinates : CITY_CONFIG.coordinates);
  const destCoords: [number, number] =
    customDestCoords || (selectedDestPlace ? selectedDestPlace.coordinates : [18.5524, 73.9015]);

  const handleComputeRoute = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await computeRoutes(startCoords, destCoords, safetyReports);
      setRouteResult(res);
      if (res.error) {
        setErrorMessage(res.error);
      }
    } catch (e: any) {
      setErrorMessage(`Routing calculation error: ${e.message || 'Unable to reach OSRM server'}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleComputeRoute();
  }, [startPlaceId, destPlaceId, customStartCoords, customDestCoords]);

  const handleSwap = () => {
    const tempId = startPlaceId;
    setStartPlaceId(destPlaceId);
    setDestPlaceId(tempId);
    const tempCoords = customStartCoords;
    setCustomStartCoords(customDestCoords);
    setCustomDestCoords(tempCoords);
  };

  const handleMapClick = (coords: [number, number]) => {
    if (pickingTarget === 'start') {
      setCustomStartCoords(coords);
      setPickingTarget(null);
    } else if (pickingTarget === 'dest') {
      setCustomDestCoords(coords);
      setPickingTarget(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Navigation className="w-7 h-7 text-emerald-600" />
            Safer Route Suggestion
          </h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
            OSRM Powered
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Compare direct paths with intelligent bypass alternatives that steer clear of high-severity accident blackspots and unlit transit zones.
        </p>
      </div>

      {/* Origin & Destination Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Start Point */}
          <div className="md:col-span-5 space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
              Start Point
            </label>
            <select
              value={customStartCoords ? 'custom' : startPlaceId}
              onChange={(e) => {
                if (e.target.value !== 'custom') {
                  setCustomStartCoords(null);
                  setStartPlaceId(e.target.value);
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            >
              {customStartCoords && (
                <option value="custom">
                  Custom Pinned Location [{startCoords[0].toFixed(3)}, {startCoords[1].toFixed(3)}]
                </option>
              )}
              {places.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.neighborhood})
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-2 flex justify-center">
            <button
              type="button"
              onClick={handleSwap}
              className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
              title="Swap Start and Destination"
            >
              <ArrowUpDown className="w-4 h-4 md:rotate-90" />
            </button>
          </div>

          {/* Destination Point */}
          <div className="md:col-span-5 space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              Destination
            </label>
            <select
              value={customDestCoords ? 'custom' : destPlaceId}
              onChange={(e) => {
                if (e.target.value !== 'custom') {
                  setCustomDestCoords(null);
                  setDestPlaceId(e.target.value);
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            >
              {customDestCoords && (
                <option value="custom">
                  Custom Pinned Location [{destCoords[0].toFixed(3)}, {destCoords[1].toFixed(3)}]
                </option>
              )}
              {places.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.neighborhood})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pin Location on Map Helper */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Or pick on map:</span>
            <button
              type="button"
              onClick={() => setPickingTarget(pickingTarget === 'start' ? null : 'start')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                pickingTarget === 'start'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {pickingTarget === 'start' ? 'Click map for Start' : 'Pick Start on Map'}
            </button>
            <button
              type="button"
              onClick={() => setPickingTarget(pickingTarget === 'dest' ? null : 'dest')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                pickingTarget === 'dest'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {pickingTarget === 'dest' ? 'Click map for Destination' : 'Pick Dest on Map'}
            </button>
          </div>

          <button
            type="button"
            onClick={handleComputeRoute}
            disabled={isLoading}
            className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Calculating...</span>
              </>
            ) : (
              <span>Re-calculate</span>
            )}
          </button>
        </div>
      </div>

      {/* Error Banner if OSRM is unreachable or routing failed */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold">Routing Notice</h4>
            <p>{errorMessage}</p>
            <p className="text-rose-700 text-xs">
              Check that your start and destination are connected by roads in Pune.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: Interactive Map with Polylines + Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Map */}
        <div className="lg:col-span-7 sticky top-20">
          {pickingTarget && (
            <div className="mb-2 p-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold animate-pulse flex items-center justify-between">
              <span>
                📍 Click map to place {pickingTarget === 'start' ? 'Start' : 'Destination'} coordinate!
              </span>
              <button
                type="button"
                onClick={() => setPickingTarget(null)}
                className="underline text-[11px]"
              >
                Cancel
              </button>
            </div>
          )}

          <LeafletMap
            places={places.filter((p) => p.id === startPlaceId || p.id === destPlaceId)}
            safetyReports={safetyReports}
            showSafetyLayer={true}
            routes={{
              direct: routeResult?.directRoute,
              safer: routeResult?.saferRoute,
              activeRoute: activeRouteView,
            }}
            pinnedLocation={customStartCoords || customDestCoords}
            onMapClick={handleMapClick}
            center={startCoords}
            zoom={13}
            heightClass="h-[440px] sm:h-[540px] lg:h-[640px]"
          />

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 px-1">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-semibold text-blue-600">
                <span className="w-3 h-1 bg-blue-500 inline-block rounded-sm"></span> Direct Route
              </span>
              <span className="flex items-center gap-1 font-semibold text-emerald-600">
                <span className="w-3 h-1 bg-emerald-500 inline-block rounded-sm"></span> Safer Alternative
              </span>
            </div>
            <span className="font-semibold text-rose-600">Red zones avoided automatically</span>
          </div>
        </div>

        {/* Right: Route Comparison Cards & Stats */}
        <div className="lg:col-span-5 space-y-4">
          {/* Map view switcher */}
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveRouteView('both')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                activeRouteView === 'both'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Compare Both
            </button>
            <button
              type="button"
              onClick={() => setActiveRouteView('safer')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                activeRouteView === 'safer'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Safer Alternative
            </button>
            <button
              type="button"
              onClick={() => setActiveRouteView('direct')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                activeRouteView === 'direct'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Direct Route
            </button>
          </div>

          {/* 1. Safer Alternative Route Card (Recommended) */}
          {routeResult?.saferRoute ? (
            <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 rounded-3xl p-5 border-2 border-emerald-400 shadow-md space-y-4 relative">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Recommended &bull; Safer Route
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                    Well-Lit Arterial Bypass
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-emerald-700">
                    {routeResult.saferRoute.safetyScore}{' '}
                    <span className="text-xs font-normal text-slate-500">/ 10</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600">Safety Index</span>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                    Distance
                  </span>
                  <span className="text-base font-extrabold text-slate-900">
                    {routeResult.saferRoute.distanceKm} km
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                    Est. Duration
                  </span>
                  <span className="text-base font-extrabold text-slate-900 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {routeResult.saferRoute.durationMins} mins
                  </span>
                </div>
              </div>

              {/* Safety highlights */}
              <div className="p-3 rounded-xl bg-white/80 border border-emerald-200 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Bypasses {routeResult.saferRoute.avoidedDangerZonesCount} high-risk accident zone(s)
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] pl-6 leading-relaxed">
                  Navigates along well-lit primary city avenues with active surveillance and pedestrian footfall.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center text-xs text-slate-500">
              {isLoading ? 'Computing safer alternative bypass...' : 'No safer alternative computed.'}
            </div>
          )}

          {/* 2. Direct Route Card */}
          {routeResult?.directRoute ? (
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    Direct Path
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    Shortest Distance
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-slate-800">
                    {routeResult.directRoute.safetyScore}{' '}
                    <span className="text-xs font-normal text-slate-500">/ 10</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">Safety Index</span>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                    Distance
                  </span>
                  <span className="text-base font-extrabold text-slate-900">
                    {routeResult.directRoute.distanceKm} km
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                    Duration
                  </span>
                  <span className="text-base font-extrabold text-slate-900 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {routeResult.directRoute.durationMins} mins
                  </span>
                </div>
              </div>

              {/* Hazards warning */}
              {routeResult.directRoute.hazardWarnings.length > 0 ? (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    Route Warnings:
                  </span>
                  <ul className="list-disc pl-5 text-[11px] text-amber-800 space-y-0.5">
                    {routeResult.directRoute.hazardWarnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500">No major incident clusters on this corridor.</p>
              )}
            </div>
          ) : null}

          {/* Tips card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Info className="w-4 h-4 text-slate-500" />
              <span>How routing is computed:</span>
            </div>
            <p className="leading-relaxed">
              OpenStreetMap + OSRM calculates driveable routes across Pune. CityPulse cross-references your route buffer against citizen reports to steer you away from poorly lit streets and blind curves.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

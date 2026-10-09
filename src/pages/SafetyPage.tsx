import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  PlusCircle,
  MapPin,
  Camera,
  Sparkles,
  CheckCircle2,
  Navigation,
  Clock,
  Filter,
  Info,
  ChevronRight,
  Upload,
  X,
  ExternalLink,
} from 'lucide-react';
import { CITY_CONFIG } from '../config/cityConfig';
import { useApp } from '../context/AppContext';
import { SafetyReport } from '../data/places';
import { LeafletMap } from '../components/LeafletMap';
import { geminiService } from '../services/gemini';

export const SafetyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { safetyReports, addSafetyReport } = useApp();

  // Filter state for reports list
  const [severityFilter, setSeverityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [selectedReport, setSelectedReport] = useState<SafetyReport | null>(null);

  // Form State
  const [showReportForm, setShowReportForm] = useState(
    searchParams.get('action') === 'report' || false
  );
  const [category, setCategory] = useState<
    'harassment' | 'theft' | 'accident' | 'poor lighting' | 'dirty area' | 'other'
  >('poor lighting');
  const [locationName, setLocationName] = useState('');
  const [coords, setCoords] = useState<[number, number]>(CITY_CONFIG.coordinates);
  const [pickingLocationOnMap, setPickingLocationOnMap] = useState(false);
  const [description, setDescription] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Submission & AI Classification states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classifiedResult, setClassifiedResult] = useState<{
    severity: 'low' | 'medium' | 'high';
    summary: string;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Pre-configured Pune landmark coordinates for quick picking
  const quickLocations: { name: string; coords: [number, number] }[] = [
    { name: 'Shivajinagar Station Area', coords: [18.5314, 73.8553] },
    { name: 'Swargate Bus Terminal & Chowk', coords: [18.5018, 73.858] },
    { name: 'Chandani Chowk Highway Bypass', coords: [18.5074, 73.7844] },
    { name: 'FC Road & Fergusson College Gate', coords: [18.5235, 73.8415] },
    { name: 'Pune Railway Station Main Exit', coords: [18.5289, 73.8744] },
    { name: 'Koregaon Park North Main Road', coords: [18.5362, 73.8938] },
    { name: 'Viman Nagar Symbiosis Corner', coords: [18.5679, 73.9143] },
  ];

  // Handle geolocation
  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCoords([lat, lng]);
          setLocationName((prev) => prev || `GPS Pin (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
          setToastMessage('Acquired location coordinates from device GPS.');
        },
        () => {
          // Fallback to Pune center
          setCoords(CITY_CONFIG.coordinates);
          setLocationName((prev) => prev || 'Central Pune');
          setToastMessage('GPS permission denied. Using central Pune coordinates.');
        }
      );
    }
  };

  // Handle map click when picking
  const handleMapClick = (newCoords: [number, number]) => {
    if (pickingLocationOnMap) {
      setCoords(newCoords);
      setLocationName(
        `Custom Pin at [${newCoords[0].toFixed(4)}, ${newCoords[1].toFixed(4)}]`
      );
      setPickingLocationOnMap(false);
      setToastMessage('Pin dropped! Location captured for your report.');
    }
  };

  // Photo upload handling (preview only)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit report with Gemini AI severity classification
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !locationName.trim()) {
      setToastMessage('Please fill out the location and description fields.');
      return;
    }

    setIsSubmitting(true);
    setClassifiedResult(null);

    try {
      // 1. Call Gemini to classify severity and produce 1-sentence summary
      const aiResult = await geminiService.classifyReport({
        category,
        description,
        locationName,
      });

      setClassifiedResult(aiResult);

      // 2. Add to app state + localStorage
      const newReport = addSafetyReport({
        category,
        location: coords,
        locationName,
        severity: aiResult.severity,
        description,
        summary: aiResult.summary,
        photoUrl: photoPreview || undefined,
      });

      setSelectedReport(newReport);
      setToastMessage(`Incident classified as ${aiResult.severity.toUpperCase()} severity and published to live map!`);

      // Reset form
      setDescription('');
      setPhotoPreview(null);
      setShowReportForm(false);
    } catch (err) {
      console.error('Error submitting report:', err);
      // Resilient fallback
      const fallbackReport = addSafetyReport({
        category,
        location: coords,
        locationName,
        severity: 'medium',
        description,
        summary: description.slice(0, 80),
        photoUrl: photoPreview || undefined,
      });
      setSelectedReport(fallbackReport);
      setToastMessage('Report published to map with medium severity.');
      setShowReportForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered reports
  const filteredReports = safetyReports.filter((r) => {
    if (severityFilter !== 'all' && r.severity !== severityFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400"
          >
            &times;
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-7 h-7 text-rose-600" />
              Safety Layer & Citizen Reports
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Crowdsourced and verified safety incidents in {CITY_CONFIG.name}. Red, amber, and green markers denote severity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/routes"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
          >
            <Navigation className="w-4 h-4" />
            <span>Plan Safer Route (OSRM) &rarr;</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowReportForm(!showReportForm)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{showReportForm ? 'Close Report Form' : 'Report an Issue'}</span>
          </button>
        </div>
      </div>

      {/* "Report an issue" Modal or Accordion Form */}
      {showReportForm && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-xl space-y-6 animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-start justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                AI-Powered Severity Classification (Gemini 3.8 Flash)
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Submit a Civic or Safety Report
              </h2>
              <p className="text-xs text-slate-500">
                Your report will be automatically classified and pinned onto the interactive city map.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowReportForm(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleReportSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                >
                  <option value="poor lighting">⚡ Poor Lighting / Broken Streetlights</option>
                  <option value="accident">⚠️ Accident-Prone Zone / Blind Curve</option>
                  <option value="harassment">🚨 Harassment / Unsafe Transit Stop</option>
                  <option value="theft">🛑 Theft / Snatching Hotspot</option>
                  <option value="dirty area">🗑️ Dirty Area / Sanitation Hazard</option>
                  <option value="other">ℹ️ Other Hazard / Road Trench</option>
                </select>
              </div>

              {/* Location Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Location / Landmark Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Swargate flyover down-ramp or JM Road walkway"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Location Picking Toolbar */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-600" />
                  Target Coordinates: [{coords[0].toFixed(4)}, {coords[1].toFixed(4)}]
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 font-semibold text-slate-700 shadow-xs"
                  >
                    Use my location
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPickingLocationOnMap(!pickingLocationOnMap);
                      setToastMessage('Click anywhere on the map below to drop your pin.');
                    }}
                    className={`px-3 py-1.5 rounded-lg font-semibold shadow-xs transition-colors ${
                      pickingLocationOnMap
                        ? 'bg-rose-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {pickingLocationOnMap ? 'Clicking on Map...' : 'Click on Map to Pick'}
                  </button>
                </div>
              </div>

              {/* Quick Landmark Presets */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-slate-400 shrink-0 font-medium">Quick Presets:</span>
                {quickLocations.map((q) => (
                  <button
                    key={q.name}
                    type="button"
                    onClick={() => {
                      setCoords(q.coords);
                      setLocationName(q.name);
                    }}
                    className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:border-slate-400 font-medium whitespace-nowrap shrink-0 shadow-2xs"
                  >
                    {q.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Description Textarea */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Issue Description *
              </label>
              <textarea
                rows={3}
                placeholder="Describe what makes this area unsafe (e.g. no functioning streetlights after 9 PM, blind turns causing two-wheeler skids, aggressive dogs, etc.)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Optional Photo Upload (Preview only) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Optional Photo Evidence (Preview only)
              </label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 text-xs font-semibold text-slate-700">
                  <Camera className="w-4 h-4 text-slate-500" />
                  <span>Choose image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>

                {photoPreview && (
                  <div className="relative inline-block">
                    <img
                      src={photoPreview}
                      alt="Uploaded incident evidence preview"
                      className="w-16 h-16 object-cover rounded-xl border border-slate-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotoPreview(null)}
                      className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Action Submit */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">
                Gemini will summarize and set severity index (Low / Medium / High).
              </span>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 font-bold text-xs sm:text-sm text-white shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>AI Classifying Report...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Publish & Classify Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Main Grid: Interactive Safety Heatmap + Reports Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Map */}
        <div className="lg:col-span-7 sticky top-20">
          {pickingLocationOnMap && (
            <div className="mb-2 p-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold flex items-center justify-between animate-pulse">
              <span>📍 Click anywhere on the map to set your report coordinates!</span>
              <button
                type="button"
                onClick={() => setPickingLocationOnMap(false)}
                className="text-[11px] underline"
              >
                Cancel
              </button>
            </div>
          )}

          <LeafletMap
            safetyReports={filteredReports}
            showSafetyLayer={true}
            onSelectReport={(report) => setSelectedReport(report)}
            pinnedLocation={pickingLocationOnMap ? coords : null}
            onMapClick={handleMapClick}
            center={selectedReport ? selectedReport.location : CITY_CONFIG.coordinates}
            zoom={selectedReport ? 15 : 13}
            heightClass="h-[440px] sm:h-[540px] lg:h-[640px]"
          />

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span>Circles show severity reach (Red: High &bull; Amber: Medium &bull; Green: Low)</span>
            <span className="font-semibold text-rose-600">Sample safety data for demo</span>
          </div>
        </div>

        {/* Right: Reports Feed & Filter Chips */}
        <div className="lg:col-span-5 space-y-4">
          {/* Severity filter chips */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" /> Severity:
            </span>
            <div className="flex items-center gap-1">
              {(['all', 'high', 'medium', 'low'] as const).map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-1 rounded-lg font-semibold uppercase text-[10px] tracking-wider transition-all ${
                    severityFilter === sev
                      ? sev === 'high'
                        ? 'bg-rose-600 text-white'
                        : sev === 'medium'
                        ? 'bg-amber-600 text-white'
                        : sev === 'low'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* List of Reports */}
          <div className="space-y-3">
            {filteredReports.map((report) => {
              const isSelected = selectedReport?.id === report.id;
              const isHigh = report.severity === 'high';
              const isMedium = report.severity === 'medium';

              return (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-rose-500 ring-2 ring-rose-400/40 shadow-md bg-rose-50/20'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white ${
                        isHigh
                          ? 'bg-rose-600'
                          : isMedium
                          ? 'bg-amber-600'
                          : 'bg-emerald-600'
                      }`}
                    >
                      {report.severity} Severity
                    </span>
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(report.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">{report.locationName}</h3>
                  <p className="text-xs text-rose-950 font-medium my-1 bg-rose-50/70 p-2 rounded-lg border border-rose-100">
                    "{report.summary}"
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {report.description}
                  </p>

                  {/* Evidence thumbnail if present */}
                  {report.photoUrl && (
                    <div className="mt-2">
                      <img
                        src={report.photoUrl}
                        alt="Citizen reported evidence"
                        className="w-14 h-14 object-cover rounded-lg border border-slate-200"
                      />
                    </div>
                  )}

                  <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 capitalize">
                      Category: <strong>{report.category}</strong>
                    </span>
                    {report.isUserReported && (
                      <span className="text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded-md">
                        Your Submitted Report
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

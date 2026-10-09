import React, { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import { CITY_CONFIG } from '../config/cityConfig';
import { Place, SafetyReport } from '../data/places';
import { createPlaceIcon, createSafetyIcon, createLocationPinIcon } from './MapIcon';
import { RouteLeg } from '../services/routing';

interface LeafletMapProps {
  places?: Place[];
  selectedPlaceId?: string | null;
  onSelectPlace?: (place: Place) => void;
  safetyReports?: SafetyReport[];
  showSafetyLayer?: boolean;
  onSelectReport?: (report: SafetyReport) => void;
  center?: [number, number];
  zoom?: number;
  routes?: {
    direct?: RouteLeg | null;
    safer?: RouteLeg | null;
    activeRoute?: 'direct' | 'safer' | 'both';
  };
  pinnedLocation?: [number, number] | null;
  onMapClick?: (coords: [number, number]) => void;
  heightClass?: string;
  className?: string;
}

// Helper to center the map when props change
function MapController({
  center,
  zoom,
}: {
  center: [number, number];
  zoom?: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom || map.getZoom(), { duration: 0.8 });
  }, [center, zoom, map]);
  return null;
}

// Helper to handle map clicks for picking locations
function MapClickHandler({
  onMapClick,
}: {
  onMapClick?: (coords: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  places = [],
  selectedPlaceId = null,
  onSelectPlace,
  safetyReports = [],
  showSafetyLayer = true,
  onSelectReport,
  center = CITY_CONFIG.coordinates,
  zoom = CITY_CONFIG.defaultZoom,
  routes,
  pinnedLocation = null,
  onMapClick,
  heightClass = 'h-[500px]',
  className = '',
}) => {
  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm z-10 ${heightClass} ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ minHeight: '100%', width: '100%' }}
      >
        <MapController center={center} zoom={zoom} />
        {onMapClick && <MapClickHandler onMapClick={onMapClick} />}

        {/* OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* 1. Place Markers */}
        {places.map((place) => {
          const isSelected = selectedPlaceId === place.id;
          return (
            <Marker
              key={place.id}
              position={place.coordinates}
              icon={createPlaceIcon(place.category, isSelected)}
              eventHandlers={{
                click: () => onSelectPlace && onSelectPlace(place),
              }}
            >
              <Popup className="custom-popup">
                <div className="p-1 max-w-[240px]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-slate-900 text-sm truncate">{place.name}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">
                      {place.priceLevel}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mb-1 flex items-center gap-2">
                    <span className="text-amber-500 font-bold">★ {place.rating}</span>
                    <span>&bull;</span>
                    <span className="capitalize">{place.category}</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 mb-2">{place.description}</p>
                  <button
                    type="button"
                    onClick={() => onSelectPlace && onSelectPlace(place)}
                    className="w-full py-1 text-center text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-md transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 2. Safety Layer & Citizen Reports */}
        {showSafetyLayer &&
          safetyReports.map((report) => {
            const isHigh = report.severity === 'high';
            const isMedium = report.severity === 'medium';
            const circleColor = isHigh ? '#ef4444' : isMedium ? '#f59e0b' : '#10b981';
            const radius = isHigh ? 380 : isMedium ? 240 : 150;

            return (
              <React.Fragment key={report.id}>
                {/* Danger / Caution zone circular halo */}
                <Circle
                  center={report.location}
                  radius={radius}
                  pathOptions={{
                    color: circleColor,
                    fillColor: circleColor,
                    fillOpacity: isHigh ? 0.22 : 0.15,
                    weight: isHigh ? 2 : 1,
                    dashArray: isHigh ? undefined : '4, 4',
                  }}
                />
                <Marker
                  position={report.location}
                  icon={createSafetyIcon(report.severity)}
                  eventHandlers={{
                    click: () => onSelectReport && onSelectReport(report),
                  }}
                >
                  <Popup>
                    <div className="p-1 max-w-[240px]">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-white ${
                            report.severity === 'high'
                              ? 'bg-rose-600'
                              : report.severity === 'medium'
                              ? 'bg-amber-600'
                              : 'bg-emerald-600'
                          }`}
                        >
                          {report.severity} Severity
                        </span>
                        <span className="text-[11px] text-slate-500 capitalize">{report.category}</span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 mb-1">{report.locationName}</h4>
                      <p className="text-xs text-slate-700 font-medium mb-1.5">{report.summary}</p>
                      <p className="text-[11px] text-slate-500 italic mb-1">{report.description}</p>
                      <div className="text-[10px] text-slate-400">
                        Reported: {new Date(report.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}

        {/* 3. Pinned custom location (e.g. click to report or route waypoint) */}
        {pinnedLocation && (
          <Marker position={pinnedLocation} icon={createLocationPinIcon('Pin', '#ef4444')}>
            <Popup>
              <div className="p-1 text-xs text-slate-800">
                <span className="font-bold">Pinned Coordinate:</span>
                <div>
                  {pinnedLocation[0].toFixed(4)}, {pinnedLocation[1].toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 4. Routes */}
        {routes?.direct && (routes.activeRoute === 'direct' || routes.activeRoute === 'both' || !routes.activeRoute) && (
          <Polyline
            positions={routes.direct.coordinates}
            pathOptions={{
              color: '#3b82f6', // blue
              weight: 5,
              opacity: 0.85,
              lineCap: 'round',
            }}
          />
        )}

        {routes?.safer && (routes.activeRoute === 'safer' || routes.activeRoute === 'both' || !routes.activeRoute) && (
          <Polyline
            positions={routes.safer.coordinates}
            pathOptions={{
              color: '#10b981', // green
              weight: 6,
              opacity: 0.95,
              lineCap: 'round',
              dashArray: routes.direct ? '8, 6' : undefined,
            }}
          />
        )}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-slate-200 text-[11px] text-slate-700 pointer-events-auto flex flex-wrap items-center gap-3">
        <span className="font-bold text-slate-900 text-xs">Legend:</span>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span>
          <span>Heritage</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
          <span>Food</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          <span>Budget / Safe</span>
        </div>
        {showSafetyLayer && (
          <>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block animate-pulse"></span>
              <span>High Risk Zone</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
              <span>Caution Zone</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

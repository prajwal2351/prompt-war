import L from 'leaflet';

export function createPlaceIcon(category: string, isSelected = false) {
  let bgColor = '#3b82f6'; // default blue
  let symbol = '📍';

  switch (category) {
    case 'heritage':
      bgColor = '#8b5cf6'; // purple
      symbol = '🏛️';
      break;
    case 'food':
      bgColor = '#f97316'; // orange
      symbol = '🍲';
      break;
    case 'hotel':
      bgColor = '#0284c7'; // ocean blue
      symbol = '🏨';
      break;
    case 'budget':
      bgColor = '#10b981'; // emerald
      symbol = '🏷️';
      break;
    case 'attraction':
      bgColor = '#06b6d4'; // cyan
      symbol = '✨';
      break;
  }

  const ringStyle = isSelected
    ? 'ring-4 ring-amber-400 scale-110 shadow-xl z-50 animate-bounce'
    : 'shadow-md hover:scale-110';

  const html = `
    <div style="background-color: ${bgColor};" class="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-white transition-all duration-200 ${ringStyle}">
      <span>${symbol}</span>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-place-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

export function createSafetyIcon(severity: 'low' | 'medium' | 'high') {
  let bgColor = '#10b981'; // green for low
  let pingBg = '#34d399';
  let icon = 'ℹ️';

  if (severity === 'high') {
    bgColor = '#ef4444'; // red
    pingBg = '#f87171';
    icon = '⚠️';
  } else if (severity === 'medium') {
    bgColor = '#f59e0b'; // amber
    pingBg = '#fbbf24';
    icon = '⚡';
  }

  const html = `
    <div class="relative flex items-center justify-center w-8 h-8">
      <span style="background-color: ${pingBg};" class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"></span>
      <div style="background-color: ${bgColor};" class="relative w-7 h-7 rounded-full flex items-center justify-center text-xs text-white font-bold border-2 border-white shadow-lg">
        ${icon}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-safety-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

export function createLocationPinIcon(label = 'Start', color = '#2563eb') {
  const html = `
    <div style="background-color: ${color};" class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-xl">
      ${label.slice(0, 1)}
    </div>
  `;
  return L.divIcon({
    html,
    className: 'custom-pin-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

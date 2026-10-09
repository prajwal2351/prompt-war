export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  weatherDescription: string;
  tempMax: number;
  tempMin: number;
  safetyAlert: string;
  isGoodForWalking: boolean;
}

// WMO Weather interpretation codes
function decodeWmoCode(code: number): { description: string; alert: string; goodForWalking: boolean } {
  switch (code) {
    case 0:
      return {
        description: 'Clear Sky & Sunny',
        alert: 'Optimal outdoor conditions. Carry water and sun protection during noon hours.',
        goodForWalking: true,
      };
    case 1:
    case 2:
      return {
        description: 'Partly Cloudy',
        alert: 'Pleasant city walking weather. Great time for heritage trail visits.',
        goodForWalking: true,
      };
    case 3:
      return {
        description: 'Overcast Skies',
        alert: 'Moderate temperature, pleasant breeze across river bridges.',
        goodForWalking: true,
      };
    case 45:
    case 48:
      return {
        description: 'Foggy / Hazy Morning',
        alert: 'Reduced visibility on flyovers and ghat roads. Turn on two-wheeler headlights.',
        goodForWalking: false,
      };
    case 51:
    case 53:
    case 55:
      return {
        description: 'Light Drizzle',
        alert: 'Slightly wet roads. Watch for slippery basalt stones near wada steps.',
        goodForWalking: true,
      };
    case 61:
    case 63:
    case 65:
      return {
        description: 'Rain Showers',
        alert: 'Pothole water accumulation reported in low-lying underpasses. Drive with caution.',
        goodForWalking: false,
      };
    case 80:
    case 81:
    case 82:
      return {
        description: 'Heavy Downpour',
        alert: 'Traffic delays expected near Swargate and Pune Station. Plan indoor heritage stops.',
        goodForWalking: false,
      };
    case 95:
    case 96:
    case 99:
      return {
        description: 'Thunderstorm',
        alert: 'Avoid seeking shelter under old trees or metal awnings. Postpone hill treks.',
        goodForWalking: false,
      };
    default:
      return {
        description: 'Fair Weather',
        alert: 'Comfortable day for city exploration.',
        goodForWalking: true,
      };
  }
}

export async function fetchCityWeather(lat = 18.5204, lon = 73.8567): Promise<WeatherData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FKolkata`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Weather API returned ${res.status}`);
    }
    const data = await res.json();
    const current = data.current;
    const daily = data.daily;

    const weatherCode = current?.weather_code ?? 1;
    const decoded = decodeWmoCode(weatherCode);

    return {
      temperature: Math.round(current?.temperature_2m ?? 27),
      humidity: Math.round(current?.relative_humidity_2m ?? 55),
      windSpeed: Math.round(current?.wind_speed_10m ?? 11),
      weatherCode,
      weatherDescription: decoded.description,
      tempMax: Math.round(daily?.temperature_2m_max?.[0] ?? 31),
      tempMin: Math.round(daily?.temperature_2m_min?.[0] ?? 20),
      safetyAlert: decoded.alert,
      isGoodForWalking: decoded.goodForWalking,
    };
  } catch (error) {
    console.warn('Weather fetch failed, using fallback Pune climate:', error);
    return {
      temperature: 28,
      humidity: 52,
      windSpeed: 12,
      weatherCode: 1,
      weatherDescription: 'Pleasant & Mild Breeze',
      tempMax: 32,
      tempMin: 21,
      safetyAlert: 'Comfortable city exploration conditions. Carry water while walking heritage streets.',
      isGoodForWalking: true,
    };
  }
}

export interface CityConfig {
  name: string;
  state: string;
  country: string;
  coordinates: [number, number]; // [lat, lng]
  defaultZoom: number;
  tagline: string;
  description: string;
  currencySymbol: string;
  emergencyContacts: {
    police: string;
    womenHelpline: string;
    trafficPolice: string;
    ambulance: string;
    disasterControl: string;
  };
  keyNeighborhoods: string[];
}

export const CITY_CONFIG: CityConfig = {
  name: 'Pune',
  state: 'Maharashtra',
  country: 'India',
  coordinates: [18.5204, 73.8567],
  defaultZoom: 13,
  tagline: 'Oxford of the East & Cultural Capital of Maharashtra',
  description:
    'A vibrant metropolis blending Maratha heritage, prestigious educational institutions, thriving tech corridors, and iconic culinary traditions.',
  currencySymbol: '₹',
  emergencyContacts: {
    police: '112 / 100',
    womenHelpline: '1091',
    trafficPolice: '020-26123342',
    ambulance: '108',
    disasterControl: '020-25501269',
  },
  keyNeighborhoods: [
    'Shivajinagar',
    'FC Road',
    'Koregaon Park',
    'Camp / MG Road',
    'Kothrud',
    'Deccan Gymkhana',
    'Viman Nagar',
    'Swargate / Kasba Peth',
  ],
};

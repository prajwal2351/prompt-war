import placesData from '../../data/places.json';

export interface Place {
  id: string;
  name: string;
  category: 'heritage' | 'attraction' | 'food' | 'hotel' | 'budget';
  coordinates: [number, number];
  rating: number;
  priceLevel: '₹' | '₹₹' | '₹₹₹';
  accessibility: boolean;
  cleanlinessScore: number;
  safetyScore: number;
  description: string;
  address: string;
  neighborhood: string;
  tags: string[];
  isHeritage: boolean;
  heritageHistory?: string;
  whyItMatters?: string;
  openingHours?: string;
  entryFee?: string;
}

export interface SafetyReport {
  id: string;
  category: 'harassment' | 'theft' | 'accident' | 'poor lighting' | 'dirty area' | 'other';
  location: [number, number];
  locationName: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  summary: string;
  timestamp: string;
  isUserReported: boolean;
  photoUrl?: string;
}

export interface Tradition {
  id: string;
  name: string;
  subtitle: string;
  era: string;
  summary: string;
  whyItMatters: string;
  insiderTip: string;
  tags: string[];
}

export interface CityDataPayload {
  places: Place[];
  safetyReports: SafetyReport[];
  traditions: Tradition[];
}

export const initialCityData: CityDataPayload = placesData as CityDataPayload;

export default initialCityData;

import React, { createContext, useContext, useState, useEffect } from 'react';
import initialCityData, { Place, SafetyReport, Tradition } from '../data/places';
import { CITY_CONFIG } from '../config/cityConfig';

interface AppContextType {
  places: Place[];
  safetyReports: SafetyReport[];
  traditions: Tradition[];
  comparedPlaceIds: string[];
  addToCompare: (id: string) => boolean;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  addSafetyReport: (report: Omit<SafetyReport, 'id' | 'timestamp' | 'isUserReported'>) => SafetyReport;
  selectedPlaceId: string | null;
  setSelectedPlaceId: (id: string | null) => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  accessibilityOnly: boolean;
  setAccessibilityOnly: (val: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_REPORTS_KEY = 'citypulse_user_safety_reports';
const LOCAL_STORAGE_COMPARE_KEY = 'citypulse_compared_places';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [places] = useState<Place[]>(initialCityData.places);
  const [traditions] = useState<Tradition[]>(initialCityData.traditions);

  // Initialize safety reports with seed data + persisted user reports
  const [safetyReports, setSafetyReports] = useState<SafetyReport[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_REPORTS_KEY);
      if (stored) {
        const userReports: SafetyReport[] = JSON.parse(stored);
        return [...userReports, ...initialCityData.safetyReports];
      }
    } catch (e) {
      console.warn('Failed to load user reports from storage:', e);
    }
    return initialCityData.safetyReports;
  });

  // Compared places (2 to 4)
  const [comparedPlaceIds, setComparedPlaceIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_COMPARE_KEY);
      if (stored) {
        const ids = JSON.parse(stored);
        if (Array.isArray(ids) && ids.length >= 2) return ids;
      }
    } catch (e) {
      console.warn('Failed to load compared places:', e);
    }
    // Default seed 3 places to compare: Shaniwar Wada, Cafe Goodluck, and Aga Khan Palace
    return ['p-1', 'p-2', 'p-9'];
  });

  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [accessibilityOnly, setAccessibilityOnly] = useState<boolean>(false);

  // Persist comparison selections
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_COMPARE_KEY, JSON.stringify(comparedPlaceIds));
    } catch (e) {
      console.warn('Failed to persist compare selections:', e);
    }
  }, [comparedPlaceIds]);

  const addToCompare = (id: string): boolean => {
    if (comparedPlaceIds.includes(id)) return false;
    if (comparedPlaceIds.length >= 4) return false;
    setComparedPlaceIds((prev) => [...prev, id]);
    return true;
  };

  const removeFromCompare = (id: string) => {
    setComparedPlaceIds((prev) => prev.filter((item) => item !== id));
  };

  const clearCompare = () => {
    setComparedPlaceIds([]);
  };

  const addSafetyReport = (
    reportData: Omit<SafetyReport, 'id' | 'timestamp' | 'isUserReported'>
  ): SafetyReport => {
    const newReport: SafetyReport = {
      ...reportData,
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      isUserReported: true,
    };

    setSafetyReports((prev) => {
      const updated = [newReport, ...prev];
      try {
        const userOnly = updated.filter((r) => r.isUserReported);
        localStorage.setItem(LOCAL_STORAGE_REPORTS_KEY, JSON.stringify(userOnly));
      } catch (e) {
        console.warn('Failed to save report to localStorage:', e);
      }
      return updated;
    });

    return newReport;
  };

  return (
    <AppContext.Provider
      value={{
        places,
        safetyReports,
        traditions,
        comparedPlaceIds,
        addToCompare,
        removeFromCompare,
        clearCompare,
        addSafetyReport,
        selectedPlaceId,
        setSelectedPlaceId,
        activeFilter,
        setActiveFilter,
        searchQuery,
        setSearchQuery,
        accessibilityOnly,
        setAccessibilityOnly,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export interface ClassifyReportResult {
  severity: 'low' | 'medium' | 'high';
  summary: string;
  source?: string;
}

export interface CityInsightResult {
  insight: string;
  tip: string;
  highlightZone: string;
  source?: string;
}

export interface CompareVerdictResult {
  verdict: string;
  recommendation: string;
  bestForBudget: string;
  bestForSafety: string;
  source?: string;
}

export interface CultureGuideResult {
  guide: string;
  insiderTips: string[];
  localCustoms: string;
  funFact: string;
  source?: string;
}

export const geminiService = {
  /**
   * Classify a safety/civic report's severity and generate a 1-sentence summary
   */
  async classifyReport(params: {
    category: string;
    description: string;
    locationName?: string;
  }): Promise<ClassifyReportResult> {
    try {
      const res = await fetch('/api/gemini/classify-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      return {
        severity: data.severity || 'medium',
        summary: data.summary || params.description.slice(0, 80),
        source: data.source,
      };
    } catch (err: any) {
      console.warn('classifyReport API warning, using client fallback:', err);
      // Fallback if network or server issue
      const text = (params.description + ' ' + params.category).toLowerCase();
      let severity: 'low' | 'medium' | 'high' = 'medium';
      if (text.includes('accident') || text.includes('assault') || text.includes('harass') || text.includes('crash')) {
        severity = 'high';
      } else if (text.includes('garbage') || text.includes('trash') || text.includes('pot') || text.includes('light')) {
        severity = 'low';
      }
      return {
        severity,
        summary: `Citizen issue: ${params.description.slice(0, 70)}...`,
        source: 'client-fallback',
      };
    }
  },

  /**
   * Get City Insight of the Day based on live weather and city pulse
   */
  async getCityInsight(params: {
    city?: string;
    weatherSummary?: string;
  }): Promise<CityInsightResult> {
    try {
      const res = await fetch('/api/gemini/city-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      return await res.json();
    } catch (err: any) {
      console.warn('getCityInsight API warning, using client fallback:', err);
      return {
        insight:
          "Pune's cultural calendar is active today with pleasant morning breezes across the Deccan. A great time for exploring historical wadas and street food katttas.",
        tip: 'Best to visit old city monuments before 11:30 AM to beat midday heat and parking queues.',
        highlightZone: 'Deccan Gymkhana & Shaniwar Peth',
        source: 'client-fallback',
      };
    }
  },

  /**
   * Compare 2-4 places and produce plain-language AI verdict
   */
  async getCompareVerdict(places: Array<{
    name: string;
    category: string;
    rating: number;
    priceLevel: string;
    cleanlinessScore: number;
    safetyScore: number;
    accessibility: boolean;
  }>): Promise<CompareVerdictResult> {
    try {
      const res = await fetch('/api/gemini/compare-verdict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ places }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      return await res.json();
    } catch (err: any) {
      console.warn('getCompareVerdict API warning, using client fallback:', err);
      const sorted = [...places].sort((a, b) => (b.safetyScore + b.rating * 2) - (a.safetyScore + a.rating * 2));
      const top = sorted[0]?.name || 'Top Place';
      return {
        verdict: `Comparing ${places.map((p) => p.name).join(' vs ')}: ${top} scores best overall for general peace of mind and visitor ratings. If travelling on a shoestring, check price levels carefully.`,
        recommendation: `We recommend ${top} as the primary choice for safety and consistent standards.`,
        bestForBudget: places.find((p) => p.priceLevel === '₹')?.name || places[0].name,
        bestForSafety: [...places].sort((a, b) => b.safetyScore - a.safetyScore)[0]?.name || places[0].name,
        source: 'client-fallback',
      };
    }
  },

  /**
   * Get cultural deep-dive story and insider tips ("Tell me more")
   */
  async getCultureGuide(params: {
    name: string;
    type?: string;
    summary?: string;
    context?: string;
  }): Promise<CultureGuideResult> {
    try {
      const res = await fetch('/api/gemini/culture-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      return await res.json();
    } catch (err: any) {
      console.warn('getCultureGuide API warning, using client fallback:', err);
      return {
        guide: `${params.name} is deeply revered in Pune lore. Known for its historical resonance and timeless charm, it captures the indomitable Maratha spirit and love for education and heritage.`,
        insiderTips: [
          'Arrive early morning for golden-hour photography and smaller crowds.',
          'Try traditional tea and snacks at the oldest tea stall in the vicinity.',
          'Spend at least 45 minutes walking through the surrounding alleys.',
        ],
        localCustoms: 'Respect local signage and footwear etiquette at sacred shrines.',
        funFact: 'Pune is nicknamed the Cultural Capital of Maharashtra and Oxford of the East.',
        source: 'client-fallback',
      };
    }
  },
};

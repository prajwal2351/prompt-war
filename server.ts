import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK with user agent header as required
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Endpoint: Classify citizen report severity & generate concise summary
app.post('/api/gemini/classify-report', async (req, res) => {
  try {
    const { category, description, locationName } = req.body;
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    if (!ai) {
      // Graceful fallback if no Gemini key is set
      const lower = (description + ' ' + (category || '')).toLowerCase();
      let severity: 'low' | 'medium' | 'high' = 'medium';
      if (
        lower.includes('accident') ||
        lower.includes('blood') ||
        lower.includes('assault') ||
        lower.includes('harass') ||
        lower.includes('danger') ||
        lower.includes('crash')
      ) {
        severity = 'high';
      } else if (
        lower.includes('garbage') ||
        lower.includes('dirty') ||
        lower.includes('pothole') ||
        lower.includes('lamp') ||
        lower.includes('clean')
      ) {
        severity = 'low';
      }
      return res.json({
        severity,
        summary: `Reported ${category || 'hazard'} near ${locationName || 'location'}: ${description.slice(0, 75)}...`,
        source: 'local-fallback',
      });
    }

    const prompt = `Analyze this citizen safety/civic incident report for a city exploration app.
Report Details:
- Category: ${category || 'Unspecified'}
- Location: ${locationName || 'Unknown coordinate'}
- Citizen Description: "${description}"

Tasks:
1. Classify severity into exactly one of: "low", "medium", "high".
   - "high" for active harassment, violence, severe accident blackspots, immediate bodily danger.
   - "medium" for dark alleys/broken lighting, theft prone spots, suspicious gatherings, transit hazards.
   - "low" for sanitation issues, overflowing trash, minor potholes, noise, stray animals.
2. Produce a crisp, objective 1-sentence summary (max 15 words) suitable for map display.

Output JSON with keys:
"severity": "low" | "medium" | "high"
"summary": string`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            severity: {
              type: Type.STRING,
              description: 'Severity classification: low, medium, or high',
            },
            summary: {
              type: Type.STRING,
              description: 'One-line summary for map markers',
            },
          },
          required: ['severity', 'summary'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const validSeverity = ['low', 'medium', 'high'].includes(parsed.severity?.toLowerCase())
      ? (parsed.severity.toLowerCase() as 'low' | 'medium' | 'high')
      : 'medium';

    return res.json({
      severity: validSeverity,
      summary: parsed.summary || description.slice(0, 80),
      source: 'gemini',
    });
  } catch (error: any) {
    console.error('Gemini classify error:', error);
    // Return resilient fallback rather than breaking client flow
    return res.json({
      severity: 'medium',
      summary: (req.body.description || 'Civic safety report').slice(0, 80),
      source: 'fallback-on-error',
    });
  }
});

// 2. Endpoint: City Insight of the Day
app.post('/api/gemini/city-insight', async (req, res) => {
  try {
    const { city = 'Pune', weatherSummary = 'pleasant' } = req.body;

    if (!ai) {
      return res.json({
        insight: `Pune's historic peths and modern tech corridors offer an exhilarating contrast today. Morning humidity is low, making it ideal for Shaniwar Wada walks before enjoying Misal Pav on FC Road.`,
        tip: `Avoid the Swargate junction bottleneck during 5:30 PM - 7:30 PM peak rush; prefer the metro line where available.`,
        highlightZone: 'Koregaon Park & Deccan Heritage Belt',
        source: 'local-fallback',
      });
    }

    const prompt = `You are CityPulse AI for the city of ${city}, India.
Current weather context: ${weatherSummary}.
Generate a fresh "City Insight of the Day" for explorers, tourists, and residents today.
Include:
1. "insight": 2-3 engaging sentences describing today's city rhythm, exploration mood, and seasonal highlight in ${city}.
2. "tip": 1 actionable local travel/safety tip (e.g. traffic bypass, best time for heritage photography, street food hygiene tip).
3. "highlightZone": 1 recommended neighborhood to explore today.

Output JSON with keys: insight, tip, highlightZone.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insight: { type: Type.STRING },
            tip: { type: Type.STRING },
            highlightZone: { type: Type.STRING },
          },
          required: ['insight', 'tip', 'highlightZone'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      insight: parsed.insight,
      tip: parsed.tip,
      highlightZone: parsed.highlightZone,
      source: 'gemini',
    });
  } catch (error: any) {
    console.error('Gemini city insight error:', error);
    return res.json({
      insight: `Pune is bustling with lively street energy across the Deccan and Camp quarters. Crisp weather provides great conditions to explore rock-cut sanctuaries and heritage wadas.`,
      tip: `Carry cash for older peth bakeries and download offline maps for winding lanes.`,
      highlightZone: 'Fergusson College Road & Old Peths',
      source: 'fallback-on-error',
    });
  }
});

// 3. Endpoint: Compare Places Verdict
app.post('/api/gemini/compare-verdict', async (req, res) => {
  try {
    const { places } = req.body;
    if (!places || !Array.isArray(places) || places.length < 2) {
      return res.status(400).json({ error: 'At least 2 places required for comparison' });
    }

    if (!ai) {
      // Deterministic fallback
      const sortedByScore = [...places].sort((a, b) => {
        const scoreA = (a.rating || 0) * 10 + (a.safetyScore || 0) + (a.cleanlinessScore || 0);
        const scoreB = (b.rating || 0) * 10 + (b.safetyScore || 0) + (b.cleanlinessScore || 0);
        return scoreB - scoreA;
      });
      const winner = sortedByScore[0]?.name || 'First option';
      return res.json({
        verdict: `Comparing ${places.map((p) => p.name).join(' vs ')}: ${winner} takes the top honors for its solid balance of safety and visitor satisfaction. Each destination caters to distinct budgets and preferences.`,
        recommendation: `For tourists prioritizing verified safety and cleanliness, pick ${winner}. If looking for economical spends, choose ${places.find((p) => p.priceLevel === '₹')?.name || winner}.`,
        bestForBudget: places.find((p) => p.priceLevel === '₹')?.name || places[0].name,
        bestForSafety: [...places].sort((a, b) => (b.safetyScore || 0) - (a.safetyScore || 0))[0]?.name || places[0].name,
        source: 'local-fallback',
      });
    }

    const prompt = `Compare these ${places.length} places in Pune for an explorer deciding where to go:
${JSON.stringify(places, null, 2)}

Provide an authoritative, friendly, plain-language comparison verdict that evaluates safety, cleanliness, affordability, rating, and accessibility.
Provide:
1. "verdict": A clear 2-3 paragraph plain-language comparison analysis explaining trade-offs.
2. "recommendation": Summary recommendation for first-time visitors.
3. "bestForBudget": Name of the best budget pick.
4. "bestForSafety": Name of the safest pick.

Return JSON format with fields: verdict, recommendation, bestForBudget, bestForSafety.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: { type: Type.STRING },
            recommendation: { type: Type.STRING },
            bestForBudget: { type: Type.STRING },
            bestForSafety: { type: Type.STRING },
          },
          required: ['verdict', 'recommendation', 'bestForBudget', 'bestForSafety'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      verdict: parsed.verdict,
      recommendation: parsed.recommendation,
      bestForBudget: parsed.bestForBudget,
      bestForSafety: parsed.bestForSafety,
      source: 'gemini',
    });
  } catch (error: any) {
    console.error('Gemini compare verdict error:', error);
    return res.json({
      verdict: `All selected spots offer unique viewpoints on Pune's urban charm. Check accessibility badges and safety scores before visiting with family.`,
      recommendation: `Opt for the location closest to your current itinerary with a safety score above 8.5.`,
      bestForBudget: req.body.places?.[0]?.name || 'Budget option',
      bestForSafety: req.body.places?.[0]?.name || 'Safety option',
      source: 'fallback-on-error',
    });
  }
});

// 4. Endpoint: Cultural Guide / "Tell me more"
app.post('/api/gemini/culture-guide', async (req, res) => {
  try {
    const { name, type, summary, context } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (!ai) {
      return res.json({
        guide: `${name} is an integral part of Pune's cultural identity. Visitors often admire the deep historical roots and local passion associated with it. When visiting, engage with local shopkeepers and elders who carry captivating oral stories about the Peshwa and freedom movement eras.`,
        insiderTips: [
          'Arrive early in the morning for serene photos and to avoid school/tourist queues.',
          'Pair your visit with local chai and snacks from nearby traditional bakeries.',
          'Respect photography regulations inside sanctum and museum galleries.',
        ],
        localCustoms: 'Modest attire is appreciated in spiritual courtyards and heritage shrines.',
        funFact: `Many structures in Pune feature black basalt stone quarried locally from the Deccan traps.`,
        source: 'local-fallback',
      });
    }

    const prompt = `You are a knowledgeable, friendly Pune local historian and heritage guide.
A traveler is viewing the landmark or cultural tradition: "${name}" (${type || 'heritage'}).
Existing context: "${summary || ''} ${context || ''}"

Generate an engaging, warm, authentic guide story for this item:
1. "guide": 2-3 short, lively paragraphs detailing the living history, captivating stories, architectural or social nuances, and why Punekars hold it dear.
2. "insiderTips": An array of 3 specific, practical insider tips (e.g. ideal photography angles, hidden nooks, local food pairing nearby, timing secrets).
3. "localCustoms": 1 sentence on etiquette or cultural nuances.
4. "funFact": 1 surprising historical trivia or legend.

Return JSON with keys: guide, insiderTips, localCustoms, funFact.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            guide: { type: Type.STRING },
            insiderTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            localCustoms: { type: Type.STRING },
            funFact: { type: Type.STRING },
          },
          required: ['guide', 'insiderTips', 'localCustoms', 'funFact'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      guide: parsed.guide,
      insiderTips: parsed.insiderTips || [],
      localCustoms: parsed.localCustoms,
      funFact: parsed.funFact,
      source: 'gemini',
    });
  } catch (error: any) {
    console.error('Gemini culture guide error:', error);
    return res.json({
      guide: `${req.body.name} represents the architectural and spiritual pride of Pune. Built during an era of great transformation, it continues to welcome seekers, architecture enthusiasts, and casual travelers alike.`,
      insiderTips: [
        'Visit during golden hour for the best natural light.',
        'Ask local guides about hidden inscriptions and carvings.',
        'Combine with a walk through the surrounding Peth streets.',
      ],
      localCustoms: 'Keep shoes outside inner sanctuaries.',
      funFact: 'Pune features over 20 preserved wadas with intricate wooden lattice facades.',
      source: 'fallback-on-error',
    });
  }
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CityPulse server running on http://0.0.0.0:${PORT} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer();

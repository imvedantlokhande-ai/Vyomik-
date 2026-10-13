import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import {
  DEMO_PROFILES,
  DEMO_BUSINESSES,
  DEMO_OPPORTUNITIES,
  DEMO_FINANCIALS,
  DEMO_SCHEMES,
  DEMO_ACTION_PLANS
} from './src/data/demoData';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));


// Mock In-Memory Store
let SAVED_PROFILES = [...DEMO_PROFILES];

// API Routes
app.post("/api/v1/profile", (req, res) => {
  const profile = req.body;
  if (!profile.id) {
    profile.id = `prof_${Math.random().toString(36).substring(2, 10)}`;
  }
  SAVED_PROFILES.push(profile);
  res.json(profile);
});

app.get("/api/v1/profile", (req, res) => {
  const user_id = req.headers.authorization?.split(" ")[1];
  const profile = SAVED_PROFILES.find(p => p.id === user_id) || SAVED_PROFILES[SAVED_PROFILES.length - 1];
  res.json(profile || { status: "empty" });
});

// API Routes (continued)
app.post("/api/v1/opportunities", (req, res) => {
  res.json(DEMO_OPPORTUNITIES);
});

app.get("/api/v1/opportunities", (req, res) => {
  res.json(DEMO_OPPORTUNITIES);
});

app.post("/api/v1/recommendations", (req, res) => {
  const recs = DEMO_BUSINESSES.slice(0, 3).map(b => ({
    business: b,
    investment: { min: b.minCapital, max: b.maxCapital, recommended: (b.minCapital + b.maxCapital) / 2 },
    demand: "High",
    competition: "Low",
    risk: "Balanced",
    opportunity_score: b.overallViabilityScore,
    reason: b.explainabilitySummary
  }));
  res.json({ status: "success", recommendations: recs, top_3: recs });
});

app.get("/api/v1/recommendations", (req, res) => {
  const recs = DEMO_BUSINESSES.slice(0, 3).map(b => ({
    business: b,
    investment: { min: b.minCapital, max: b.maxCapital, recommended: (b.minCapital + b.maxCapital) / 2 },
    demand: "High",
    competition: "Low",
    risk: "Balanced",
    opportunity_score: b.overallViabilityScore,
    reason: b.explainabilitySummary
  }));
  res.json({ status: "success", recommendations: recs, top_3: recs });
});

app.post("/api/v1/finance/calculate", (req, res) => {
  // Simple mock calculation
  res.json({
    status: "success",
    profit: 10000,
    cash_flow: 5000,
    EMI: 2000,
    break_even: 6,
    risk: "Low"
  });
});

app.post("/api/v1/schemes/match", (req, res) => {
  res.json({ status: "success", matches: DEMO_SCHEMES.map(s => ({ scheme: s })) });
});

app.get("/api/v1/schemes/dataset", (req, res) => {
  res.json({ status: "success", schemes: DEMO_SCHEMES });
});

app.get("/api/v1/schemes/rag/stats", (req, res) => {
  res.json({ rag_ready: true });
});

app.post("/api/v1/explain", (req, res) => {
  res.json({ status: "success", summary: "Looks like a good fit!" });
});

// Lazy-initialized Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "VYOMIK",
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// AI Advisor endpoint for rural micro-entrepreneurs - delegates to FastAPI /api/v1/advisor
app.post("/api/gemini/advisor", async (req, res) => {
  try {
    const { message, question, profile, currentBusiness } = req.body;
    const userQuery = question || message;

    if (!userQuery || typeof userQuery !== "string") {
      res.status(400).json({ error: "Message is required." });
      return;
    }

    // Try calling FastAPI advisor endpoint first
    try {
      const fastApiResponse = await fetch("http://127.0.0.1:8001/api/v1/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userQuery,
          message: userQuery,
          profile: profile || {},
          currentBusiness,
        }),
      });

      if (fastApiResponse.ok) {
        const data = await fastApiResponse.json();
        res.json({
          reply: data.advice || data.reply,
          advice: data.advice || data.reply,
          source: data.model || "gemini",
        });
        return;
      }
    } catch (proxyErr) {
      console.warn("FastAPI advisor call error, falling back to local handler:", proxyErr);
    }

    const ai = getGeminiClient();

    if (ai) {
      try {
        const systemPrompt = `You are VYOMIK AI Advisor, an empathetic and highly knowledgeable rural business mentor for Indian micro-entrepreneurs, small farmers, women SHG leaders, and rural youth.
Your mission is to help them choose, plan, finance, de-risk, and scale viable local micro-enterprises in India.
User Profile context:
- Name: ${profile?.name || "Rural Entrepreneur"}
- Location: ${profile?.district || "Rural District"}, ${profile?.state || "India"}
- Available Capital: ₹${profile?.capital || "50,000"}
- Land/Shop: ${profile?.landAsset || "0.5 acre ancestral land"}
- Experience/Skills: ${profile?.skills || "Agriculture and dairy basics"}
- Preferred Language: ${profile?.language || "English / Hinglish"}
- Current Focus: ${currentBusiness || "General Exploration"}

Guidelines:
1. Provide practical, numbers-grounded advice with realistic costs in Indian Rupees (₹).
2. Recommend viable local supply chains (raw material availability, transport, local weekly haats, Mandis, or value addition).
3. Reference relevant Government of India / State schemes (Mudra Shishu/Kishore/Tarun, PMEGP subsidy up to 35%, PMFME for food processing, NRLM SHG bank linkage).
4. Keep tone warm, respectful, practical, and action-oriented. Format with clean bullet points.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: userQuery,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
          },
        });

        res.json({
          reply: response.text,
          advice: response.text,
          source: "gemini",
        });
        return;
      } catch (geminiErr: any) {
        console.warn("Gemini API call failed, falling back to rural knowledge engine:", geminiErr?.message);
        // Fallback below
      }
    }

    // High quality intelligent rural enterprise domain fallback
    const msg = message.toLowerCase();
    let reply = "";

    if (msg.includes("loan") || msg.includes("mudra") || msg.includes("scheme") || msg.includes("pmegp") || msg.includes("subsidy")) {
      reply = `**Government Scheme & Financing Guidance for ${profile?.district || "your district"}:**

1. **PMEGP (Prime Minister Employment Generation Programme):**
   - **Subsidy:** 25% for general category in rural areas, and **35% for Special Categories** (SC/ST/OBC/Women/Ex-servicemen/Differently abled).
   - **Own Contribution:** Only 5% to 10% of total project cost.
   - **Max Project Cost:** Up to ₹50 Lakh for manufacturing, ₹20 Lakh for service units.

2. **Pradhan Mantri Mudra Yojana (PMMY):**
   - **Shishu Loan:** Up to ₹50,000 (Zero collateral, quick sanction via local Gramin / PSU banks).
   - **Kishore Loan:** ₹50,000 to ₹5,00,000 for equipment purchase.
   - **Tarun Loan:** ₹5 Lakh to ₹10 Lakh for expanding sales and logistics.

3. **Recommended Action:**
   - Keep your Aadhaar, PAN card, Udyam Registration (free online), and 6-month bank passbook ready.
   - Apply through the unified JanSamarth portal or visit your nearest Common Service Centre (CSC) or District Industries Centre (DIC).`;
    } else if (msg.includes("profit") || msg.includes("financial") || msg.includes("break-even") || msg.includes("cost") || msg.includes("margin")) {
      reply = `**Financial Feasibility & Working Capital Rules for Rural Ventures:**

- **Working Capital Rule:** Always preserve at least **45 to 60 days of operating expenses** as a cash buffer before counting profits.
- **Gross Margin Target:** In agro-processing or cottage goods, aim for a minimum of **28% - 35% gross margin** to absorb seasonal transport and raw material price fluctuations.
- **Break-Even Benchmark:** A healthy rural micro-unit should achieve break-even within **4 to 6 months** of consistent operation.
- **Use VYOMIK Financial Planner & What-If Simulator:** We have pre-computed models where you can test what happens if diesel prices rise by 10% or if monsoon delays harvesting.`;
    } else if (msg.includes("market") || msg.includes("sell") || msg.includes("customer") || msg.includes("haat")) {
      reply = `**Local Market Linkage & Customer Acquisition Strategy:**

1. **Immediate Radius (0–5 km):** Start with direct sales at local weekly Gramin Haats, schools, and nearby village kirana stores. Cash liquidity is immediate.
2. **Semi-Urban Hubs (5–25 km):** Partner with restaurants, sweet shops, or distributors in the nearest Taluka/Tehsil town.
3. **Packaging & Trust:** Simple tamper-evident packaging with FSSAI basic registration (costs only ₹100/yr) allows you to charge 15-20% premium over loose unbranded commodities.
4. **Bulk Buyer Agreements:** Form supply tie-ups with local Dairy Federations, FPOs (Farmer Producer Organizations), or SHG federations.`;
    } else {
      reply = `**VYOMIK Advisory Insights for ${profile?.name || "Entrepreneur"}:**

Based on your profile with **₹${profile?.capital || "50,000"} capital** and skills in **${profile?.skills || "local production"}**:

1. **High Potential Opportunities in ${profile?.district || "your region"}:**
   - **Mini Pulse/Dal Mill or Spice Grinding Unit:** High recurring local demand, 32% gross margins, 5-month payback.
   - **Cold Pressed Oil Processing (Ghani):** Mustard/Groundnut/Sesame oil commands 30% higher prices over refined oils.
   - **Solar Powered Decentralized Service (Dryer or Cold Storage):** Eligible for 40-50% NABARD / state green subsidies.

2. **Next Immediate Step:**
   - Check the **Local Opportunities** tab to see raw material surpluses in your block.
   - Review your matched business in **Business Recommendations**, and adjust variables in the **Financial Planner**.`;
    }

    res.json({
      reply,
      source: "knowledge_engine",
    });
  } catch (err: any) {
    console.error("Advisor error:", err);
    res.status(500).json({ error: "Failed to generate advisory response." });
  }
});

// Voice Advisor proxy endpoint
app.post("/api/gemini/advisor/voice", async (req, res) => {
  try {
    const fastApiResponse = await fetch("http://127.0.0.1:8001/api/v1/advisor/voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await fastApiResponse.json();
    res.status(fastApiResponse.status).json(data);
  } catch (err: any) {
    console.error("FastAPI voice advisor proxy error:", err);
    res.status(502).json({ error: "Failed to process voice advisor query", details: err.message });
  }
});

// Vite middleware in dev, static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`VYOMIK Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

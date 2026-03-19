import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// Check if AI is configured
app.get("/api/config", (req, res) => {
  res.json({ 
    hasZhipu: !!process.env.ZHIPU_API_KEY,
    hasGemini: !!process.env.GEMINI_API_KEY
  });
});

// Zhipu AI Proxy Route
app.post("/api/chat", async (req, res) => {
  const { prompt } = req.body;
  const zhipuApiKey = process.env.ZHIPU_API_KEY;

  if (!zhipuApiKey) {
    return res.status(500).json({ error: "ZHIPU_API_KEY is not configured on the server." });
  }

  try {
    const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${zhipuApiKey}`,
      },
      body: JSON.stringify({
        model: "GLM-4-Flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Zhipu AI Error:", errorData);
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Proxy Error:", error);
    res.status(500).json({ error: "Failed to connect to Zhipu AI" });
  }
});

// Gemini AI Proxy Route
app.post("/api/gemini", async (req, res) => {
  const { prompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    if (!response.text) {
      return res.status(500).json({ error: "Gemini returned empty content" });
    }

    res.json({ text: response.text.trim() });
  } catch (error) {
    console.error("Gemini Proxy Error:", error);
    res.status(500).json({ error: "Failed to connect to Gemini AI" });
  }
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Only listen if not on Vercel (Vercel handles the app export)
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
export default app;

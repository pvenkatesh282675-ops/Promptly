import { Router, Request, Response } from "express";
import { model } from "../lib/gemini";
import { searchWeb } from "../lib/tavily";

import History from "../models/History";

const router = Router();

router.post("/generate", async (req: Request, res: Response): Promise<void> => {
  const { prompt, includeSearch, userId } = req.body;

  if (!prompt) {
    res.status(400).json({ error: "Prompt is required" });
    return;
  }

  const startTime = Date.now();
  try {
    let finalPrompt = prompt;
    let sources: { title: string; url: string }[] = [];
    let domains: string[] = [];

    if (includeSearch) {
      console.log("Searching web for:", prompt);
      const searchResults = await searchWeb(prompt);
      // @ts-ignore
      sources = (searchResults.results || []).map((r: any) => ({
        title: r.title || "Untitled",
        url: r.url,
      }));

      domains = [...new Set(sources.map((s) => new URL(s.url).hostname))];

      const context = sources
        // @ts-ignore
        .map(
          (s: any, i: number) =>
            `Source [${i + 1}]: ${s.url}\nContent: ${searchResults.results[i].content}`,
        )
        .join("\n\n");
      finalPrompt = `Context from web search:\n${context}\n\nUser Question: ${prompt}\n\nAnswer based on the context provided. If the information isn't in the context, use your general knowledge but prioritize search results.`;
    }

    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const text = response.text();

    // Generate Highlights
    const highlightResult = await model.generateContent(
      `Based on this AI response, provide 2-3 extremely concise bullet points (max 10 words each) highlighting the key takeaways. Just the bullet points, no extra text:\n\n${text}`,
    );
    const highlightResponse = await highlightResult.response;
    const highlights = highlightResponse
      .text()
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => line.replace(/^[*-]\s*/, "").trim());

    const endTime = Date.now();
    const processingTime = Number(((endTime - startTime) / 1000).toFixed(2));

    const metadata = {
      sources,
      domains,
      processingTime,
      highlights: highlights.slice(0, 3),
    };

    // Save to History if userId is provided
    if (userId) {
      try {
        await History.create({
          userId,
          prompt,
          response: text,
          metadata,
        });
      } catch (saveError) {
        console.error("Failed to save history:", saveError);
      }
    }

    res.json({
      text,
      metadata,
    });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "AI generation failed" });
  }
});

router.get(
  "/history/:userId",
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
    try {
      const history = await History.find({ userId })
        .sort({ createdAt: -1 })
        .limit(20);
      res.json(history);
    } catch (error) {
      console.error("Failed to fetch history:", error);
      res.status(500).json({ error: "Failed to fetch history" });
    }
  },
);

export default router;

import { Router, Request, Response } from "express";
import { Agent } from "../lib/agent";

const router = Router();

router.post("/start", async (req: Request, res: Response): Promise<void> => {
  const { channelType, channelId } = req.body;
  if (!channelId) {
    res.status(400).json({ error: "Channel ID required" });
    return;
  }

  try {
    const agent = new Agent(channelType || "messaging", channelId);
    await agent.initialize();
    res.json({ status: "Agent started" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to start agent" });
  }
});

router.post("/message", async (req: Request, res: Response): Promise<void> => {
  const { channelType, channelId, text } = req.body;
  // In a real app, verify webhook signature logic here

  try {
    const agent = new Agent(channelType || "messaging", channelId);
    // Fire and forget response to not block
    agent.processMessage(text);
    res.json({ status: "Processing" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to process" });
  }
});

export default router;

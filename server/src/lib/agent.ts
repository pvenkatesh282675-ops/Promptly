import { streamClient } from "./stream";
import { model } from "./gemini";
import { searchWeb } from "./tavily";

export class Agent {
  private channelId: string;
  private channelType: string;

  constructor(channelType: string, channelId: string) {
    this.channelType = channelType;
    this.channelId = channelId;
  }

  async initialize() {
    // Upsert AI user
    await streamClient.upsertUser({
      id: "ai-agent",
      name: "AI Assistant",
      role: "admin", 
      image: "https://cdn-icons-png.flaticon.com/512/4712/4712035.png",
    });

    const channel = streamClient.channel(this.channelType, this.channelId);
    await channel.addMembers(["ai-agent"]);
  }

  async processMessage(messageText: string) {
    console.log(`Agent processing: ${messageText}`);

    // Simple heuristic: if message starts with @ai-agent or normal flow
    // For now, we assume this is called when it SHOULD respond.

    let context = "";
    // Trigger search if "search" keyword or question
    if (messageText.toLowerCase().includes("search")) {
      console.log("Agent searching web...");
      const searchRes = await searchWeb(messageText);
      // @ts-ignore
      if (searchRes.results && searchRes.results.length > 0) {
        // @ts-ignore
        context = searchRes.results
          .map((r) => `Source: ${r.url}\n${r.content}`)
          .join("\n\n");
      }
    }

    const prompt = `
      You are an intelligent AI assistant in a chat channel.
      Context from web (if any): ${context}
      User Message: ${messageText}
      
      Respond conversationally and helpfully.
      Make sure you give it in a very structured and easy to understand format.
      Follow the basic details to answer the user message in the required format.
      Keenly analyze the user message and respond accordingly.
      Keep the converstion open ended so that the user can ask more questions.
    `;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      const channel = streamClient.channel(this.channelType, this.channelId);
      await channel.sendMessage({
        text: responseText,
        user_id: "ai-agent",
      });
    } catch (e) {
      console.error("Agent generation error", e);
    }
  }
}

import { tavily } from "@tavily/core";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.TAVILY_API_KEY;

if (!apiKey) {
  console.warn("TAVILY_API_KEY is missing");
}

// Export a function or object that handles the client creation safely
export const searchWeb = async (query: string) => {
  if (!apiKey) return { results: [] };
  // @ts-ignore
  const client = tavily({ apiKey });
  return await client.search(query, {
    searchDepth: "basic",
    maxResults: 5,
  });
};

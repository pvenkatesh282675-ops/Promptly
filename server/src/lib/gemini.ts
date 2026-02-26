import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is missing");
}

const genAI = new GoogleGenerativeAI(apiKey || "placeholder");

// Using gemini-2.5-flash - latest and most capable
export const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

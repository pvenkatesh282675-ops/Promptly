import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY is missing");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    // There isn't a direct listModels on genAI instance in some versions,
    // but we can try to use the modelManager if available or just test a known model.
    // Actually, for v1beta, listModels is not directly exposed on the client in this way easily
    // without using the rest API or looking at docs.
    // But let's try a simple generation to test 'gemini-1.5-flash' specifically.

    console.log("Testing gemini-1.5-flash...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello");
    console.log("Success with gemini-1.5-flash:", result.response.text());
  } catch (error: any) {
    console.error("Error with gemini-1.5-flash:", error.message);

    try {
      console.log("Testing gemini-pro...");
      const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
      const resultPro = await modelPro.generateContent("Hello");
      console.log("Success with gemini-pro:", resultPro.response.text());
    } catch (e: any) {
      console.error("Error with gemini-pro:", e.message);
    }
  }
}

listModels();

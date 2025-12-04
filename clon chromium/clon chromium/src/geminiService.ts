import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || "";
const modelId = process.env.GEMINI_MODEL || "gemini-1.5-flash";

if (!apiKey) throw new Error("Missing GEMINI_API_KEY in .env");

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: modelId });

export async function generateWithGemini(messages: any[]): Promise<string> {
  // Gộp messages thành 1 prompt text
  const prompt = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");

  const result = await model.generateContent(prompt);
  return result.response.text();
}

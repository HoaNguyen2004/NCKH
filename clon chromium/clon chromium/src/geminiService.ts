import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || "";
const modelId = process.env.GEMINI_MODEL || "gemini-1.5-flash";

// Không bắt buộc phải có Gemini API key (chỉ dùng để lọc thêm)

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: modelId });

export async function generateWithGemini(messages: any[]): Promise<string> {
  // Kiểm tra API key
  if (!apiKey) {
    console.warn("⚠️ GEMINI_API_KEY không được cấu hình, bỏ qua lọc Gemini");
    return JSON.stringify({ matchedIndices: [] });
  }

  // Gộp messages thành 1 prompt text
  const prompt = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error("Gemini API error:", err);
    return JSON.stringify({ matchedIndices: [] });
  }
}

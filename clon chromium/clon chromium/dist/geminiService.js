"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWithGemini = generateWithGemini;
const genai_1 = require("@google/genai");
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error('GEMINI_API_KEY missing in environment (.env)');
}
// Sử dụng Gemini Developer API (không phải Vertex AI)
const ai = new genai_1.GoogleGenAI({
    apiKey,
    // apiVersion: 'v1', // có thể set nếu cần version cụ thể
});
/**
 * Ghép messages thành 1 prompt dài và gọi Gemini.
 * Trả về text (string) đã merge.
 */
async function generateWithGemini(messages) {
    if (!messages || !messages.length) {
        throw new Error('messages array is empty');
    }
    // Ghép toàn bộ messages thành 1 đoạn text
    const prompt = messages
        .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
        .join('\n');
    const modelId = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    // Gọi API theo SDK @google/genai
    const response = await ai.models.generateContent({
        model: modelId,
        contents: [
            {
                role: 'user',
                parts: [{ text: prompt }]
            }
        ]
    });
    // SDK có sẵn helper `.text` để gom toàn bộ phần text lại
    const text = response.text ?? '';
    if (!text) {
        // fallback: log raw response, stringify cho dễ debug
        return JSON.stringify(response, null, 2);
    }
    return text;
}

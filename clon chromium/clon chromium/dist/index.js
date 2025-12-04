"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const puppeteerService_1 = require("./puppeteerService");
const geminiService_1 = require("./geminiService");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
const PORT = process.env.PORT || 3000;
// Test route
app.get('/', (_req, res) => {
    res.send('Demo Node.js + TypeScript + Puppeteer + Gemini');
});
/**
 * POST /chat
 * body: { messages: { role: string; content: string }[] }
 * -> Gửi thẳng messages vào Gemini, trả lại reply.text
 */
app.post('/chat', async (req, res) => {
    const messages = req.body.messages;
    if (!messages || !Array.isArray(messages)) {
        return res
            .status(400)
            .json({ ok: false, error: 'messages (array) is required in body' });
    }
    try {
        const reply = await (0, geminiService_1.generateWithGemini)(messages);
        res.json({ ok: true, reply });
    }
    catch (err) {
        console.error('Error in /chat:', err);
        res
            .status(500)
            .json({ ok: false, error: err?.message || String(err) });
    }
});
/**
 * POST /scrape-and-chat
 * body: { url: string }
 * -> Puppeteer cào tiêu đề từ URL
 * -> Gửi danh sách titles sang Gemini để phân tích
 */
app.post('/scrape-and-chat', async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res
            .status(400)
            .json({ ok: false, error: 'url is required in body' });
    }
    try {
        // 1. Cào dữ liệu với Puppeteer
        const titles = await (0, puppeteerService_1.fetchMarketplaceTitles)(url);
        // 2. Chuẩn bị messages cho Gemini
        const messages = [
            {
                role: 'system',
                content: 'Bạn là một trợ lý phân tích dữ liệu marketplace. Hãy phân tích danh sách tiêu đề và đưa ra insight, xu hướng, gợi ý tối ưu.'
            },
            {
                role: 'user',
                content: 'Đây là danh sách tiêu đề tôi đã cào được:\n\n' +
                    titles.map((t, i) => `${i + 1}. ${t}`).join('\n')
            }
        ];
        // 3. Gọi Gemini
        const reply = await (0, geminiService_1.generateWithGemini)(messages);
        res.json({
            ok: true,
            url,
            titles,
            reply
        });
    }
    catch (err) {
        console.error('Error in /scrape-and-chat:', err);
        res
            .status(500)
            .json({ ok: false, error: err?.message || String(err) });
    }
});
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { initLoginAndSaveCookies, scrapeWithSearch, scrapeFeedByKeywords, MarketplaceItem } from "./puppeteerService";
import { saveJsonFile } from "./fileService";
import { generateWithGemini } from "./geminiService";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

const PORT_BASE = 3001; // Bắt buộc dùng port 3001 để tránh xung đột với frontend (port 3000)

app.post("/api/init-login", async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.json({ ok: false, error: "Thiếu email" });
  try {
    await initLoginAndSaveCookies(email);
    return res.json({ ok: true, message: "OK. Hãy đăng nhập Chrome trong 60s." });
  } catch (e: any) {
    return res.json({ ok: false, error: e.message });
  }
});

app.post("/api/scrape-filter", async (req: Request, res: Response) => {
  const { email, url, keywordsText } = req.body;

  if (!email || !url || !keywordsText) {
    return res.json({ ok: false, error: "Thiếu thông tin." });
  }

  try {
    const keywords = keywordsText.split(/\r?\n|,/).map((x:any) => x.trim()).filter((x:any) => x);
    if (!keywords.length) return res.json({ ok: false, error: "Nhập ít nhất 1 từ khóa" });

    // 1. CÀO DỮ LIỆU (Đã update logic URL Search)
    let items: MarketplaceItem[];
    try {
      items = await scrapeWithSearch(email, url, keywords);
    } catch (err: any) {
       if (err.message === "NO_COOKIE") return res.json({ ok: false, error: "Chưa có cookie login!" });
       throw err;
    }

    // 2. LỌC GEMINI (Tùy chọn, giúp lọc bài spam)
    let matched = items;
    // Chỉ gửi tối đa 40 bài để check nhanh
    const itemsToCheck = items.slice(0, 40); 
    
    if (itemsToCheck.length > 0) {
        // Prompt đặc biệt cho Group Post (thường text dài hơn)
        const messages = [
            {
                role: "system",
                content: 'Bạn là bộ lọc bài viết. Hãy trả về JSON {"matchedIndices": [0, 1, ...]} chứa index của các bài viết thực sự mua bán/trao đổi liên quan đến từ khóa. Bỏ qua bài quảng cáo xổ số, spam, livestream không liên quan.',
            },
            {
                role: "user",
                content: `TỪ KHÓA: ${keywords.join(", ")}\n\nDANH SÁCH:\n` + 
                         itemsToCheck.map((it, i) => `[${i}] ${it.fullText.substring(0, 150)}...`).join("\n")
            }
        ];

        try {
            const reply = await generateWithGemini(messages);
            const clean = reply.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(clean);
            if (Array.isArray(parsed.matchedIndices)) {
                matched = parsed.matchedIndices.map((idx: number) => itemsToCheck[idx]).filter((x:any)=>x);
            }
        } catch (e) {
            console.log("Gemini error, skip filter.");
        }
    }

    const fileName = `group_data_${Date.now()}.json`;
    await saveJsonFile(fileName, { keywords, url, total: items.length, matched });

    return res.json({
      ok: true,
      file: fileName,
      matched,
      count: matched.length,
      totalItems: items.length
    });

  } catch (e: any) {
    console.error(e);
    return res.json({ ok: false, error: e.message });
  }
});

// API MỚI: Cào Feed (Group hoặc Newsfeed) theo từ khóa
app.post("/api/scrape-feed", async (req: Request, res: Response) => {
  const { email, feedUrl, keywordsText, scrollCount } = req.body;

  if (!email || !feedUrl || !keywordsText) {
    return res.json({ ok: false, error: "Thiếu thông tin." });
  }

  try {
    const keywords = keywordsText.split(/\r?\n|,/).map((x: any) => x.trim()).filter((x: any) => x);
    if (!keywords.length) return res.json({ ok: false, error: "Nhập ít nhất 1 từ khóa" });

    // Cào Feed và lọc theo từ khóa
    let items: MarketplaceItem[];
    try {
      items = await scrapeFeedByKeywords(
        email, 
        feedUrl, 
        keywords, 
        scrollCount || 10
      );
    } catch (err: any) {
      if (err.message === "NO_COOKIE") return res.json({ ok: false, error: "Chưa có cookie login!" });
      if (err.message === "COOKIE_INVALID") return res.json({ ok: false, error: "Cookie hết hạn, cần login lại!" });
      console.error(err);
      return res.json({ ok: false, error: "Lỗi Scraper: " + err.message });
    }

    // Lọc Gemini (tùy chọn - có thể bỏ qua nếu đã lọc keyword)
    let matched = items;
    
    // Nếu muốn Gemini lọc thêm, uncomment đoạn dưới:
    /*
    const itemsToCheck = items.slice(0, 40);
    if (itemsToCheck.length > 0) {
      const messages = [
        {
          role: "system",
          content: 'Bạn là bộ lọc bài viết. Hãy trả về JSON {"matchedIndices": [0, 1, ...]} chứa index của các bài viết thực sự mua bán/trao đổi liên quan đến từ khóa.',
        },
        {
          role: "user",
          content: `TỪ KHÓA: ${keywords.join(", ")}\n\nDANH SÁCH:\n` +
            itemsToCheck.map((it, i) => `[${i}] ${it.fullText.substring(0, 150)}...`).join("\n")
        }
      ];

      try {
        const reply = await generateWithGemini(messages);
        const clean = reply.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(clean);
        if (Array.isArray(parsed.matchedIndices)) {
          matched = parsed.matchedIndices.map((idx: number) => itemsToCheck[idx]).filter((x: any) => x);
        }
      } catch (e) {
        console.log("Gemini error, skip filter.");
      }
    }
    */

    const fileName = `feed_data_${Date.now()}.json`;
    await saveJsonFile(fileName, { keywords, feedUrl, total: items.length, matched });

    return res.json({
      ok: true,
      file: fileName,
      matched,
      count: matched.length,
      totalScraped: items.length
    });

  } catch (e: any) {
    console.error(e);
    return res.json({ ok: false, error: e.message });
  }
});

function startServer(port: number) {
  app.listen(port, () => console.log(`Running at http://localhost:${port}`))
     .on("error", (e: any) => e.code === "EADDRINUSE" ? startServer(port + 1) : process.exit(1));
}
startServer(PORT_BASE);
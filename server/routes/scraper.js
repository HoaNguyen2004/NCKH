/**
 * Scraper Routes
 * API endpoints cho việc thu thập dữ liệu từ Facebook
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Import scraper service
const { 
  initLoginAndSaveCookies, 
  scrapeWithSearch, 
  scrapeFeedByKeywords,
  getCookiePath 
} = require('../services/scraperService');

// Data directory để lưu kết quả
const DATA_DIR = path.join(__dirname, '..', 'scraper-data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Health check
router.get('/health', (req, res) => {
  res.json({ ok: true, status: 'online', timestamp: new Date().toISOString() });
});

// Đăng nhập Facebook và lưu cookie
router.post('/init-login', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.json({ ok: false, error: 'Thiếu email' });
  }
  
  try {
    await initLoginAndSaveCookies(email);
    return res.json({ ok: true, message: 'OK. Đã lưu cookie thành công!' });
  } catch (e) {
    console.error('Login error:', e);
    return res.json({ ok: false, error: e.message });
  }
});

// Kiểm tra cookie đã tồn tại chưa
router.post('/check-cookie', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.json({ ok: false, error: 'Thiếu email' });
  }
  
  try {
    const cookiePath = getCookiePath(email);
    const exists = fs.existsSync(cookiePath);
    return res.json({ ok: true, hasCookie: exists });
  } catch (e) {
    return res.json({ ok: false, error: e.message });
  }
});

// Quét theo Search Mode
router.post('/scrape-filter', async (req, res) => {
  const { email, url, keywordsText } = req.body;

  if (!email || !url || !keywordsText) {
    return res.json({ ok: false, error: 'Thiếu thông tin.' });
  }

  try {
    const keywords = keywordsText.split(/\r?\n|,/).map(x => x.trim()).filter(x => x);
    if (!keywords.length) {
      return res.json({ ok: false, error: 'Nhập ít nhất 1 từ khóa' });
    }

    let items;
    try {
      items = await scrapeWithSearch(email, url, keywords);
    } catch (err) {
      if (err.message === 'NO_COOKIE') {
        return res.json({ ok: false, error: 'Chưa có cookie login!' });
      }
      if (err.message === 'COOKIE_INVALID') {
        return res.json({ ok: false, error: 'Cookie hết hạn, cần login lại!' });
      }
      throw err;
    }

    // Lưu kết quả
    const fileName = `search_data_${Date.now()}.json`;
    const filePath = path.join(DATA_DIR, fileName);
    fs.writeFileSync(filePath, JSON.stringify({ keywords, url, total: items.length, matched: items }, null, 2));

    return res.json({
      ok: true,
      file: fileName,
      matched: items,
      count: items.length,
      totalItems: items.length
    });

  } catch (e) {
    console.error('Scrape error:', e);
    return res.json({ ok: false, error: e.message });
  }
});

// Quét theo Feed Mode
router.post('/scrape-feed', async (req, res) => {
  const { email, feedUrl, keywordsText, scrollCount } = req.body;

  if (!email || !feedUrl || !keywordsText) {
    return res.json({ ok: false, error: 'Thiếu thông tin.' });
  }

  try {
    const keywords = keywordsText.split(/\r?\n|,/).map(x => x.trim()).filter(x => x);
    if (!keywords.length) {
      return res.json({ ok: false, error: 'Nhập ít nhất 1 từ khóa' });
    }

    let items;
    try {
      items = await scrapeFeedByKeywords(
        email, 
        feedUrl, 
        keywords, 
        scrollCount || 10
      );
    } catch (err) {
      if (err.message === 'NO_COOKIE') {
        return res.json({ ok: false, error: 'Chưa có cookie login!' });
      }
      if (err.message === 'COOKIE_INVALID') {
        return res.json({ ok: false, error: 'Cookie hết hạn, cần login lại!' });
      }
      console.error(err);
      return res.json({ ok: false, error: 'Lỗi Scraper: ' + err.message });
    }

    // Lưu kết quả
    const fileName = `feed_data_${Date.now()}.json`;
    const filePath = path.join(DATA_DIR, fileName);
    fs.writeFileSync(filePath, JSON.stringify({ keywords, feedUrl, total: items.length, matched: items }, null, 2));

    return res.json({
      ok: true,
      file: fileName,
      matched: items,
      count: items.length,
      totalScraped: items.length
    });

  } catch (e) {
    console.error('Feed scrape error:', e);
    return res.json({ ok: false, error: e.message });
  }
});

module.exports = router;


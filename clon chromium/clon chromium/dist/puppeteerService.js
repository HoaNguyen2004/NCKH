"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchMarketplaceTitles = fetchMarketplaceTitles;
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
/**
 * Cào danh sách tiêu đề marketplace / bài post từ 1 URL
 * Trả về mảng string (tối đa 50 phần tử)
 */
async function fetchMarketplaceTitles(url) {
    const browser = await puppeteer_extra_1.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    try {
        const page = await browser.newPage();
        await page.setUserAgent(
        // UA chuẩn Chrome 120 trên Windows
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
            'AppleWebKit/537.36 (KHTML, like Gecko) ' +
            'Chrome/120.0.0.0 Safari/537.36');
        page.setDefaultNavigationTimeout(60000);
        await page.goto(url, { waitUntil: 'networkidle2' });
        // Chờ thêm cho chắc chắn: lazy-load, script chậm,...
        await page.waitForTimeout(3000);
        // Tùy cấu trúc site, selector này có thể cần chỉnh
        const titles = await page.$$eval('div[role="article"] h2, [data-testid="marketplace_listing_title"]', (els) => els
            .map((e) => (e.textContent || '').trim())
            .filter(Boolean));
        // Trả tối đa 50 item
        return titles.slice(0, 50);
    }
    catch (err) {
        console.error('Error in fetchMarketplaceTitles:', err);
        throw err;
    }
    finally {
        await browser.close();
    }
}

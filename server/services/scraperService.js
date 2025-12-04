/**
 * Facebook Scraper Service
 * Sử dụng Puppeteer với Network Interception để thu thập dữ liệu từ Facebook
 */

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');
const md5 = require('md5');

puppeteer.use(StealthPlugin());

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function emailToHash(email) {
  return md5(email.trim().toLowerCase());
}

/**
 * CODE TIÊM VÀO TRANG - Network Spy theo kiểu codemau
 * Hook cả fetch và XHR để bắt tất cả network requests
 */
const NETWORK_SPY_CODE = `
(function() {
  window._capturedPackets = [];
  window._capturedCount = 0;
  
  // Hàm kiểm tra JSON có chứa dữ liệu bài viết không
  function isRelevantData(str) {
    const patterns = [
      'CometFeedUnit',
      'GroupFeed', 
      'FeedUnit',
      'MarketplaceFeed',
      'marketplace_search',
      'NewsFeed',
      'HomepageFeed',
      'FBFeed',
      'CometHomeRoot',
      'CometNewsFeed',
      'FeedStory',
      'comet_sections',
      'attached_story',
      'feedback_context'
    ];
    
    for (const p of patterns) {
      if (str.includes(p)) return true;
    }
    
    if ((str.includes('story') || str.includes('post')) && 
        (str.includes('message') || str.includes('text')) &&
        (str.includes('wwwURL') || str.includes('actors') || str.includes('creation_time'))) {
      return true;
    }
    
    return false;
  }
  
  // ========== HOOK FETCH ==========
  const originalFetch = window.fetch;
  window.fetch = async function(input, init) {
    const response = await originalFetch(input, init);
    
    try {
      const url = typeof input === 'string' ? input : input.url;
      if (url.includes('graphql') || url.includes('api/graphql')) {
        const clone = response.clone();
        const text = await clone.text();
        
        const lines = text.split('\\n');
        lines.forEach(line => {
          if (line.trim().startsWith('{')) {
            try {
              const json = JSON.parse(line);
              const str = JSON.stringify(json);
              if (isRelevantData(str)) {
                window._capturedPackets.push(json);
                window._capturedCount++;
              }
            } catch(e) {}
          }
        });
      }
    } catch(e) {}
    
    return response;
  };
  
  // ========== HOOK XHR ==========
  const originalXHROpen = XMLHttpRequest.prototype.open;
  const originalXHRSend = XMLHttpRequest.prototype.send;
  
  XMLHttpRequest.prototype.open = function(method, url) {
    this._url = url;
    return originalXHROpen.apply(this, arguments);
  };
  
  XMLHttpRequest.prototype.send = function() {
    this.addEventListener('load', function() {
      try {
        if (this._url && (this._url.includes('graphql') || this._url.includes('api/graphql'))) {
          if (this.responseText) {
            const lines = this.responseText.split('\\n');
            lines.forEach(line => {
              if (line.trim().startsWith('{')) {
                try {
                  const json = JSON.parse(line);
                  const str = JSON.stringify(json);
                  if (isRelevantData(str)) {
                    window._capturedPackets.push(json);
                    window._capturedCount++;
                  }
                } catch(e) {}
              }
            });
          }
        }
      } catch(e) {}
    });
    return originalXHRSend.apply(this, arguments);
  };
  
  console.log('[NetworkSpy] Đã kích hoạt bắt gói tin!');
})();
`;

/**
 * HÀM TÌM ẢNH ĐỆ QUY
 */
function findImageUrl(obj, depth = 0) {
  if (!obj || typeof obj !== 'object' || depth > 15) return "";
  
  const imageKeys = ['uri', 'url', 'src'];
  const containerKeys = ['image', 'photo', 'media', 'thumbnail', 'preview_image', 'attached_photo'];
  
  for (const key of imageKeys) {
    if (typeof obj[key] === 'string' && obj[key].includes('fbcdn')) {
      return obj[key];
    }
  }
  
  for (const key of containerKeys) {
    if (obj[key]) {
      const found = findImageUrl(obj[key], depth + 1);
      if (found) return found;
    }
  }
  
  if (obj.attachments && Array.isArray(obj.attachments)) {
    for (const att of obj.attachments) {
      const found = findImageUrl(att, depth + 1);
      if (found) return found;
    }
  }
  
  if (obj.all_subattachments?.nodes && Array.isArray(obj.all_subattachments.nodes)) {
    for (const node of obj.all_subattachments.nodes) {
      const found = findImageUrl(node, depth + 1);
      if (found) return found;
    }
  }
  
  if (obj.styles?.attachment) {
    const found = findImageUrl(obj.styles.attachment, depth + 1);
    if (found) return found;
  }
  
  return "";
}

/**
 * Phân tích JSON thô từ Facebook thành dữ liệu sạch
 */
function parseFacebookJson(jsonBody, keyword) {
  const results = [];
  const seenUrls = new Set();

  function traverse(obj, depth = 0) {
    if (!obj || typeof obj !== 'object' || depth > 50) return;

    if (obj?.comet_sections?.content?.story) {
      extractFromCometSections(obj);
    }

    if (obj?.story?.message?.text && obj?.story?.wwwURL) {
      extractFromStory(obj.story);
    }

    if (obj?.__typename === 'Story' && obj?.message?.text) {
      extractFromStoryNode(obj);
    }

    if (obj?.node?.__typename === 'Story') {
      extractFromStoryNode(obj.node);
    }

    if (obj?.edges && Array.isArray(obj.edges)) {
      obj.edges.forEach((edge) => {
        if (edge?.node) traverse(edge.node, depth + 1);
      });
    }

    if (obj?.feedback_context?.story) {
      extractFromStoryNode(obj.feedback_context.story);
    }

    if (obj?.attached_story?.message?.text) {
      extractFromStoryNode(obj.attached_story);
    }

    if (obj?.comet_feed_ufi_container?.feedback?.story) {
      extractFromStoryNode(obj.comet_feed_ufi_container.feedback.story);
    }

    if (obj?.units && Array.isArray(obj.units)) {
      obj.units.forEach((unit) => traverse(unit, depth + 1));
    }

    if (obj?.data?.node?.__typename === 'Story') {
      extractFromStoryNode(obj.data.node);
    }

    if (Array.isArray(obj)) {
      obj.forEach(item => traverse(item, depth + 1));
    } else {
      Object.values(obj).forEach(val => traverse(val, depth + 1));
    }
  }

  function extractFromCometSections(obj) {
    try {
      const story = obj.comet_sections.content.story;
      const contextLayout = obj.comet_sections.context_layout?.story;
      const footer = obj.comet_sections.footer?.story;

      let text = "";
      if (story?.message?.text) {
        text = story.message.text;
      } else if (story?.comet_sections?.message?.story?.message?.text) {
        text = story.comet_sections.message.story.message.text;
      }

      if (!text || text.length < 5) return;

      let author = "Unknown";
      let uid = "";
      try {
        const actors = contextLayout?.comet_sections?.actor_photo?.story?.actors || 
                       story?.actors || [];
        if (actors.length > 0) {
          author = actors[0]?.name || "Unknown";
          uid = actors[0]?.id || "";
        }
      } catch (e) {}

      let image = "";
      try {
        image = findImageUrl(story);
        if (!image) {
          image = findImageUrl(obj);
        }
      } catch (e) {}

      let url = "";
      try {
        url = story?.wwwURL || 
              story?.url ||
              contextLayout?.comet_sections?.metadata?.[0]?.story?.url ||
              footer?.url ||
              "";
              
        if (!url && story?.post_id) {
          url = `https://www.facebook.com/${story.post_id}`;
        }
        if (!url && story?.id) {
          url = `https://www.facebook.com/story.php?id=${story.id}`;
        }
      } catch (e) {}

      let timestamp = "";
      try {
        const creationTime = story?.creation_time || contextLayout?.creation_time;
        if (creationTime) {
          timestamp = new Date(creationTime * 1000).toISOString();
        }
      } catch (e) {}

      const priceRegex = /[\d\.\,]+\s*(tr|triệu|k|đ|vnđ|usd|\$)/gi;
      const priceMatch = text.match(priceRegex);
      const price = priceMatch ? priceMatch[0] : "";

      if (url && !seenUrls.has(url)) {
        seenUrls.add(url);
        results.push({
          title: text.substring(0, 80) + (text.length > 80 ? "..." : ""),
          fullText: text,
          price: price,
          location: "Group/Feed",
          url: url,
          image: image,
          author: author,
          uid: uid,
          keyword: keyword,
          type: 'group_post',
          timestamp: timestamp
        });
      }
    } catch (e) {}
  }

  function extractFromStory(story) {
    try {
      const text = story?.message?.text || "";
      if (!text || text.length < 5) return;

      const url = story?.wwwURL || story?.url || "";
      if (!url || seenUrls.has(url)) return;

      let author = "Unknown";
      let uid = "";
      try {
        const actors = story?.actors || [];
        if (actors.length > 0) {
          author = actors[0]?.name || "Unknown";
          uid = actors[0]?.id || "";
        }
      } catch (e) {}

      let image = findImageUrl(story);

      const priceRegex = /[\d\.\,]+\s*(tr|triệu|k|đ|vnđ|usd|\$)/gi;
      const priceMatch = text.match(priceRegex);
      const price = priceMatch ? priceMatch[0] : "";

      seenUrls.add(url);
      results.push({
        title: text.substring(0, 80) + (text.length > 80 ? "..." : ""),
        fullText: text,
        price: price,
        location: "Group/Feed",
        url: url,
        image: image,
        author: author,
        uid: uid,
        keyword: keyword,
        type: 'group_post'
      });
    } catch (e) {}
  }

  function extractFromStoryNode(node) {
    try {
      const text = node?.message?.text || 
                   node?.comet_sections?.content?.story?.message?.text || 
                   node?.attached_story?.message?.text ||
                   "";
      if (!text || text.length < 5) return;

      let url = node?.wwwURL || 
                node?.url || 
                node?.permalink_url ||
                node?.share_url ||
                "";
      
      if (!url) {
        const postId = node?.post_id || node?.id || node?.legacy_story_hydrated_id;
        if (postId) {
          url = `https://www.facebook.com/${postId}`;
        }
      }
      
      if (!url || seenUrls.has(url)) return;

      let author = "Unknown";
      let uid = "";
      try {
        const actors = node?.actors || 
                       node?.comet_sections?.context_layout?.story?.comet_sections?.actor_photo?.story?.actors ||
                       [];
        if (actors.length > 0) {
          author = actors[0]?.name || "Unknown";
          uid = actors[0]?.id || "";
        }
        if (author === "Unknown" && node?.owner) {
          author = node.owner.name || "Unknown";
          uid = node.owner.id || "";
        }
      } catch (e) {}

      let image = findImageUrl(node);

      const priceRegex = /[\d\.\,]+\s*(tr|triệu|k|đ|vnđ|usd|\$)/gi;
      const priceMatch = text.match(priceRegex);
      const price = priceMatch ? priceMatch[0] : "";

      let timestamp = "";
      try {
        const creationTime = node?.creation_time || node?.created_time;
        if (creationTime) {
          timestamp = new Date(creationTime * 1000).toISOString();
        }
      } catch (e) {}

      seenUrls.add(url);
      results.push({
        title: text.substring(0, 80) + (text.length > 80 ? "..." : ""),
        fullText: text,
        price: price,
        location: "Newsfeed",
        url: url,
        image: image,
        author: author,
        uid: uid,
        keyword: keyword,
        type: 'newsfeed',
        timestamp: timestamp
      });
    } catch (e) {}
  }

  traverse(jsonBody);
  return results;
}

const COOKIE_DIR = path.join(__dirname, "..", "cookies");

function getCookiePath(email) {
  const hash = emailToHash(email);
  if (!fs.existsSync(COOKIE_DIR)) {
    fs.mkdirSync(COOKIE_DIR, { recursive: true });
  }
  return path.join(COOKIE_DIR, `fb_${hash}.json`);
}

/**
 * BƯỚC 1: Login & Save Cookie
 */
async function initLoginAndSaveCookies(email) {
  const cookiePath = getCookiePath(email);
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--start-maximized", "--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
  
  console.log("🔵 Mở trang login...");
  await page.goto("https://www.facebook.com/login", { waitUntil: "networkidle2" });
  console.log("👉 Hãy login trong 30s...");
  await delay(30000);
  
  const cookies = await page.cookies();
  fs.writeFileSync(cookiePath, JSON.stringify(cookies, null, 2), "utf-8");
  console.log(`🍪 Đã lưu cookie: ${cookiePath}`);
  await browser.close();
}

/**
 * BƯỚC 2: Cào dữ liệu (URL Search Mode)
 */
async function scrapeWithSearch(email, baseUrl, keywords) {
  const cookiePath = getCookiePath(email);
  if (!fs.existsSync(cookiePath)) throw new Error("NO_COOKIE");

  const cleanBaseUrl = baseUrl.replace(/\/$/, "");
  const isGroup = cleanBaseUrl.includes("/groups/");
  const isMarketplace = cleanBaseUrl.includes("/marketplace");

  console.log(`ℹ️ Chế độ: ${isGroup ? "GROUP SEARCH" : isMarketplace ? "MARKETPLACE SEARCH" : "SEARCH"}`);

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      "--start-maximized", 
      "--no-sandbox", 
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled"
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

  const cookies = JSON.parse(fs.readFileSync(cookiePath, "utf-8"));
  await page.setCookie(...cookies);

  await page.evaluateOnNewDocument(NETWORK_SPY_CODE);

  let allItems = [];

  for (const kw of keywords) {
    console.log(`\n🔎 Đang xử lý từ khóa: "${kw}" ...`);

    try {
      let searchUrl;
      
      if (isGroup) {
        searchUrl = `${cleanBaseUrl}/search/?q=${encodeURIComponent(kw)}`;
      } else if (isMarketplace) {
        searchUrl = `https://www.facebook.com/marketplace/search/?query=${encodeURIComponent(kw)}`;
      } else {
        searchUrl = `${cleanBaseUrl}/search/?q=${encodeURIComponent(kw)}`;
      }

      console.log(`   📍 URL: ${searchUrl}`);
      
      await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 60000 });
      
      if (page.url().includes("login")) throw new Error("COOKIE_INVALID");

      await page.evaluate(() => {
        window._capturedPackets = [];
        window._capturedCount = 0;
      });

      await delay(3000);

      console.log("   ⏳ Đang cuộn trang để load kết quả...");
      const scrollTimes = isMarketplace ? 5 : 4;
      
      for (let i = 0; i < scrollTimes; i++) {
        await page.evaluate(() => window.scrollBy({ top: 1200, behavior: 'smooth' }));
        console.log(`   ⬇️ Scroll lần ${i + 1}/${scrollTimes}...`);
        await delay(2000);

        const result = await page.evaluate(() => {
          const data = window._capturedPackets || [];
          const count = window._capturedCount || 0;
          window._capturedPackets = [];
          return { packets: data, totalCount: count };
        });

        if (result.packets && result.packets.length > 0) {
          console.log(`   📦 Bắt được ${result.packets.length} gói tin JSON`);
          result.packets.forEach((pkg) => {
            const parsedItems = parseFacebookJson(pkg, kw);
            allItems.push(...parsedItems);
          });
        }
      }

      const finalResult = await page.evaluate(() => {
        const data = window._capturedPackets || [];
        return data;
      });
      
      if (finalResult.length > 0) {
        finalResult.forEach((pkg) => {
          const parsedItems = parseFacebookJson(pkg, kw);
          allItems.push(...parsedItems);
        });
      }

      if (allItems.length === 0 && isMarketplace) {
        console.log("   ⚠️ Network không bắt được, thử DOM selector...");
        const mpItems = await page.$$eval('a[href*="/marketplace/item"]', (els, currentKw) => 
          els.map((el) => {
            const anchor = el;
            const img = anchor.querySelector("img");
            const text = anchor.innerText || "";
            const lines = text.split("\n");
            return {
              title: lines[1] || lines[0] || "",
              price: lines[0] || "",
              location: lines[2] || "",
              fullText: text,
              url: anchor.href,
              image: img ? img.src : "",
              keyword: currentKw,
              type: 'marketplace'
            };
          }), kw
        );
        console.log(`   ✅ DOM Fallback: Tìm thấy ${mpItems.length} sản phẩm`);
        allItems.push(...mpItems);
      }

      console.log(`   ✅ Tổng cộng: ${allItems.length} bài cho "${kw}"`);

    } catch (err) {
      console.error(`   ❌ Lỗi xử lý từ khóa "${kw}":`, err);
    }
  }

  // Deduplicate
  const map = new Map();
  allItems.forEach((it) => {
    const cleanUrl = it.url.split('?')[0]; 
    if (cleanUrl) {
      it.url = cleanUrl;
      map.set(cleanUrl, it);
    }
  });

  const uniqueItems = Array.from(map.values());
  console.log(`\n🏁 TỔNG KẾT: Cào được ${uniqueItems.length} bài duy nhất.`);

  await browser.close();
  return uniqueItems;
}

/**
 * Cào Feed (Group Feed hoặc Newsfeed) và lọc theo từ khóa
 */
async function scrapeFeedByKeywords(email, feedUrl, keywords, scrollCount = 10) {
  const cookiePath = getCookiePath(email);
  if (!fs.existsSync(cookiePath)) throw new Error("NO_COOKIE");

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      "--start-maximized", 
      "--no-sandbox", 
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled"
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );

  const cookies = JSON.parse(fs.readFileSync(cookiePath, "utf-8"));
  await page.setCookie(...cookies);

  await page.evaluateOnNewDocument(NETWORK_SPY_CODE);

  let allItems = [];
  
  const normalizedUrl = feedUrl.split('?')[0].replace(/\/$/, '');
  const isNewsfeed = normalizedUrl === "https://www.facebook.com" || 
                     feedUrl.includes("?ref=homescreenpwa") ||
                     feedUrl.includes("/home.php");
  const isGroup = feedUrl.includes("/groups/");

  console.log(`\n🌐 Đang vào ${isNewsfeed ? "Newsfeed Trang Chủ" : isGroup ? "Group Feed" : "Feed"}: ${feedUrl}`);
  
  try {
    await page.goto(feedUrl, { waitUntil: "networkidle2", timeout: 60000 });
    
    if (page.url().includes("login")) throw new Error("COOKIE_INVALID");

    await delay(3000);

    console.log(`⏳ Đang cuộn trang ${scrollCount} lần để load bài viết...`);
    console.log(`📋 Từ khóa cần lọc: ${keywords.join(", ")}`);
    
    for (let i = 0; i < scrollCount; i++) {
      await page.evaluate(() => {
        window.scrollBy({ top: 1200, behavior: 'smooth' });
      });
      
      console.log(`   ⬇️ Scroll lần ${i + 1}/${scrollCount}...`);
      await delay(2000);

      const result = await page.evaluate(() => {
        const data = window._capturedPackets || [];
        const count = window._capturedCount || 0;
        window._capturedPackets = [];
        return { packets: data, totalCount: count };
      });

      if (result.packets && result.packets.length > 0) {
        console.log(`   📦 Bắt được ${result.packets.length} gói tin JSON (Tổng: ${result.totalCount})`);
        result.packets.forEach((pkg) => {
          const parsedItems = parseFacebookJson(pkg, "");
          allItems.push(...parsedItems);
        });
      }

      if ((i + 1) % 3 === 0) {
        console.log(`   ⏸️ Đợi thêm để tránh rate limit...`);
        await delay(1500);
      }
    }

    const finalResult = await page.evaluate(() => {
      const data = window._capturedPackets || [];
      return data;
    });
    
    if (finalResult.length > 0) {
      finalResult.forEach((pkg) => {
        const parsedItems = parseFacebookJson(pkg, "");
        allItems.push(...parsedItems);
      });
    }

  } catch (e) {
    console.error(`❌ Lỗi:`, e);
    await browser.close();
    throw e;
  }

  await browser.close();

  console.log(`\n📊 Đã parse được ${allItems.length} bài viết từ JSON`);

  // Lọc theo từ khóa
  const keywordsLower = keywords.map(k => k.toLowerCase().trim()).filter(k => k.length > 0);
  
  const filteredItems = allItems.filter(item => {
    const textLower = item.fullText.toLowerCase();
    const titleLower = item.title.toLowerCase();
    
    for (const kw of keywordsLower) {
      const kwParts = kw.split(/\s+/);
      const allPartsMatch = kwParts.every(part => 
        textLower.includes(part) || titleLower.includes(part)
      );
      
      if (allPartsMatch) {
        item.keyword = kw;
        return true;
      }
    }
    return false;
  });

  // Deduplicate
  const map = new Map();
  filteredItems.forEach((it) => {
    if (it.url) {
      const cleanUrl = it.url.split('?')[0];
      map.set(cleanUrl, it);
    }
  });

  const uniqueItems = Array.from(map.values());
  
  console.log(`\n🏁 TỔNG KẾT:`);
  console.log(`   - Tổng bài parse được: ${allItems.length}`);
  console.log(`   - Bài khớp từ khóa: ${filteredItems.length}`);
  console.log(`   - Bài duy nhất (sau dedupe): ${uniqueItems.length}`);

  return uniqueItems;
}

module.exports = {
  initLoginAndSaveCookies,
  scrapeWithSearch,
  scrapeFeedByKeywords,
  getCookiePath
};


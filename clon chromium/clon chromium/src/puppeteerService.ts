import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "fs";
import path from "path";
import { emailToHash } from "./utils";

puppeteer.use(StealthPlugin());

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface MarketplaceItem {
  title: string;
  price: string;
  location: string;
  fullText: string;
  url: string;
  image: string;
  keyword: string;
  type: 'marketplace' | 'group_post' | 'newsfeed';
  uid?: string;
  author?: string;
  timestamp?: string;
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
    // Pattern cho Newsfeed trang chủ
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
    
    // Kiểm tra pattern
    for (const p of patterns) {
      if (str.includes(p)) return true;
    }
    
    // Kiểm tra có phải là post/story data
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
      // Chỉ bắt các request graphql của Facebook
      if (url.includes('graphql') || url.includes('api/graphql')) {
        const clone = response.clone();
        const text = await clone.text();
        
        // Facebook trả về NDJSON (nhiều dòng JSON)
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
        // Chỉ bắt graphql requests
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
  
  console.log('[NetworkSpy] Đã kích hoạt bắt gói tin! (Enhanced for Homepage)');
})();
`;

/**
 * HÀM TÌM ẢNH ĐỆ QUY - Tìm URL ảnh trong object phức tạp
 */
function findImageUrl(obj: any, depth: number = 0): string {
  if (!obj || typeof obj !== 'object' || depth > 15) return "";
  
  // Các key thường chứa URL ảnh
  const imageKeys = ['uri', 'url', 'src'];
  const containerKeys = ['image', 'photo', 'media', 'thumbnail', 'preview_image', 'attached_photo'];
  
  // Kiểm tra trực tiếp
  for (const key of imageKeys) {
    if (typeof obj[key] === 'string' && obj[key].includes('fbcdn')) {
      return obj[key];
    }
  }
  
  // Kiểm tra trong các container
  for (const key of containerKeys) {
    if (obj[key]) {
      const found = findImageUrl(obj[key], depth + 1);
      if (found) return found;
    }
  }
  
  // Kiểm tra attachments
  if (obj.attachments && Array.isArray(obj.attachments)) {
    for (const att of obj.attachments) {
      const found = findImageUrl(att, depth + 1);
      if (found) return found;
    }
  }
  
  // Kiểm tra all_subattachments
  if (obj.all_subattachments?.nodes && Array.isArray(obj.all_subattachments.nodes)) {
    for (const node of obj.all_subattachments.nodes) {
      const found = findImageUrl(node, depth + 1);
      if (found) return found;
    }
  }
  
  // Kiểm tra styles
  if (obj.styles?.attachment) {
    const found = findImageUrl(obj.styles.attachment, depth + 1);
    if (found) return found;
  }
  
  return "";
}

/**
 * HÀM QUAN TRỌNG: Phân tích JSON thô từ Facebook thành dữ liệu sạch
 * Cải tiến theo cách làm của codemau - duyệt đệ quy sâu hơn
 */
function parseFacebookJson(jsonBody: any, keyword: string): MarketplaceItem[] {
  const results: MarketplaceItem[] = [];
  const seenUrls = new Set<string>();

  // Hàm đệ quy để tìm các node bài viết
  function traverse(obj: any, depth: number = 0) {
    if (!obj || typeof obj !== 'object' || depth > 50) return;

    // Pattern 1: CometFeedUnit với comet_sections
    if (obj?.comet_sections?.content?.story) {
      extractFromCometSections(obj);
    }

    // Pattern 2: Story trực tiếp
    if (obj?.story?.message?.text && obj?.story?.wwwURL) {
      extractFromStory(obj.story);
    }

    // Pattern 3: Node với __typename là Story
    if (obj?.__typename === 'Story' && obj?.message?.text) {
      extractFromStoryNode(obj);
    }

    // Pattern 4: GroupFeed nodes
    if (obj?.node?.__typename === 'Story') {
      extractFromStoryNode(obj.node);
    }

    // Pattern 5: Feed edges
    if (obj?.edges && Array.isArray(obj.edges)) {
      obj.edges.forEach((edge: any) => {
        if (edge?.node) traverse(edge.node, depth + 1);
      });
    }

    // Pattern 6: Homepage Feed (CometNewsFeed, FBFeed)
    if (obj?.feedback_context?.story) {
      extractFromStoryNode(obj.feedback_context.story);
    }

    // Pattern 7: attached_story (Shared posts)
    if (obj?.attached_story?.message?.text) {
      extractFromStoryNode(obj.attached_story);
    }

    // Pattern 8: comet_feed_ufi_container
    if (obj?.comet_feed_ufi_container?.feedback?.story) {
      extractFromStoryNode(obj.comet_feed_ufi_container.feedback.story);
    }

    // Pattern 9: Units trong feed
    if (obj?.units && Array.isArray(obj.units)) {
      obj.units.forEach((unit: any) => traverse(unit, depth + 1));
    }

    // Pattern 10: data -> node (Common homepage pattern)
    if (obj?.data?.node?.__typename === 'Story') {
      extractFromStoryNode(obj.data.node);
    }

    // Tiếp tục đệ quy xuống các node con
    if (Array.isArray(obj)) {
      obj.forEach(item => traverse(item, depth + 1));
    } else {
      Object.values(obj).forEach(val => traverse(val, depth + 1));
    }
  }

  function extractFromCometSections(obj: any) {
    try {
      const story = obj.comet_sections.content.story;
      const contextLayout = obj.comet_sections.context_layout?.story;
      const footer = obj.comet_sections.footer?.story;

      // Lấy nội dung text
      let text = "";
      if (story?.message?.text) {
        text = story.message.text;
      } else if (story?.comet_sections?.message?.story?.message?.text) {
        text = story.comet_sections.message.story.message.text;
      }

      if (!text || text.length < 5) return;

      // Lấy thông tin người đăng
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

        // Lấy ảnh - Sử dụng hàm tìm đệ quy
      let image = "";
      try {
        // Thử tìm trong story trước
        image = findImageUrl(story);
        
        // Nếu không có, thử tìm trong obj gốc
        if (!image) {
          image = findImageUrl(obj);
        }
        
        // Thử các path cụ thể
        if (!image) {
          const attachments = story?.attachments || [];
          for (const att of attachments) {
            // Ảnh đơn
            if (att?.media?.image?.uri) {
              image = att.media.image.uri;
              break;
            }
            // Ảnh trong photo
            if (att?.media?.photo?.image?.uri) {
              image = att.media.photo.image.uri;
              break;
            }
            // Album ảnh
            if (att?.all_subattachments?.nodes?.length > 0) {
              image = att.all_subattachments.nodes[0]?.media?.image?.uri || "";
              break;
            }
            // Style attachment
            if (att?.styles?.attachment?.media?.image?.uri) {
              image = att.styles.attachment.media.image.uri;
              break;
            }
            // Comet sections trong attachment
            if (att?.comet_product_tag_feed_overlay_renderer?.attachment?.media?.image?.uri) {
              image = att.comet_product_tag_feed_overlay_renderer.attachment.media.image.uri;
              break;
            }
          }
        }
      } catch (e) {}

      // Lấy URL bài viết
      let url = "";
      try {
        // Thử nhiều path khác nhau
        url = story?.wwwURL || 
              story?.url ||
              contextLayout?.comet_sections?.metadata?.[0]?.story?.url ||
              footer?.url ||
              "";
              
        // Nếu vẫn không có, tìm trong post_id
        if (!url && story?.post_id) {
          url = `https://www.facebook.com/${story.post_id}`;
        }
        if (!url && story?.id) {
          url = `https://www.facebook.com/story.php?id=${story.id}`;
        }
      } catch (e) {}

      // Lấy timestamp
      let timestamp = "";
      try {
        const creationTime = story?.creation_time || contextLayout?.creation_time;
        if (creationTime) {
          timestamp = new Date(creationTime * 1000).toISOString();
        }
      } catch (e) {}

      // Đoán giá từ text
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
          type: 'group_post' as const,
          timestamp: timestamp
        });
      }
    } catch (e) {}
  }

  function extractFromStory(story: any) {
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

      // Tìm ảnh bằng hàm đệ quy
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
        type: 'group_post' as const
      });
    } catch (e) {}
  }

  function extractFromStoryNode(node: any) {
    try {
      const text = node?.message?.text || 
                   node?.comet_sections?.content?.story?.message?.text || 
                   node?.attached_story?.message?.text ||
                   "";
      if (!text || text.length < 5) return;

      // Cải tiến: Tìm URL từ nhiều nguồn
      let url = node?.wwwURL || 
                node?.url || 
                node?.permalink_url ||
                node?.share_url ||
                "";
      
      // Nếu không có URL, thử tạo từ post_id hoặc story id
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
        // Thử lấy từ owner
        if (author === "Unknown" && node?.owner) {
          author = node.owner.name || "Unknown";
          uid = node.owner.id || "";
        }
      } catch (e) {}

      // Tìm ảnh bằng hàm đệ quy
      let image = findImageUrl(node);

      const priceRegex = /[\d\.\,]+\s*(tr|triệu|k|đ|vnđ|usd|\$)/gi;
      const priceMatch = text.match(priceRegex);
      const price = priceMatch ? priceMatch[0] : "";

      // Lấy timestamp nếu có
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
        type: 'newsfeed' as const,
        timestamp: timestamp
      });
    } catch (e) {}
  }

  traverse(jsonBody);
  return results;
}

const COOKIE_DIR = path.join(__dirname, "..", "cookies");

function getCookiePath(email: string): string {
  const hash = emailToHash(email);
  if (!fs.existsSync(COOKIE_DIR)) {
    fs.mkdirSync(COOKIE_DIR, { recursive: true });
  }
  return path.join(COOKIE_DIR, `fb_${hash}.json`);
}

// BƯỚC 1: Login & Save Cookie (Giữ nguyên)
export async function initLoginAndSaveCookies(email: string): Promise<void> {
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
  await delay(30000); // 30 giây để đăng nhập
  
  const cookies = await page.cookies();
  fs.writeFileSync(cookiePath, JSON.stringify(cookies, null, 2), "utf-8");
  console.log(`🍪 Đã lưu cookie: ${cookiePath}`);
  await browser.close();
}

// BƯỚC 2: Cào dữ liệu (URL Search Mode) - SỬ DỤNG NETWORK INTERCEPTION
export async function scrapeWithSearch(
  email: string,
  baseUrl: string,
  keywords: string[]
): Promise<MarketplaceItem[]> {
  const cookiePath = getCookiePath(email);
  if (!fs.existsSync(cookiePath)) throw new Error("NO_COOKIE");

  // Chuẩn hóa URL (bỏ dấu / ở cuối nếu có)
  const cleanBaseUrl = baseUrl.replace(/\/$/, "");
  const isGroup = cleanBaseUrl.includes("/groups/");
  const isMarketplace = cleanBaseUrl.includes("/marketplace");

  console.log(`ℹ️ Chế độ: ${isGroup ? "GROUP SEARCH" : isMarketplace ? "MARKETPLACE SEARCH" : "SEARCH"} (Network Mode)`);

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

  // TIÊM NETWORK SPY TRƯỚC KHI LOAD TRANG
  await page.evaluateOnNewDocument(NETWORK_SPY_CODE);

  let allItems: MarketplaceItem[] = [];

  // --- LOOP TỪ KHÓA ---
  for (const kw of keywords) {
    console.log(`\n🔎 Đang xử lý từ khóa: "${kw}" ...`);

    try {
      let searchUrl: string;
      
      if (isGroup) {
        // GROUP SEARCH URL
        searchUrl = `${cleanBaseUrl}/search/?q=${encodeURIComponent(kw)}`;
      } else if (isMarketplace) {
        // MARKETPLACE SEARCH URL
        searchUrl = `https://www.facebook.com/marketplace/search/?query=${encodeURIComponent(kw)}`;
      } else {
        // DEFAULT SEARCH
        searchUrl = `${cleanBaseUrl}/search/?q=${encodeURIComponent(kw)}`;
      }

      console.log(`   📍 URL: ${searchUrl}`);
      
      await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 60000 });
      
      if (page.url().includes("login")) throw new Error("COOKIE_INVALID");

      // Reset captured packets cho từ khóa mới
      await page.evaluate(() => {
        (window as any)._capturedPackets = [];
        (window as any)._capturedCount = 0;
      });

      // Đợi trang load xong
      await delay(3000);

      // Scroll để load thêm kết quả
      console.log("   ⏳ Đang cuộn trang để load kết quả...");
      const scrollTimes = isMarketplace ? 5 : 4;
      
      for (let i = 0; i < scrollTimes; i++) {
        await page.evaluate(() => window.scrollBy({ top: 1200, behavior: 'smooth' }));
        console.log(`   ⬇️ Scroll lần ${i + 1}/${scrollTimes}...`);
        await delay(2000);

        // Lấy packets đã bắt được
        const result = await page.evaluate(() => {
          const data = (window as any)._capturedPackets || [];
          const count = (window as any)._capturedCount || 0;
          (window as any)._capturedPackets = []; // Reset
          return { packets: data, totalCount: count };
        });

        if (result.packets && result.packets.length > 0) {
          console.log(`   📦 Bắt được ${result.packets.length} gói tin JSON`);
          result.packets.forEach((pkg: any) => {
            const parsedItems = parseFacebookJson(pkg, kw);
            allItems.push(...parsedItems);
          });
        }
      }

      // Lấy nốt packets còn lại
      const finalResult = await page.evaluate(() => {
        const data = (window as any)._capturedPackets || [];
        return data;
      });
      
      if (finalResult.length > 0) {
        finalResult.forEach((pkg: any) => {
          const parsedItems = parseFacebookJson(pkg, kw);
          allItems.push(...parsedItems);
        });
      }

      // Nếu Network không bắt được, fallback về DOM selector cho Marketplace
      if (allItems.length === 0 && isMarketplace) {
        console.log("   ⚠️ Network không bắt được, thử DOM selector...");
        const mpItems = await page.$$eval('a[href*="/marketplace/item"]', (els, currentKw) => 
          els.map((el) => {
            const anchor = el as HTMLAnchorElement;
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
              type: 'marketplace' as const
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
  const map = new Map<string, MarketplaceItem>();
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
 * HÀM MỚI: Cào Feed (Group Feed hoặc Newsfeed) và lọc theo từ khóa
 * Áp dụng kỹ thuật Network Interception giống codemau
 * 
 * @param email - Email đã login
 * @param feedUrl - URL của Group hoặc "https://www.facebook.com" cho Newsfeed
 * @param keywords - Danh sách từ khóa cần lọc
 * @param scrollCount - Số lần cuộn (mặc định 10)
 */
export async function scrapeFeedByKeywords(
  email: string,
  feedUrl: string,
  keywords: string[],
  scrollCount: number = 10
): Promise<MarketplaceItem[]> {
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
  
  // Set viewport lớn để load nhiều bài hơn
  await page.setViewport({ width: 1920, height: 1080 });
  
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );

  // Nạp cookie
  const cookies = JSON.parse(fs.readFileSync(cookiePath, "utf-8"));
  await page.setCookie(...cookies);

  // TIÊM NETWORK SPY TRƯỚC KHI LOAD TRANG
  await page.evaluateOnNewDocument(NETWORK_SPY_CODE);

  let allItems: MarketplaceItem[] = [];
  
  // Nhận diện URL trang chủ Facebook (bao gồm các biến thể với query params)
  const normalizedUrl = feedUrl.split('?')[0].replace(/\/$/, '');
  const isNewsfeed = normalizedUrl === "https://www.facebook.com" || 
                     feedUrl.includes("?ref=homescreenpwa") ||
                     feedUrl.includes("/home.php");
  const isGroup = feedUrl.includes("/groups/");

  console.log(`\n🌐 Đang vào ${isNewsfeed ? "Newsfeed Trang Chủ" : isGroup ? "Group Feed" : "Feed"}: ${feedUrl}`);
  
  try {
    await page.goto(feedUrl, { waitUntil: "networkidle2", timeout: 60000 });
    
    // Kiểm tra login
    if (page.url().includes("login")) throw new Error("COOKIE_INVALID");

    // Đợi feed load
    await delay(3000);

    console.log(`⏳ Đang cuộn trang ${scrollCount} lần để load bài viết...`);
    console.log(`📋 Từ khóa cần lọc: ${keywords.join(", ")}`);
    
    // Cuộn trang nhiều lần
    for (let i = 0; i < scrollCount; i++) {
      // Cuộn mượt hơn
      await page.evaluate(() => {
        window.scrollBy({ top: 1200, behavior: 'smooth' });
      });
      
      console.log(`   ⬇️ Scroll lần ${i + 1}/${scrollCount}...`);
      await delay(2000);

      // Lấy packets đã bắt được
      const result = await page.evaluate(() => {
        const data = (window as any)._capturedPackets || [];
        const count = (window as any)._capturedCount || 0;
        (window as any)._capturedPackets = []; // Reset
        return { packets: data, totalCount: count };
      });

      if (result.packets && result.packets.length > 0) {
        console.log(`   📦 Bắt được ${result.packets.length} gói tin JSON (Tổng: ${result.totalCount})`);
        result.packets.forEach((pkg: any) => {
          const parsedItems = parseFacebookJson(pkg, "");
          allItems.push(...parsedItems);
        });
      }

      // Mỗi 3 lần scroll, đợi thêm để tránh rate limit
      if ((i + 1) % 3 === 0) {
        console.log(`   ⏸️ Đợi thêm để tránh rate limit...`);
        await delay(1500);
      }
    }

    // Lấy nốt packets còn lại
    const finalResult = await page.evaluate(() => {
      const data = (window as any)._capturedPackets || [];
      return data;
    });
    
    if (finalResult.length > 0) {
      finalResult.forEach((pkg: any) => {
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

  // ========================================
  // LỌC THEO TỪ KHÓA (QUAN TRỌNG!)
  // ========================================
  const keywordsLower = keywords.map(k => k.toLowerCase().trim()).filter(k => k.length > 0);
  
  const filteredItems = allItems.filter(item => {
    const textLower = item.fullText.toLowerCase();
    const titleLower = item.title.toLowerCase();
    
    // Kiểm tra xem bài viết có chứa ít nhất 1 từ khóa không
    for (const kw of keywordsLower) {
      // Hỗ trợ tìm kiếm nhiều từ (ví dụ: "iphone 15 pro max")
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

  // Deduplicate theo URL
  const map = new Map<string, MarketplaceItem>();
  filteredItems.forEach((it) => {
    if (it.url) {
      const cleanUrl = it.url.split('?')[0]; // Bỏ query params
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
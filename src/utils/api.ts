// src/utils/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getHeaders(token?: string) {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

// Token helpers
export function saveToken(token: string) {
  localStorage.setItem("token", token);
}
export function getToken() {
  return localStorage.getItem("token");
}
export function removeToken() {
  localStorage.removeItem("token");
}

// Lấy user sau đăng nhập
export async function getMe() {
  const token = getToken();
  if (!token) throw new Error("Chưa đăng nhập");

  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getHeaders(token),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || "Token không hợp lệ");

  return json; // { success:true, user }
}

// ✅ Đăng nhập
export async function login(data: { email: string; password: string }) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || "Đăng nhập thất bại");

  // Lưu token
  if (json?.token) saveToken(json.token);

  // ✅ UI của bạn cần user → gọi /me để lấy user
  const me = await getMe();
  return { success: true, user: me.user };
}

// ✅ Đăng ký
export async function register(data: any) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || "Đăng ký thất bại");

  if (json?.token) saveToken(json.token);

  if (json?.user) return { success: true, user: json.user };

  const me = await getMe();
  return { success: true, user: me.user };
}

// ✅ Lấy danh sách bài đăng (có phân quyền theo role)
export async function fetchPosts(params?: { type?: string; platform?: string; status?: string; keyword?: string; limit?: number; skip?: number }) {
  const token = getToken();
  const queryParams = new URLSearchParams();
  
  if (params?.type) queryParams.append('type', params.type);
  if (params?.platform) queryParams.append('platform', params.platform);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.keyword) queryParams.append('keyword', params.keyword);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.skip) queryParams.append('skip', params.skip.toString());
  
  const url = `${API_BASE_URL}/posts${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  
  const res = await fetch(url, {
    headers: getHeaders(token || undefined),
  });
  
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || "Lấy bài đăng thất bại");
  
  return json;
}

// ✅ Lấy thống kê bài đăng (có phân quyền theo role)
export async function fetchPostsStats() {
  const token = getToken();
  
  const res = await fetch(`${API_BASE_URL}/posts/stats`, {
    headers: getHeaders(token || undefined),
  });
  
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || "Lấy thống kê thất bại");
  
  return json;
}

// ✅ Lưu bài đăng mới (kèm thông tin người quét)
export async function savePosts(items: any[]) {
  const token = getToken();
  
  const res = await fetch(`${API_BASE_URL}/posts`, {
    method: "POST",
    headers: getHeaders(token || undefined),
    body: JSON.stringify({ items }),
  });
  
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || "Lưu bài đăng thất bại");
  
  return json;
}
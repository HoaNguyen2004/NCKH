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

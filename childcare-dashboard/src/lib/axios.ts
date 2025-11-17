import axios from "axios";

// رابط الباك إند
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// نصنع نسخة Axios جاهزة
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// إضافة الـ token تلقائياً إذا موجود
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// معالجة الأخطاء
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error.response?.data || error);
  }
);
import axios from "axios";
import { logout } from "@/redux/authSlice";
import { store } from "@/redux/store";


export const api = axios.create({
  baseURL: "http://localhost:5000",
});

/* 🔵 Request Interceptor — يضيف التوكن لكل طلب */
api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* 🔴 Response Interceptor — يمسك الأخطاء */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;

    console.error("API Error:", data || error);

    /* 🚨 إذا التوكن منتهي أو غير صالح */
    if (
      status === 401 &&
      (data?.error === "jwt expired" || data?.message === "Invalid token")
    ) {
      console.warn("❌ JWT expired — Logging out");

      // احذف التوكن من localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }

      // احذف بيانات المستخدم من Redux
      try {
        store.dispatch(logout());
      } catch (err) {
        console.log("Redux logout not available:", err);
      }

      // إعادة توجيه المستخدم لصفحة تسجيل الدخول
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(data || error);
  }
);

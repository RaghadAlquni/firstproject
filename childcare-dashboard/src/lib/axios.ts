import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5000",
});

// يضيف التوكن لكل طلب تلقائيًا
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error?.response?.data || error);
    return Promise.reject(error?.response?.data || error);
  }
);
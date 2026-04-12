import axios from "axios";

const fallbackApiUrl =
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:5001/api`
    : "http://localhost:5001/api";

const apiBaseUrl = import.meta.env.VITE_API_URL?.trim() || fallbackApiUrl;

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json"
  }
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

import axios from "axios";

const fallbackApiUrl =
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:5001/api`
    : "http://localhost:5001/api";

export const apiBaseUrl = import.meta.env.VITE_API_URL?.trim() || fallbackApiUrl;

const apiRootUrl = (() => {
  try {
    const url = new URL(apiBaseUrl);
    url.pathname = url.pathname.replace(/\/api\/?$/, "");
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return apiBaseUrl.replace(/\/api\/?$/, "");
  }
})();

let backendWarmupPromise;

export const warmBackend = () => {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  if (!backendWarmupPromise) {
    backendWarmupPromise = fetch(`${apiRootUrl}/health`, {
      cache: "no-store",
    })
      .then((response) => response.ok)
      .catch(() => false);
  }

  return backendWarmupPromise;
};

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

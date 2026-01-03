import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: true,
});

function getApiGroupFromConfig(config) {
  try {
    const base = config.baseURL || "";
    const rawUrl = config.url || "";
    // Build absolute URL for safe parsing
    const abs = new URL(rawUrl, base || window.location.origin);
    let path = abs.pathname || "";
    // Normalize: strip trailing slashes
    if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
    // Remove common API prefix if present
    if (path.startsWith("/api/")) path = path.slice(4); // keep leading /
    // Determine group from first path segment
    if (path.startsWith("/admin/")) return "admin";
    if (path.startsWith("/staff/")) return "staff";
    return "public"; // customer/public endpoints
  } catch {
    return "public";
  }
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API error:", error);
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      const cfg = error.response.config || error.config || {};
      const group = getApiGroupFromConfig(cfg);

      const current = window.location.pathname || "";
      if (group === "admin") {
        if (current !== "/login") window.location.href = "/login";
      } else if (group === "staff") {
        if (current !== "/staff/login") window.location.href = "/staff/login";
      } else {
        // public/customer: don't redirect; let the caller handle it
        // Optionally, you could emit an event or set a flag here.
      }
    }
    return Promise.reject(error);
  }
);

export default api;

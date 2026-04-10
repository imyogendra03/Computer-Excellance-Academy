import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const USER_PUBLIC_PATHS = new Set([
  "/api/auth/login",
  "/api/auth/verify-login",
  "/api/auth/register",
  "/api/auth/verify-registration",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/refresh-token",
]);

const ADMIN_PUBLIC_PATHS = new Set([
  "/api/admin/login",
  "/api/admin/refresh-token",
]);

const refreshState = {
  user: null,
  admin: null,
};

const getRole = () => localStorage.getItem("role");

const getAuthState = (preferredKind = null) => {
  if (preferredKind === "admin" && localStorage.getItem("adminToken")) return "admin";
  if (preferredKind === "user" && localStorage.getItem("token")) return "user";

  if (getRole() === "admin" && localStorage.getItem("adminToken")) return "admin";
  if (localStorage.getItem("token")) return "user";
  if (localStorage.getItem("adminToken")) return "admin";

  return null;
};

const getAccessToken = (kind) =>
  kind === "admin" ? localStorage.getItem("adminToken") : localStorage.getItem("token");

const getRefreshToken = (kind) =>
  kind === "admin"
    ? localStorage.getItem("adminRefreshToken")
    : localStorage.getItem("refreshToken");

const storeTokens = (kind, tokens) => {
  if (kind === "admin") {
    if (tokens.accessToken) localStorage.setItem("adminToken", tokens.accessToken);
    if (tokens.refreshToken) localStorage.setItem("adminRefreshToken", tokens.refreshToken);
    localStorage.setItem("role", "admin");
    return;
  }

  if (tokens.accessToken) localStorage.setItem("token", tokens.accessToken);
  if (tokens.refreshToken) localStorage.setItem("refreshToken", tokens.refreshToken);
  localStorage.setItem("userRole", "user");
};

const clearAuth = (kind) => {
  if (kind === "admin") {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRefreshToken");
    localStorage.removeItem("adminData");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    return;
  }

  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userData");
  localStorage.removeItem("userId");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userToken");
};

const redirectToLogin = (kind) => {
  window.showAuthError?.("Session expired, please login again");
  window.location.href = kind === "admin" ? "/adlogin" : "/login";
};

const toUrl = (input) => {
  const raw = typeof input === "string" ? input : input?.url || "";
  return new URL(raw, window.location.origin);
};

const isApiRequest = (url) => {
  const apiOrigin = new URL(API_URL, window.location.origin).origin;
  return url.origin === apiOrigin && url.pathname.startsWith("/api/");
};

const isPublicPath = (pathname) =>
  USER_PUBLIC_PATHS.has(pathname) || ADMIN_PUBLIC_PATHS.has(pathname);

const shouldHandleAuth = (url) => isApiRequest(url) && !isPublicPath(url.pathname);

const shouldUseAdminAuth = (url) => {
  if (url.pathname.startsWith("/api/admin/")) return true;
  return getRole() === "admin" && !!localStorage.getItem("adminToken");
};

const refreshAuthToken = async (kind) => {
  if (refreshState[kind]) return refreshState[kind];

  const refreshToken = getRefreshToken(kind);
  if (!refreshToken) throw new Error("No refresh token found");

  const endpoint =
    kind === "admin" ? `${API_URL}/api/admin/refresh-token` : `${API_URL}/api/auth/refresh-token`;

  refreshState[kind] = fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  })
    .then(async (response) => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.accessToken) {
        throw new Error(data?.message || "Refresh failed");
      }

      storeTokens(kind, data);
      return data.accessToken;
    })
    .finally(() => {
      refreshState[kind] = null;
    });

  return refreshState[kind];
};

const createAuthHeaders = (headers, token) => {
  const merged = new Headers(headers || {});
  if (token) {
    merged.set("Authorization", `Bearer ${token}`);
  }
  return merged;
};

export const setupAuthSession = () => {
  axios.interceptors.request.use((config) => {
    const url = toUrl(config.url || "");
    if (!shouldHandleAuth(url)) return config;

    const kind = shouldUseAdminAuth(url) ? "admin" : getAuthState();
    const token = getAccessToken(kind);

    if (token && !config.headers?.Authorization) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    config._authKind = kind;
    return config;
  });

  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const config = error.config;
      const url = toUrl(config?.url || "");

      if (
        !config ||
        config._retry ||
        error.response?.status !== 401 ||
        !shouldHandleAuth(url)
      ) {
        return Promise.reject(error);
      }

      const kind = config._authKind || (shouldUseAdminAuth(url) ? "admin" : getAuthState());

      try {
        const newToken = await refreshAuthToken(kind);
        config._retry = true;
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${newToken}`;
        return axios(config);
      } catch (refreshError) {
        clearAuth(kind);
        redirectToLogin(kind);
        return Promise.reject(refreshError);
      }
    }
  );

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init = {}) => {
    const url = toUrl(input);
    if (!shouldHandleAuth(url)) {
      return originalFetch(input, init);
    }

    const kind = shouldUseAdminAuth(url) ? "admin" : getAuthState();
    const makeRequest = async (tokenOverride = null) => {
      const token = tokenOverride || getAccessToken(kind);
      const headers = createAuthHeaders(init.headers, token);
      return originalFetch(typeof input === "string" ? input : input.url, {
        ...init,
        headers,
      });
    };

    let response = await makeRequest();

    if (response.status !== 401 || init._retry) {
      return response;
    }

    try {
      const newToken = await refreshAuthToken(kind);
      return makeRequest(newToken);
    } catch (refreshError) {
      clearAuth(kind);
      redirectToLogin(kind);
      throw refreshError;
    }
  };
};

export default setupAuthSession;

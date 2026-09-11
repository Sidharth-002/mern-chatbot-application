import axios from "axios";
import { refreshRoute } from "./APIRoutes";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const PUBLIC_AUTH_PATHS = new Set([
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
]);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const isPublicAuthRoute = (url) => {
  if (!url) return false;

  try {
    const pathname = new URL(url, API_BASE_URL).pathname;
    return PUBLIC_AUTH_PATHS.has(pathname);
  } catch (error) {
    return false;
  }
};

const setAuthHeader = (token) => {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    return;
  }

  delete apiClient.defaults.headers.common["Authorization"];
};

let isRefreshing = false;
let refreshQueue = [];

const refreshAccessToken = async () => {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      refreshQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    const { data } = await axios.post(
      refreshRoute,
      {},
      { withCredentials: true },
    );

    if (!data?.accessToken) {
      throw new Error("Refresh endpoint did not return an access token");
    }

    setAuthHeader(data.accessToken);
    refreshQueue.forEach(({ resolve }) => resolve(data.accessToken));
    refreshQueue = [];
    return data.accessToken;
  } catch (error) {
    refreshQueue.forEach(({ reject }) => reject(error));
    refreshQueue = [];
    throw error;
  } finally {
    isRefreshing = false;
  }
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error("API request error:", error);
    const originalRequest = error.config;

    if (!error.response || !originalRequest) {
      console.error("Error response or original request is undefined");
      return Promise.reject(error);
    }

    console.error("Error retry status:", originalRequest._retry);

    const shouldSkipRefresh =
      originalRequest._retry ||
      originalRequest.skipAuthRefresh === true ||
      isPublicAuthRoute(originalRequest.url);

    if (error.response.status !== 401 || shouldSkipRefresh) {
      console.error("Skipping token refresh due to status or retry flag:", {
        status: error.response.status,
        shouldSkipRefresh,
      });
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const accessToken = await refreshAccessToken();
      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${accessToken}`,
      };
      return apiClient(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  },
);

export default apiClient;

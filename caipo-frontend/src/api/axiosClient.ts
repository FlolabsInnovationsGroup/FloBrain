import axios from "axios";
import { store } from "../store/store";
import { setError, setLoading } from "../store/slices/appSlice";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // if backend uses cookies
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    store.dispatch(setLoading(true));
    return config;
  }, (error) => {
    store.dispatch(setLoading(false));
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => {
    store.dispatch(setLoading(false));
    store.dispatch(setError(null)); // Clear any previous errors
    return response;
  },
  async (error) => {
    store.dispatch(setLoading(false));
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = "Bearer " + token;
            return axiosClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = refreshResponse.data.accessToken;
        localStorage.setItem("accessToken", newToken);
        axiosClient.defaults.headers.common.Authorization = "Bearer " + newToken;
        processQueue(null, newToken);
        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("accessToken");
        store.dispatch(setError("Session expired. Please login again."));
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message || "An error occurred";
    store.dispatch(setError(errorMessage));
    
    return Promise.reject(error);
  }
);

import { useCallback, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useToast } from "./useToast";
import { getToken } from "../utils/localStorage";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const useAxios = () => {
  const navigate = useNavigate();
  const toast = useToast();

  // Create an Axios instance (memoized)
  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: BASE_URL,
      headers: { "Content-Type": "application/json" },
      timeout: 10000,
    });

    // ✅ Request interceptor - attach token if available
    instance.interceptors.request.use(
      (config) => {
        const token = getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;

        if (status === 401) {
          toast.error("Session expired. Please sign in again.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/signin");
        } else if (status === 403) {
          toast.error("You do not have permission to access this resource.");
        } else if (status === 404) {
          toast.error("Requested resource not found.");
        } else if (status >= 500) {
          toast.error("Server error. Please try again later.");
        } else {
          toast.error(message);
        }

        return Promise.reject(error.response?.data || error.message);
      }
    );

    return instance;
  }, [navigate, toast]);

  // ✅ Simple unified request method
  const request = useCallback(
    async ({ url, method = "GET", body = null, params = null }) => {
      try {
        const response = await axiosInstance({
          url,
          method: method.toLowerCase(),
          data: body,
          params,
        });
        return response.data;
      } catch (err) {
        throw err;
      }
    },
    [axiosInstance]
  );

  return { request };
};

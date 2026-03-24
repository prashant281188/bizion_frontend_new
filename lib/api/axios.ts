import axios, { AxiosError } from "axios";

const getApiUrl = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;

    if (hostname === "localhost") {
      return "http://localhost:6767/api/v1";
    }
    else if (hostname === "192.168.29.120") {

      return process.env.NEXT_PUBLIC_HOME_API_URL;
    }

    return process.env.NEXT_PUBLIC_OFFICE_API_URL!;
  }

  return process.env.NEXT_PUBLIC_API_URL;
};

export const API_URL = getApiUrl();

export const api = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",

  },
});

const AUTH_PATHS = ["/login", "/logout", "/forgot", "/reset", "/verify"];

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const isAuthPage = typeof window !== "undefined" &&
      AUTH_PATHS.some((p) => window.location.pathname.startsWith(p));

    if (error.response?.status === 401 && typeof window !== "undefined" && !isAuthPage) {
      window.location.href = "/login";
    }
    return Promise.reject(
      error.response?.data?.message || "Something went wrong"
    );
  }
)

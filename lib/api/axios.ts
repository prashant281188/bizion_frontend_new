import axios, { AxiosError } from "axios";


// lib/api.ts

const getApiUrl = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;

    if (hostname === "localhost") {
      return "http://localhost:6767/api/v1";
    }
    else if(hostname === "192.168.29.120"){

      return "http://192.168.29.120:6767/api/v1";
    }

    return "http://192.168.31.216:6767/api/v1";
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

api.interceptors.response.use(
  (response)=> response, 
  (error:AxiosError < {message?: string}>)=>{
    if(error.response?.status === 401){
      window.location.href ="/login"
    }
    return Promise.reject(
      error.response?.data.message || "Something went wrong"
    )
  }
)

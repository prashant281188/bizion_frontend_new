import axios, { AxiosError } from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
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

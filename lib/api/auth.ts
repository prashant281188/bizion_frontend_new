import { ApiResponse, User } from "@/types/auth";
import { api } from "./axios";
import { AxiosError } from "axios";

export async function getMe(): Promise<User | null> {
  try {
    const res = await api.get<ApiResponse<User>>("/auth/me");
    return res.data.data ?? null;
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      if (err.response?.status === 401) {
        return null;
      }
    }
    throw err; // let React Query handle real errors
  }
}

export async function login(data: {
    email: string;
    password: string;
}) {
    const res = await api.post("/auth/login", data);
    return res.data
}

export async function logout() {
    await api.post("/auth/logout")
}


export async function forgot(data: {
    email: string
}) {
    const res = await api.post("/auth/forgot-password", data)
    return res.data
}

export async function resetPassword(data: {
    token: string;
    newPassword: string;
}) {
    const res = await api.post("/auth/reset-password", data)
    return res.data
}

export async function verifyOtp(data: {
    email: string;
    otp: string;
}) {
    const res = await api.post<ApiResponse<{ token?: string }>>("/auth/verify-otp", data)
    return res.data
}

export async function resendOtp(data: { email: string }) {
    const res = await api.post("/auth/resend-otp", data)
    return res.data
}

export async function changePassword(data: {
    currentPassword: string;
    newPassword: string;
}) {
    const res = await api.post("/auth/change-password", data)
    return res.data
}

export async function updateProfile(data: {
    name?: string;
    email?: string;
}) {
    const res = await api.patch<ApiResponse<{ user: User }>>("/auth/profile", data)
    return res.data
}
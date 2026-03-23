import { ApiResponse, User } from "@/types/auth";
import { api } from "./axios";

export async function getMe(): Promise<User | null> {
  try {
    const res = await api.get<ApiResponse<{ user: User }>>("/auth/me");
    return res.data.data?.user ?? null;
  } catch (err: any) {
    if (err.response?.status === 401) {
      return null;
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
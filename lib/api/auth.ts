import { ApiResponse, User } from "@/types/auth";
import { api } from "./axios";

export async function getMe(): Promise<User | null> {

    try {
        const res = await api.get<ApiResponse<{ user: User }>>("/auth/me");
        return res.data.data.user
    } catch {
        return null
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
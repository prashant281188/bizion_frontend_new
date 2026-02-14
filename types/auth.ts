export interface Permission {
    id: string;
    code: string;
}

export interface Role {
    id: string;
    name: string;
    permissions?: Permission[];
}

export interface User {
    id: string;
    email: string;
    role: Role;
    isActive: boolean;
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}
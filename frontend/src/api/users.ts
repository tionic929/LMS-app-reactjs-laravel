import type { Update } from "vite/types/hmrPayload.js";
import api from "./axios"; // Your configured axios instance

export interface User {
    id: number;
    name: string;
    email: string;
    role: "instructor" | "learner" | "admin";
    is_enabled: boolean; // New: Account status
    is_confirmed: boolean; // New: Instructor confirmation status
    is_banned_from_comments: boolean;
    avatar_url?: string | null;
    avatar?: string,
}

export interface UserAnalytics {
    totalUsers: number;
    totalLearners: number;
    totalInstructors: number,
    activeUsers: number;
    bannedUsers: number;
    pendingApplications: number,
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: "instructor" | "learner" | "admin";
}

export interface ViewUserPayload {
    name: string;
    email: string;
    role: "instructor" | "learner" | "admin";
}

export interface UpdateUserPayload {
    name: string;
    email: string;
    role: "instructor" | "learner" | "admin";
    password?: string;
}

// Interface for the Laravel Pagination Object
export interface PaginatedResponse {
  current_page: number;
  data: User[];
  last_page: number;
  per_page: number;
  total: number;
}

export const getAllUsers = async (
    page = 1,
    search = "",
    role: string | null = null
    ): Promise<PaginatedResponse> => {
        const params: Record<string, any> = { page };
        
        // Only add params if they have values
        if (search) params.search = search;
        if (role && role !== "all") params.role = role;

        const response = await api.get("/users", { params });
        return response.data; 
};

export async function getUsersAnalytics(): Promise<UserAnalytics>{
    const response = await api.get('/users/analytics');
    return response.data;
}

export const createUser = async (data: CreateUserPayload) => {
  const response = await api.post("/users", data);
  return response.data;
};

export const viewUser = async (id: number, data: UpdateUserPayload) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
}

export const updateUser = async (id: number, data: UpdateUserPayload) => {
    // Choose JSON or multipart depending on presence of File
    if ((data as any).avatar instanceof File) {
        const fd = new FormData();
        fd.append('_method', 'PUT');
        fd.append('name', data.name);
        fd.append('email', data.email);
        fd.append('role', data.role);
        if (data.password) fd.append('password', data.password);
        fd.append('avatar', (data as any).avatar as File);
        const response = await api.post(`/users/${id}`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
    const response = await api.put(`/users/${id}`, data);
    return response.data;
}

export const deleteUser = async (id: number) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
}

export const toggleUserField = async (userId: number, field: keyof User) => {
    const response = await api.put(`/users/${userId}/toggle`, { 
        field: field 
    });
    return response.data;
};

export const deleteUserAvatar = async (userId: number) => {
    const response = await api.delete(`/users/${userId}/avatar`);
    return response.data;
};

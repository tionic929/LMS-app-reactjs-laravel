import type { Update } from "vite/types/hmrPayload.js";
import api from "./axios"; // Your configured axios instance

export interface User {
  id: number;
  name: string;
  email: string;
  role: "instructor" | "learner" | "admin";
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

export const createUser = async (data: CreateUserPayload) => {
  const response = await api.post("/users", data);
  return response.data;
};

export const viewUser = async (id: number, data: UpdateUserPayload) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
}

export const updateUser = async (id: number, data: UpdateUserPayload) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
}

export const deleteUser = async (id: number) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
}

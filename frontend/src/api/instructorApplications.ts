import axios from "./axios";
import api from "./axios";
import { type User } from "./users";

export interface InstructorApplication {
    id: number;
    user_id: number;
    name: string;
    email: string;
    experience?: string;
    bio?: string;
    status: "pending" | "approved" | "rejected";
    created_at: string;
    user?: User;
}

export interface InstructorApplicationResponse {
    data: InstructorApplication[];
    total_pages: number;
}

export interface InstructorAnalytics{
    totalApproved: number,
    totalPending: number,
    totalRejected: number,

    total_count: number,
    data: InstructorApplication[],
}

export interface ApplicationRates{
    month: string;
    totalApplications: number;
    approvedCount: number;
    approvalRate: string;
}

export async function getApplicationRates(): Promise<ApplicationRates[]>{
    const response = await api.get('/instructors/analytics/applications-rates');
    return response.data;
}

export async function getPendingApplications(): Promise<InstructorAnalytics>{
    const response = await api.get('/instructor/pending-applications');
    return response.data as InstructorAnalytics;
}

export async function getInstructorAnalytics(): Promise<InstructorAnalytics>{
    const response = await api.get('/instructor/analytics');
    return response.data;
}

export const getInstructorApplications = async (status: string, page: number):Promise<InstructorApplicationResponse> => {
    const res = await axios.get(`/instructor-applications?status=${status}&page=${page}`);
    return res.data;
};

export const approveInstructorApplication = async (id: number) => {
    const res = await axios.post(`/instructor-applications/${id}/approve`);
    return res.data;
};

export const rejectInstructorApplication = async (id: number) => {
    const res = await axios.post(`/instructor-applications/${id}/reject`);
    return res.data;
};

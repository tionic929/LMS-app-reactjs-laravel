import axios from "./axios";

export interface InstructorApplication {
    id: number;
    user_id: number;
    name: string;
    email: string;
    experience?: string;
    bio?: string;
    status: "pending" | "approved" | "rejected";
    created_at: string;
    user?: any;
}

export const getInstructorApplications = async (status: string) => {
    const res = await axios.get(`/instructor-applications?status=${status}`);
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

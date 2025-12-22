import api from "./axios";

export interface RegistrationTrend{
    totalRegistrations: number,
    totalApplications: number,
    Learners: number,
    Instructors: number,

    registrationYear: number,
    registrationDate: number,
    registrationMonth: string,
}

export async function getRegistrationTrend(): Promise<RegistrationTrend[]>{
    const response = await api.get("/learners/registration-trend");
    return response.data;
}
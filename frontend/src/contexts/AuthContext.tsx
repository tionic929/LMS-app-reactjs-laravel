import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { 
    fetchUser, 
    login as apiLogin, 
    apiLogoutAndRevokeToken, 
    apiLogoutAndClearSession 
} from "../api/auth"; 
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { toast } from "react-toastify";

export interface User {
    uid: any;
    id: number;
    email: string;
    role: 'admin' | 'instructor' | 'learner';
    name: string;
    avatar?: string | null;
    avatar_url?: string | null;
}

interface RegistrationPayload {
    firstName: string;
    middleInitial: string | null;
    lastName: string;
    email: string;
    password: string;
    passwordConfirmation: string;
    dateOfBirth: string;
    phoneNumber: string;
    address: string;
    resumeFile?: File | null;
    avatarFile?: File | null;
    role?: 'instructor' | 'learner'; 
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    // Updated to accept either the Object or FormData
    register: (data: RegistrationPayload | FormData) => Promise<{message: string} | void >;
    remember: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [remember] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUser()
            .then((res) => {
                setUser(res.data);
            })
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    const register = useCallback(async (data: RegistrationPayload | FormData) => {
        setLoading(true);

        try {
            // 1. Prepare data for the request
            // If it's FormData, Axios handles headers automatically.
            // If it's a plain object, we spread it.
            const res = await api.post("/register", data, {
                withCredentials: true,
                headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
            });

            // 2. Extract values for post-registration logic (Login/Navigation)
            let email, password, role;

            if (data instanceof FormData) {
                email = data.get('email') as string;
                password = data.get('password') as string;
                role = data.get('role') as string;
            } else {
                email = data.email;
                password = data.password;
                role = data.role || "learner";
            }

            if (role === 'learner') {
                await api.get("http://localhost:8000/sanctum/csrf-cookie", { withCredentials: true });
                const loginRes = await api.post("/login", { email, password }, { withCredentials: true });

                setUser(loginRes.data.user);
                navigate("/dashboard");
            } else if (role === 'instructor') {
                return { message: res.data.message || "Application submitted and pending approval" };
            }

        } catch (error: any) {
            console.error("Registration failed:", error);
            let msg = 'Registration failed, please try again.';
            if (error.response?.data?.message) {
                msg = error.response.data.message;
            } else if (error.message) {
                msg = error.message;
            }

            throw {
                message: msg,
                response: error.response || null
            };
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    const login = useCallback(async (email: string, password: string) => {
        try {
            await apiLogin(email, password); 
            const res = await fetchUser();
            const loggedInUser = res.data as User;
            
            let dashboardPath: string;
            switch(loggedInUser.role) {
                case 'admin': dashboardPath = '/admin/dashboard'; break;
                case 'instructor': dashboardPath = '/instructor/dashboard'; break;
                case 'learner': dashboardPath = '/learner/dashboard'; break;
                default: dashboardPath = '/'; break;
            }
            
            setUser(loggedInUser);
            navigate(dashboardPath, { replace: true });
        } catch (err: any) {
            if (err.response?.status === 429) {
                toast.error("⚠️ Too many attempts. Please wait a minute and try again.");
            } else {
                toast.error(err.response?.data?.message || "Login failed.");
            }
        }
    }, [navigate]);

    const logout = useCallback(async () => {
        try {
            await apiLogoutAndRevokeToken();
            await apiLogoutAndClearSession();
        } catch (error) {
            console.error("Server-side logout failed:", error);
        }
        setUser(null);
        delete api.defaults.headers.common['Authorization']; 
        localStorage.removeItem('token'); 
        navigate("/login");
    }, [navigate]); 

    const contextValue = useMemo(() => ({
        user, 
        loading,
        login, 
        logout, 
        register, 
        remember,
    }), [user, loading, login, logout, register, remember]); 

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be inside AuthProvider");
    return ctx;
};
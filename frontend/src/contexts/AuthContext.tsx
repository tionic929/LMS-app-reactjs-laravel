import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
// 💡 CRITICAL CHANGE: Import the two new logout functions
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
    role?: 'instructor' | 'learner'; 
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (data: RegistrationPayload) => Promise<{message: string} | void >;
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

    // 2. Memoize complex functions using useCallback
    const register = useCallback(async (data: RegistrationPayload) => {
        setLoading(true);

        try {
            if (data.password !== data.passwordConfirmation) {
                throw new Error("Passwords do not match.");
            }

            const finalRole = data.role || "learner";

            const res = await api.post("/register", { ...data, role: finalRole }, {
                withCredentials: true
            });

            // If learner, log in immediately
            if(finalRole === 'learner'){
                await api.get("http://localhost:8000/sanctum/csrf-cookie", { withCredentials: true });
                const loginRes = await api.post("/login", {
                    email: data.email,
                    password: data.password
                }, { withCredentials: true });

                setUser(loginRes.data.user);
                navigate("/dashboard");
            } else if(finalRole === 'instructor') {
                // Instructor: just return success (no error thrown)
                return { message: res.data.message || "Application submitted and pending approval" };
            }

        } catch (error: any) {
            console.error("Registration failed:", error);

            let msg = 'Registration failed, please try again.';
            if(error.response?.data?.message){
                msg = error.response.data.message; // <-- fixed typo: massage -> message
            } else if(error.message) {
                msg = error.message;
            }

            throw {
                message: msg,
                response: error.response || null
            };
        } finally {
            setLoading(false);
        }
    }, [setLoading, setUser, navigate]);




    const login = useCallback(async (email: string, password: string) => {
        try{
            await apiLogin(email, password); 
            const res = await fetchUser();
            setUser(res.data);
            navigate("/dashboard");
        } catch (err: any) {
            if (err.response?.status === 429) {
                toast.error("⚠️ Too many attempts. Please wait a minute and try again.");
            } else {
                toast.error(err.response?.data?.message || "Login failed.");
            }
        }
    }, [navigate, setUser]); 

    // 💡 THE FIXED LOGOUT FUNCTION
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

    
    // 3. CRITICAL FIX: Memoize the entire context value object
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
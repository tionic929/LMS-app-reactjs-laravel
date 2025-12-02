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


export interface User {
    uid: any;
    id: number;
    email: string;
    role: 'admin' | 'instructor' | 'learner';
    name: string;
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
    register: (data: RegistrationPayload) => Promise<void>;
    remember: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [remember, setRemember] = useState(false);
    const navigate = useNavigate();

    // 1. useEffect remains stable (only runs on mount)
    useEffect(() => {
        // ... existing token/user fetch logic ...
        fetchUser()
            .then((res) => {
                setUser(res.data);
                // 💡 If a token is in storage and user is fetched, set it on axios header here.
            })
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    // 2. Memoize complex functions using useCallback
    const register = useCallback(async (data: RegistrationPayload) => {
        setLoading(true);
        try {
            // ... (Registration logic remains the same) ...
            const finalRole = data.role || 'learner';
            if (data.password !== data.passwordConfirmation){
                throw new Error("Passwords do not match");
            }
            
            const apiPayload: Record<string, any> = { ...data, role: finalRole };
            
            const response = await api.post('/register', apiPayload); 
            
            const registeredUser = response.data.user as User;
            setUser(registeredUser);
            // 💡 If token is returned on register, save it here
            // localStorage.setItem('token', response.data.token);
            // api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;


        } catch(error: any) {
            let errorMessage = 'An unexpected error occurred. Please try again.';
            console.error('Registration failed:', error);
            throw new Error(errorMessage);
        } finally{
            setLoading(false);
        }
    }, [setLoading, setUser]);


    const login = useCallback(async (email: string, password: string) => {
        // The API call to login, which returns the token in the response body
        const response = await apiLogin(email, password); 
        
        // 💡 Save the token to local storage and set the Axios header
        localStorage.setItem('token', response.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

        // Fetch user data with the new token attached
        const res = await fetchUser();
        setUser(res.data);
        navigate("/");
    }, [navigate, setUser]); 

    // 💡 THE FIXED LOGOUT FUNCTION
    const logout = useCallback(async () => {
        try {
            // 1. Revoke the API token (Logs out on other devices/browsers)
            await apiLogoutAndRevokeToken();
            
            // 2. Destroy the session cookie (Crucial for preventing refresh login)
            await apiLogoutAndClearSession();
        } catch (error) {
            console.error("Server-side logout failed:", error);
        }
        
        // 3. CRITICAL CLIENT-SIDE CLEANUP
        setUser(null);
        delete api.defaults.headers.common['Authorization']; 
        localStorage.removeItem('token'); 
        
        // 4. Redirect
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
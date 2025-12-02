import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { fetchUser, login as apiLogin, logout as apiLogout } from "../api/auth"; 
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
    fetchUser()
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // 2. Memoize complex functions using useCallback
  const register = useCallback(async (data: RegistrationPayload) => {
    setLoading(true);
    try {
      const { 
        email,
        password,
        passwordConfirmation,
        firstName,
        middleInitial,
        lastName,
        dateOfBirth,
        phoneNumber,
        address,
        role,
        resumeFile,
      } = data;

      const finalRole = role || 'learner';

      if (password !== passwordConfirmation){
        throw new Error("Passwords do not match");
      }

      const apiPayload: Record<string, any> = {
        email,
        password,
        passwordConfirmation,
        firstName,
        middleInitial,
        lastName,
        dateOfBirth,
        phoneNumber,
        address,
        role: finalRole,
      };
      
      const response = await api.post('/register', apiPayload); 
      
      const registeredUser = response.data.user as User;
      setUser(registeredUser);

    } catch(error: any) {
      // Error handling logic remains the same...
      let errorMessage = 'An unexpected error occurred. Please try again.';
      // ... (simplified for display)
      console.error('Registration failed:', error);
      throw new Error(errorMessage);
    } finally{
      setLoading(false);
    }
  }, [setUser, setLoading]); // Depend on setUser/setLoading (which are stable)


  const login = useCallback(async (email: string, password: string) => {
    await apiLogin(email, password, undefined);
    const res = await fetchUser();
    setUser(res.data);
    navigate("/");
  }, [navigate]); // Depend on navigate

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
    navigate("/login");
  }, [navigate]); // Depend on navigate

  
  // 3. CRITICAL FIX: Memoize the entire context value object
  const contextValue = useMemo(() => ({
    user, 
    loading,
    login, 
    logout, 
    register, // Pass the memoized register function
    remember,
  }), [user, loading, login, logout, register, remember]); // Dependencies: all state and memoized function references

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
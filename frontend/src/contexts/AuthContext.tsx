import React, { createContext, useContext, useState, useEffect } from "react";
// Assuming these are correctly configured
import { fetchUser, login as apiLogin, logout as apiLogout } from "../api/auth"; 
import { useNavigate } from "react-router-dom";
import api from "../api/axios";


export interface User {
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
  user: User | null; // Use the User interface here
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegistrationPayload) => Promise<void>;
  remember: boolean;
  refreshUser: () => Promise<void>;
}

// Initialize AuthContext with defined type
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user on initial load
    fetchUser()
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const register = async (data: RegistrationPayload) => {
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
        role, // Use explicit role if passed
        resumeFile,
      } = data;

      // Determine the final role, defaulting to 'learner' if not explicitly provided
      const finalRole = role || 'learner';

      if (password !== passwordConfirmation){
        throw new Error("Passwords do not match");
      }

      // 1. Construct the base API payload
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
      
      // Note: For instructor applications, you might want to prevent immediate sign-in 
      // until approved by an admin. For simplicity, we assume successful registration 
      // means the user is created and logged in, which might need adjustment based on 
      // your backend approval flow.
      const registeredUser = response.data.user as User;
      setUser(registeredUser);

    } catch(error: any) {
      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (error.response) {
        const apiError = error.response.data;

        if (apiError.errors) {
          const firstErrorKey = Object.keys(apiError.errors)[0];
          if (firstErrorKey) {
            errorMessage = apiError.errors[firstErrorKey][0];
          }
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }
      } else if (error.request) {
        errorMessage = 'The server is unreachable. Check your internet connection.';
      } 

      console.error('Registration failed:', error);
      throw new Error(errorMessage);
    } finally{
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    await apiLogin(email, password, undefined);
    const res = await fetchUser();
    setUser(res.data);
    navigate("/");
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
    navigate("/login");
  };

  const refreshUser = async () => {
    try {
      const res = await fetchUser();
      setUser(res.data);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, remember, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
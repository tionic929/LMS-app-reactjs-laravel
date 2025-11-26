import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchUser, login as apiLogin, logout as apiLogout } from "../api/auth";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser()
      .then((res) => setUser(res.data.data.data))
      .catch(() => setUser([]))
      .finally(() => setLoading(false));
  }, []);

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

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

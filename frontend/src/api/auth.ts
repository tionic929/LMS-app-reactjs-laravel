import api from "./axios";

export const login = async (email: string, password: string) => {
  // 1. Get the CSRF cookie (required for Sanctum when using an SPA)
  await api.get("http://localhost:8000/sanctum/csrf-cookie");
  
  // 2. Perform login (this request returns the token in the response data)
  return await api.post("/login", {email, password});
};

export const apiRegister = async () => {
  return await api.get("http://localhost:8000/sanctum/csrf-cookie");
}

export const fetchUser = async () => {
  return await api.get("/user");
};

// 💡 NEW: API call to revoke the Sanctum token
export const apiLogoutAndRevokeToken = async () => {
  return await api.post("/logout");
};

// 💡 NEW: API call to destroy the session cookie
export const apiLogoutAndClearSession = async () => {
  return await api.post("/logout-session");
};

// Helper for role checking
export const hasRole = (user: any, role: string) => {
  if (!user) return false;
  return user.role === role;
};

export const isInstructorApproved = (user: any) => {
  if (!user) return false;
  return user.role !== "instructor" || user.is_confirmed; // true if not instructor or approved
};

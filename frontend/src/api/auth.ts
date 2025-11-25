import api from "./axios";

export const login = async (email: string, password: string, p0: any) => {
  try {
    await api.get("/sanctum/csrf-cookie");
    // helpful debug during development: check browser devtools cookies/response
    try {
      console.log('CSRF cookie set, document.cookie:', document.cookie);
    } catch (e) {
      // document may be undefined in some environments; ignore
    }
  } catch (err) {
    console.error("Failed to get CSRF cookie", err);
    throw err;
  }

  try {
    return await api.post("/login", { email, password });
  } catch (err: any) {
    // surface backend error body to the console to aid debugging
    if (err.response) console.error('login error response', err.response.status, err.response.data);
    throw err;
  }
};

export const fetchUser = async () => {
  return api.get("/user");
};

export const logout = async () => {
  return api.post("/logout");
};  

export const hasRole = (user: any, role: string) => {
  if (!user) return false;
  return user.role === role;
};

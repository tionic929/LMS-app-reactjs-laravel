import api from "./axios";

export const login = async (email: string, password: string, p0: any) => {
  await api.get("http://localhost:8000/sanctum/csrf-cookie");
  await api.post("/login", {email, password});
  // try {
  //   await api.get("http://localhost:8000/sanctum/csrf-cookie");
  //   // helpful debug during development: check browser devtools cookies/response
  //   try {
  //     // console.log('CSRF cookie set, document.cookie:', document.cookie);
  //   } catch (e) {
  //     // document may be undefined in some environments; ignore
  //   }
  // } catch (err) {
  //   console.error("Failed to get CSRF cookie", err);
  //   throw err;
  // }

  // try {
  //   return await api.post("/login", { email, password });
  // } catch (err: any) {
  //   // surface backend error body to the console to aid debugging
  //   if (err.response) console.error('login error response', err.response.status, err.response.data);
  //   throw err;
  // }
};

export const fetchUser = async () => {
  return await api.get("/user");
};

export const logout = async () => {
  // console.log("Before logout, cookies:", document.cookie);

  return await api.post("/logout");
  // try {
  //   const response = await api.post("/logout");
  //   console.log("Logout response:", response.data);
  //   return response.data;
  // } catch (err: any) {
  //   console.error("Logout ERROR:", err);
  //   if (err.response) {
  //     console.error("Status:", err.response.status);
  //     console.error("Data:", err.response.data);
  //   }
  //   throw err;
  // }
};


export const hasRole = (user: any, role: string) => {
  if (!user) return false;
  return user.role === role;
};

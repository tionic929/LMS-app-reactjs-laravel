import axios from "axios";

const api = axios.create({
  // Send requests under the /api prefix so the dev server proxy forwards them to the backend
  baseURL: "/api",
  withCredentials: true,
});

api.defaults.xsrfCookieName = "XSRF-TOKEN";
api.defaults.xsrfHeaderName = "X-XSRF-TOKEN";

export default api;

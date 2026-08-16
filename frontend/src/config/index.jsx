import axios from "axios";

// export const BASE_URL = "https://proconnect-7t7u.onrender.com";
export const BASE_URL = "http://localhost:9090";
export const clientServer = axios.create({
  baseURL: BASE_URL,
});

clientServer.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

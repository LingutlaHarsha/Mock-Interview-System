import axios from "axios";

const api = axios.create({
    baseURL: "/api/",
});

// Request interceptor: attach JWT access token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: handle token expiration / 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            localStorage.removeItem("role");
            if (window.location.pathname !== "/login" && window.location.pathname !== "/") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
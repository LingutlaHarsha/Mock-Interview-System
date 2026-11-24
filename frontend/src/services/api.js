import axios from "axios";

export const getBackendUrl = () => {
    let url = import.meta.env.VITE_API_URL;
    if (!url) return "";
    url = url.trim().replace(/\/+$/, "");
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = `https://${url}`;
    }
    return url;
};

const getBaseURL = () => {
    const backend = getBackendUrl();
    return backend ? `${backend}/api/` : "/api/";
};

const api = axios.create({
    baseURL: getBaseURL(),
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
import axios from "axios";

export const http = axios.create({
    baseURL: "/api",
    withCredentials: true,
});


// http.interceptors.request.use((config) => {
//     const token = localStorage.getItem("token");
//     if (token) config.headers.Authorization = `Bearer ${token}`;
//     return config;
// });

http.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Manejar tanto 401 (Unauthorized) como 403 (Forbidden)
        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Intentamos refrescar el token. Asumimos que el refresh setea la cookie automáticamente.
                await http.post("/auth/refresh");
                return http(originalRequest);
            } catch (refreshError) {
                // Si el refresh falla, redirigir al login
                console.error('Token refresh failed, redirecting to login...');
                window.location.href = '/';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

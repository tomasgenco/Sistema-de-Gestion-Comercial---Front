import axios from "axios";

export const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
});




http.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // NO intentar refrescar si la petición que falló es /auth/refresh (evita loop infinito)
        if (originalRequest.url?.includes('/auth/refresh')) {
            // Si el refresh falla, redirigir al login
            window.location.href = '/';
            return Promise.reject(error);
        }

        // Manejar tanto 401 (Unauthorized) como 403 (Forbidden)
        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Intentamos refrescar el token. Asumimos que el refresh setea la cookie automáticamente.
                await http.post("/auth/refresh");
                return http(originalRequest);
            } catch (refreshError) {
                // Si el refresh falla, redirigir al login
                window.location.href = '/';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

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
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Intentamos refrescar el token. Asumimos que el refresh setea la cookie automáticamente.
                await http.post("/auth/refresh");
                return http(originalRequest);
            } catch (refreshError) {
                // Si el refresh falla, rechazamos la promesa.
                // Aquí podrías redirigir al login si fuera necesario.
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = "Ocurrió un error inesperado";
    const status = error.response?.status;

    if (error.code === "ECONNABORTED") {
      message = "La conexión tardó demasiado tiempo";
    } else if (status === 401) {
      message = "Tu sesión ha expirado";
    } else if (status === 403) {
      message = "No tienes permisos para realizar esta acción";
    } else if (status === 404) {
      message = "El recurso solicitado no existe";
    } else if (status >= 500) {
      message = "Error en el servidor. Intenta de nuevo más tarde";
    }

    const normalizedError = {
      message,
      status,
      originalError: error,
    };

    console.error("API ERROR:", normalizedError);
    return Promise.reject(normalizedError);
  }
);

const configurarToken = async (getToken: () => Promise<string | null>) => {
  const token = await getToken();
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export { api, configurarToken };

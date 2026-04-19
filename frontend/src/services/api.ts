import axios from "axios";

// Helper function to convert a snake_case string to camelCase
function toCamel(s: string) {
  return s.replace(/_([a-z])/ig, (_, letter) => letter.toUpperCase());
}

// Helper function to recursively convert object keys to camelCase
function keysToCamelCase(o: any): any {
  if (o === Object(o) && !Array.isArray(o) && typeof o !== "function") {
    const n = {};
    Object.keys(o).forEach((k) => {
      // @ts-expect-error dynamic object key assignment
      n[toCamel(k)] = keysToCamelCase(o[k]);
    });
    return n;
  } else if (Array.isArray(o)) {
    return o.map((i) => keysToCamelCase(i));
  }
  return o;
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// API Request Interceptor (Auth token preparation)
api.interceptors.request.use((config) => {
  // TODO: Integrar JWT de Clerk en Fase 5
  // const token = await getToken();
  // if (token) {
  //    config.headers.Authorization = `Bearer ${token}`;
  // }
  return config;
});

// API Response Interceptor (snake_case -> camelCase)
api.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = keysToCamelCase(response.data);
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

import axios from "axios";
import Cookies from "js-cookie";
import config from "./Config/Config";

const api = axios.create({
  baseURL: `${config.API_URL}/api`,
});

// Adiciona o token automaticamente em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Trata erros de token expirado
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.response?.status === 401 &&
      error.response?.data?.message?.includes("token")
    ) {
      // Token expirado ou inválido
      Cookies.remove("token");
      window.location.href = "/home";
    }
    return Promise.reject(error);
  }
);

export default api;

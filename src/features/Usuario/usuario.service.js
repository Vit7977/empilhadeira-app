import { api } from "../../api/api.js";

export const createUsuario = async (usuario) => {
  const response = await api.post("/usuario", usuario);
  return response.data;
};

export const loginUsuario = async (credenciais) => {
  const response = await api.post("/usuario/login", credenciais);
  return response.data;
};
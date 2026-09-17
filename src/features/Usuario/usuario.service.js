import { api } from "../../api/api.js";

export const createUsuario = async (usuario) => {
  const response = await api.post("/usuario", usuario);
  return response.data;
};

export const loginUsuario = async (credenciais) => {
  const response = await api.post("/usuario/login", credenciais);
  return response.data;
};

export const updateUsuario = async (id, usuario) => {
  const response = await api.put(`/usuario/${id}`, usuario);
  return response.data;
};

export const deleteUsuario = async (id) => {
  const response = await api.delete(`/usuario/${id}`);
  return response.data;
};
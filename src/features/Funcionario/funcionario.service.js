import { api } from "../../api/api.js"; 

export const createFuncionario = async (funcionario) => { 
  const response = await api.post("/funcionario", funcionario); 
  return response.data; 
};

export const getFuncionarios = async () => {
  const response = await api.get("/funcionario");
  return response.data;
};

export const updateFuncionario = async (id, funcionario) => {
  const response = await api.put(`/funcionario/${id}`, funcionario);
  return response.data;
};

export const deleteFuncionario = async (id) => {
  const response = await api.delete(`/funcionario/${id}`);
  return response.data;
};
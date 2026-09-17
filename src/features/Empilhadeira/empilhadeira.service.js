import { api } from "../../api/api.js";

/**
 * Consulta todas as empilhadeiras.
 * Endpoint: GET /api/empilhadeira
 */
export const getEmpilhadeiras = async (params) => {
  const response = await api.get("/empilhadeira", { params });
  return response.data;
};

/**
 * Consulta uma empilhadeira específica por ID.
 * Endpoint: GET /api/empilhadeira/:id
 */
export const getEmpilhadeiraById = async (id) => {
  const response = await api.get(`/empilhadeira/${id}`);
  return response.data;
};

/**
 * Cadastra uma nova empilhadeira.
 * Endpoint: POST /api/empilhadeira
 */
export const createEmpilhadeira = async (empilhadeira) => {
  const response = await api.post("/empilhadeira", empilhadeira);
  return response.data;
};

/**
 * Atualiza os dados de uma empilhadeira.
 * Endpoint: PUT /api/empilhadeira/:id
 */
export const updateEmpilhadeira = async (id, empilhadeira) => {
  const response = await api.put(`/empilhadeira/${id}`, empilhadeira);
  return response.data;
};

/**
 * Exclui uma empilhadeira.
 * Endpoint: DELETE /api/empilhadeira/:id
 */
export const deleteEmpilhadeira = async (id) => {
  const response = await api.delete(`/empilhadeira/${id}`);
  return response.data;
};

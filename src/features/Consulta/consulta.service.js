import { api } from "../../api/api.js";

/**
 * Consulta todos os usuários cadastrados.
 * Endpoint: GET /api/usuario
 */
export const getUsuarios = async () => {
  const response = await api.get("/usuario");
  return response.data;
};

/**
 * Atualiza um usuário.
 * Endpoint: PUT /api/usuario/:id
 */
export const updateUsuario = async (id, data) => {
  const response = await api.put(`/usuario/${id}`, data);
  return response.data;
};

/**
 * Exclui um usuário.
 * Endpoint: DELETE /api/usuario/:id
 */
export const deleteUsuario = async (id) => {
  const response = await api.delete(`/usuario/${id}`);
  return response.data;
};

/**
 * Consulta todos os funcionários cadastrados.
 * Endpoint: GET /api/funcionario
 */
export const getFuncionarios = async () => {
  const response = await api.get("/funcionario");
  return response.data;
};

/**
 * Atualiza um funcionário.
 * Endpoint: PUT /api/funcionario/:id
 */
export const updateFuncionario = async (id, data) => {
  const response = await api.put(`/funcionario/${id}`, data);
  return response.data;
};

/**
 * Exclui um funcionário.
 * Endpoint: DELETE /api/funcionario/:id
 */
export const deleteFuncionario = async (id) => {
  const response = await api.delete(`/funcionario/${id}`);
  return response.data;
};

/**
 * Consulta o histórico de telemetrias.
 * Endpoint: GET /api/telemetria
 */
export const getTelemetrias = async (params) => {
  const response = await api.get("/telemetria", { params });
  return response.data;
};

/**
 * Consulta todas as empilhadeiras.
 * Endpoint: GET /api/empilhadeira
 */
export const getEmpilhadeiras = async (params) => {
  const response = await api.get("/empilhadeira", { params });
  return response.data;
};

/**
 * Atualiza uma empilhadeira.
 * Endpoint: PUT /api/empilhadeira/:id
 */
export const updateEmpilhadeira = async (id, data) => {
  const response = await api.put(`/empilhadeira/${id}`, data);
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

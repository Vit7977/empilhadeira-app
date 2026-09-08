import { api } from "../../api/api.js";

/**
 * Consulta todas as empilhadeiras.
 * Endpoint: GET /api/empilhadeira
 *
 * Exemplo de resposta:
 * {
 *   "success": true,
 *   "status": 200,
 *   "message": "Empilhadeiras consultadas!",
 *   "error": "",
 *   "data": [
 *     {
 *       "id": 1,
 *       "codigo": "EMP-001",
 *       "status": "disponivel"
 *     }
 *   ],
 *   "quant": 1
 * }
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


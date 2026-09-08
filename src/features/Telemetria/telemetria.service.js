import { api } from "../../api/api.js";

/**
 * Consulta o histórico ou lista de telemetrias.
 * Endpoint: GET /api/telemetria
 *
 * Exemplo de registro:
 * {
 *   "id": 2,
 *   "empilhadeira": 1,
 *   "data_hora": "2026-09-08T12:12:07.000Z",
 *   "posicao_x": 100,
 *   "posicao_y": 110,
 *   "nivel_bateria": 83,
 *   "velocidade": "10.30",
 *   "peso_carga": "0.50",
 *   "temperatura": "15.00",
 *   "sensor_linha": "",
 *   "obstaculo": 0
 * }
 */
export const getTelemetrias = async (params) => {
  const response = await api.get("/telemetria", { params });
  return response.data;
};

/**
 * Consulta a última telemetria registrada de uma empilhadeira específica.
 * Endpoint: GET /api/telemetria?empilhadeira=:id
 */
export const getUltimaTelemetriaPorEmpilhadeira = async (empilhadeiraId) => {
  const params = empilhadeiraId ? { empilhadeira: empilhadeiraId } : {};
  const response = await api.get("/telemetria", { params });
  return response.data;
};


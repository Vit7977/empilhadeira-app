import { useState, useEffect, useCallback } from "react";
import Toast from "react-native-toast-message";
import { getEmpilhadeiras, getEmpilhadeiraById } from "./empilhadeira.service.js";

/**
 * Hook para gerenciar estado e consumo de dados de empilhadeiras.
 * 
 * @param {Object} options
 * @param {number|string|null} [options.id=null] ID da empilhadeira a ser consultada diretamente
 * @param {boolean} [options.autoFetch=true] Se true, busca automaticamente ao montar
 * @param {boolean} [options.showToastOnError=true] Se true, exibe Toast caso ocorra erro
 */
export function useEmpilhadeira({ id = null, autoFetch = true, showToastOnError = true } = {}) {
  const [empilhadeiras, setEmpilhadeiras] = useState([]);
  const [quant, setQuant] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEmpilhadeira, setSelectedEmpilhadeira] = useState(null);

  const fetchEmpilhadeiras = useCallback(
    async (params) => {
      setLoading(true);
      setError(null);

      try {
        const response = await getEmpilhadeiras(params);

        const lista = Array.isArray(response?.data) ? response.data : [];
        setEmpilhadeiras(lista);
        setQuant(response?.quant ?? lista.length);

        return response;
      } catch (err) {
        let title = "Erro na Consulta";
        let message = "Não foi possível carregar as empilhadeiras.";

        if (err.response?.data) {
          const resData = err.response.data;

          if (typeof resData.error === "string" && resData.error.trim()) {
            message = resData.error;
          } else if (resData.error && typeof resData.error === "object" && resData.error.message) {
            message = resData.error.message;
          } else if (resData.message) {
            message = resData.message;
          }
        } else if (err.request) {
          title = "Erro de Conexão";
          message = "Não foi possível comunicar com a API. Verifique sua conexão e o servidor.";
        } else if (err.message) {
          message = err.message;
        }

        setError(message);

        if (showToastOnError) {
          Toast.show({
            type: "error",
            text1: title,
            text2: message,
          });
        }

        return null;
      } finally {
        setLoading(false);
      }
    },
    [showToastOnError]
  );

  const fetchById = useCallback(
    async (targetId = id) => {
      if (!targetId) return null;
      setLoading(true);
      setError(null);

      try {
        let item = null;

        try {
          const response = await getEmpilhadeiraById(targetId);
          if (Array.isArray(response?.data)) {
            item =
              response.data.find(
                (e) => String(e.id) === String(targetId)
              ) || response.data[0];
          } else {
            item = response?.data;
          }
        } catch (apiErr) {
          // Fallback caso a rota específica /api/empilhadeira/:id não esteja implementada no backend
          if (apiErr.response?.status === 404 || apiErr.response?.status === 405) {
            const listResponse = await getEmpilhadeiras();
            const list = Array.isArray(listResponse?.data) ? listResponse.data : [];
            setEmpilhadeiras(list);
            setQuant(listResponse?.quant ?? list.length);
            item = list.find((e) => String(e.id) === String(targetId)) || list[0];
          } else {
            throw apiErr;
          }
        }

        setSelectedEmpilhadeira(item ?? null);
        return item;
      } catch (err) {
        let title = "Erro na Consulta";
        let message = "Não foi possível carregar a empilhadeira solicitada.";

        if (err.response?.data) {
          const resData = err.response.data;
          if (typeof resData.error === "string" && resData.error.trim()) {
            message = resData.error;
          } else if (resData.error?.message) {
            message = resData.error.message;
          } else if (resData.message) {
            message = resData.message;
          }
        } else if (err.request) {
          title = "Erro de Conexão";
          message = "Não foi possível comunicar com a API. Verifique sua conexão e o servidor.";
        } else if (err.message) {
          message = err.message;
        }

        setError(message);

        if (showToastOnError) {
          Toast.show({
            type: "error",
            text1: title,
            text2: message,
          });
        }

        return null;
      } finally {
        setLoading(false);
      }
    },
    [id, showToastOnError]
  );

  const refresh = useCallback(
    async (params) => {
      setRefreshing(true);
      try {
        if (id) {
          await fetchById(id);
        } else {
          await fetchEmpilhadeiras(params);
        }
      } finally {
        setRefreshing(false);
      }
    },
    [id, fetchById, fetchEmpilhadeiras]
  );

  useEffect(() => {
    if (autoFetch) {
      if (id) {
        fetchById(id);
      } else {
        fetchEmpilhadeiras();
      }
    }
  }, [id, autoFetch, fetchById, fetchEmpilhadeiras]);

  return {
    empilhadeiras,
    quant,
    loading,
    refreshing,
    error,
    selectedEmpilhadeira,
    setSelectedEmpilhadeira,
    fetchEmpilhadeiras,
    refresh,
    fetchById,
  };
}

export default useEmpilhadeira;

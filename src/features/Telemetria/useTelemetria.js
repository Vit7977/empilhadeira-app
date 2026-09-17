import { useState, useEffect, useCallback, useRef } from "react";
import Toast from "react-native-toast-message";
import { getTelemetrias } from "./telemetria.service.js";

/**
 * Função utilitária para extrair a última telemetria registrada,
 * filtrando pela empilhadeira e ordenando decrescente por data_hora ou id.
 */
function extrairUltimaTelemetria(resposta, empilhadeiraId) {
  if (!resposta) return null;

  let lista = [];
  if (Array.isArray(resposta)) {
    lista = resposta;
  } else if (Array.isArray(resposta.data)) {
    lista = resposta.data;
  } else if (resposta.data && typeof resposta.data === "object") {
    return resposta.data;
  } else if (typeof resposta === "object" && resposta.id) {
    return resposta;
  }

  if (!lista || lista.length === 0) return null;

  // Filtra pela empilhadeira caso especificada
  if (empilhadeiraId != null) {
    const filtrados = lista.filter(
      (item) => String(item.empilhadeira) === String(empilhadeiraId)
    );
    if (filtrados.length > 0) {
      lista = filtrados;
    }
  }

  // Ordena decrescente pela data_hora mais recente ou pelo maior ID
  lista.sort((a, b) => {
    if (a.data_hora && b.data_hora) {
      return new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime();
    }
    return (b.id || 0) - (a.id || 0);
  });

  return lista[0] || null;
}

/**
 * Hook para gerenciar e receber a telemetria mais recente de uma empilhadeira em tempo real.
 * 
 * @param {Object} options
 * @param {number|string} [options.empilhadeiraId] ID da empilhadeira a ser monitorada
 * @param {number} [options.pollingInterval=3000] Intervalo em ms para checar novas telemetrias (0 para desativar)
 * @param {boolean} [options.autoFetch=true] Se true, inicia a busca no mount
 * @param {boolean} [options.showToastOnError=false] Se true, exibe toast em erros de busca
 * @param {Function} [options.onNovaTelemetria] Callback disparado quando uma nova telemetria for detectada
 */
export function useTelemetria({
  empilhadeiraId = 1,
  pollingInterval = 3000,
  autoFetch = true,
  showToastOnError = false,
  onNovaTelemetria,
} = {}) {
  const [telemetria, setTelemetria] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Guarda a referência da telemetria atual para detectar novas chegadas sem recriar timers
  const telemetriaRef = useRef(telemetria);
  telemetriaRef.current = telemetria;

  const buscarTelemetria = useCallback(
    async (isBackground = false) => {
      if (!isBackground) {
        setLoading(true);
      }
      setError(null);

      try {
        const params = empilhadeiraId ? { empilhadeira: empilhadeiraId } : {};
        const response = await getTelemetrias(params);
        const ultima = extrairUltimaTelemetria(response, empilhadeiraId);

        if (ultima) {
          const anterior = telemetriaRef.current;
          const ehNova =
            !anterior ||
            anterior.id !== ultima.id ||
            anterior.data_hora !== ultima.data_hora;

          if (ehNova) {
            setTelemetria(ultima);
            onNovaTelemetria?.(ultima);
          }
        }

        return ultima;
      } catch (err) {
        let title = "Erro na Telemetria";
        let message = "Não foi possível carregar os dados de telemetria.";

        if (err.response?.data?.message) {
          message = err.response.data.message;
        } else if (err.message) {
          message = err.message;
        }

        setError(message);

        // Só exibe Toast se configurado e não for busca em background repetitiva
        if (showToastOnError && !isBackground) {
          Toast.show({
            type: "error",
            text1: title,
            text2: message,
          });
        }

        return null;
      } finally {
        if (!isBackground) {
          setLoading(false);
        }
      }
    },
    [empilhadeiraId, showToastOnError, onNovaTelemetria]
  );

  const refreshTelemetria = useCallback(async () => {
    setRefreshing(true);
    try {
      await buscarTelemetria(false);
    } finally {
      setRefreshing(false);
    }
  }, [buscarTelemetria]);

  // Efeito para busca inicial e polling em tempo real
  useEffect(() => {
    let ativo = true;

    if (autoFetch) {
      buscarTelemetria(false);
    }

    let timer = null;
    if (pollingInterval > 0) {
      timer = setInterval(() => {
        if (ativo) {
          buscarTelemetria(true);
        }
      }, pollingInterval);
    }

    return () => {
      ativo = false;
      if (timer) clearInterval(timer);
    };
  }, [empilhadeiraId, pollingInterval, autoFetch, buscarTelemetria]);

  return {
    telemetria,
    loading,
    refreshing,
    error,
    refreshTelemetria,
    buscarTelemetria,
  };
}

export default useTelemetria;


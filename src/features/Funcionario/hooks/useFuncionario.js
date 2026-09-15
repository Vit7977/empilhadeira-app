import { useState, useEffect, useCallback } from "react";
import { getFuncionarios } from "../funcionario.service.js";

export function useFuncionario() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFuncionarios = useCallback(async () => {
    try {
      const data = await getFuncionarios();

      console.log("Funcionários recebidos pela API:", data);

      if (Array.isArray(data)) {
        setFuncionarios(data);
      } else if (Array.isArray(data?.data)) {
        setFuncionarios(data.data);
      } else if (Array.isArray(data?.funcionarios)) {
        setFuncionarios(data.funcionarios);
      } else {
        console.error("Formato inesperado dos funcionários:", data);
        setFuncionarios([]);
      }
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
      setFuncionarios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFuncionarios();
  }, [fetchFuncionarios]);

  return {
    funcionarios,
    loading,
    refreshFuncionarios: fetchFuncionarios,
  };
}

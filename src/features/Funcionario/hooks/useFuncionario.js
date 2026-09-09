import { useState, useEffect } from "react";
import { getFuncionarios } from "../funcionario.service.js";

export function useFuncionario() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFuncionarios = async () => {
      try {
        const data = await getFuncionarios();

        console.log("Funcionários recebidos pela API:", data);

        // Se a API já retornar um array
        if (Array.isArray(data)) {
          setFuncionarios(data);
        }

        // Se a API retornar { data: [...] }
        else if (Array.isArray(data?.data)) {
          setFuncionarios(data.data);
        }

        // Se a API retornar { funcionarios: [...] }
        else if (Array.isArray(data?.funcionarios)) {
          setFuncionarios(data.funcionarios);
        }

        // Caso não seja nenhum dos formatos esperados
        else {
          console.error(
            "Formato inesperado dos funcionários:",
            data
          );

          setFuncionarios([]);
        }
      } catch (error) {
        console.error(
          "Erro ao buscar funcionários:",
          error
        );

        setFuncionarios([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFuncionarios();
  }, []);

  return {
    funcionarios,
    loading,
  };
}

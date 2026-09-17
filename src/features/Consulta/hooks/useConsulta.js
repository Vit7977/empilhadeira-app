import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getUsuarios,
  getFuncionarios,
  getTelemetrias,
  getEmpilhadeiras,
} from "../consulta.service.js";

export const CONSULTA_TIPOS = [
  { id: "usuarios", label: "Usuários", icon: "account-group" },
  { id: "funcionarios", label: "Funcionários", icon: "badge-account-horizontal" },
  { id: "telemetrias", label: "Telemetrias", icon: "table" },
  { id: "empilhadeiras", label: "Empilhadeiras", icon: "forklift" },
];

export function useConsulta() {
  const [tipoConsulta, setTipoConsulta] = useState("usuarios");
  const [data, setData] = useState([]);
  const [funcionariosList, setFuncionariosList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Cria um mapa rápido de id -> funcionário para enriquecer os dados de Usuários
  const funcionariosMap = useMemo(() => {
    const map = {};
    funcionariosList.forEach((f) => {
      if (f && f.id) {
        map[f.id] = f;
      }
    });
    return map;
  }, [funcionariosList]);

  // Carrega a lista de funcionários em segundo plano se necessário
  const ensureFuncionarios = useCallback(async () => {
    if (funcionariosList.length > 0) return;
    try {
      const resp = await getFuncionarios();
      const list = Array.isArray(resp) ? resp : resp?.data || [];
      setFuncionariosList(list);
    } catch (err) {
      console.warn("Não foi possível pré-carregar funcionários:", err);
    }
  }, [funcionariosList.length]);

  const fetchData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        let result;
        switch (tipoConsulta) {
          case "usuarios":
            await ensureFuncionarios();
            result = await getUsuarios();
            break;
          case "funcionarios":
            result = await getFuncionarios();
            // Atualiza também a lista em cache
            if (Array.isArray(result?.data)) {
              setFuncionariosList(result.data);
            } else if (Array.isArray(result)) {
              setFuncionariosList(result);
            }
            break;
          case "telemetrias":
            result = await getTelemetrias({ limit: 100 });
            break;
          case "empilhadeiras":
            result = await getEmpilhadeiras();
            break;
          default:
            result = [];
        }

        const items = Array.isArray(result)
          ? result
          : Array.isArray(result?.data)
          ? result.data
          : [];

        setData(items);
      } catch (err) {
        console.error("Erro ao buscar dados de consulta:", err);
        setError(
          err.response?.data?.message ||
            "Não foi possível carregar os dados. Verifique a conexão."
        );
        setData([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [tipoConsulta, ensureFuncionarios]
  );

  useEffect(() => {
    setSearchTerm("");
    fetchData();
  }, [tipoConsulta, fetchData]);

  // Filtro de busca em tempo real
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase().trim();

    return data.filter((item) => {
      if (!item) return false;

      switch (tipoConsulta) {
        case "usuarios": {
          const email = String(item.email || "").toLowerCase();
          const nivel = String(item.nivel_acesso || "").toLowerCase();
          const id = String(item.id || "");
          const funcNome = String(
            funcionariosMap[item.funcionario]?.nome || ""
          ).toLowerCase();
          return (
            email.includes(term) ||
            nivel.includes(term) ||
            id.includes(term) ||
            funcNome.includes(term)
          );
        }

        case "funcionarios": {
          const nome = String(item.nome || "").toLowerCase();
          const cargo = String(item.cargo || "").toLowerCase();
          const cpf = String(item.cpf || "").toLowerCase();
          const telefone = String(item.telefone || "").toLowerCase();
          const id = String(item.id || "");
          return (
            nome.includes(term) ||
            cargo.includes(term) ||
            cpf.includes(term) ||
            telefone.includes(term) ||
            id.includes(term)
          );
        }

        case "telemetrias": {
          const id = String(item.id || "");
          const emp = String(item.empilhadeira || "");
          const sensor = String(item.sensor_linha || "").toLowerCase();
          const dataHora = String(item.data_hora || "").toLowerCase();
          return (
            id.includes(term) ||
            emp.includes(term) ||
            sensor.includes(term) ||
            dataHora.includes(term)
          );
        }

        case "empilhadeiras": {
          const codigo = String(item.codigo || "").toLowerCase();
          const status = String(item.status || "").toLowerCase();
          const id = String(item.id || "");
          return (
            codigo.includes(term) ||
            status.includes(term) ||
            id.includes(term)
          );
        }

        default:
          return true;
      }
    });
  }, [data, searchTerm, tipoConsulta, funcionariosMap]);

  return {
    tipoConsulta,
    setTipoConsulta,
    data,
    filteredData,
    loading,
    refreshing,
    error,
    searchTerm,
    setSearchTerm,
    refresh: () => fetchData(true),
    funcionariosMap,
  };
}


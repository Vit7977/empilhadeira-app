import { useState } from "react";
import Toast from "react-native-toast-message";
import { createEmpilhadeira } from "../empilhadeira.service.js";

export function useCadastro({ navigation } = {}) {
  const [codigo, setCodigo] = useState("");
  const [status, setStatus] = useState("disponivel");
  const [loading, setLoading] = useState(false);

  // =========================
  // VALIDAÇÕES
  // =========================

  const codigoInvalido = !codigo || codigo.trim().length === 0;

  const statusValidos = ["disponivel", "operando", "parada"];
  const statusInvalido = !status || !statusValidos.includes(status);

  const formularioInvalido = codigoInvalido || statusInvalido;

  // =========================
  // CADASTRAR
  // =========================

  const handleCadastro = async () => {
    if (formularioInvalido || loading) {
      Toast.show({
        type: "info",
        text1: "Aviso",
        text2: "Preencha o código da empilhadeira corretamente.",
      });
      return;
    }

    setLoading(true);

    const empilhadeira = {
      codigo: codigo.trim().toUpperCase(),
      status,
    };

    try {
      const response = await createEmpilhadeira(empilhadeira);

      Toast.show({
        type: "success",
        text1: "Sucesso",
        text2: response?.message || "Empilhadeira cadastrada com sucesso!",
      });

      // Limpa o formulário
      setCodigo("");
      setStatus("disponivel");

      // Volta para o Dashboard
      setTimeout(() => {
        navigation?.navigate?.("Dashboard");
      }, 1200);
    } catch (error) {
      console.error("Erro ao cadastrar empilhadeira:", error);

      let title = "Erro no Cadastro";
      let message = "Não foi possível cadastrar a empilhadeira.";

      if (error.response?.data) {
        const resData = error.response.data;

        if (resData.message) {
          title = resData.message;
          message = resData.message;
        }

        if (
          resData.error &&
          typeof resData.error === "object" &&
          resData.error.message
        ) {
          message = resData.error.message;
        } else if (
          typeof resData.error === "string" &&
          resData.error.trim()
        ) {
          message = resData.error;
        }
      } else if (error.request) {
        title = "Erro de Conexão";
        message =
          "Não foi possível comunicar com a API. Verifique se o servidor está funcionando.";
      } else if (error.message) {
        message = error.message;
      }

      Toast.show({
        type: "error",
        text1: title,
        text2: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    codigo,
    setCodigo,
    status,
    setStatus,
    loading,
    codigoInvalido,
    statusInvalido,
    formularioInvalido,
    handleCadastro,
  };
}


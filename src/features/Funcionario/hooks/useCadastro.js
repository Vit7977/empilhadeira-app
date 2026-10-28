
import { useState } from "react";
import Toast from "react-native-toast-message";
import { createFuncionario } from "../funcionario.service.js";

// Confere os dígitos verificadores do CPF
const cpfValido = (numeros) => {
  if (numeros.length !== 11 || /^(\d)\1{10}$/.test(numeros)) return false;

  const digito = (tamanho) => {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) {
      soma += Number(numeros[i]) * (tamanho + 1 - i);
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  return digito(9) === Number(numeros[9]) && digito(10) === Number(numeros[10]);
};

// Confere se DD/MM/AAAA é uma data que existe e não está no futuro
const dataValida = (texto) => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) return false;

  const [dia, mes, ano] = texto.split("/").map(Number);
  const data = new Date(ano, mes - 1, dia);

  return (
    data.getFullYear() === ano &&
    data.getMonth() === mes - 1 &&
    data.getDate() === dia &&
    ano >= 1900 &&
    data <= new Date()
  );
};

export function useCadastro({ navigation } = {}) {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNasc, setDataNasc] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cargo, setCargo] = useState("operador");

  const [loading, setLoading] = useState(false);

  // =========================
  // VALIDAÇÕES
  // =========================

  const nomeInvalido =
    !nome || nome.trim().length < 3;

  const cpfNumeros = cpf.replace(/\D/g, "");

  const cpfInvalido =
    !cpfValido(cpfNumeros);

  const dataNascInvalida =
    !dataNasc ||
    !dataValida(dataNasc);

  const telefoneNumeros =
    telefone.replace(/\D/g, "");

  const telefoneInvalido =
    !telefone ||
    !/^\d{10,11}$/.test(telefoneNumeros);

  const cargosValidos = [
    "operador",
    "supervisor",
    "tecnico",
    "gerente",
  ];

  const cargoInvalido =
    !cargo ||
    !cargosValidos.includes(cargo);

  const formularioInvalido =
    nomeInvalido ||
    cpfInvalido ||
    dataNascInvalida ||
    telefoneInvalido ||
    cargoInvalido;

  // =========================
  // CADASTRAR
  // =========================

  const handleCadastro = async () => {
    if (formularioInvalido || loading) {
      Toast.show({
        type: "info",
        text1: "Aviso",
        text2:
          "Preencha todos os campos corretamente antes de cadastrar.",
      });

      return;
    }

    setLoading(true);

    /*
     * Converte:
     *
     * DD/MM/AAAA
     *
     * para:
     *
     * AAAA-MM-DD
     *
     * formato aceito pelo MySQL.
     */

    const dataFormatada = dataNasc
      .split("/")
      .reverse()
      .join("-");

    const funcionario = {
      nome: nome.trim(),

      cpf: cpfNumeros,

      data_nasc: dataFormatada,

      telefone: telefoneNumeros,

      cargo: cargo,
    };

    try {
      const response =
        await createFuncionario(funcionario);

      Toast.show({
        type: "success",
        text1: "Sucesso",
        text2:
          response?.message ||
          "Funcionário cadastrado com sucesso!",
      });

      // Limpa o formulário
      setNome("");
      setCpf("");
      setDataNasc("");
      setTelefone("");
      setCargo("operador");

      // Volta para o Dashboard
      setTimeout(() => {
        navigation?.navigate?.("Dashboard");
      }, 1200);

    } catch (error) {
      console.error(
        "Erro ao cadastrar funcionário:",
        error
      );

      let title = "Erro no Cadastro";

      let message =
        "Não foi possível cadastrar o funcionário.";

      // =========================
      // ERRO DA API
      // =========================

      if (error.response?.data) {
        const resData =
          error.response.data;

        if (resData.message) {
          title = resData.message;
          message = resData.message;
        }

        if (
          resData.error &&
          typeof resData.error === "object" &&
          resData.error.message
        ) {
          message =
            resData.error.message;
        } else if (
          typeof resData.error === "string" &&
          resData.error.trim()
        ) {
          message = resData.error;
        }
      }

      // =========================
      // ERRO DE CONEXÃO
      // =========================

      else if (error.request) {
        title = "Erro de Conexão";

        message =
          "Não foi possível comunicar com a API. Verifique se o servidor está funcionando.";
      }

      // =========================
      // OUTRO ERRO
      // =========================

      else if (error.message) {
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
    nome,
    setNome,

    cpf,
    setCpf,

    dataNasc,
    setDataNasc,

    telefone,
    setTelefone,

    cargo,
    setCargo,

    loading,

    nomeInvalido,
    cpfInvalido,
    dataNascInvalida,
    telefoneInvalido,
    cargoInvalido,

    formularioInvalido,

    handleCadastro,
  };
}
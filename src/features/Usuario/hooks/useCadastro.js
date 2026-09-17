import { useState } from "react";
import Toast from "react-native-toast-message";
import { createUsuario } from "../usuario.service.js";
import { saveStoredUser } from "../usuario.storage.js";

export function useCadastro({ navigation } = {}) {
  const [funcionario, setFuncionario] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nivelAcesso, setNivelAcesso] = useState("operador");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  const funcionarioInvalido = !!funcionario && isNaN(Number(funcionario));
  const emailInvalido = !!email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const senhaInvalida = !!senha && senha.length < 8;
  const nivelAcessoInvalido = !nivelAcesso;

  const formularioInvalido =
    !funcionario ||
    !email ||
    !senha ||
    !nivelAcesso ||
    funcionarioInvalido ||
    emailInvalido ||
    senhaInvalida ||
    nivelAcessoInvalido;

  const handleCadastro = async () => {
    if (formularioInvalido) {
      Toast.show({
        type: "info",
        text1: "Aviso",
        text2: "Preencha todos os campos corretamente antes de cadastrar.",
      });
      return;
    }

    setLoading(true);

    const usuario = {
      funcionario: Number(funcionario),
      email: email.trim().toLowerCase(),
      senha,
      nivel_acesso: nivelAcesso.trim().toLowerCase(),
    };

    try {
      const response = await createUsuario(usuario);

      saveStoredUser({
        funcionario: usuario.funcionario,
        email: usuario.email,
        nivel_acesso: usuario.nivel_acesso,
      });

      Toast.show({
        type: "success",
        text1: "Sucesso",
        text2: response?.message || "Usuário cadastrado com sucesso!",
      });

      setTimeout(() => {
        navigation?.navigate?.("Login");
      }, 1200);
    } catch (error) {
      let title = "Erro no Cadastro";
      let message = "Não foi possível conectar ou processar a solicitação.";

      if (error.response?.data) {
        const resData = error.response.data;

        if (resData.message) {
          title = resData.message;
        }

        if (resData.error && typeof resData.error === "object" && resData.error.message) {
          message = resData.error.message;
        } else if (typeof resData.error === "string" && resData.error.trim()) {
          message = resData.error;
        } else if (resData.message) {
          message = resData.message;
        }
      } else if (error.request) {
        title = "Erro de Conexão";
        message = "Não foi possível comunicar com a API. Verifique sua conexão e o servidor.";
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
    funcionario,
    setFuncionario,
    email,
    setEmail,
    senha,
    setSenha,
    nivelAcesso,
    setNivelAcesso,
    mostrarSenha,
    toggleMostrarSenha: () => setMostrarSenha((prev) => !prev),
    loading,
    funcionarioInvalido,
    emailInvalido,
    senhaInvalida,
    formularioInvalido,
    handleCadastro,
  };
}

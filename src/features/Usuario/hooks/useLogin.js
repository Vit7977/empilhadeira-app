import { useState, useEffect } from "react";
import Toast from "react-native-toast-message";
import { loginUsuario } from "../usuario.service.js";
import { getStoredUser, saveStoredUser } from "../usuario.storage.js";

export function useLogin({ onLoginSuccess } = {}) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    const savedUser = getStoredUser();
    if (savedUser) {
      setEmail(savedUser.email ?? "");
    }
  }, []);

  const emailInvalido = !!email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const senhaInvalida = !!senha && senha.length < 8;
  const formularioInvalido = !email || !senha || emailInvalido || senhaInvalida;

  const handleLogin = async () => {
    if (formularioInvalido) {
      Toast.show({
        type: "info",
        text1: "Aviso",
        text2: "Preencha o e-mail e a senha corretamente (mínimo 8 caracteres na senha).",
      });
      return;
    }

    setLoading(true);
    setLoginError("");

    const credenciais = {
      email: email.trim().toLowerCase(),
      senha,
    };

    try {
      const response = await loginUsuario(credenciais);
      const dadosUsuario = response?.data || {
        email: credenciais.email,
        nome: credenciais.email.split("@")[0],
      };

      saveStoredUser(dadosUsuario);

      Toast.show({
        type: "success",
        text1: "Bem-vindo!",
        text2: response?.message || "Login realizado com sucesso!",
      });

      onLoginSuccess?.(dadosUsuario);
    } catch (error) {
      let title = "Falha no Login";
      let message = "E-mail ou senha inválidos.";

      if (error.response?.data) {
        const resData = error.response.data;

        if (typeof resData.error === "string" && resData.error.trim()) {
          message = resData.error;
        } else if (resData.error && typeof resData.error === "object" && resData.error.message) {
          message = resData.error.message;
          if (resData.message && resData.message !== resData.error.message) {
            title = resData.message;
          }
        } else if (resData.message) {
          message = resData.message;
        }
      } else if (error.request) {
        title = "Erro de Conexão";
        message = "Não foi possível comunicar com a API. Verifique sua conexão e o servidor.";
      } else if (error.message) {
        message = error.message;
      }

      setLoginError(message);

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
    email,
    setEmail: (val) => {
      setEmail(val);
      setLoginError("");
    },
    senha,
    setSenha: (val) => {
      setSenha(val);
      setLoginError("");
    },
    mostrarSenha,
    toggleMostrarSenha: () => setMostrarSenha((prev) => !prev),
    loading,
    loginError,
    emailInvalido,
    senhaInvalida,
    formularioInvalido,
    handleLogin,
  };
}

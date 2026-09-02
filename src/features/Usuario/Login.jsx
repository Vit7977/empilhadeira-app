import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Text,
  TextInput,
  Button,
  HelperText,
  useTheme,
} from "react-native-paper";

export const getStoredUser = () => {
  if (typeof globalThis === "undefined" || !("localStorage" in globalThis)) {
    return null;
  }

  try {
    const storedUser = globalThis.localStorage.getItem("usuarioLogado");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

export const saveStoredUser = (usuario) => {
  if (typeof globalThis !== "undefined" && "localStorage" in globalThis) {
    globalThis.localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
  }
};

export default function Login({ onLoginSuccess, navigation }) {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [inputFocus, setInputFocus] = useState({
    input: "",
    focus: false,
  });
  const [textHover, setTextHover] = useState({
    text: "",
    hover: false,
  });
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    const savedUser = getStoredUser();

    if (savedUser) {
      setEmail(savedUser.email ?? "");
      setSenha(savedUser.senha ?? "");
    }
  }, []);

  const emailInvalido = !!email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function handleLogin() {
    if (!email || !senha || emailInvalido) {
      return;
    }

    setLoading(true);
    setLoginError("");

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const usuarioSalvo = getStoredUser();
    const emailDigitado = email.trim().toLowerCase();
    const senhaDigitada = senha;

    const credenciaisValidas =
      usuarioSalvo &&
      usuarioSalvo.email &&
      usuarioSalvo.senha &&
      usuarioSalvo.email.toLowerCase() === emailDigitado &&
      usuarioSalvo.senha === senhaDigitada;

    if (!credenciaisValidas) {
      setLoginError("E-mail ou senha inválidos.");
      setLoading(false);
      return;
    }

    const usuario = { email: usuarioSalvo.email, senha: usuarioSalvo.senha };

    setLoading(false);
    onLoginSuccess?.(usuario);
  }

  const senhaInvalida =
  !!senha && (senha.length <= 8 || senha.length >= 255);

  const formularioInvalido =
  !email || !senha || emailInvalido || senhaInvalida;

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.form}>
        <Text variant="headlineLarge" style={styles.title}>
          Entrar
        </Text>

        <Text variant="bodyLarge" style={styles.subtitle}>
          Entre na sua conta para continuar
        </Text>

        <TextInput
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          outlineColor="gray"
          activeOutlineColor={theme.colors.primary}
          onFocus={() =>
            setInputFocus({
              input: "E-mail",
              focus: true,
            })
          }
          onBlur={() =>
            setInputFocus({
              input: "",
              focus: false,
            })
          }
          left={
            <TextInput.Icon
              icon="email-outline"
              color={
                inputFocus.focus && inputFocus.input === "E-mail"
                  ? theme.colors.primary
                  : "gray"
              }
            />
          }
        />

        <HelperText type="error" visible={emailInvalido}>
          Digite um e-mail válido.
        </HelperText>

        <TextInput
          label="Senha"
          value={senha}
          onChangeText={setSenha}
          mode="outlined"
          secureTextEntry={!mostrarSenha}
          maxLength={254}
          autoCapitalize="none"
          outlineColor="gray"
          activeOutlineColor={theme.colors.primary}
          onFocus={() =>
            setInputFocus({
              input: "Senha",
              focus: true,
            })
          }
          onBlur={() =>
            setInputFocus({
              input: "",
              focus: false,
            })
          }
          left={
            <TextInput.Icon
              icon="lock-outline"
              color={
                inputFocus.focus && inputFocus.input === "Senha"
                  ? theme.colors.primary
                  : "gray"
              }
            />
          }
          right={
            <TextInput.Icon
              icon={mostrarSenha ? "eye-off" : "eye"}
              onPress={() => setMostrarSenha((prev) => !prev)}
              forceTextInputFocus={false}
            />
          }
        />

        <HelperText type="error" visible={senhaInvalida}>
          A senha deve ter entre 9 e 254 caracteres.
        </HelperText>

        <HelperText type="error" visible={!!loginError}>
          {loginError}
        </HelperText>

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={formularioInvalido || loading}
          buttonColor={theme.colors.primary}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Entrar
        </Button>

        <Button
          mode="text"
          textColor={
            textHover.hover && textHover.text === "Esqueci minha senha"
              ? theme.colors.primary
              : theme.colors.onSurfaceVariant ?? theme.colors.onSurface
          }
          onPress={() => console.log("Esqueci minha senha")}
          onMouseEnter={() =>
            setTextHover({ text: "Esqueci minha senha", hover: true })
          }
          onMouseLeave={() => setTextHover({ text: "", hover: false })}
        >
          Esqueci minha senha
        </Button>

        <Button
          mode="text"
          textColor={
            textHover.hover && textHover.text === "Cadastre-se"
              ? theme.colors.primary
              : theme.colors.onSurfaceVariant ?? theme.colors.onSurface
          }
          onPress={() => navigation?.navigate?.("Cadastro")}
          onMouseEnter={() => setTextHover({ text: "Cadastre-se", hover: true })}
          onMouseLeave={() => setTextHover({ text: "", hover: false })}
        >
          Não tem uma conta? Cadastre-se
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },

  form: {
    gap: 4,
  },

  title: {
    textAlign: "center",
    marginBottom: 4,
  },

  subtitle: {
    textAlign: "center",
    marginBottom: 24,
  },

  button: {
    marginTop: 16,
    borderRadius: 8,
  },

  buttonContent: {
    height: 48,
  },
});

import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Text,
  TextInput,
  Button,
  HelperText,
  useTheme,
} from "react-native-paper";

export default function Cadastro() {
  const theme = useTheme();
  const [nome, setNome] = useState("");
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

  const nomeInvalido = !!nome && nome.trim().length < 2;
  const emailInvalido = !!email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const senhaInvalida =
  !!senha && (senha.length <= 8 || senha.length >= 255);

  async function handleCadastro() {
    if (!nome || !email || !senha || nomeInvalido || emailInvalido || senhaInvalida) {
      return;
    }

    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log("Cadastro:", {
      nome,
      email,
      senha,
    });

    if (typeof globalThis !== "undefined" && "localStorage" in globalThis) {
      globalThis.localStorage.setItem(
        "usuarioLogado",
        JSON.stringify({ nome, email, senha }),
      );
    }

    setLoading(false);
  }

  const formularioInvalido =
    !nome || !email || !senha || nomeInvalido || emailInvalido || senhaInvalida;

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.form}>
        <Text variant="headlineLarge" style={styles.title}>
          Cadastrar
        </Text>

        <Text variant="bodyLarge" style={styles.subtitle}>
          Cadastre-se para acessar o aplicativo
        </Text>

        <TextInput
          label="Nome"
          value={nome}
          onChangeText={setNome}
          mode="outlined"
          keyboardType="default"
          autoCapitalize="words"
          autoComplete="name"
          outlineColor="gray"
          activeOutlineColor={theme.colors.primary}
          onFocus={() =>
            setInputFocus({
              input: "Nome",
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
              icon="account-outline"
              color={
                inputFocus.focus && inputFocus.input === "Nome"
                  ? theme.colors.primary
                  : "gray"
              }
            />
          }
        />

        <HelperText type="error" visible={nomeInvalido}>
          Digite um nome com pelo menos 2 letras.
        </HelperText>

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


        <Button
          mode="contained"
          onPress={handleCadastro}
          loading={loading}
          disabled={formularioInvalido || loading}
          buttonColor={theme.colors.primary}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Cadastrar
        </Button>

        <Button
          mode="text"
          textColor={
            textHover.hover && textHover.text === "Já tem conta"
              ? theme.colors.primary
              : theme.colors.onSurfaceVariant ?? theme.colors.onSurface
          }
          onPress={() => console.log("Já tem conta")}
          onMouseEnter={() => setTextHover({ text: "Já tem conta", hover: true })}
          onMouseLeave={() => setTextHover({ text: "", hover: false })}
        >
          Já tem conta? Entrar
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

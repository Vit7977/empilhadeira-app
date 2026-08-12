import React, { useState } from "react";
import { StyleSheet, View, useColorScheme } from "react-native";
import {
  Text,
  TextInput,
  Button,
  HelperText,
  useTheme,
} from "react-native-paper";

export default function Login() {
  const theme = useTheme();
  const [email, setEmail] = useState(localStorage.getItem("usuarioLogado") ? JSON.parse(localStorage.getItem("usuarioLogado")).email : "");
  const [senha, setSenha] = useState(localStorage.getItem("usuarioLogado") ? JSON.parse(localStorage.getItem("usuarioLogado")).senha : "");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailInvalido = email.length > 0 && !email.includes("@");

  async function handleLogin() {
    if (!email || !senha || emailInvalido) {
      return;
    }

    setLoading(true);

    // Simulando uma requisição para uma API
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log("Login:", {
      email,
      senha,
    });

    localStorage.setItem("usuarioLogado", JSON.stringify({ email, senha }));

    setLoading(false);
  }

  const formularioInvalido = !email || !senha || emailInvalido;

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
          activeOutlineColor="#ffd900ff"
          left={<TextInput.Icon icon="email-outline" />}
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
          autoCapitalize="none"
          outlineColor="gray"
          activeOutlineColor="#ffd900ff"
          left={<TextInput.Icon icon="lock-outline" />}
          right={
            <TextInput.Icon
              icon={mostrarSenha ? "eye-off" : "eye"}
              onPress={() => setMostrarSenha(!mostrarSenha)}
            />
          }
        />

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={formularioInvalido || loading}
          buttonColor={theme.colors.primary}
          style={[styles.button]}
          contentStyle={styles.buttonContent}
        >
          Entrar
        </Button>

        <Button
          mode="text"
          textColor={theme.colors.primary}
          onPress={() => console.log("Esqueci minha senha")}
        >
          Esqueci minha senha
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
    gap: 8,
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

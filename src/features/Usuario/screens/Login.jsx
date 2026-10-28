import React, { useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import {
  Text,
  TextInput,
  Button,
  HelperText,
  Icon,
  useTheme,
} from "react-native-paper";
import { useLogin } from "../hooks/useLogin";
import {
  useResponsive,
  centralizado,
} from "../../../components/responsive";

export { getStoredUser, saveStoredUser } from "../usuario.storage.js";

export default function Login({ onLoginSuccess, navigation }) {
  const theme = useTheme();
  const { espacamento } = useResponsive();
  const {
    email,
    setEmail,
    senha,
    setSenha,
    mostrarSenha,
    toggleMostrarSenha,
    loading,
    loginError,
    emailInvalido,
    senhaInvalida,
    formularioInvalido,
    handleLogin,
  } = useLogin({ onLoginSuccess });

  const [inputFocus, setInputFocus] = useState({
    input: "",
    focus: false,
  });
  const [textHover, setTextHover] = useState({
    text: "",
    hover: false,
  });

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={[styles.container, { padding: espacamento }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.form, centralizado(420)]}>
        <View
          style={[
            styles.logo,
            { backgroundColor: theme.colors.secondaryContainer },
          ]}
        >
          <Icon source="forklift" size={44} color={theme.colors.primary} />
        </View>

        <Text variant="headlineLarge" style={styles.title}>
          Entrar
        </Text>

        <Text
          variant="bodyLarge"
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
        >
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
          returnKeyType="go"
          onSubmitEditing={() => !loading && handleLogin()}
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
              onPress={toggleMostrarSenha}
              forceTextInputFocus={false}
            />
          }
        />

        <HelperText type="error" visible={senhaInvalida}>
          A senha deve ter no mínimo 8 caracteres.
        </HelperText>

        {!!loginError && (
          <HelperText type="error" visible={true}>
            {loginError}
          </HelperText>
        )}

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

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
  },

  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  form: {
    gap: 4,
  },

  title: {
    textAlign: "center",
    fontWeight: "bold",
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

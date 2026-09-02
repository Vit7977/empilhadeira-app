import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Text,
  TextInput,
  Button,
  HelperText,
  RadioButton,
  useTheme,
} from "react-native-paper";
import { useCadastro } from "../hooks/useCadastro";

export default function Cadastro({ navigation }) {
  const theme = useTheme();
  const {
    funcionario,
    setFuncionario,
    email,
    setEmail,
    senha,
    setSenha,
    nivelAcesso,
    setNivelAcesso,
    mostrarSenha,
    toggleMostrarSenha,
    loading,
    funcionarioInvalido,
    emailInvalido,
    senhaInvalida,
    formularioInvalido,
    handleCadastro,
  } = useCadastro({ navigation });

  const [inputFocus, setInputFocus] = useState({
    input: "",
    focus: false,
  });
  const [textHover, setTextHover] = useState({
    text: "",
    hover: false,
  });

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.form}>
        <TextInput
          label="Funcionário (ID)"
          value={funcionario}
          onChangeText={setFuncionario}
          mode="outlined"
          keyboardType="numeric"
          outlineColor="gray"
          activeOutlineColor={theme.colors.primary}
          onFocus={() =>
            setInputFocus({
              input: "Funcionario",
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
              icon="badge-account-horizontal-outline"
              color={
                inputFocus.focus && inputFocus.input === "Funcionario"
                  ? theme.colors.primary
                  : "gray"
              }
            />
          }
        />

        <HelperText type="error" visible={funcionarioInvalido}>
          O ID do funcionário deve ser um número válido.
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

        <Text
          variant="labelMedium"
          style={[styles.fieldLabel, { color: theme.colors.onSurfaceVariant }]}
        >
          NÍVEL DE ACESSO
        </Text>

        <View
          style={[
            styles.radioContainer,
            {
              borderColor: "gray",
              backgroundColor: theme.colors.surface,
            },
          ]}
        >
          <RadioButton.Group
            onValueChange={setNivelAcesso}
            value={nivelAcesso}
          >
            <RadioButton.Item
              label="Operador"
              value="operador"
              position="leading"
              color={theme.colors.primary}
              style={styles.radioItem}
              labelStyle={styles.radioLabel}
            />
            <RadioButton.Item
              label="Supervisor"
              value="supervisor"
              position="leading"
              color={theme.colors.primary}
              style={styles.radioItem}
              labelStyle={styles.radioLabel}
            />
            <RadioButton.Item
              label="Admin"
              value="admin"
              position="leading"
              color={theme.colors.primary}
              style={styles.radioItem}
              labelStyle={styles.radioLabel}
            />
          </RadioButton.Group>
        </View>

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
              onPress={toggleMostrarSenha}
              forceTextInputFocus={false}
            />
          }
        />

        <HelperText type="error" visible={senhaInvalida}>
          A senha deve ter no mínimo 8 caracteres.
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
          onPress={() => navigation?.navigate?.("Login")}
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
    gap: 0,
  },

  title: {
    textAlign: "center",
    marginBottom: 4,
  },

  subtitle: {
    textAlign: "center",
    marginBottom: 24,
  },

  fieldLabel: {
    marginTop: 4,
    marginBottom: 2,
    fontWeight: "600",
  },

  radioContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    overflow: "hidden",
  },

  radioItem: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },

  radioLabel: {
    textAlign: "left",
    fontSize: 15,
  },

  button: {
    borderRadius: 8,
  },

  buttonContent: {
    height: 48,
  },
});

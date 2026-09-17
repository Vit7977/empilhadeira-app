import React, { useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import {
  Text,
  TextInput,
  Button,
  HelperText,
  RadioButton,
  useTheme,
} from "react-native-paper";
import { useCadastro } from "../hooks/useCadastro.js";

export default function CadastroEmpilhadeira({ navigation }) {
  const theme = useTheme();

  const {
    codigo,
    setCodigo,
    status,
    setStatus,
    loading,
    codigoInvalido,
    formularioInvalido,
    handleCadastro,
  } = useCadastro({ navigation });

  const [inputFocus, setInputFocus] = useState({
    input: "",
    focus: false,
  });

  const handleFocus = (input) => {
    setInputFocus({
      input,
      focus: true,
    });
  };

  const handleBlur = () => {
    setInputFocus({
      input: "",
      focus: false,
    });
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        {/* =========================
            CÓDIGO DA EMPILHADEIRA
        ========================= */}
        <TextInput
          label="Código da empilhadeira"
          value={codigo}
          onChangeText={(text) => setCodigo(text.toUpperCase())}
          placeholder="Ex: EMP-001"
          mode="outlined"
          autoCapitalize="characters"
          onFocus={() => handleFocus("Codigo")}
          onBlur={handleBlur}
          style={styles.input}
          outlineColor={
            inputFocus.input === "Codigo" && inputFocus.focus
              ? theme.colors.primary
              : theme.colors.outline
          }
          activeOutlineColor={theme.colors.primary}
          error={codigoInvalido && codigo.length > 0}
          left={
            <TextInput.Icon
              icon="forklift"
              color={
                inputFocus.input === "Codigo" && inputFocus.focus
                  ? theme.colors.primary
                  : theme.colors.onSurfaceVariant
              }
            />
          }
        />

        <HelperText
          type="error"
          visible={codigoInvalido && codigo.length > 0}
        >
          O código da empilhadeira é obrigatório.
        </HelperText>

        {/* =========================
            STATUS
        ========================= */}
        <Text
          variant="titleMedium"
          style={[
            styles.label,
            {
              color: theme.colors.onBackground,
            },
          ]}
        >
          Status
        </Text>

        <RadioButton.Group
          onValueChange={(value) => setStatus(value)}
          value={status}
        >
          <View style={styles.radioRow}>
            <RadioButton.Android
              value="disponivel"
              color={theme.colors.primary}
              uncheckedColor={theme.colors.onSurfaceVariant}
            />
            <Text
              style={{
                color: theme.colors.onBackground,
              }}
            >
              Disponível
            </Text>
          </View>

          <View style={styles.radioRow}>
            <RadioButton.Android
              value="operando"
              color={theme.colors.primary}
              uncheckedColor={theme.colors.onSurfaceVariant}
            />
            <Text
              style={{
                color: theme.colors.onBackground,
              }}
            >
              Operando
            </Text>
          </View>

          <View style={styles.radioRow}>
            <RadioButton.Android
              value="parada"
              color={theme.colors.primary}
              uncheckedColor={theme.colors.onSurfaceVariant}
            />
            <Text
              style={{
                color: theme.colors.onBackground,
              }}
            >
              Parada
            </Text>
          </View>
        </RadioButton.Group>

        {/* =========================
            BOTÃO
        ========================= */}
        <Button
          mode="contained"
          onPress={handleCadastro}
          loading={loading}
          disabled={formularioInvalido || loading}
          buttonColor={theme.colors.primary}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Cadastrar Empilhadeira
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },

  container: {
    flex: 1,
    padding: 25,
    justifyContent: "center",
  },

  input: {
    marginBottom: 2,
  },

  label: {
    marginTop: 10,
    marginBottom: 5,
    fontWeight: "bold",
  },

  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 1,
  },

  button: {
    marginTop: 15,
    borderRadius: 8,
  },

  buttonContent: {
    height: 50,
  },
});

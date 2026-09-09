import { StyleSheet, View, ScrollView } from "react-native";
import {
  Text,
  TextInput,
  Button,
  HelperText,
  RadioButton,
  useTheme,
} from "react-native-paper";

import { useState } from "react";
import { useCadastro } from "../hooks/useCadastro";

export default function CadastroFuncionario({ navigation }) {
  const theme = useTheme();

  const {
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

  // =========================
  // CPF
  // =========================

  const handleCpfChange = (valor) => {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);

    let formatado = numeros;

    if (numeros.length > 3) {
      formatado =
        numeros.slice(0, 3) +
        "." +
        numeros.slice(3);
    }

    if (numeros.length > 6) {
      formatado =
        numeros.slice(0, 3) +
        "." +
        numeros.slice(3, 6) +
        "." +
        numeros.slice(6);
    }

    if (numeros.length > 9) {
      formatado =
        numeros.slice(0, 3) +
        "." +
        numeros.slice(3, 6) +
        "." +
        numeros.slice(6, 9) +
        "-" +
        numeros.slice(9, 11);
    }

    setCpf(formatado);
  };

  // =========================
  // DATA
  // =========================

  const handleDataChange = (valor) => {
    const numeros = valor.replace(/\D/g, "").slice(0, 8);

    let formatado = numeros;

    if (numeros.length > 2) {
      formatado =
        numeros.slice(0, 2) +
        "/" +
        numeros.slice(2);
    }

    if (numeros.length > 4) {
      formatado =
        numeros.slice(0, 2) +
        "/" +
        numeros.slice(2, 4) +
        "/" +
        numeros.slice(4);
    }

    setDataNasc(formatado);
  };

  // =========================
  // TELEFONE
  // =========================

  const handleTelefoneChange = (valor) => {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);

    let formatado = numeros;

    if (numeros.length <= 10) {
      if (numeros.length > 2) {
        formatado =
          "(" +
          numeros.slice(0, 2) +
          ") " +
          numeros.slice(2);
      }

      if (numeros.length > 6) {
        formatado =
          "(" +
          numeros.slice(0, 2) +
          ") " +
          numeros.slice(2, 6) +
          "-" +
          numeros.slice(6);
      }
    } else {
      formatado =
        "(" +
        numeros.slice(0, 2) +
        ") " +
        numeros.slice(2, 7) +
        "-" +
        numeros.slice(7, 11);
    }

    setTelefone(formatado);
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
            TÍTULO
        ========================= */}

        <Text
          variant="headlineMedium"
          style={[
            styles.title,
            {
              color: theme.colors.onBackground,
            },
          ]}
        >
          Cadastro de Funcionário
        </Text>

        {/* =========================
            NOME
        ========================= */}

        <TextInput
          label="Nome completo"
          value={nome}
          onChangeText={setNome}
          mode="outlined"
          autoCapitalize="words"
          onFocus={() => handleFocus("Nome")}
          onBlur={handleBlur}
          style={styles.input}
          outlineColor={
            inputFocus.input === "Nome" && inputFocus.focus
              ? theme.colors.primary
              : theme.colors.outline
          }
          activeOutlineColor={theme.colors.primary}
          error={nomeInvalido && nome.length > 0}
          left={
            <TextInput.Icon
              icon="account"
              color={
                inputFocus.input === "Nome" && inputFocus.focus
                  ? theme.colors.primary
                  : theme.colors.onSurfaceVariant
              }
            />
          }
        />

        <HelperText
          type="error"
          visible={nomeInvalido && nome.length > 0}
        >
          O nome deve possuir pelo menos 3 caracteres.
        </HelperText>

        {/* =========================
            CPF
        ========================= */}

        <TextInput
          label="CPF"
          value={cpf}
          onChangeText={handleCpfChange}
          mode="outlined"
          keyboardType="numeric"
          maxLength={14}
          onFocus={() => handleFocus("CPF")}
          onBlur={handleBlur}
          style={styles.input}
          outlineColor={
            inputFocus.input === "CPF" && inputFocus.focus
              ? theme.colors.primary
              : theme.colors.outline
          }
          activeOutlineColor={theme.colors.primary}
          error={cpfInvalido && cpf.length > 0}
          left={
            <TextInput.Icon
              icon="card-account-details"
              color={
                inputFocus.input === "CPF" && inputFocus.focus
                  ? theme.colors.primary
                  : theme.colors.onSurfaceVariant
              }
            />
          }
        />

        <HelperText
          type="error"
          visible={cpfInvalido && cpf.length > 0}
        >
          O CPF deve possuir 11 números.
        </HelperText>

        {/* =========================
            DATA DE NASCIMENTO
        ========================= */}

        <TextInput
          label="Data de nascimento"
          value={dataNasc}
          onChangeText={handleDataChange}
          mode="outlined"
          keyboardType="numeric"
          maxLength={10}
          placeholder="DD/MM/AAAA"
          onFocus={() => handleFocus("Data")}
          onBlur={handleBlur}
          style={styles.input}
          outlineColor={
            inputFocus.input === "Data" && inputFocus.focus
              ? theme.colors.primary
              : theme.colors.outline
          }
          activeOutlineColor={theme.colors.primary}
          error={dataNascInvalida && dataNasc.length > 0}
          left={
            <TextInput.Icon
              icon="calendar"
              color={
                inputFocus.input === "Data" && inputFocus.focus
                  ? theme.colors.primary
                  : theme.colors.onSurfaceVariant
              }
            />
          }
        />

        <HelperText
          type="error"
          visible={dataNascInvalida && dataNasc.length > 0}
        >
          Informe a data no formato DD/MM/AAAA.
        </HelperText>

        {/* =========================
            TELEFONE
        ========================= */}

        <TextInput
          label="Telefone"
          value={telefone}
          onChangeText={handleTelefoneChange}
          mode="outlined"
          keyboardType="phone-pad"
          maxLength={15}
          onFocus={() => handleFocus("Telefone")}
          onBlur={handleBlur}
          onSubmitEditing={() => {
            if (!formularioInvalido && !loading) {
              handleCadastro();
            }
          }}
          returnKeyType="done"
          style={styles.input}
          outlineColor={
            inputFocus.input === "Telefone" && inputFocus.focus
              ? theme.colors.primary
              : theme.colors.outline
          }
          activeOutlineColor={theme.colors.primary}
          error={telefoneInvalido && telefone.length > 0}
          left={
            <TextInput.Icon
              icon="phone"
              color={
                inputFocus.input === "Telefone" && inputFocus.focus
                  ? theme.colors.primary
                  : theme.colors.onSurfaceVariant
              }
            />
          }
        />

        <HelperText
          type="error"
          visible={telefoneInvalido && telefone.length > 0}
        >
          Informe um telefone válido.
        </HelperText>

        {/* =========================
            CARGO
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
          Cargo
        </Text>

        <RadioButton.Group
          onValueChange={(value) => setCargo(value)}
          value={cargo}
        >
          <View style={styles.radioRow}>
            <RadioButton.Android
              value="operador"
              color={theme.colors.primary}
              uncheckedColor={theme.colors.onSurfaceVariant}
            />

            <Text
              style={{
                color: theme.colors.onBackground,
              }}
            >
              Operador
            </Text>
          </View>

          <View style={styles.radioRow}>
            <RadioButton.Android
              value="supervisor"
              color={theme.colors.primary}
              uncheckedColor={theme.colors.onSurfaceVariant}
            />

            <Text
              style={{
                color: theme.colors.onBackground,
              }}
            >
              Supervisor
            </Text>
          </View>

          <View style={styles.radioRow}>
            <RadioButton.Android
              value="tecnico"
              color={theme.colors.primary}
              uncheckedColor={theme.colors.onSurfaceVariant}
            />

            <Text
              style={{
                color: theme.colors.onBackground,
              }}
            >
              Técnico
            </Text>
          </View>

          <View style={styles.radioRow}>
            <RadioButton.Android
              value="gerente"
              color={theme.colors.primary}
              uncheckedColor={theme.colors.onSurfaceVariant}
            />

            <Text
              style={{
                color: theme.colors.onBackground,
              }}
            >
              Gerente
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
          Cadastrar Funcionário
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

  title: {
    textAlign: "center",
    marginBottom: 25,
    fontWeight: "bold",
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
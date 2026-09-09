import { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Text,
  TextInput,
  Button,
  HelperText,
  RadioButton,
  Menu,
  useTheme,
} from "react-native-paper";

import { useCadastro } from "../hooks/useCadastro";
import { useFuncionario } from "../../Funcionario/hooks/useFuncionario";

export default function CadastroUsuario() {
  const theme = useTheme();

  // ==========================================
  // FUNCIONÁRIOS
  // ==========================================

  const { funcionarios } = useFuncionario();

  const [menuFuncionario, setMenuFuncionario] =
    useState(false);

  // ==========================================
  // CADASTRO
  // ==========================================

  const {
    funcionario,
    setFuncionario,

    email,
    setEmail,

    senha,
    setSenha,

    nivelAcesso,
    setNivelAcesso,

    loading,
    erro,
    sucesso,

    funcionarioInvalido,
    emailInvalido,
    senhaInvalida,
    formularioInvalido,

    handleCadastro,
  } = useCadastro();

  // ==========================================
  // FUNCIONÁRIO SELECIONADO
  // ==========================================

  const funcionarioSelecionado =
    funcionarios.find(
      (item) =>
        String(item.id) ===
        String(funcionario)
    );

  // ==========================================
  // SENHA
  // ==========================================

  const [mostrarSenha, setMostrarSenha] =
    useState(false);

  // ==========================================
  // FOCUS
  // ==========================================

  const [inputFocus, setInputFocus] =
    useState({
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
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme.colors.background,
        },
      ]}
    >
      {/* =========================
          FUNCIONÁRIO
      ========================= */}

      <Menu
        visible={menuFuncionario}
        onDismiss={() => {
          setMenuFuncionario(false);
          handleBlur();
        }}
        anchor={
          <TextInput
            label="Funcionário"
            value={
              funcionarioSelecionado?.nome ||
              ""
            }
            mode="outlined"
            editable={false}
            onPressIn={() => {
              setMenuFuncionario(true);
              handleFocus("Funcionário");
            }}
            style={styles.input}
            outlineColor={
              inputFocus.input ===
                "Funcionário" &&
              inputFocus.focus
                ? theme.colors.primary
                : theme.colors.outline
            }
            activeOutlineColor={
              theme.colors.primary
            }
            error={funcionarioInvalido}
            left={
              <TextInput.Icon
                icon="account"
                color={
                  inputFocus.input ===
                    "Funcionário" &&
                  inputFocus.focus
                    ? theme.colors.primary
                    : theme.colors
                        .onSurfaceVariant
                }
              />
            }
            right={
              <TextInput.Icon
                icon={
                  menuFuncionario
                    ? "chevron-up"
                    : "chevron-down"
                }
                onPress={() => {
                  setMenuFuncionario(
                    !menuFuncionario
                  );

                  if (!menuFuncionario) {
                    handleFocus(
                      "Funcionário"
                    );
                  } else {
                    handleBlur();
                  }
                }}
              />
            }
          />
        }
      >
        {funcionarios.length > 0 ? (
          funcionarios.map((item) => (
            <Menu.Item
              key={item.id}
              title={item.nome}
              onPress={() => {
                // Guarda o ID do funcionário
                setFuncionario(
                  String(item.id)
                );

                // Fecha o select
                setMenuFuncionario(
                  false
                );

                handleBlur();
              }}
            />
          ))
        ) : (
          <Menu.Item
            title="Nenhum funcionário cadastrado"
            disabled
          />
        )}
      </Menu>

      <HelperText
        type="error"
        visible={funcionarioInvalido}
      >
        Selecione um funcionário.
      </HelperText>

      {/* =========================
          E-MAIL
      ========================= */}

      <TextInput
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        onFocus={() =>
          handleFocus("E-mail")
        }
        onBlur={handleBlur}
        style={styles.input}
        outlineColor={
          inputFocus.input === "E-mail" &&
          inputFocus.focus
            ? theme.colors.primary
            : theme.colors.outline
        }
        activeOutlineColor={
          theme.colors.primary
        }
        error={emailInvalido}
        left={
          <TextInput.Icon
            icon="email"
            color={
              inputFocus.input ===
                "E-mail" &&
              inputFocus.focus
                ? theme.colors.primary
                : theme.colors
                    .onSurfaceVariant
            }
          />
        }
      />

      <HelperText
        type="error"
        visible={emailInvalido}
      >
        Informe um e-mail válido.
      </HelperText>

      {/* =========================
          NÍVEL DE ACESSO
      ========================= */}

      <Text
        variant="titleMedium"
        style={[
          styles.label,
          {
            color:
              theme.colors.onBackground,
          },
        ]}
      >
        Nível de acesso
      </Text>

      <RadioButton.Group
        onValueChange={(value) =>
          setNivelAcesso(value)
        }
        value={nivelAcesso}
      >
        {/* OPERADOR */}

        <View style={styles.radioRow}>
          <RadioButton.Android
            value="operador"
            color={theme.colors.primary}
            uncheckedColor={
              theme.colors.onSurfaceVariant
            }
          />

          <Text
            style={{
              color:
                theme.colors.onBackground,
            }}
          >
            Operador
          </Text>
        </View>

        {/* SUPERVISOR */}

        <View style={styles.radioRow}>
          <RadioButton.Android
            value="supervisor"
            color={theme.colors.primary}
            uncheckedColor={
              theme.colors.onSurfaceVariant
            }
          />

          <Text
            style={{
              color:
                theme.colors.onBackground,
            }}
          >
            Supervisor
          </Text>
        </View>

        {/* ADMIN */}

        <View style={styles.radioRow}>
          <RadioButton.Android
            value="admin"
            color={theme.colors.primary}
            uncheckedColor={
              theme.colors.onSurfaceVariant
            }
          />

          <Text
            style={{
              color:
                theme.colors.onBackground,
            }}
          >
            Administrador
          </Text>
        </View>
      </RadioButton.Group>

      {/* =========================
          SENHA
      ========================= */}

      <TextInput
        label="Senha"
        value={senha}
        onChangeText={setSenha}
        mode="outlined"
        secureTextEntry={!mostrarSenha}
        onFocus={() =>
          handleFocus("Senha")
        }
        onBlur={handleBlur}
        style={styles.input}
        outlineColor={
          inputFocus.input === "Senha" &&
          inputFocus.focus
            ? theme.colors.primary
            : theme.colors.outline
        }
        activeOutlineColor={
          theme.colors.primary
        }
        error={senhaInvalida}
        left={
          <TextInput.Icon
            icon="lock"
            color={
              inputFocus.input ===
                "Senha" &&
              inputFocus.focus
                ? theme.colors.primary
                : theme.colors
                    .onSurfaceVariant
            }
          />
        }
        right={
          <TextInput.Icon
            icon={
              mostrarSenha
                ? "eye-off"
                : "eye"
            }
            onPress={() =>
              setMostrarSenha(
                (prev) => !prev
              )
            }
            color={
              theme.colors.onSurfaceVariant
            }
          />
        }
        onSubmitEditing={() => {
          if (
            !formularioInvalido &&
            !loading
          ) {
            handleCadastro();
          }
        }}
        returnKeyType="done"
      />

      <HelperText
        type="error"
        visible={senhaInvalida}
      >
        A senha deve ter pelo menos 8
        caracteres.
      </HelperText>

      {/* =========================
          ERRO
      ========================= */}

      {erro ? (
        <HelperText
          type="error"
          visible={true}
        >
          {erro}
        </HelperText>
      ) : null}

      {/* =========================
          SUCESSO
      ========================= */}

      {sucesso ? (
        <HelperText
          type="info"
          visible={true}
        >
          {sucesso}
        </HelperText>
      ) : null}

      {/* =========================
          BOTÃO CADASTRAR
      ========================= */}

      <Button
        mode="contained"
        onPress={handleCadastro}
        loading={loading}
        disabled={
          formularioInvalido ||
          loading
        }
        buttonColor={
          theme.colors.primary
        }
        style={styles.button}
        contentStyle={
          styles.buttonContent
        }
      >
        Cadastrar
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
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
    marginTop: 15,
    marginBottom: 5,
    fontWeight: "bold",
  },

  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },

  button: {
    marginTop: 20,
    borderRadius: 8,
  },

  buttonContent: {
    height: 50,
  },
});

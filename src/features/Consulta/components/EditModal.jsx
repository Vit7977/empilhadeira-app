import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import {
  Modal,
  Portal,
  Text,
  TextInput,
  Button,
  RadioButton,
  HelperText,
  useTheme,
  Icon,
} from "react-native-paper";
import { formatDate } from "../utils/formatters.js";

export default function EditModal({
  visible,
  onDismiss,
  item,
  tipo,
  onSave,
}) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  // Estados para Usuário
  const [userEmail, setUserEmail] = useState("");
  const [userNivel, setUserNivel] = useState("operador");
  const [userAtivo, setUserAtivo] = useState(true);
  const [userSenha, setUserSenha] = useState("");

  // Estados para Funcionário
  const [funcNome, setFuncNome] = useState("");
  const [funcCpf, setFuncCpf] = useState("");
  const [funcDataNasc, setFuncDataNasc] = useState("");
  const [funcTelefone, setFuncTelefone] = useState("");
  const [funcCargo, setFuncCargo] = useState("operador");
  const [funcAtivo, setFuncAtivo] = useState(true);

  // Estados para Empilhadeira
  const [empCodigo, setEmpCodigo] = useState("");
  const [empStatus, setEmpStatus] = useState("disponivel");

  // Preenche os campos quando o item muda
  useEffect(() => {
    if (!item) return;

    if (tipo === "usuarios") {
      setUserEmail(item.email || "");
      setUserNivel(item.nivel_acesso || "operador");
      setUserAtivo(Boolean(item.ativo));
      setUserSenha("");
    } else if (tipo === "funcionarios") {
      setFuncNome(item.nome || "");
      setFuncCpf(item.cpf || "");
      setFuncDataNasc(item.data_nasc ? formatDate(item.data_nasc) : "");
      setFuncTelefone(item.telefone || "");
      setFuncCargo(item.cargo || "operador");
      setFuncAtivo(Boolean(item.ativo));
    } else if (tipo === "empilhadeiras") {
      setEmpCodigo(item.codigo || "");
      setEmpStatus(item.status || "disponivel");
    }
  }, [item, tipo, visible]);

  // Formatação de CPF para funcionário
  const handleCpfChange = (valor) => {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);
    let formatado = numeros;
    if (numeros.length > 3) {
      formatado = numeros.slice(0, 3) + "." + numeros.slice(3);
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
    setFuncCpf(formatado);
  };

  // Formatação de Telefone para funcionário
  const handleTelefoneChange = (valor) => {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);
    let formatado = numeros;
    if (numeros.length > 2) {
      formatado = "(" + numeros.slice(0, 2) + ") " + numeros.slice(2);
    }
    if (numeros.length > 6 && numeros.length <= 10) {
      formatado =
        "(" +
        numeros.slice(0, 2) +
        ") " +
        numeros.slice(2, 6) +
        "-" +
        numeros.slice(6);
    } else if (numeros.length > 10) {
      formatado =
        "(" +
        numeros.slice(0, 2) +
        ") " +
        numeros.slice(2, 7) +
        "-" +
        numeros.slice(7, 11);
    }
    setFuncTelefone(formatado);
  };

  // Formatação de Data de Nascimento para funcionário
  const handleDataNascChange = (valor) => {
    const numeros = valor.replace(/\D/g, "").slice(0, 8);
    let formatado = numeros;
    if (numeros.length > 2) {
      formatado = numeros.slice(0, 2) + "/" + numeros.slice(2);
    }
    if (numeros.length > 4) {
      formatado =
        numeros.slice(0, 2) +
        "/" +
        numeros.slice(2, 4) +
        "/" +
        numeros.slice(4, 8);
    }
    setFuncDataNasc(formatado);
  };

  const handleSalvar = async () => {
    if (!item?.id) return;
    setLoading(true);

    try {
      let payload = {};

      if (tipo === "usuarios") {
        payload = {
          email: userEmail.trim(),
          nivel_acesso: userNivel,
          ativo: userAtivo,
        };
        if (userSenha && userSenha.trim().length >= 6) {
          payload.senha = userSenha.trim();
        }
      } else if (tipo === "funcionarios") {
        // Converte DD/MM/AAAA para AAAA-MM-DD se necessário
        let dataFormatada = funcDataNasc;
        if (funcDataNasc.includes("/")) {
          dataFormatada = funcDataNasc.split("/").reverse().join("-");
        }

        payload = {
          nome: funcNome.trim(),
          cpf: funcCpf.replace(/\D/g, ""),
          data_nasc: dataFormatada,
          telefone: funcTelefone.replace(/\D/g, ""),
          cargo: funcCargo,
          ativo: funcAtivo,
        };
      } else if (tipo === "empilhadeiras") {
        payload = {
          codigo: empCodigo.trim().toUpperCase(),
          status: empStatus,
        };
      }

      await onSave(tipo, item.id, payload);
      onDismiss();
    } catch (err) {
      console.error("Erro no modal de edição:", err);
    } finally {
      setLoading(false);
    }
  };

  const getTitulo = () => {
    switch (tipo) {
      case "usuarios":
        return `Editar Usuário #${item?.id}`;
      case "funcionarios":
        return `Editar Funcionário #${item?.id}`;
      case "empilhadeiras":
        return `Editar Empilhadeira #${item?.id}`;
      default:
        return "Editar";
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={loading ? undefined : onDismiss}
        contentContainerStyle={[
          styles.modalContainer,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Cabeçalho do Modal */}
          <View style={styles.modalHeader}>
            <View style={styles.titleRow}>
              <Icon source="pencil-box-outline" size={24} color={theme.colors.primary} />
              <Text variant="titleLarge" style={styles.modalTitle}>
                {getTitulo()}
              </Text>
            </View>
          </View>

          {/* =======================================================
              CAMPOS PARA USUÁRIO
          ======================================================= */}
          {tipo === "usuarios" && (
            <View style={styles.formSection}>
              <TextInput
                label="E-mail"
                value={userEmail}
                onChangeText={setUserEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label="Nova Senha (opcional)"
                placeholder="Deixe em branco para não alterar"
                value={userSenha}
                onChangeText={setUserSenha}
                secureTextEntry
                mode="outlined"
                style={styles.input}
              />
              {userSenha.length > 0 && userSenha.length < 6 && (
                <HelperText type="error">
                  A senha deve possuir pelo menos 6 caracteres.
                </HelperText>
              )}

              <Text variant="titleSmall" style={styles.label}>
                Nível de Acesso
              </Text>
              <RadioButton.Group
                onValueChange={(val) => setUserNivel(val)}
                value={userNivel}
              >
                <View style={styles.radioRow}>
                  <RadioButton.Android value="operador" color={theme.colors.primary} />
                  <Text>Operador</Text>
                </View>
                <View style={styles.radioRow}>
                  <RadioButton.Android value="supervisor" color={theme.colors.primary} />
                  <Text>Supervisor</Text>
                </View>
                <View style={styles.radioRow}>
                  <RadioButton.Android value="admin" color={theme.colors.primary} />
                  <Text>Administrador</Text>
                </View>
              </RadioButton.Group>

              <Text variant="titleSmall" style={styles.label}>
                Status da Conta
              </Text>
              <RadioButton.Group
                onValueChange={(val) => setUserAtivo(val === "ativo")}
                value={userAtivo ? "ativo" : "inativo"}
              >
                <View style={styles.radioRow}>
                  <RadioButton.Android value="ativo" color={theme.colors.primary} />
                  <Text>Ativo</Text>
                </View>
                <View style={styles.radioRow}>
                  <RadioButton.Android value="inativo" color={theme.colors.primary} />
                  <Text>Inativo</Text>
                </View>
              </RadioButton.Group>
            </View>
          )}

          {/* =======================================================
              CAMPOS PARA FUNCIONÁRIO
          ======================================================= */}
          {tipo === "funcionarios" && (
            <View style={styles.formSection}>
              <TextInput
                label="Nome completo"
                value={funcNome}
                onChangeText={setFuncNome}
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label="CPF"
                value={funcCpf}
                onChangeText={handleCpfChange}
                keyboardType="numeric"
                maxLength={14}
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label="Data de Nascimento (DD/MM/AAAA)"
                value={funcDataNasc}
                onChangeText={handleDataNascChange}
                keyboardType="numeric"
                maxLength={10}
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label="Telefone"
                value={funcTelefone}
                onChangeText={handleTelefoneChange}
                keyboardType="numeric"
                maxLength={15}
                mode="outlined"
                style={styles.input}
              />

              <Text variant="titleSmall" style={styles.label}>
                Cargo
              </Text>
              <RadioButton.Group
                onValueChange={(val) => setFuncCargo(val)}
                value={funcCargo}
              >
                <View style={styles.radioRow}>
                  <RadioButton.Android value="operador" color={theme.colors.primary} />
                  <Text>Operador</Text>
                </View>
                <View style={styles.radioRow}>
                  <RadioButton.Android value="supervisor" color={theme.colors.primary} />
                  <Text>Supervisor</Text>
                </View>
                <View style={styles.radioRow}>
                  <RadioButton.Android value="tecnico" color={theme.colors.primary} />
                  <Text>Técnico</Text>
                </View>
                <View style={styles.radioRow}>
                  <RadioButton.Android value="gerente" color={theme.colors.primary} />
                  <Text>Gerente</Text>
                </View>
              </RadioButton.Group>

              <Text variant="titleSmall" style={styles.label}>
                Status
              </Text>
              <RadioButton.Group
                onValueChange={(val) => setFuncAtivo(val === "ativo")}
                value={funcAtivo ? "ativo" : "inativo"}
              >
                <View style={styles.radioRow}>
                  <RadioButton.Android value="ativo" color={theme.colors.primary} />
                  <Text>Ativo</Text>
                </View>
                <View style={styles.radioRow}>
                  <RadioButton.Android value="inativo" color={theme.colors.primary} />
                  <Text>Inativo</Text>
                </View>
              </RadioButton.Group>
            </View>
          )}

          {/* =======================================================
              CAMPOS PARA EMPILHADEIRA
          ======================================================= */}
          {tipo === "empilhadeiras" && (
            <View style={styles.formSection}>
              <TextInput
                label="Código da Empilhadeira"
                value={empCodigo}
                onChangeText={(t) => setEmpCodigo(t.toUpperCase())}
                mode="outlined"
                style={styles.input}
              />

              <Text variant="titleSmall" style={styles.label}>
                Status
              </Text>
              <RadioButton.Group
                onValueChange={(val) => setEmpStatus(val)}
                value={empStatus}
              >
                <View style={styles.radioRow}>
                  <RadioButton.Android value="disponivel" color={theme.colors.primary} />
                  <Text>Disponível</Text>
                </View>
                <View style={styles.radioRow}>
                  <RadioButton.Android value="operando" color={theme.colors.primary} />
                  <Text>Operando</Text>
                </View>
                <View style={styles.radioRow}>
                  <RadioButton.Android value="parada" color={theme.colors.primary} />
                  <Text>Parada</Text>
                </View>
              </RadioButton.Group>
            </View>
          )}

          {/* Botões do Rodapé */}
          <View style={styles.buttonsRow}>
            <Button
              mode="outlined"
              onPress={onDismiss}
              disabled={loading}
              style={styles.actionBtn}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleSalvar}
              loading={loading}
              disabled={loading}
              buttonColor={theme.colors.primary}
              style={styles.actionBtn}
            >
              Salvar Alterações
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    maxHeight: "85%",
  },
  modalHeader: {
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 18,
  },
  formSection: {
    marginBottom: 14,
  },
  input: {
    marginBottom: 10,
  },
  label: {
    marginTop: 8,
    marginBottom: 4,
    fontWeight: "bold",
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 1,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f030",
  },
  actionBtn: {
    borderRadius: 8,
  },
});


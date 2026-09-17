import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  TextInput,
  Menu,
  Searchbar,
  ActivityIndicator,
  useTheme,
  Icon,
  Button,
  Chip,
  Portal,
  Dialog,
} from "react-native-paper";
import Toast from "react-native-toast-message";
import { getStoredUser } from "../../Usuario/usuario.storage.js";
import { useConsulta, CONSULTA_TIPOS } from "../hooks/useConsulta.js";

import TelemetriaTable from "../components/TelemetriaTable.jsx";
import UsuarioCard from "../components/UsuarioCard.jsx";
import FuncionarioCard from "../components/FuncionarioCard.jsx";
import EmpilhadeiraCard from "../components/EmpilhadeiraCard.jsx";
import EditModal from "../components/EditModal.jsx";

import {
  updateUsuario,
  deleteUsuario,
  updateFuncionario,
  deleteFuncionario,
  updateEmpilhadeira,
  deleteEmpilhadeira,
} from "../consulta.service.js";

export default function Consulta() {
  const theme = useTheme();

  // Verificação de permissão de Administrador
  const [isAdmin, setIsAdmin] = useState(true);

  // Estados para Edição e Exclusão
  const [itemParaEditar, setItemParaEditar] = useState(null);
  const [itemParaExcluir, setItemParaExcluir] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const user = getStoredUser();
    const adminRole = user?.nivel_acesso?.trim().toLowerCase() === "admin";
    setIsAdmin(adminRole);
  }, []);

  const {
    tipoConsulta,
    setTipoConsulta,
    filteredData,
    loading,
    refreshing,
    error,
    searchTerm,
    setSearchTerm,
    refresh,
    funcionariosMap,
  } = useConsulta();

  const [menuVisible, setMenuVisible] = useState(false);

  // Opção selecionada atual
  const tipoSelecionado =
    CONSULTA_TIPOS.find((item) => item.id === tipoConsulta) || CONSULTA_TIPOS[0];

  // ==========================================
  // HANDLERS DE EDIÇÃO
  // ==========================================
  const handleOpenEdit = (item, tipo) => {
    setItemParaEditar({ item, tipo });
  };

  const handleCloseEdit = () => {
    setItemParaEditar(null);
  };

  const handleSaveEdit = async (tipo, id, payload) => {
    try {
      let response;
      if (tipo === "usuarios") {
        response = await updateUsuario(id, payload);
      } else if (tipo === "funcionarios") {
        response = await updateFuncionario(id, payload);
      } else if (tipo === "empilhadeiras") {
        response = await updateEmpilhadeira(id, payload);
      }

      Toast.show({
        type: "success",
        text1: "Sucesso",
        text2: response?.message || "Alterações salvas com sucesso!",
      });

      refresh();
    } catch (err) {
      console.error("Erro ao atualizar:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        "Não foi possível salvar as alterações.";
      Toast.show({
        type: "error",
        text1: "Erro na Atualização",
        text2: msg,
      });
      throw err;
    }
  };

  // ==========================================
  // HANDLERS DE EXCLUSÃO
  // ==========================================
  const handlePromptDelete = (item, tipo, label) => {
    setItemParaExcluir({ item, tipo, label });
  };

  const handleConfirmDelete = async () => {
    if (!itemParaExcluir) return;
    setDeleting(true);

    try {
      const { item, tipo } = itemParaExcluir;
      let response;

      if (tipo === "usuarios") {
        response = await deleteUsuario(item.id);
      } else if (tipo === "funcionarios") {
        response = await deleteFuncionario(item.id);
      } else if (tipo === "empilhadeiras") {
        response = await deleteEmpilhadeira(item.id);
      }

      Toast.show({
        type: "success",
        text1: "Sucesso",
        text2: response?.message || "Item excluído com sucesso!",
      });

      setItemParaExcluir(null);
      refresh();
    } catch (err) {
      console.error("Erro ao excluir:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        "Não foi possível excluir o item.";
      Toast.show({
        type: "error",
        text1: "Erro na Exclusão",
        text2: msg,
      });
    } finally {
      setDeleting(false);
    }
  };

  // Se não for admin, bloqueia visualização
  if (!isAdmin) {
    return (
      <View
        style={[
          styles.unauthorizedContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Icon source="shield-lock-outline" size={64} color="#dc2626" />
        <Text variant="headlineSmall" style={styles.unauthorizedTitle}>
          Acesso Restrito
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.unauthorizedMessage, { color: theme.colors.onSurfaceVariant }]}
        >
          Esta funcionalidade é exclusiva para administradores do sistema.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Cabeçalho da Tela */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={refresh}
            disabled={loading || refreshing}
            activeOpacity={0.7}
            style={[
              styles.refreshButton,
              { backgroundColor: theme.colors.secondaryContainer },
            ]}
          >
            <Icon source="reload" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.screenTitle, { color: theme.colors.onSurface }]}>
            Atualizar
          </Text>
        </View>

        <View style={styles.selectWrapper}>
          <Text
            variant="labelMedium"
            style={[styles.inputLabel, { color: theme.colors.onSurface }]}
          >
            O QUE VOCÊ DESEJA CONSULTAR?
          </Text>

          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TextInput
                value={tipoSelecionado.label}
                mode="outlined"
                editable={false}
                onPressIn={() => setMenuVisible(true)}
                style={[
                  styles.selectInput,
                  { backgroundColor: theme.colors.surface },
                ]}
                outlineColor={
                  menuVisible ? theme.colors.primary : theme.colors.outline
                }
                activeOutlineColor={theme.colors.primary}
                left={
                  <TextInput.Icon
                    icon={tipoSelecionado.icon}
                    color={theme.colors.primary}
                  />
                }
                right={
                  <TextInput.Icon
                    icon={menuVisible ? "chevron-up" : "chevron-down"}
                    onPress={() => setMenuVisible(!menuVisible)}
                    color={theme.colors.primary}
                  />
                }
              />
            }
            contentStyle={[
              styles.menuContent,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            {CONSULTA_TIPOS.map((opcao) => {
              const isSelected = opcao.id === tipoConsulta;
              return (
                <Menu.Item
                  key={opcao.id}
                  leadingIcon={opcao.icon}
                  title={opcao.label}
                  titleStyle={{
                    fontWeight: isSelected ? "bold" : "normal",
                    color: isSelected
                      ? theme.colors.primary
                      : theme.colors.onSurface,
                  }}
                  style={
                    isSelected
                      ? { backgroundColor: theme.colors.secondaryContainer }
                      : null
                  }
                  onPress={() => {
                    setTipoConsulta(opcao.id);
                    setMenuVisible(false);
                  }}
                />
              );
            })}
          </Menu>
        </View>

        {/* Chips Rápidos de Seleção */}
        <View style={styles.chipsRow}>
          {CONSULTA_TIPOS.map((opcao) => {
            const active = opcao.id === tipoConsulta;
            return (
              <Chip
                key={opcao.id}
                icon={opcao.icon}
                selected={active}
                showSelectedOverlay
                onPress={() => setTipoConsulta(opcao.id)}
                style={[
                  styles.quickChip,
                  {
                    backgroundColor: active
                      ? theme.colors.secondaryContainer
                      : theme.colors.surface,
                    borderColor: active
                      ? theme.colors.primary
                      : theme.dark
                      ? "#333"
                      : "#e2e8f0",
                  },
                ]}
                textStyle={{
                  color: active
                    ? theme.colors.primary
                    : theme.colors.onSurfaceVariant,
                  fontWeight: active ? "bold" : "500",
                  fontSize: 12,
                }}
              >
                {opcao.label}
              </Chip>
            );
          })}
        </View>

        {/* Barra de Pesquisa */}
        <Searchbar
          placeholder={`Buscar em ${tipoSelecionado.label.toLowerCase()}...`}
          onChangeText={setSearchTerm}
          value={searchTerm}
          style={[
            styles.searchbar,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.dark ? "#333333" : "#e2e8f0",
            },
          ]}
          inputStyle={styles.searchInput}
          iconColor={theme.colors.primary}
          elevation={1}
        />

        {/* Barra de Metadados / Contagem */}
        <View style={styles.countRow}>
          <Text
            variant="labelMedium"
            style={{ color: theme.colors.onSurfaceVariant, fontWeight: "600" }}
          >
            {loading
              ? "Carregando registros..."
              : `${filteredData.length} ${
                  filteredData.length === 1 ? "registro" : "registros"
                } encontrado${filteredData.length === 1 ? "" : "s"}`}
          </Text>

          {tipoConsulta === "telemetrias" && (
            <View style={styles.tableHint}>
              <Icon source="arrow-left-right" size={14} color={theme.colors.onSurfaceVariant} />
              <Text
                variant="labelSmall"
                style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }}
              >
                Deslize a tabela para os lados
              </Text>
            </View>
          )}
        </View>

        {/* Estado: Carregamento */}
        {loading && !refreshing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text
              variant="bodyMedium"
              style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}
            >
              Buscando {tipoSelecionado.label.toLowerCase()}...
            </Text>
          </View>
        )}

        {/* Estado: Erro */}
        {error && !loading && (
          <View
            style={[
              styles.errorCard,
              {
                backgroundColor: theme.dark ? "#261313" : "#fee2e2",
                borderColor: "#fca5a5",
              },
            ]}
          >
            <Icon source="alert-circle-outline" size={32} color="#dc2626" />
            <Text style={[styles.errorTitle, { color: "#dc2626" }]}>
              Ocorreu um problema
            </Text>
            <Text
              style={[
                styles.errorMessage,
                { color: theme.dark ? "#f87171" : "#991b1b" },
              ]}
            >
              {error}
            </Text>
            <Button
              mode="contained"
              onPress={refresh}
              buttonColor="#dc2626"
              textColor="#ffffff"
              style={styles.retryButton}
            >
              Tentar Novamente
            </Button>
          </View>
        )}

        {/* Estado: Nenhum Dado Encontrado */}
        {!loading && !error && filteredData.length === 0 && (
          <View style={styles.emptyContainer}>
            <Icon
              source="text-box-search-outline"
              size={56}
              color={theme.colors.onSurfaceVariant}
            />
            <Text
              variant="titleMedium"
              style={[styles.emptyTitle, { color: theme.colors.onSurface }]}
            >
              Nenhum registro encontrado
            </Text>
            <Text
              variant="bodySmall"
              style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}
            >
              {searchTerm
                ? `Nenhum resultado corresponde a "${searchTerm}"`
                : `Não há dados cadastrados em ${tipoSelecionado.label.toLowerCase()}.`}
            </Text>
          </View>
        )}

        {/* Visualização de Resultados */}
        {!loading && !error && filteredData.length > 0 && (
          <View style={styles.resultsContainer}>
            {/* TELEMETRIAS: Em Formato de Tabela com Scroll Horizontal */}
            {tipoConsulta === "telemetrias" && (
              <TelemetriaTable data={filteredData} />
            )}

            {/* USUÁRIOS: Em Formato de Cards Modernos com Editar e Excluir */}
            {tipoConsulta === "usuarios" && (
              <View>
                {filteredData.map((item) => (
                  <UsuarioCard
                    key={item.id}
                    usuario={item}
                    funcionario={funcionariosMap[item.funcionario]}
                    onEdit={(u) => handleOpenEdit(u, "usuarios")}
                    onDelete={(u) => handlePromptDelete(u, "usuarios", u.email)}
                  />
                ))}
              </View>
            )}

            {/* FUNCIONÁRIOS: Em Formato de Cards Modernos com Editar e Excluir */}
            {tipoConsulta === "funcionarios" && (
              <View>
                {filteredData.map((item) => (
                  <FuncionarioCard
                    key={item.id}
                    funcionario={item}
                    onEdit={(f) => handleOpenEdit(f, "funcionarios")}
                    onDelete={(f) => handlePromptDelete(f, "funcionarios", f.nome)}
                  />
                ))}
              </View>
            )}

            {/* EMPILHADEIRAS: Em Formato de Cards Modernos com Editar e Excluir */}
            {tipoConsulta === "empilhadeiras" && (
              <View>
                {filteredData.map((item) => (
                  <EmpilhadeiraCard
                    key={item.id}
                    empilhadeira={item}
                    onEdit={(e) => handleOpenEdit(e, "empilhadeiras")}
                    onDelete={(e) => handlePromptDelete(e, "empilhadeiras", e.codigo)}
                  />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Diálogo de Confirmação de Exclusão */}
      <Portal>
        <Dialog
          visible={Boolean(itemParaExcluir)}
          onDismiss={() => !deleting && setItemParaExcluir(null)}
          style={{ borderRadius: 16 }}
        >
          <Dialog.Title style={{ fontWeight: "bold" }}>
            Confirmar Exclusão
          </Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Tem certeza que deseja excluir{" "}
              <Text style={{ fontWeight: "bold" }}>
                "{itemParaExcluir?.label}"
              </Text>
              ? Esta ação não pode ser desfeita.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setItemParaExcluir(null)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              textColor="#dc2626"
              onPress={handleConfirmDelete}
              loading={deleting}
              disabled={deleting}
            >
              Excluir
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Modal de Edição Interativa */}
      <EditModal
        visible={Boolean(itemParaEditar)}
        onDismiss={handleCloseEdit}
        item={itemParaEditar?.item}
        tipo={itemParaEditar?.tipo}
        onSave={handleSaveEdit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "start",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  screenTitle: {
    fontWeight: "bold",
    fontSize: 20,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  selectWrapper: {
    marginBottom: 10,
  },
  inputLabel: {
    fontWeight: "bold",
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  selectInput: {
    fontSize: 15,
  },
  menuContent: {
    borderRadius: 12,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  quickChip: {
    borderRadius: 8,
    borderWidth: 1,
  },
  searchbar: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchInput: {
    fontSize: 14,
  },
  countRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  tableHint: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingContainer: {
    paddingVertical: 50,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
  },
  errorCard: {
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    marginVertical: 16,
  },
  errorTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 8,
  },
  errorMessage: {
    textAlign: "center",
    fontSize: 13,
    marginTop: 4,
    marginBottom: 14,
  },
  retryButton: {
    borderRadius: 8,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontWeight: "bold",
    marginTop: 12,
  },
  emptySubtitle: {
    textAlign: "center",
    marginTop: 4,
    maxWidth: 260,
  },
  resultsContainer: {
    marginTop: 4,
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  unauthorizedTitle: {
    fontWeight: "bold",
    color: "#dc2626",
    marginTop: 16,
  },
  unauthorizedMessage: {
    textAlign: "center",
    marginTop: 8,
    maxWidth: 280,
  },
});

import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Card, Text, Avatar, useTheme, Icon } from "react-native-paper";
import { formatDate, formatCPF, formatPhone } from "../utils/formatters.js";

export default function FuncionarioCard({ funcionario, onEdit, onDelete }) {
  const theme = useTheme();

  const cargo = (funcionario.cargo || "operador").toLowerCase();
  const isAtivo = Boolean(funcionario.ativo);

  const getCargoBadgeConfig = (role) => {
    switch (role) {
      case "gerente":
        return {
          bg: "#fdf2f8",
          text: "#be185d",
          border: "#fbcfe8",
          label: "GERENTE",
          icon: "briefcase",
        };
      case "supervisor":
        return {
          bg: "#f3e8ff",
          text: "#7e22ce",
          border: "#d8b4fe",
          label: "SUPERVISOR",
          icon: "clipboard-check",
        };
      case "tecnico":
        return {
          bg: "#e0f2fe",
          text: "#0369a1",
          border: "#bae6fd",
          label: "TÉCNICO",
          icon: "wrench",
        };
      case "operador":
      default:
        return {
          bg: "#fef3c7",
          text: "#b45309",
          border: "#fde68a",
          label: "OPERADOR",
          icon: "account-hard-hat",
        };
    }
  };

  const cargoConfig = getCargoBadgeConfig(cargo);

  // Iniciais do nome (ex: "Gabriel Santos" -> "GS")
  const getInitials = (name) => {
    if (!name) return "F";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  return (
    <Card
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.dark ? "#333333" : "#e2e8f0",
        },
      ]}
      mode="elevated"
    >
      <Card.Content style={styles.content}>
        {/* Topo do Card */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <Avatar.Text
              size={46}
              label={getInitials(funcionario.nome)}
              style={{
                backgroundColor: theme.dark
                  ? "#2d3748"
                  : theme.colors.primaryContainer,
              }}
              color={theme.colors.onPrimaryContainer}
            />
            <View style={styles.nameContainer}>
              <Text
                variant="titleMedium"
                style={[styles.nomeText, { color: theme.colors.onSurface }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {funcionario.nome}
              </Text>

              {/* Badge de Cargo */}
              <View
                style={[
                  styles.cargoBadge,
                  {
                    backgroundColor: theme.dark ? "#262626" : cargoConfig.bg,
                    borderColor: cargoConfig.border,
                  },
                ]}
              >
                <Icon source={cargoConfig.icon} size={13} color={cargoConfig.text} />
                <Text style={[styles.cargoText, { color: cargoConfig.text }]}>
                  {cargoConfig.label}
                </Text>
              </View>
            </View>
          </View>

          {/* Status e ID */}
          <View style={styles.statusSection}>
            <View
              style={[
                styles.statusDotContainer,
                {
                  backgroundColor: isAtivo ? "#dcfce7" : "#fee2e2",
                  borderColor: isAtivo ? "#86efac" : "#fca5a5",
                },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isAtivo ? "#16a34a" : "#dc2626" },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: isAtivo ? "#15803d" : "#b91c1c" },
                ]}
              >
                {isAtivo ? "Ativo" : "Inativo"}
              </Text>
            </View>

            <Text
              variant="labelSmall"
              style={[styles.idBadge, { color: theme.colors.onSurfaceVariant }]}
            >
              #{funcionario.id}
            </Text>
          </View>
        </View>

        {/* Separador */}
        <View
          style={[
            styles.divider,
            { backgroundColor: theme.dark ? "#2d2d2d" : "#f1f5f9" },
          ]}
        />

        {/* Grid de Informações Detalhadas */}
        <View style={styles.infoGrid}>
          {/* CPF */}
          <View style={styles.infoItem}>
            <Icon
              source="card-account-details-outline"
              size={16}
              color={theme.colors.primary}
            />
            <View style={styles.infoTextContainer}>
              <Text
                variant="labelSmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                CPF
              </Text>
              <Text variant="bodySmall" style={styles.infoValue}>
                {formatCPF(funcionario.cpf)}
              </Text>
            </View>
          </View>

          {/* Telefone */}
          <View style={styles.infoItem}>
            <Icon source="phone-outline" size={16} color={theme.colors.primary} />
            <View style={styles.infoTextContainer}>
              <Text
                variant="labelSmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                Telefone
              </Text>
              <Text variant="bodySmall" style={styles.infoValue}>
                {formatPhone(funcionario.telefone)}
              </Text>
            </View>
          </View>

          {/* Data de Nascimento */}
          <View style={styles.infoItem}>
            <Icon source="calendar-outline" size={16} color={theme.colors.primary} />
            <View style={styles.infoTextContainer}>
              <Text
                variant="labelSmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                Nascimento
              </Text>
              <Text variant="bodySmall" style={styles.infoValue}>
                {formatDate(funcionario.data_nasc)}
              </Text>
            </View>
          </View>
        </View>

        {/* Ações (Editar e Excluir) */}
        {(onEdit || onDelete) && (
          <View style={styles.actionsRow}>
            <Text
              variant="labelSmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Opções de gerenciamento:
            </Text>

            <View style={styles.actionsButtons}>
              {onEdit && (
                <TouchableOpacity
                  onPress={() => onEdit(funcionario)}
                  activeOpacity={0.7}
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: theme.dark ? "#1e293b" : "#e0f2fe",
                      borderColor: theme.dark ? "#334155" : "#bae6fd",
                    },
                  ]}
                >
                  <Icon source="pencil-outline" size={16} color="#0284c7" />
                </TouchableOpacity>
              )}

              {onDelete && (
                <TouchableOpacity
                  onPress={() => onDelete(funcionario)}
                  activeOpacity={0.7}
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: theme.dark ? "#2a1616" : "#fee2e2",
                      borderColor: theme.dark ? "#451a1a" : "#fca5a5",
                    },
                  ]}
                >
                  <Icon source="trash-can-outline" size={16} color="#dc2626" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginVertical: 6,
    marginHorizontal: 2,
    elevation: 2,
  },
  content: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  nameContainer: {
    marginLeft: 12,
    flex: 1,
  },
  nomeText: {
    fontWeight: "bold",
    fontSize: 15,
  },
  cargoBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
    marginTop: 4,
  },
  cargoText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  statusSection: {
    alignItems: "flex-end",
    gap: 4,
  },
  statusDotContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  idBadge: {
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 90,
    gap: 6,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoValue: {
    fontWeight: "600",
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f920",
  },
  actionsButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Card, Text, Avatar, useTheme, Icon } from "react-native-paper";
import { formatDateTime } from "../utils/formatters.js";

export default function UsuarioCard({ usuario, funcionario, onEdit, onDelete }) {
  const theme = useTheme();

  const nivel = (usuario.nivel_acesso || "operador").toLowerCase();
  const isAtivo = Boolean(usuario.ativo);

  const getNivelBadgeConfig = (level) => {
    switch (level) {
      case "admin":
        return {
          bg: "#dbeafe",
          text: "#1d4ed8",
          border: "#93c5fd",
          label: "ADMINISTRADOR",
          icon: "shield-crown",
        };
      case "supervisor":
        return {
          bg: "#f3e8ff",
          text: "#7e22ce",
          border: "#d8b4fe",
          label: "SUPERVISOR",
          icon: "shield-account",
        };
      case "operador":
      default:
        return {
          bg: "#dcfce7",
          text: "#15803d",
          border: "#86efac",
          label: "OPERADOR",
          icon: "account-hard-hat",
        };
    }
  };

  const badgeConfig = getNivelBadgeConfig(nivel);
  const initial = (usuario.email || "U").charAt(0).toUpperCase();

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
        {/* Cabeçalho do Card */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Avatar.Text
              size={44}
              label={initial}
              style={{
                backgroundColor: theme.colors.primaryContainer,
              }}
              color={theme.colors.onPrimaryContainer}
            />
            <View style={styles.namesContainer}>
              <Text
                variant="titleMedium"
                style={[styles.emailText, { color: theme.colors.onSurface }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {usuario.email}
              </Text>

              <View style={styles.funcRow}>
                <Icon source="account" size={14} color={theme.colors.onSurfaceVariant} />
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }}
                >
                  {funcionario?.nome
                    ? funcionario.nome
                    : `Funcionário #${usuario.funcionario}`}
                </Text>
              </View>
            </View>
          </View>

          {/* Status Ativo/Inativo */}
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
        </View>

        {/* Divisor Visual Suave */}
        <View
          style={[
            styles.divider,
            { backgroundColor: theme.dark ? "#2d2d2d" : "#f1f5f9" },
          ]}
        />

        {/* Detalhes Inferiores e Ações */}
        <View style={styles.footer}>
          {/* Lado Esquerdo: Badge de Nível e ID */}
          <View style={styles.leftMeta}>
            <View
              style={[
                styles.nivelBadge,
                {
                  backgroundColor: theme.dark ? "#262626" : badgeConfig.bg,
                  borderColor: badgeConfig.border,
                },
              ]}
            >
              <Icon source={badgeConfig.icon} size={13} color={badgeConfig.text} />
              <Text style={[styles.nivelText, { color: badgeConfig.text }]}>
                {badgeConfig.label}
              </Text>
            </View>

            <Text
              variant="labelSmall"
              style={[styles.idText, { color: theme.colors.onSurfaceVariant }]}
            >
              ID: #{usuario.id}
            </Text>
          </View>

          {/* Lado Direito: Botões de Editar e Excluir */}
          <View style={styles.actionsContainer}>
            {onEdit && (
              <TouchableOpacity
                onPress={() => onEdit(usuario)}
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
                onPress={() => onDelete(usuario)}
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

        {usuario.created_at && (
          <Text
            variant="labelSmall"
            style={[styles.dateText, { color: theme.colors.onSurfaceVariant }]}
          >
            Cadastrado em {formatDateTime(usuario.created_at)}
          </Text>
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
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  namesContainer: {
    marginLeft: 12,
    flex: 1,
  },
  emailText: {
    fontWeight: "bold",
    fontSize: 15,
  },
  funcRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  statusDotContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
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
  divider: {
    height: 1,
    marginVertical: 10,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  nivelBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  nivelText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  idText: {
    fontWeight: "600",
  },
  actionsContainer: {
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
  dateText: {
    marginTop: 6,
    fontSize: 10,
  },
});

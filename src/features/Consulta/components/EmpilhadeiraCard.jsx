import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Card, Text, useTheme, Icon } from "react-native-paper";

export default function EmpilhadeiraCard({ empilhadeira, onEdit, onDelete }) {
  const theme = useTheme();

  const status = (empilhadeira.status || "disponivel").toLowerCase();

  const getStatusConfig = (st) => {
    switch (st) {
      case "operando":
        return {
          bg: "#e0f2fe",
          text: "#0284c7",
          border: "#7dd3fc",
          label: "Operando",
          icon: "play-circle-outline",
          accent: "#0284c7",
        };
      case "parada":
        return {
          bg: "#fee2e2",
          text: "#dc2626",
          border: "#fca5a5",
          label: "Parada",
          icon: "alert-circle-outline",
          accent: "#dc2626",
        };
      case "disponivel":
      default:
        return {
          bg: "#dcfce7",
          text: "#16a34a",
          border: "#86efac",
          label: "Disponível",
          icon: "check-circle-outline",
          accent: "#16a34a",
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  return (
    <Card
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.dark ? "#333333" : "#e2e8f0",
          borderLeftColor: statusConfig.accent,
          borderLeftWidth: 5,
        },
      ]}
      mode="elevated"
    >
      <Card.Content style={styles.content}>
        <View style={styles.mainRow}>
          {/* Ícone de Empilhadeira */}
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: theme.dark
                  ? "#262626"
                  : theme.colors.secondaryContainer,
              },
            ]}
          >
            <Icon source="forklift" size={32} color={theme.colors.primary} />
          </View>

          {/* Informações da Empilhadeira */}
          <View style={styles.detailsContainer}>
            <View style={styles.titleRow}>
              <Text
                variant="titleLarge"
                style={[styles.codigoText, { color: theme.colors.onSurface }]}
              >
                {empilhadeira.codigo}
              </Text>
              <Text
                variant="labelSmall"
                style={[styles.idText, { color: theme.colors.onSurfaceVariant }]}
              >
                ID #{empilhadeira.id}
              </Text>
            </View>

            <View style={styles.bottomRow}>
              {/* Badge de Status */}
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: theme.dark ? "#262626" : statusConfig.bg,
                    borderColor: statusConfig.border,
                  },
                ]}
              >
                <Icon
                  source={statusConfig.icon}
                  size={14}
                  color={statusConfig.text}
                />
                <Text style={[styles.statusText, { color: statusConfig.text }]}>
                  {statusConfig.label}
                </Text>
              </View>

              {/* Botões de Ação (Editar e Excluir) */}
              <View style={styles.actionsContainer}>
                {onEdit && (
                  <TouchableOpacity
                    onPress={() => onEdit(empilhadeira)}
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
                    onPress={() => onDelete(empilhadeira)}
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
          </View>
        </View>
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
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  detailsContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  codigoText: {
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  idText: {
    fontWeight: "600",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
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
});

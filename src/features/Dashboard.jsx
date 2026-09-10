import React from "react";
import { StyleSheet, View, ScrollView, RefreshControl } from "react-native";
import {
  Text,
  Card,
  Chip,
  Icon,
  ProgressBar,
  Divider,
  useTheme,
} from "react-native-paper";
import useEmpilhadeira from "./Empilhadeira/useEmpilhadeira";
import useTelemetria from "./Telemetria/useTelemetria";

export default function Dashboard({ route }) {
  const theme = useTheme();

  const empilhadeiraId = route?.params?.id || 1;

  const {
    selectedEmpilhadeira,
    loading: loadingEmpilhadeira,
    refreshing: refreshingEmpilhadeira,
    refresh: refreshEmpilhadeira,
  } = useEmpilhadeira({
    id: empilhadeiraId,
  });

  const {
    telemetria,
    loading: loadingTelemetria,
    refreshing: refreshingTelemetria,
    refreshTelemetria,
    error: erroTelemetria,
  } = useTelemetria({
    empilhadeiraId,
    pollingInterval: 3000,
  });

  const loading = loadingEmpilhadeira;
  const refreshing = refreshingEmpilhadeira || refreshingTelemetria;

  const handleRefresh = async () => {
    await Promise.all([refreshEmpilhadeira(), refreshTelemetria()]);
  };

  const empilhadeira = {
    codigo: selectedEmpilhadeira?.codigo,
    status: selectedEmpilhadeira?.status,

    bateria:
      telemetria?.nivel_bateria != null ? Number(telemetria.nivel_bateria) : 82,
    velocidade:
      telemetria?.velocidade != null ? parseFloat(telemetria.velocidade) : 12.5,
    pesoCarga:
      telemetria?.peso_carga != null ? parseFloat(telemetria.peso_carga) : 850,
    temperatura:
      telemetria?.temperatura != null ? parseFloat(telemetria.temperatura) : 32,
    posicaoX:
      telemetria?.posicao_x != null ? Number(telemetria.posicao_x) : 14.5,
    posicaoY:
      telemetria?.posicao_y != null ? Number(telemetria.posicao_y) : 8.2,
    obstaculo:
      telemetria?.obstaculo != null
        ? Boolean(Number(telemetria.obstaculo))
        : false,
    sensorLinha: telemetria?.sensor_linha ?? "",
    dataHora: telemetria?.data_hora ?? null,

    ...selectedEmpilhadeira,
  };

  const horaFormatada = empilhadeira.dataHora
    ? new Date(empilhadeira.dataHora).toLocaleTimeString("pt-BR")
    : null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <View>
          <Text variant="headlineMedium" style={styles.title}>
            Dashboard
          </Text>

          <Text
            variant="bodyMedium"
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            {horaFormatada
              ? `Última telemetria: ${horaFormatada}`
              : "Monitoramento da empilhadeira"}
          </Text>
        </View>

        <View
          style={[
            styles.statusIcon,
            { backgroundColor: theme.colors.secondaryContainer },
          ]}
        >
          <Icon source="forklift" size={30} color={theme.colors.primary} />
        </View>
      </View>

      {/* Identificação da empilhadeira */}
      <Card
        style={[styles.card, { backgroundColor: theme.colors.surface }]}
        mode="elevated"
      >
        <Card.Content>
          <View style={styles.machineHeader}>
            <View>
              <Text
                variant="labelMedium"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                EMPILHADEIRA {selectedEmpilhadeira?.id || empilhadeiraId}
              </Text>

              <Text
                variant="titleLarge"
                style={{ fontSize: 16, fontWeight: "bold" }}
              >
                {loading && !selectedEmpilhadeira
                  ? "Carregando..."
                  : empilhadeira.codigo}
              </Text>
            </View>

            <Chip
              icon={
                empilhadeira.status?.toLowerCase() === "disponivel"
                  ? "check-circle"
                  : "circle"
              }
              style={{
                backgroundColor: theme.colors.secondaryContainer,
              }}
              textStyle={{
                color: theme.colors.primary,
                textTransform: "capitalize",
              }}
            >
              {loading && !selectedEmpilhadeira
                ? "Carregando..."
                : empilhadeira.status}
            </Chip>
          </View>
        </Card.Content>
      </Card>

      {/* Bateria */}
      <Card
        style={[styles.card, { backgroundColor: theme.colors.surface }]}
        mode="elevated"
      >
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitle}>
              {empilhadeira.bateria <= 15 ? (
                <Icon
                  source="battery-low"
                  size={24}
                  color={theme.colors.primary}
                />
              ) : (
                <Icon source="battery" size={24} color={theme.colors.primary} />
              )}

              <Text variant="titleMedium">Bateria</Text>
            </View>

            <Text variant="titleLarge" style={{ color: theme.colors.primary }}>
              {empilhadeira.bateria}%
            </Text>
          </View>

          <ProgressBar
            progress={Math.min(
              Math.max((empilhadeira.bateria || 0) / 100, 0),
              1,
            )}
            color={empilhadeira.bateria <= 15 ? "red" : "lime"}
            style={styles.progress}
          />
        </Card.Content>
      </Card>

      {/* Estatísticas */}
      <Text variant="titleLarge" style={styles.sectionTitle}>
        Estatísticas
      </Text>

      <View style={styles.statsGrid}>
        {/* Velocidade */}
        <Card
          style={[styles.statCard, { backgroundColor: theme.colors.surface }]}
          mode="elevated"
        >
          <Card.Content>
            <Icon source="speedometer" size={28} color={theme.colors.primary} />

            <Text variant="headlineSmall" style={styles.statValue}>
              {empilhadeira.velocidade}
            </Text>

            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              km/h
            </Text>

            <Text variant="labelMedium">Velocidade</Text>
          </Card.Content>
        </Card>

        {/* Peso */}
        <Card
          style={[styles.statCard, { backgroundColor: theme.colors.surface }]}
          mode="elevated"
        >
          <Card.Content>
            <Icon
              source="weight-kilogram"
              size={28}
              color={theme.colors.primary}
            />

            <Text variant="headlineSmall" style={styles.statValue}>
              {empilhadeira.pesoCarga}
            </Text>

            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              kg
            </Text>

            <Text variant="labelMedium">Carga</Text>
          </Card.Content>
        </Card>

        {/* Temperatura */}
        <Card
          style={[styles.statCard, { backgroundColor: theme.colors.surface }]}
          mode="elevated"
        >
          <Card.Content>
            <Icon source="thermometer" size={28} color={theme.colors.primary} />

            <Text variant="headlineSmall" style={styles.statValue}>
              {empilhadeira.temperatura}°C
            </Text>

            <Text variant="labelMedium">Temperatura</Text>
          </Card.Content>
        </Card>

        {/* Obstáculo */}
        <Card
          style={[styles.statCard, { backgroundColor: theme.colors.surface }]}
          mode="elevated"
        >
          <Card.Content>
            <Icon
              source="alert-circle"
              size={28}
              color={
                empilhadeira.obstaculo
                  ? theme.colors.error
                  : theme.colors.primary
              }
            />

            <Text
              variant="headlineSmall"
              style={[
                styles.statValue,
                {
                  color: empilhadeira.obstaculo
                    ? theme.colors.error
                    : theme.colors.primary,
                },
              ]}
            >
              {empilhadeira.obstaculo ? "Detectado" : "Livre"}
            </Text>

            <Text variant="labelMedium">Obstáculo</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Localização */}
      <Text variant="titleLarge" style={styles.sectionTitle}>
        Localização
      </Text>

      <Card
        style={[styles.card, { backgroundColor: theme.colors.surface }]}
        mode="elevated"
      >
        <Card.Content>
          <View style={styles.locationHeader}>
            <View style={styles.cardTitle}>
              <Icon
                source="map-marker"
                size={26}
                color={theme.colors.primary}
              />

              <Text variant="titleMedium">Posição atual</Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.positionContainer}>
            <View style={styles.positionItem}>
              <Text
                variant="labelMedium"
                style={{
                  color: theme.colors.onSurfaceVariant,
                }}
              >
                EIXO X
              </Text>

              <Text variant="headlineSmall">{empilhadeira.posicaoX} m</Text>
            </View>

            <View style={styles.positionItem}>
              <Text
                variant="labelMedium"
                style={{
                  color: theme.colors.onSurfaceVariant,
                }}
              >
                EIXO Y
              </Text>

              <Text variant="headlineSmall">{empilhadeira.posicaoY} m</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Status dos sensores */}
      <Text variant="titleLarge" style={styles.sectionTitle}>
        Sistema
      </Text>

      <Card
        style={[styles.card, { backgroundColor: theme.colors.surface }]}
        mode="elevated"
      >
        <Card.Content>


          <View style={styles.systemRow}>
            <View style={styles.systemLeft}>
              <Icon source="wifi" size={24} color={theme.colors.primary} />

              <Text variant="bodyLarge">Conexão</Text>
            </View>

            <Chip
              icon={erroTelemetria ? "alert-circle" : "check"}
              style={{
                backgroundColor: erroTelemetria
                  ? theme.colors.errorContainer
                  : theme.colors.secondaryContainer,
              }}
              textStyle={{
                color: erroTelemetria
                  ? theme.colors.error
                  : theme.colors.primary,
              }}
            >
              {erroTelemetria ? "Offline" : "Online"}
            </Chip>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.systemRow}>
            <View style={styles.systemLeft}>
              <Icon
                source="navigation"
                size={24}
                color={theme.colors.primary}
              />

              <Text variant="bodyLarge">Navegação</Text>
            </View>

            <Chip
              icon="check"
              style={{
                backgroundColor: theme.colors.secondaryContainer,
              }}
            >
              Ativa
            </Chip>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 24,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  title: {
    marginBottom: 4,
  },

  subtitle: {
    marginBottom: 4,
  },

  statusIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    borderRadius: 12,
    marginBottom: 16,
  },

  machineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  progress: {
    height: 8,
    borderRadius: 8,
    marginTop: 16,
  },

  sectionTitle: {
    marginTop: 12,
    marginBottom: 12,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  statCard: {
    width: "48%",
    borderRadius: 12,
    marginBottom: 12,
  },

  statValue: {
    marginTop: 12,
    fontWeight: "bold",
  },

  locationHeader: {
    marginBottom: 4,
  },

  divider: {
    marginVertical: 16,
  },

  positionContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },

  positionItem: {
    alignItems: "center",
    gap: 4,
  },

  systemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  systemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
});

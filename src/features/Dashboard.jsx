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
import { useIsFocused } from "@react-navigation/native";
import useEmpilhadeira from "./Empilhadeira/useEmpilhadeira";
import {
  useResponsive,
  centralizado,
  LARGURA_CONTEUDO,
} from "../components/responsive";
import useTelemetria from "./Telemetria/useTelemetria";

export default function Dashboard({ route }) {
  const theme = useTheme();
  const isFocused = useIsFocused();
  const { isTablet, espacamento } = useResponsive();

  const routeId = route?.params?.id ?? null;

  const {
    empilhadeiras,
    selectedEmpilhadeira: empilhadeiraPorId,
    loading: loadingEmpilhadeira,
    refreshing: refreshingEmpilhadeira,
    refresh: refreshEmpilhadeira,
  } = useEmpilhadeira({
    id: routeId,
  });

  // Sem id na rota (aba Dashboard), o hook busca a lista: usa a primeira empilhadeira
  const selectedEmpilhadeira = routeId
    ? empilhadeiraPorId
    : empilhadeiras[0] ?? null;

  const empilhadeiraId = selectedEmpilhadeira?.id ?? routeId;

  const {
    telemetria,
    loading: loadingTelemetria,
    refreshing: refreshingTelemetria,
    refreshTelemetria,
    error: erroTelemetria,
  } = useTelemetria({
    empilhadeiraId,
    // Só atualiza em tempo real enquanto o Dashboard estiver aberto
    pollingInterval: isFocused ? 3000 : 0,
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
      telemetria?.nivel_bateria != null ? Number(telemetria.nivel_bateria) : 0,
    velocidade:
      telemetria?.velocidade != null ? parseFloat(telemetria.velocidade) : 0,
    pesoCarga:
      telemetria?.peso_carga != null ? parseFloat(telemetria.peso_carga) : 0,
    temperatura:
      telemetria?.temperatura != null ? parseFloat(telemetria.temperatura) : 0,
    posicaoX:
      telemetria?.posicao_x != null ? Number(telemetria.posicao_x) : 0,
    posicaoY:
      telemetria?.posicao_y != null ? Number(telemetria.posicao_y) : 0,
    obstaculo:
      telemetria?.obstaculo != null
        ? Boolean(Number(telemetria.obstaculo))
        : false,
    sensorLinha: telemetria?.sensor_linha ?? "",
    dataHora: telemetria?.data_hora ?? null,

    ...selectedEmpilhadeira,
  };

  // Enquanto não chega nenhuma telemetria, mostra "—" em vez de valores zerados
  const semDados = !telemetria;
  const exibir = (valor) => (semDados ? "—" : valor);
  // 2 colunas no celular, 4 no tablet
  const larguraStat = isTablet ? "23.5%" : "48%";

  const bateriaBaixa = !semDados && empilhadeira.bateria <= 15;

  const horaFormatada = empilhadeira.dataHora
    ? new Date(empilhadeira.dataHora).toLocaleTimeString("pt-BR")
    : null;

  const bateriaColor =
    bateriaBaixa
      ? "red"
      : theme.dark
        ? "lime"
        : "#2E7D32";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        styles.content,
        centralizado(LARGURA_CONTEUDO),
        { padding: espacamento },
      ]}
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

      <View style={isTablet ? styles.row : null}>
        <View style={isTablet ? styles.rowItem : null}>
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
        </View>

        <View style={isTablet ? styles.rowItem : null}>
          {/* Bateria */}
          <Card
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
            mode="elevated"
          >
            <Card.Content>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitle}>
                  {bateriaBaixa ? (
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

                <Text
                  variant="titleLarge"
                  style={{
                    color: bateriaBaixa ? theme.colors.error : theme.colors.primary,
                  }}
                >
                  {exibir(`${empilhadeira.bateria}%`)}
                </Text>
              </View>

              <ProgressBar
                progress={Math.min(
                  Math.max((empilhadeira.bateria || 0) / 100, 0),
                  1,
                )}
                color={bateriaColor}
                style={styles.progress}
              />
            </Card.Content>
          </Card>
        </View>
      </View>

      {/* Estatísticas */}
      <Text variant="titleLarge" style={styles.sectionTitle}>
        Estatísticas
      </Text>

      <View style={styles.statsGrid}>
        {/* Velocidade */}
        <Card
          style={[
            styles.statCard,
            { backgroundColor: theme.colors.surface, width: larguraStat },
          ]}
          mode="elevated"
        >
          <Card.Content>
            <Icon source="speedometer" size={28} color={theme.colors.primary} />

            <Text variant="headlineSmall" style={styles.statValue}>
              {exibir(empilhadeira.velocidade)}
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
          style={[
            styles.statCard,
            { backgroundColor: theme.colors.surface, width: larguraStat },
          ]}
          mode="elevated"
        >
          <Card.Content>
            <Icon
              source="weight-kilogram"
              size={28}
              color={theme.colors.primary}
            />

            <Text variant="headlineSmall" style={styles.statValue}>
              {exibir(empilhadeira.pesoCarga)}
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
          style={[
            styles.statCard,
            { backgroundColor: theme.colors.surface, width: larguraStat },
          ]}
          mode="elevated"
        >
          <Card.Content>
            <Icon source="thermometer" size={28} color={theme.colors.primary} />

            <Text variant="headlineSmall" style={styles.statValue}>
              {exibir(`${empilhadeira.temperatura}°C`)}
            </Text>

            <Text variant="labelMedium">Temperatura</Text>
          </Card.Content>
        </Card>

        {/* Obstáculo */}
        <Card
          style={[
            styles.statCard,
            { backgroundColor: theme.colors.surface, width: larguraStat },
          ]}
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
              {exibir(empilhadeira.obstaculo ? "Detectado" : "Livre")}
            </Text>

            <Text variant="labelMedium">Obstáculo</Text>
          </Card.Content>
        </Card>
      </View>

      <View style={isTablet ? styles.row : null}>
        <View style={isTablet ? styles.rowItem : null}>
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

                  <Text variant="headlineSmall">{exibir(empilhadeira.posicaoX.toFixed(2))}</Text>
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

                  <Text variant="headlineSmall">{exibir(empilhadeira.posicaoY.toFixed(2))}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>

        <View style={isTablet ? styles.rowItem : null}>
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
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    paddingBottom: 40,
  },

  row: {
    flexDirection: "row",
    gap: 16,
  },

  rowItem: {
    flex: 1,
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

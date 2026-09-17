import React, { useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { DataTable, Text, Chip, useTheme } from "react-native-paper";
import { formatDateTime } from "../utils/formatters.js";

export default function TelemetriaTable({ data }) {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const itemsPerPage = 10;

  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, data.length);
  const paginatedData = data.slice(from, to);

  const getBateriaColor = (bateria) => {
    const val = Number(bateria) || 0;
    if (val <= 20) return "#dc2626";
    if (val <= 50) return "#f59e0b";
    return "#16a34a";
  };

  return (
    <View
      style={[
        styles.tableCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.dark ? "#333333" : "#e0e0e0",
        },
      ]}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <DataTable style={styles.table}>
          <DataTable.Header
            style={[
              styles.tableHeader,
              {
                backgroundColor: theme.dark ? "#262626" : "#f1f5f9",
                borderBottomColor: theme.dark ? "#3a3a3a" : "#cbd5e1",
              },
            ]}
          >
            <DataTable.Title style={styles.colId}>
              <Text style={styles.headerText}># ID</Text>
            </DataTable.Title>
            <DataTable.Title style={styles.colEmp}>
              <Text style={styles.headerText}>Empilhadeira</Text>
            </DataTable.Title>
            <DataTable.Title style={styles.colData}>
              <Text style={styles.headerText}>Data / Hora</Text>
            </DataTable.Title>
            <DataTable.Title style={styles.colBateria} numeric>
              <Text style={styles.headerText}>Bateria</Text>
            </DataTable.Title>
            <DataTable.Title style={styles.colVelocidade} numeric>
              <Text style={styles.headerText}>Velocidade</Text>
            </DataTable.Title>
            <DataTable.Title style={styles.colPosicao}>
              <Text style={styles.headerText}>Posição (X, Y)</Text>
            </DataTable.Title>
            <DataTable.Title style={styles.colCarga} numeric>
              <Text style={styles.headerText}>Carga</Text>
            </DataTable.Title>
            <DataTable.Title style={styles.colTemp} numeric>
              <Text style={styles.headerText}>Temp.</Text>
            </DataTable.Title>
            <DataTable.Title style={styles.colSensor}>
              <Text style={styles.headerText}>Sensor Linha</Text>
            </DataTable.Title>
            <DataTable.Title style={styles.colObstaculo}>
              <Text style={styles.headerText}>Obstáculo</Text>
            </DataTable.Title>
          </DataTable.Header>

          {paginatedData.map((item, index) => {
            const isObstaculo = Boolean(Number(item.obstaculo));
            const bateriaVal = item.nivel_bateria ?? 0;
            const batColor = getBateriaColor(bateriaVal);

            return (
              <DataTable.Row
                key={item.id ?? index}
                style={[
                  styles.tableRow,
                  {
                    borderBottomColor: theme.dark ? "#2d2d2d" : "#f1f5f9",
                    backgroundColor:
                      index % 2 === 0
                        ? "transparent"
                        : theme.dark
                        ? "#1a1a1a"
                        : "#fafafa",
                  },
                ]}
              >
                <DataTable.Cell style={styles.colId}>
                  <Text style={[styles.idText, { color: theme.colors.primary }]}>
                    #{item.id}
                  </Text>
                </DataTable.Cell>

                <DataTable.Cell style={styles.colEmp}>
                  <View style={styles.badgeContainer}>
                    <Text style={styles.empText}>
                      EMP-{String(item.empilhadeira).padStart(3, "0")}
                    </Text>
                  </View>
                </DataTable.Cell>

                <DataTable.Cell style={styles.colData}>
                  <Text style={styles.cellText}>
                    {formatDateTime(item.data_hora)}
                  </Text>
                </DataTable.Cell>

                <DataTable.Cell style={styles.colBateria} numeric>
                  <View
                    style={[
                      styles.pillBadge,
                      { backgroundColor: `${batColor}20`, borderColor: batColor },
                    ]}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        { color: batColor, fontWeight: "bold" },
                      ]}
                    >
                      {bateriaVal}%
                    </Text>
                  </View>
                </DataTable.Cell>

                <DataTable.Cell style={styles.colVelocidade} numeric>
                  <Text style={styles.cellText}>
                    {item.velocidade != null
                      ? `${parseFloat(item.velocidade).toFixed(1)} km/h`
                      : "-"}
                  </Text>
                </DataTable.Cell>

                <DataTable.Cell style={styles.colPosicao}>
                  <Text style={styles.cellText}>
                    ({item.posicao_x ?? 0}, {item.posicao_y ?? 0})
                  </Text>
                </DataTable.Cell>

                <DataTable.Cell style={styles.colCarga} numeric>
                  <Text style={styles.cellText}>
                    {item.peso_carga != null
                      ? `${parseFloat(item.peso_carga).toFixed(2)} t`
                      : "-"}
                  </Text>
                </DataTable.Cell>

                <DataTable.Cell style={styles.colTemp} numeric>
                  <Text style={styles.cellText}>
                    {item.temperatura != null
                      ? `${parseFloat(item.temperatura).toFixed(1)} °C`
                      : "-"}
                  </Text>
                </DataTable.Cell>

                <DataTable.Cell style={styles.colSensor}>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={styles.cellText}
                  >
                    {item.sensor_linha || "Nenhum"}
                  </Text>
                </DataTable.Cell>

                <DataTable.Cell style={styles.colObstaculo}>
                  <View
                    style={[
                      styles.pillBadge,
                      {
                        backgroundColor: isObstaculo ? "#dc262620" : "#16a34a20",
                        borderColor: isObstaculo ? "#dc2626" : "#16a34a",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        {
                          color: isObstaculo ? "#dc2626" : "#16a34a",
                          fontWeight: "bold",
                        },
                      ]}
                    >
                      {isObstaculo ? "SIM" : "NÃO"}
                    </Text>
                  </View>
                </DataTable.Cell>
              </DataTable.Row>
            );
          })}
        </DataTable>
      </ScrollView>

      <DataTable.Pagination
        page={page}
        numberOfPages={Math.ceil(data.length / itemsPerPage) || 1}
        onPageChange={(p) => setPage(p)}
        label={`${from + 1}-${to} de ${data.length}`}
        showFastPaginationControls
        numberOfItemsPerPage={itemsPerPage}
        selectPageDropdownLabel="Linhas por página"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tableCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    marginVertical: 8,
  },
  table: {
    minWidth: 1000,
  },
  tableHeader: {
    borderBottomWidth: 1,
    paddingVertical: 6,
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 13,
  },
  tableRow: {
    borderBottomWidth: 1,
    minHeight: 48,
    alignItems: "center",
  },
  cellText: {
    fontSize: 12,
  },
  idText: {
    fontWeight: "bold",
    fontSize: 12,
  },
  empText: {
    fontSize: 12,
    fontWeight: "600",
  },
  badgeContainer: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pillText: {
    fontSize: 11,
  },
  // Larguras fixas de coluna para alinhamento horizontal impecável
  colId: { width: 70, justifyContent: "center" },
  colEmp: { width: 120 },
  colData: { width: 160 },
  colBateria: { width: 90, justifyContent: "center" },
  colVelocidade: { width: 110, justifyContent: "center" },
  colPosicao: { width: 120 },
  colCarga: { width: 90, justifyContent: "center" },
  colTemp: { width: 90, justifyContent: "center" },
  colSensor: { width: 130 },
  colObstaculo: { width: 100, justifyContent: "center" },
});


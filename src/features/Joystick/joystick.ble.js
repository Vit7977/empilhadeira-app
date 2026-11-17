import { PermissionsAndroid, Platform } from "react-native";
import { BleManager } from "react-native-ble-plx";

/*
 * Comunicação Bluetooth (BLE) com o ESP32 da empilhadeira.
 * Os valores abaixo precisam ser IGUAIS aos do firmware
 * (firmware/empilhadeira_ble/empilhadeira_ble.ino).
 */
export const BLE_NOME = "EMPILHADEIRA-BLE";
export const BLE_SERVICO = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
export const BLE_COMANDO = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";

const TEMPO_BUSCA_MS = 10000;

let manager = null;

// O BLE só existe no APK (não funciona no Expo Go nem na web)
export const getManager = () => {
  if (manager) return manager;

  try {
    manager = new BleManager();
  } catch {
    manager = null;
  }

  return manager;
};

export const pedirPermissoes = async () => {
  if (Platform.OS !== "android") return true;

  // Android 12+ usa as permissões de Bluetooth; versões antigas pedem localização
  const permissoes =
    Platform.Version >= 31
      ? [
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ]
      : [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];

  const resultado = await PermissionsAndroid.requestMultiple(permissoes);

  return permissoes.every(
    (p) => resultado[p] === PermissionsAndroid.RESULTS.GRANTED,
  );
};

// Procura a empilhadeira pelo nome e conecta. Retorna o id do dispositivo.
export const conectarEmpilhadeira = (ble) =>
  new Promise((resolve, reject) => {
    let finalizado = false;
    let conectando = false;

    const finalizar = (erro, id) => {
      if (finalizado) return;
      finalizado = true;
      clearTimeout(timer);
      ble.stopDeviceScan();

      if (erro) reject(erro);
      else resolve(id);
    };

    const timer = setTimeout(
      () => finalizar(new Error("Empilhadeira não encontrada")),
      TEMPO_BUSCA_MS,
    );

    ble.startDeviceScan(null, null, async (erro, dispositivo) => {
      if (erro) return finalizar(erro);

      if (finalizado || !dispositivo) return;

      // Reconhece pelo nome ou pelo serviço anunciado (o nome às vezes só vem na scan response)
      const nome = dispositivo.name || dispositivo.localName;
      const servicos = (dispositivo.serviceUUIDs ?? []).map((u) => u.toLowerCase());
      if (nome !== BLE_NOME && !servicos.includes(BLE_SERVICO)) return;
      if (conectando) return;
      conectando = true;

      ble.stopDeviceScan();

      try {
        const conectado = await dispositivo.connect({ timeout: 8000 });
        await conectado.discoverAllServicesAndCharacteristics();
        finalizar(null, conectado.id);
      } catch (e) {
        finalizar(e);
      }
    });
  });

// Envia "x,y,elevacao" (texto simples, convertido para base64 como a biblioteca exige)
export const enviarComando = (ble, id, texto) =>
  ble.writeCharacteristicWithoutResponseForDevice(
    id,
    BLE_SERVICO,
    BLE_COMANDO,
    btoa(texto),
  );

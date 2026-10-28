import { PermissionsAndroid, Platform } from "react-native";
import { BleManager } from "react-native-ble-plx";

/*
 * Comunicação Bluetooth (BLE) com o ESP32 da empilhadeira.
 * Os valores abaixo precisam ser IGUAIS aos do firmware (empilhadeira_ble.ino).
 */
export const BLE_NOME = "Empilhadeira";
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

      const nome = dispositivo?.name || dispositivo?.localName;
      if (nome !== BLE_NOME || finalizado) return;

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

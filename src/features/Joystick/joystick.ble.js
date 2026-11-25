
import { PermissionsAndroid, Platform } from "react-native";
import { BleManager } from "react-native-ble-plx";
import { encode } from "base-64";

// ========================================
// CONFIGURAÇÕES BLE DO ESP32-C3
// ========================================

export const BLE_NOME = "EMPILHADEIRA-BLE";

export const BLE_SERVICO =
  "6e400001-b5a3-f393-e0a9-e50e24dcca9e";

export const BLE_COMANDO =
  "6e400002-b5a3-f393-e0a9-e50e24dcca9e";

export const BLE_RESPOSTA =
  "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

const TEMPO_BUSCA_MS = 15000;

// ========================================
// GERENCIADOR BLE
// ========================================

let manager = null;

export const getManager = () => {
  if (!manager) {
    manager = new BleManager();
  }

  return manager;
};

// ========================================
// PERMISSÕES ANDROID
// ========================================

export const pedirPermissoes = async () => {
  if (Platform.OS !== "android") {
    return true;
  }

  try {
    const permissoes =
      Platform.Version >= 31
        ? [
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          ]
        : [
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ];

    const resultado =
      await PermissionsAndroid.requestMultiple(permissoes);

    return permissoes.every(
      (p) =>
        resultado[p] === PermissionsAndroid.RESULTS.GRANTED
    );
  } catch (erro) {
    console.log("Erro nas permissões:", erro);
    return false;
  }
};

// ========================================
// CONECTAR À EMPILHADEIRA
// ========================================

export const conectarEmpilhadeira = async (ble) => {
  if (!ble) {
    throw new Error("Gerenciador BLE não inicializado");
  }

  const permissao = await pedirPermissoes();

  if (!permissao) {
    throw new Error("Permissão Bluetooth não concedida");
  }

  return new Promise((resolve, reject) => {
    let finalizado = false;
    let conectando = false;

    const finalizar = (erro, id) => {
      if (finalizado) return;

      finalizado = true;

      clearTimeout(timer);
      ble.stopDeviceScan();

      if (erro) {
        reject(erro);
      } else {
        resolve(id);
      }
    };

    const timer = setTimeout(() => {
      finalizar(
        new Error("EMPILHADEIRA-BLE não encontrada")
      );
    }, TEMPO_BUSCA_MS);

    ble.startDeviceScan(
      null,
      null,
      async (erro, dispositivo) => {
        if (finalizado) return;

        if (erro) {
          finalizar(erro);
          return;
        }

        if (!dispositivo || conectando) return;

        const nome =
          dispositivo.name || dispositivo.localName;

        const servicos = (
          dispositivo.serviceUUIDs || []
        ).map((uuid) => uuid.toLowerCase());

        const encontrado =
          nome === BLE_NOME ||
          servicos.includes(BLE_SERVICO);

        if (!encontrado) return;

        conectando = true;
        ble.stopDeviceScan();

        try {
          console.log("Dispositivo encontrado:", nome);

          const conectado = await dispositivo.connect({
            timeout: 10000,
          });

          await conectado.discoverAllServicesAndCharacteristics();

          // Confirma a existência do serviço e característica RX
          const servico = await conectado.services();

          const existeServico = servico.some(
            (s) => s.uuid.toLowerCase() === BLE_SERVICO
          );

          if (!existeServico) {
            throw new Error("Serviço BLE não encontrado");
          }

          const caracteristicas =
            await conectado.characteristicsForService(
              BLE_SERVICO
            );

          const existeRX = caracteristicas.some(
            (c) => c.uuid.toLowerCase() === BLE_COMANDO
          );

          if (!existeRX) {
            throw new Error("Característica RX não encontrada");
          }

          console.log("Empilhadeira conectada:", conectado.id);

          finalizar(null, conectado.id);

        } catch (e) {
          finalizar(e);
        }
      }
    );
  });
};

// ========================================
// ENVIAR COMANDOS PARA O ESP32
// ========================================

export const enviarComando = async (ble, id, texto) => {
  if (!ble || !id) {
    throw new Error("ESP32 não está conectado");
  }

  const comando = String(texto).trim();

  if (!comando) {
    throw new Error("Comando vazio");
  }

  console.log("Enviando para ESP32:", comando);

  const base64 = encode(comando);

  try {
    await ble.writeCharacteristicWithoutResponseForDevice(
      id,
      BLE_SERVICO,
      BLE_COMANDO,
      base64
    );

    return true;

  } catch (erro) {
    console.log("Erro ao enviar comando:", erro);
    throw erro;
  }
};

// ========================================
// COMANDO DO JOYSTICK
// ========================================
// Formato enviado: "x,y,garfo"
//   x     -100 (esquerda) .. 100 (direita)
//   y     -100 (trás)     .. 100 (frente)
//   garfo -100 (desce)    .. 100 (sobe), 0 = garfo parado

export const enviarJoystick = async (
  ble,
  id,
  x,
  y,
  garfo = 0
) => {
  const limitar = (valor) =>
    Math.max(-100, Math.min(100, Math.round(valor)));

  x = limitar(x);
  y = limitar(y);
  garfo = limitar(garfo);

  const comando = `${x},${y},${garfo}`;

  return enviarComando(ble, id, comando);
};

// ========================================
// PARAR OS MOTORES
// ========================================

export const pararEmpilhadeira = async (ble, id) => {
  try {
    // "PARAR" também cancela a volta automática do garfo à base
    await enviarComando(ble, id, "PARAR");
    await enviarJoystick(ble, id, 0, 0, 0);
    console.log("Motores parados");
    return true;
  } catch (erro) {
    console.log("Erro ao parar:", erro);
    return false;
  }
};

// ========================================
// GARFO 0%: DESCE SOZINHO ATÉ A BASE
// ========================================
// O ESP32 desce o garfo até a chave de fim de curso da base.
// Para no fim de curso, no PARAR ou se o slider for movido.

export const baixarGarfo = async (ble, id) => {
  return enviarComando(ble, id, "BASE");
};

// ========================================
// DESCONECTAR
// ========================================

export const desconectarEmpilhadeira = async (ble, id) => {
  if (!ble || !id) return;

  try {
    await pararEmpilhadeira(ble, id);
  } catch (erro) {
    console.log("Não foi possível enviar parada:", erro);
  }

  try {
    await ble.cancelDeviceConnection(id);
    console.log("Empilhadeira desconectada");
  } catch (erro) {
    console.log("Erro ao desconectar:", erro);
  }
};

// ========================================
// VERIFICAR CONEXÃO
// ========================================

export const verificarConexao = async (ble, id) => {
  try {
    const dispositivo = await ble.isDeviceConnected(id);
    return dispositivo;
  } catch {
    return false;
  }
};
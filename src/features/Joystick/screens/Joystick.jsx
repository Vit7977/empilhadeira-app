import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import {
  getManager,
  pedirPermissoes,
  conectarEmpilhadeira,
  enviarComando,
} from "../joystick.ble.js";

const CORES = {
  fundo: "#000000",
  base: "#b3b3b3",
  borda: "#a3a3a3",
  manopla: "#a6a6a6",
  parar: "#d32f2f",
};

// Texto e cor de cada estado da conexão Bluetooth
const CONEXAO = {
  procurando: { texto: "Procurando a empilhadeira...", cor: "#f5b700" },
  conectado: { texto: "Conectado via Bluetooth", cor: "#22c55e" },
  desconectado: {
    texto: "Empilhadeira não encontrada — tentando de novo...",
    cor: "#ef4444",
  },
  "bluetooth-desligado": { texto: "Ligue o Bluetooth do celular", cor: "#ef4444" },
  "sem-permissao": {
    texto: "Permita o Bluetooth nas configurações do app",
    cor: "#ef4444",
  },
  indisponivel: {
    texto: "Bluetooth indisponível — use o app instalado (APK), não o Expo Go",
    cor: "#ef4444",
  },
};

// O ESP32 para os motores se ficar 500 ms sem receber comando
const INTERVALO_ENVIO_MS = 100;

const limitar = (valor, min, max) => Math.min(Math.max(valor, min), max);

export default function Joystick({ navigation }) {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  // Os controles só aparecem com o celular na horizontal
  const janela = useWindowDimensions();
  const vertical = janela.height > janela.width;

  const [area, setArea] = useState({ width: 0, height: 0 });

  // direcao: x/y de -1 a 1 (y positivo = frente)
  // elevacao: 0 (embaixo) a 1 (em cima) — mantém a posição ao soltar
  const [direcao, setDirecao] = useState({ x: 0, y: 0 });
  const [elevacao, setElevacao] = useState(0);

  // Último comando, lido pelo envio periódico sem recriar a conexão
  const comandoRef = useRef({ direcao, elevacao });
  comandoRef.current = { direcao, elevacao };

  const dispositivoRef = useRef(null); // id do ESP32 conectado
  const enviandoRef = useRef(false); // evita acumular envios se o Bluetooth atrasar
  const [conexao, setConexao] = useState("procurando");

  const joystickRef = useRef(null);
  const sliderRef = useRef(null);

  // Posição dos controles na tela (pageX/pageY)
  const limites = useRef({ joystick: null, slider: null });

  // Toque (identifier) que está controlando cada controle
  const toques = useRef({ joystick: null, slider: null, vistos: new Set() });

  /*
   * ============================
   * DIMENSÕES (proporções da imagem de referência)
   * ============================
   */
  const diametro = Math.max(
    0,
    Math.min(area.width * 0.55, (area.height * 0.9) / 1.26, 700)
  );
  const borda = Math.max(2, diametro * 0.02);
  const manoplaJoystick = diametro * 0.47;
  const raioMax = (diametro - manoplaJoystick) / 2 - borda;

  const sliderLargura = diametro * 0.47;
  const sliderAltura = diametro * 1.26;
  const sliderPadding = sliderLargura * 0.12;
  const manoplaSlider = sliderLargura - sliderPadding * 2;
  const cursoSlider = sliderAltura - manoplaSlider - sliderPadding * 2;

  const medir = (nome, ref) => {
    ref.current?.measure((x, y, width, height, pageX, pageY) => {
      limites.current[nome] = { x: pageX, y: pageY, width, height };
    });
  };

  /*
   * ============================
   * TOQUES
   * ============================
   */
  const dentroJoystick = (t) => {
    const b = limites.current.joystick;
    if (!b) return false;

    const dx = t.pageX - (b.x + b.width / 2);
    const dy = t.pageY - (b.y + b.height / 2);
    return Math.hypot(dx, dy) <= b.width / 2;
  };

  const dentroSlider = (t) => {
    const b = limites.current.slider;
    if (!b) return false;

    return (
      t.pageX >= b.x &&
      t.pageX <= b.x + b.width &&
      t.pageY >= b.y &&
      t.pageY <= b.y + b.height
    );
  };

  const atualizarJoystick = (t) => {
    const b = limites.current.joystick;
    if (!b || raioMax <= 0) return;

    let dx = t.pageX - (b.x + b.width / 2);
    let dy = t.pageY - (b.y + b.height / 2);
    const distancia = Math.hypot(dx, dy);

    if (distancia > raioMax) {
      dx = (dx / distancia) * raioMax;
      dy = (dy / distancia) * raioMax;
    }

    setDirecao({ x: dx / raioMax, y: -dy / raioMax });
  };

  const atualizarSlider = (t) => {
    const b = limites.current.slider;
    if (!b || cursoSlider <= 0) return;

    const centroMinimo = b.y + b.height - sliderPadding - manoplaSlider / 2;
    setElevacao(limitar((centroMinimo - t.pageY) / cursoSlider, 0, 1));
  };

  const soltarTudo = () => {
    toques.current = { joystick: null, slider: null, vistos: new Set() };
    setDirecao({ x: 0, y: 0 });
  };

  /*
   * ============================
   * COMUNICAÇÃO COM O ESP32 (BLUETOOTH)
   * ============================
   * Envia "x,y,elevacao" (x/y de -100 a 100, elevação de 0 a 100).
   * O firmware lê os dois primeiros valores; a elevação fica pronta para quando houver motor de garfo.
   */
  const formatarComando = (x, y, e) =>
    `${Math.round(x * 100)},${Math.round(y * 100)},${Math.round(e * 100)}`;

  const enviar = (x, y, e) => {
    const ble = getManager();
    const id = dispositivoRef.current;
    if (!ble || !id || enviandoRef.current) return;

    enviandoRef.current = true;
    enviarComando(ble, id, formatarComando(x, y, e))
      .catch(() => {})
      .finally(() => {
        enviandoRef.current = false;
      });
  };

  // O próximo envio periódico (até 100 ms) já leva o comando de parada
  const parar = () => soltarTudo();

  // Só fica conectado enquanto a tela do Joystick estiver aberta
  useEffect(() => {
    if (!isFocused) return;

    const ble = getManager();
    if (!ble) {
      setConexao("indisponivel");
      return;
    }

    let ativo = true;
    let timer = null;
    let assinaturaDesconexao = null;

    const tentarDeNovo = (estado, espera) => {
      if (!ativo) return;
      setConexao(estado);
      timer = setTimeout(conectar, espera);
    };

    const conectar = async () => {
      if (!ativo) return;

      try {
        if (!(await pedirPermissoes())) {
          setConexao("sem-permissao");
          return;
        }

        const estado = await ble.state();
        if (estado === "Unauthorized") {
          setConexao("sem-permissao");
          return;
        }
        if (estado !== "PoweredOn") {
          // "Unknown"/"Resetting" acontecem por instantes ao abrir o app
          tentarDeNovo(
            estado === "PoweredOff" ? "bluetooth-desligado" : "procurando",
            1000,
          );
          return;
        }

        setConexao("procurando");
        const id = await conectarEmpilhadeira(ble);

        if (!ativo) {
          ble.cancelDeviceConnection(id).catch(() => {});
          return;
        }

        dispositivoRef.current = id;
        setConexao("conectado");

        assinaturaDesconexao = ble.onDeviceDisconnected(id, () => {
          assinaturaDesconexao?.remove();
          dispositivoRef.current = null;
          soltarTudo();
          tentarDeNovo("desconectado", 1000);
        });
      } catch {
        tentarDeNovo("desconectado", 2000);
      }
    };

    conectar();

    const envioTimer = setInterval(() => {
      const { direcao: d, elevacao: e } = comandoRef.current;
      enviar(d.x, d.y, e);
    }, INTERVALO_ENVIO_MS);

    return () => {
      ativo = false;
      clearInterval(envioTimer);
      clearTimeout(timer);
      assinaturaDesconexao?.remove();
      ble.stopDeviceScan();

      // Manda parar os motores e só então desconecta
      const id = dispositivoRef.current;
      dispositivoRef.current = null;
      if (id) {
        enviarComando(ble, id, formatarComando(0, 0, comandoRef.current.elevacao))
          .catch(() => {})
          .finally(() => ble.cancelDeviceConnection(id).catch(() => {}));
      }

      soltarTudo();
    };
  }, [isFocused]);

  // Ao virar para a vertical os controles somem: solta o que estiver pressionado
  useEffect(() => {
    if (vertical) soltarTudo();
  }, [vertical]);

  const processarToques = (evt) => {
    const ativos = evt.nativeEvent.touches ?? [];
    const ids = ativos.map((t) => t.identifier);
    const atual = toques.current;

    // Libera os controles cujo dedo foi retirado
    if (atual.joystick !== null && !ids.includes(atual.joystick)) {
      atual.joystick = null;
      setDirecao({ x: 0, y: 0 });
    }

    if (atual.slider !== null && !ids.includes(atual.slider)) {
      atual.slider = null;
    }

    atual.vistos.forEach((id) => {
      if (!ids.includes(id)) atual.vistos.delete(id);
    });

    ativos.forEach((t) => {
      // Um toque só assume um controle se começou em cima dele
      if (!atual.vistos.has(t.identifier)) {
        atual.vistos.add(t.identifier);

        if (atual.joystick === null && dentroJoystick(t)) {
          atual.joystick = t.identifier;
        } else if (atual.slider === null && dentroSlider(t)) {
          atual.slider = t.identifier;
        }
      }

      if (t.identifier === atual.joystick) atualizarJoystick(t);
      else if (t.identifier === atual.slider) atualizarSlider(t);
    });
  };

  return (
    <View style={styles.tela}>
      {/* ============================
          VOLTAR AO DASHBOARD
      ============================ */}
      <TouchableOpacity
        onPress={() => navigation?.navigate?.("Dashboard")}
        activeOpacity={0.7}
        style={[
          styles.voltar,
          { top: insets.top + 12, left: insets.left + 12 },
        ]}
      >
        <Ionicons name="arrow-back" size={28} color={CORES.base} />
      </TouchableOpacity>

      {/* ============================
          STATUS DA CONEXÃO
      ============================ */}
      <View
        pointerEvents="none"
        style={[
          styles.status,
          {
            top: insets.top + 18,
            left: insets.left + 64,
            right: insets.right + 140,
          },
        ]}
      >
        <View
          style={[
            styles.statusPonto,
            { backgroundColor: CONEXAO[conexao].cor },
          ]}
        />
        <Text style={styles.statusTexto} numberOfLines={1}>
          {CONEXAO[conexao].texto}
        </Text>
      </View>

      {/* ============================
          PARADA DE EMERGÊNCIA
      ============================ */}
      <TouchableOpacity
        onPress={parar}
        activeOpacity={0.7}
        style={[
          styles.parar,
          { top: insets.top + 12, right: insets.right + 12 },
        ]}
      >
        <Ionicons name="stop" size={18} color="#ffffff" />
        <Text style={styles.pararTexto}>PARAR</Text>
      </TouchableOpacity>

      {/* ============================
          AVISO: VIRE O CELULAR
      ============================ */}
      {vertical ? (
        <View style={styles.aviso}>
          <Ionicons
            name="phone-landscape-outline"
            size={72}
            color={CORES.base}
          />
          <Text style={styles.avisoTitulo}>Vire o celular</Text>
          <Text style={styles.avisoTexto}>
            Use o celular na horizontal para controlar a empilhadeira.
          </Text>
        </View>
      ) : (
        <View
          style={styles.container}
          onLayout={(e) => setArea(e.nativeEvent.layout)}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderTerminationRequest={() => false}
          onResponderGrant={processarToques}
          onResponderStart={processarToques}
          onResponderMove={processarToques}
          onResponderEnd={processarToques}
          onResponderRelease={soltarTudo}
          onResponderTerminate={soltarTudo}
        >
          {diametro > 0 && (
            <>
              {/* ============================
                  JOYSTICK (DIREÇÃO)
              ============================ */}
              <View
                ref={joystickRef}
                onLayout={() => medir("joystick", joystickRef)}
                style={[
                  styles.base,
                  {
                    width: diametro,
                    height: diametro,
                    borderRadius: diametro / 2,
                    borderWidth: borda,
                    alignItems: "center",
                    justifyContent: "center",
                  },
                ]}
              >
                <View
                  style={[
                    styles.manopla,
                    {
                      width: manoplaJoystick,
                      height: manoplaJoystick,
                      borderRadius: manoplaJoystick / 2,
                      transform: [
                        { translateX: direcao.x * raioMax },
                        { translateY: -direcao.y * raioMax },
                      ],
                    },
                  ]}
                />
              </View>

              {/* ============================
                  SLIDER (ELEVAÇÃO)
              ============================ */}
              <View
                ref={sliderRef}
                onLayout={() => medir("slider", sliderRef)}
                style={[
                  styles.base,
                  {
                    width: sliderLargura,
                    height: sliderAltura,
                    borderRadius: sliderLargura / 2,
                    borderWidth: borda,
                  },
                ]}
              >
                <View
                  style={[
                    styles.manopla,
                    {
                      position: "absolute",
                      left: sliderPadding - borda,
                      bottom: sliderPadding - borda,
                      width: manoplaSlider,
                      height: manoplaSlider,
                      borderRadius: manoplaSlider / 2,
                      transform: [{ translateY: -elevacao * cursoSlider }],
                    },
                  ]}
                />
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: CORES.fundo,
  },

  voltar: {
    position: "absolute",
    zIndex: 1,
    padding: 8,
  },

  status: {
    position: "absolute",
    zIndex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  statusPonto: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  statusTexto: {
    color: CORES.base,
    fontSize: 14,
    flexShrink: 1,
  },

  parar: {
    position: "absolute",
    zIndex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: CORES.parar,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },

  pararTexto: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },

  aviso: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  avisoTitulo: {
    color: CORES.base,
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 16,
    textAlign: "center",
  },

  avisoTexto: {
    color: CORES.borda,
    fontSize: 15,
    marginTop: 8,
    textAlign: "center",
  },

  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: CORES.fundo,
  },

  base: {
    backgroundColor: CORES.base,
    borderColor: CORES.borda,
  },

  manopla: {
    backgroundColor: CORES.manopla,
  },
});

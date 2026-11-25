import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
  Text,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import {
  getManager,
  pedirPermissoes,
  conectarEmpilhadeira,
  enviarJoystick,
  desconectarEmpilhadeira,
  verificarConexao,
  pararEmpilhadeira,
  baixarGarfo,
} from "../joystick.ble.js";

// Paleta (troque aqui para mudar o visual inteiro)
const CORES = {
  fundo: "#0f1115",
  painel: "#181b21",
  base: "#20242b",
  borda: "#2e343e",
  guia: "#3b4350",
  manopla: "#e6e8eb",
  manoplaMiolo: "#c9cdd3",
  destaque: "#f5b700", // amarelo "empilhadeira"
  texto: "#e6e8eb",
  textoSec: "#8b93a1",
  parar: "#e53935",
  pararPressionado: "#b71c1c",
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

// Espaço reservado para o rótulo embaixo de cada controle
const ALTURA_ROTULO = 56; // rótulo / botão GARFO 0%

// Slider do garfo ao soltar o dedo:
//   true  = volta devagar ao centro e o garfo para
//   false = fica onde você soltou e o garfo continua (para no fim de curso
//           ou quando você leva o slider de volta ao centro / aperta PARAR)
const SLIDER_VOLTA_AO_CENTRO = false;

// Tempo da volta ao centro (aumente para ficar mais lento)
const TEMPO_RETORNO_SLIDER_MS = 400;

const limitar = (valor, min, max) => Math.min(Math.max(valor, min), max);

// No Expo Go o módulo nativo não existe e `new BleManager()` lança erro
const obterBle = () => {
  try {
    return getManager();
  } catch {
    return null;
  }
};

// Texto do painel central
const descreverDirecao = ({ x, y }) => {
  if (Math.hypot(x, y) < 0.1) return "Parado";
  if (Math.abs(y) >= Math.abs(x)) return y > 0 ? "Frente" : "Ré";
  return x > 0 ? "Direita" : "Esquerda";
};

const descreverGarfo = (e) => {
  if (e > 0.1) return "Subindo";
  if (e < -0.1) return "Descendo";
  return "Parado";
};

export default function Joystick({ navigation }) {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  // Os controles só aparecem com o celular na horizontal
  const janela = useWindowDimensions();
  const vertical = janela.height > janela.width;

  const [area, setArea] = useState({ width: 0, height: 0 });

  // direcao: x/y de -1 a 1 (y positivo = frente)
  // elevacao: velocidade do garfo, -1 (desce) a 1 (sobe)
  //   funciona como alavanca: volta ao centro (garfo parado) ao soltar
  const [direcao, setDirecao] = useState({ x: 0, y: 0 });
  const [elevacao, setElevacao] = useState(0);

  // Último comando, lido pelo envio periódico sem recriar a conexão
  const comandoRef = useRef({ direcao, elevacao });
  comandoRef.current = { direcao, elevacao };

  const bleRef = useRef(null); // BleManager em uso
  const dispositivoRef = useRef(null); // id do ESP32 conectado
  const enviandoRef = useRef(false); // evita acumular envios se o Bluetooth atrasar
  const [conexao, setConexao] = useState("procurando");

  const joystickRef = useRef(null);
  const sliderRef = useRef(null);

  // Posição dos controles na tela (pageX/pageY)
  const limites = useRef({ joystick: null, slider: null });

  // Toque (identifier) que está controlando cada controle
  const toques = useRef({ joystick: null, slider: null, vistos: new Set() });

  // Posição animada das manoplas (volta ao centro com efeito de mola)
  const posJoystick = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const posSlider = useRef(new Animated.Value(0)).current;

  /*
   * ============================
   * DIMENSÕES (se adaptam a qualquer tela)
   * ============================
   * O joystick e o slider têm a mesma altura. O painel central com as
   * informações só aparece se houver largura suficiente (tablets e celulares grandes).
   */
  const mostrarPainel = area.width >= 560;
  const alturaUtil = Math.max(0, area.height - ALTURA_ROTULO);

  const diametro = Math.max(
    0,
    Math.min(alturaUtil, area.width * (mostrarPainel ? 0.38 : 0.52), 460)
  );
  const borda = Math.max(2, diametro * 0.015);
  const manoplaJoystick = diametro * 0.42;
  const raioMax = (diametro - manoplaJoystick) / 2 - borda;
  const interno = diametro - borda * 2; // área dentro da borda
  const tamanhoSeta = Math.max(14, diametro * 0.09);
  const margemSeta = diametro * 0.035;

  const sliderLargura = diametro * 0.42;
  const sliderAltura = diametro;
  const sliderPadding = sliderLargura * 0.1;
  const manoplaSlider = sliderLargura - sliderPadding * 2;
  const cursoSlider = sliderAltura - manoplaSlider - sliderPadding * 2;
  const sliderInternoAltura = sliderAltura - borda * 2;
  const trilhoLargura = sliderLargura * 0.16;

  const fonteRotulo = limitar(diametro * 0.055, 11, 15);

  const medir = (nome, ref) => {
    ref.current?.measure((x, y, width, height, pageX, pageY) => {
      limites.current[nome] = { x: pageX, y: pageY, width, height };
    });
  };

  /*
   * ============================
   * ANIMAÇÃO DAS MANOPLAS
   * ============================
   * Enquanto o dedo está no controle, a manopla acompanha o dedo.
   * Ao soltar, ela volta ao centro com uma mola.
   */
  useEffect(() => {
    if (direcao.x === 0 && direcao.y === 0) {
      Animated.spring(posJoystick, {
        toValue: { x: 0, y: 0 },
        friction: 5,
        tension: 90,
        useNativeDriver: true,
      }).start();
    } else {
      posJoystick.stopAnimation();
      posJoystick.setValue({ x: direcao.x * raioMax, y: -direcao.y * raioMax });
    }
  }, [direcao, raioMax]);

  useEffect(() => {
    if (elevacao === 0) {
      // Retorno suave, sem quique
      Animated.timing(posSlider, {
        toValue: 0,
        duration: TEMPO_RETORNO_SLIDER_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      posSlider.stopAnimation();
      posSlider.setValue((-elevacao * cursoSlider) / 2);
    }
  }, [elevacao, cursoSlider]);

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

    // Centro do slider = garfo parado; para cima sobe, para baixo desce
    const centro = b.y + b.height / 2;
    const meioCurso = cursoSlider / 2;
    setElevacao(limitar((centro - t.pageY) / meioCurso, -1, 1));
  };

  const soltarTudo = () => {
    toques.current = { joystick: null, slider: null, vistos: new Set() };
    setDirecao({ x: 0, y: 0 });
    setElevacao(0);
  };

  // Todos os dedos saíram da tela: o joystick sempre volta ao centro;
  // o slider do garfo só volta se SLIDER_VOLTA_AO_CENTRO for true
  const soltarDedos = () => {
    toques.current = { joystick: null, slider: null, vistos: new Set() };
    setDirecao({ x: 0, y: 0 });
    if (SLIDER_VOLTA_AO_CENTRO) setElevacao(0);
  };

  /*
   * ============================
   * COMUNICAÇÃO COM O ESP32 (BLUETOOTH)
   * ============================
   * enviarJoystick() já arredonda, limita (tudo de -100 a 100)
   * e monta a string "x,y,garfo". Aqui só convertemos a escala (-1..1 → -100..100).
   * O firmware mistura x/y para as duas rodas e usa o 3º valor como velocidade do garfo.
   */
  const enviar = (x, y, e) => {
    const ble = bleRef.current;
    const id = dispositivoRef.current;
    if (!ble || !id || enviandoRef.current) return;

    enviandoRef.current = true;
    enviarJoystick(ble, id, x * 100, y * 100, e * 100)
      .catch(() => {})
      .finally(() => {
        enviandoRef.current = false;
      });
  };

  // Parada de emergência: para rodas e garfo e já manda o comando, sem esperar o próximo ciclo
  const parar = () => {
    soltarTudo();

    const ble = bleRef.current;
    const id = dispositivoRef.current;
    if (ble && id) {
      pararEmpilhadeira(ble, id);
    }
  };

  // Botão "GARFO 0%": centraliza o slider e manda o garfo descer até a base
  const garfoParaBase = () => {
    toques.current.slider = null;
    setElevacao(0);

    const ble = bleRef.current;
    const id = dispositivoRef.current;
    if (ble && id) {
      baixarGarfo(ble, id).catch(() => {});
    }
  };

  // Só fica conectado enquanto a tela do Joystick estiver aberta
  useEffect(() => {
    if (!isFocused) return;

    const ble = obterBle();
    bleRef.current = ble;

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
            1000
          );
          return;
        }

        setConexao("procurando");
        const id = await conectarEmpilhadeira(ble);

        if (!ativo) {
          ble.cancelDeviceConnection(id).catch(() => {});
          return;
        }

        // Garante que a conexão não caiu logo depois de estabelecida
        if (!(await verificarConexao(ble, id))) {
          tentarDeNovo("desconectado", 1000);
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
      if (id) desconectarEmpilhadeira(ble, id);

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
      if (SLIDER_VOLTA_AO_CENTRO) setElevacao(0); // soltou o slider: garfo para
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

  /*
   * ============================
   * ESTADO VISUAL
   * ============================
   */
  const joystickAtivo = direcao.x !== 0 || direcao.y !== 0;
  const sliderAtivo = elevacao !== 0;
  const tracao = Math.round(Math.min(1, Math.hypot(direcao.x, direcao.y)) * 100);
  const garfo = Math.round(Math.abs(elevacao) * 100);

  const corSeta = (acesa) => (acesa ? CORES.destaque : CORES.guia);

  // Barra amarela do centro do slider até a manopla
  const alturaPreenchimento = (Math.abs(elevacao) * cursoSlider) / 2;
  const centroSlider = sliderInternoAltura / 2;

  return (
    <View style={styles.tela}>
      {/* ============================
          BARRA SUPERIOR
      ============================ */}
      <View
        style={[
          styles.topo,
          {
            paddingTop: insets.top + 8,
            paddingLeft: insets.left + 12,
            paddingRight: insets.right + 12,
          },
        ]}
      >
        <Pressable
          onPress={() => navigation?.navigate?.("Dashboard")}
          hitSlop={8}
          style={({ pressed }) => [
            styles.botaoVoltar,
            pressed && styles.pressionado,
          ]}
        >
          <Ionicons name="arrow-back" size={22} color={CORES.texto} />
        </Pressable>

        <View style={styles.status} pointerEvents="none">
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

        <Pressable
          onPress={parar}
          hitSlop={8}
          style={({ pressed }) => [
            styles.parar,
            pressed && {
              backgroundColor: CORES.pararPressionado,
              transform: [{ scale: 0.96 }],
            },
          ]}
        >
          <Ionicons name="stop" size={18} color="#ffffff" />
          <Text style={styles.pararTexto}>PARAR</Text>
        </Pressable>
      </View>

      {/* ============================
          AVISO: VIRE O CELULAR
      ============================ */}
      {vertical ? (
        <View style={styles.aviso}>
          <View style={styles.avisoIcone}>
            <Ionicons
              name="phone-landscape-outline"
              size={56}
              color={CORES.destaque}
            />
          </View>
          <Text style={styles.avisoTitulo}>Vire o celular</Text>
          <Text style={styles.avisoTexto}>
            Use o celular na horizontal para controlar a empilhadeira.
          </Text>
        </View>
      ) : (
        <View
          style={[
            styles.areaControles,
            {
              paddingLeft: insets.left + 20,
              paddingRight: insets.right + 20,
              paddingBottom: insets.bottom + 8,
            },
          ]}
        >
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
            onResponderRelease={soltarDedos}
            onResponderTerminate={soltarTudo}
          >
            {diametro > 0 && (
              <>
                {/* ============================
                    JOYSTICK (DIREÇÃO)
                ============================ */}
                <View style={styles.coluna}>
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
                        borderColor: joystickAtivo
                          ? CORES.destaque
                          : CORES.borda,
                      },
                    ]}
                  >
                    {/* Anel que marca o limite da manopla */}
                    <View
                      pointerEvents="none"
                      style={[
                        styles.anelGuia,
                        {
                          width: raioMax * 2,
                          height: raioMax * 2,
                          borderRadius: raioMax,
                          left: interno / 2 - raioMax,
                          top: interno / 2 - raioMax,
                        },
                      ]}
                    />

                    {/* Setas de direção (acendem conforme o movimento) */}
                    <Ionicons
                      name="chevron-up"
                      size={tamanhoSeta}
                      color={corSeta(direcao.y > 0.3)}
                      style={[
                        styles.seta,
                        { top: margemSeta, left: (interno - tamanhoSeta) / 2 },
                      ]}
                    />
                    <Ionicons
                      name="chevron-down"
                      size={tamanhoSeta}
                      color={corSeta(direcao.y < -0.3)}
                      style={[
                        styles.seta,
                        {
                          bottom: margemSeta,
                          left: (interno - tamanhoSeta) / 2,
                        },
                      ]}
                    />
                    <Ionicons
                      name="chevron-back"
                      size={tamanhoSeta}
                      color={corSeta(direcao.x < -0.3)}
                      style={[
                        styles.seta,
                        { left: margemSeta, top: (interno - tamanhoSeta) / 2 },
                      ]}
                    />
                    <Ionicons
                      name="chevron-forward"
                      size={tamanhoSeta}
                      color={corSeta(direcao.x > 0.3)}
                      style={[
                        styles.seta,
                        {
                          right: margemSeta,
                          top: (interno - tamanhoSeta) / 2,
                        },
                      ]}
                    />

                    {/* Manopla */}
                    <Animated.View
                      pointerEvents="none"
                      style={[
                        styles.manopla,
                        {
                          position: "absolute",
                          left: (interno - manoplaJoystick) / 2,
                          top: (interno - manoplaJoystick) / 2,
                          width: manoplaJoystick,
                          height: manoplaJoystick,
                          borderRadius: manoplaJoystick / 2,
                          backgroundColor: joystickAtivo
                            ? CORES.destaque
                            : CORES.manopla,
                          transform: posJoystick.getTranslateTransform(),
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.manoplaMiolo,
                          {
                            width: manoplaJoystick * 0.55,
                            height: manoplaJoystick * 0.55,
                            borderRadius: manoplaJoystick * 0.275,
                          },
                        ]}
                      />
                    </Animated.View>
                  </View>

                  <View style={styles.rodape}>
                    <Text style={[styles.rotulo, { fontSize: fonteRotulo }]}>
                      DIREÇÃO
                    </Text>
                  </View>
                </View>

                {/* ============================
                    PAINEL CENTRAL (telas largas)
                ============================ */}
                {mostrarPainel && (
                  <View style={styles.painel} pointerEvents="none">
                    <View style={styles.cartao}>
                      <Ionicons
                        name="speedometer-outline"
                        size={20}
                        color={joystickAtivo ? CORES.destaque : CORES.textoSec}
                      />
                      <View style={styles.cartaoTextos}>
                        <Text style={styles.cartaoTitulo}>Tração</Text>
                        <Text style={styles.cartaoValor}>
                          {descreverDirecao(direcao)}
                          {joystickAtivo ? ` · ${tracao}%` : ""}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cartao}>
                      <Ionicons
                        name={
                          elevacao > 0.1
                            ? "arrow-up-circle-outline"
                            : elevacao < -0.1
                            ? "arrow-down-circle-outline"
                            : "remove-circle-outline"
                        }
                        size={20}
                        color={sliderAtivo ? CORES.destaque : CORES.textoSec}
                      />
                      <View style={styles.cartaoTextos}>
                        <Text style={styles.cartaoTitulo}>Garfo</Text>
                        <Text style={styles.cartaoValor}>
                          {descreverGarfo(elevacao)}
                          {sliderAtivo ? ` · ${garfo}%` : ""}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* ============================
                    SLIDER (GARFO: SOBE / DESCE)
                ============================ */}
                <View style={styles.coluna}>
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
                        borderColor: sliderAtivo
                          ? CORES.destaque
                          : CORES.borda,
                      },
                    ]}
                  >
                    {/* Trilho central */}
                    <View
                      pointerEvents="none"
                      style={[
                        styles.trilho,
                        {
                          width: trilhoLargura,
                          borderRadius: trilhoLargura / 2,
                          left: (sliderLargura - borda * 2 - trilhoLargura) / 2,
                          top: sliderPadding + manoplaSlider / 2 - borda,
                          bottom: sliderPadding + manoplaSlider / 2 - borda,
                        },
                      ]}
                    />

                    {/* Preenchimento: mostra para onde e quão rápido o garfo vai */}
                    {sliderAtivo && (
                      <View
                        pointerEvents="none"
                        style={{
                          position: "absolute",
                          width: trilhoLargura,
                          borderRadius: trilhoLargura / 2,
                          left: (sliderLargura - borda * 2 - trilhoLargura) / 2,
                          height: alturaPreenchimento,
                          top:
                            elevacao > 0
                              ? centroSlider - alturaPreenchimento
                              : centroSlider,
                          backgroundColor: CORES.destaque,
                          opacity: 0.6,
                        }}
                      />
                    )}

                    {/* Marca do centro (garfo parado) */}
                    <View
                      pointerEvents="none"
                      style={[
                        styles.marcaCentro,
                        {
                          top: centroSlider - 1,
                          left: sliderPadding,
                          right: sliderPadding,
                        },
                      ]}
                    />

                    {/* Setas sobe / desce */}
                    <View
                      pointerEvents="none"
                      style={[styles.setaSlider, { top: sliderPadding * 0.6 }]}
                    >
                      <Ionicons
                        name="chevron-up"
                        size={tamanhoSeta}
                        color={corSeta(elevacao > 0.1)}
                      />
                    </View>
                    <View
                      pointerEvents="none"
                      style={[
                        styles.setaSlider,
                        { bottom: sliderPadding * 0.6 },
                      ]}
                    >
                      <Ionicons
                        name="chevron-down"
                        size={tamanhoSeta}
                        color={corSeta(elevacao < -0.1)}
                      />
                    </View>

                    {/* Manopla: em repouso fica no centro (garfo parado) */}
                    <Animated.View
                      pointerEvents="none"
                      style={[
                        styles.manopla,
                        {
                          position: "absolute",
                          left: sliderPadding - borda,
                          bottom: sliderPadding - borda + cursoSlider / 2,
                          width: manoplaSlider,
                          height: manoplaSlider,
                          borderRadius: manoplaSlider / 2,
                          backgroundColor: sliderAtivo
                            ? CORES.destaque
                            : CORES.manopla,
                          transform: [{ translateY: posSlider }],
                        },
                      ]}
                    >
                      <Ionicons
                        name="swap-vertical"
                        size={manoplaSlider * 0.4}
                        color={sliderAtivo ? "#3a2c00" : CORES.textoSec}
                      />
                    </Animated.View>
                  </View>

                  {/* Botão GARFO 0%: desce o garfo até a base */}
                  <View style={styles.rodape}>
                    <Pressable
                      onPress={garfoParaBase}
                      hitSlop={6}
                      style={({ pressed }) => [
                        styles.botaoBase,
                        pressed && styles.botaoBasePressionado,
                      ]}
                    >
                      {({ pressed }) => (
                        <>
                          <Ionicons
                            name="arrow-down-circle"
                            size={18}
                            color={pressed ? "#3a2c00" : CORES.destaque}
                          />
                          <Text
                            style={[
                              styles.botaoBaseTexto,
                              { fontSize: fonteRotulo },
                              pressed && { color: "#3a2c00" },
                            ]}
                          >
                            GARFO 0%
                          </Text>
                        </>
                      )}
                    </Pressable>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const sombra = {
  shadowColor: "#000",
  shadowOpacity: 0.45,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 4 },
  elevation: 8,
};

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: CORES.fundo,
  },

  // ---------- Barra superior ----------
  topo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingBottom: 8,
  },

  botaoVoltar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CORES.painel,
    borderWidth: 1,
    borderColor: CORES.borda,
  },

  pressionado: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },

  status: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 8,
    backgroundColor: CORES.painel,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },

  statusPonto: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  statusTexto: {
    color: CORES.texto,
    fontSize: 13,
    flexShrink: 1,
  },

  parar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: CORES.parar,
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 22,
    ...sombra,
  },

  pararTexto: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 1,
  },

  // ---------- Aviso (celular na vertical) ----------
  aviso: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  avisoIcone: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CORES.painel,
    borderWidth: 1,
    borderColor: CORES.borda,
  },

  avisoTitulo: {
    color: CORES.texto,
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,
    textAlign: "center",
  },

  avisoTexto: {
    color: CORES.textoSec,
    fontSize: 15,
    marginTop: 8,
    textAlign: "center",
    maxWidth: 320,
  },

  // ---------- Controles ----------
  areaControles: {
    flex: 1,
  },

  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },

  coluna: {
    alignItems: "center",
  },

  base: {
    backgroundColor: CORES.base,
    ...sombra,
  },

  anelGuia: {
    position: "absolute",
    borderWidth: 1.5,
    borderColor: CORES.guia,
  },

  seta: {
    position: "absolute",
  },

  manopla: {
    alignItems: "center",
    justifyContent: "center",
    ...sombra,
  },

  manoplaMiolo: {
    backgroundColor: CORES.manoplaMiolo,
    opacity: 0.5,
  },

  trilho: {
    position: "absolute",
    backgroundColor: CORES.fundo,
    opacity: 0.6,
  },

  marcaCentro: {
    position: "absolute",
    height: 2,
    borderRadius: 1,
    backgroundColor: CORES.guia,
  },

  setaSlider: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },

  rodape: {
    height: 44,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  rotulo: {
    color: CORES.textoSec,
    fontWeight: "600",
    letterSpacing: 2,
  },

  botaoBase: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: CORES.destaque,
    backgroundColor: CORES.painel,
  },

  botaoBasePressionado: {
    backgroundColor: CORES.destaque,
    transform: [{ scale: 0.96 }],
  },

  botaoBaseTexto: {
    color: CORES.destaque,
    fontWeight: "700",
    letterSpacing: 1,
  },

  // ---------- Painel central ----------
  painel: {
    gap: 12,
    minWidth: 150,
  },

  cartao: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: CORES.painel,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },

  cartaoTextos: {
    flexShrink: 1,
  },

  cartaoTitulo: {
    color: CORES.textoSec,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  cartaoValor: {
    color: CORES.texto,
    fontSize: 15,
    fontWeight: "600",
    marginTop: 2,
  },
});

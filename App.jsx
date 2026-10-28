import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import {
  useColorScheme,
  useWindowDimensions,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { useFuncionario } from "./src/features/Funcionario/hooks/useFuncionario.js";

import {
  MD3LightTheme,
  MD3DarkTheme,
  PaperProvider,
  Icon,
} from "react-native-paper";

import { useState, useEffect } from "react";
import Toast from "react-native-toast-message";
import { StatusBar } from "expo-status-bar";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  loadStoredUser,
  removeStoredUser,
} from "./src/features/Usuario/usuario.storage";

import { getUsuarios } from "./src/features/Consulta/consulta.service.js";
import { getEmpilhadeiras } from "./src/features/Empilhadeira/empilhadeira.service.js";

import Login from "./src/features/Usuario/screens/Login";
import CadastroUsuario from "./src/features/Usuario/screens/CadastroUsuario";
import CadastroFuncionario from "./src/features/Funcionario/screens/CadastroFuncionario";
import Dashboard from "./src/features/Dashboard";
import Consulta from "./src/features/Consulta/screens/Consulta";
import CadastroEmpilhadeira from "./src/features/Empilhadeira/screens/CadastroEmpilhadeira.jsx";
import Joystick from "./src/features/Joystick/screens/Joystick.jsx";

const Tab = createBottomTabNavigator();

// O provider precisa ficar acima de quem lê as áreas seguras (status bar e botões do Android)
export default function App() {
  return (
    <SafeAreaProvider>
      <AppConteudo />
    </SafeAreaProvider>
  );
}

function AppConteudo() {
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [usuario, setUsuario] = useState(null);
  const [funcionario, setFuncionario] = useState(null);
  const [isLogged, setIsLogged] = useState(false);

  const { funcionarios } = useFuncionario();

  const funcUser = funcionarios.find((f) => f.id === usuario?.funcionario);

  useEffect(() => {
    setFuncionario(funcUser || null);
  }, [funcUser]);
  const [carregandoSessao, setCarregandoSessao] = useState(true);

  useEffect(() => {
    loadStoredUser().then((usuarioSalvo) => {
      if (usuarioSalvo) {
        setUsuario(usuarioSalvo);
        setIsLogged(true);
      }

      setCarregandoSessao(false);
    });
  }, []);

  const handleLogout = () => {
    removeStoredUser();

    setUsuario(null);
    setIsLogged(false);
  };

  const handleLoginSuccess = (dadosUsuario) => {
    setUsuario(dadosUsuario);
    setIsLogged(true);
  };

  useEffect(() => {
    if (!isLogged || !usuario) return;

    const verificarUsuarioAtivo = async () => {
      try {
        const usuarios = await getUsuarios();
        const usuarioAtual = usuarios.find(
          (u) => String(u.id) === String(usuario.id),
        );

        if (!usuarioAtual || usuarioAtual.ativo === false) {
          Toast.show({
            type: "error",
            text1: "Acesso bloqueado",
            text2: "Seu usuário foi desativado.",
          });
          handleLogout();
        }
      } catch {}
    };

    verificarUsuarioAtivo();
    const intervalId = setInterval(verificarUsuarioAtivo, 30000);

    return () => clearInterval(intervalId);
  }, [isLogged, usuario?.id]);

  const [temEmpilhadeira, setTemEmpilhadeira] = useState(null);

  const verificarEmpilhadeira = async () => {
    try {
      const response = await getEmpilhadeiras();
      const lista = Array.isArray(response?.data) ? response.data : [];
      setTemEmpilhadeira(lista.length > 0);
    } catch {}
  };

  useEffect(() => {
    if (!isLogged) {
      setTemEmpilhadeira(null);
      return;
    }

    verificarEmpilhadeira();
  }, [isLogged]);

  const isAdmin = usuario?.nivel_acesso?.trim().toLowerCase() === "admin";

  const theme =
    colorScheme === "dark"
      ? {
          ...MD3DarkTheme,
          colors: {
            ...MD3DarkTheme.colors,
            primary: "#ffd900",
            neutral: "#ffffff",
            secondaryContainer: "#292929ff",
          },
        }
      : {
          ...MD3LightTheme,
          colors: {
            ...MD3LightTheme.colors,
            primary: "#004ec4ff",
            neutral: "#000000",
          },
        };

  // Tema da navegação com as mesmas cores do Paper (evita fundo branco no modo escuro)
  const baseNavTheme = colorScheme === "dark" ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...baseNavTheme,
    colors: {
      ...baseNavTheme.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.onSurface,
      border: theme.colors.outlineVariant,
    },
  };

  // Em telas estreitas o nome do usuário ocupa menos espaço no cabeçalho
  const larguraUsuario = Math.min(width * 0.45, 260);

  // Evita mostrar a tela de Login por um instante enquanto lê a sessão salva
  if (carregandoSessao) return null;

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer theme={navTheme}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused }) => {
              let iconName;

              switch (route.name) {
                case "Dashboard":
                  iconName = focused ? "grid" : "grid-outline";
                  break;

                case "Login":
                  iconName = focused ? "person" : "person-outline";
                  break;

                case "Cadastro Funcionario":
                  iconName = focused ? "id-card" : "id-card-outline";
                  break;

                case "Cadastro Usuário":
                  iconName = focused ? "person-add" : "person-add-outline";
                  break;

                case "Cadastro Empilhadeira":
                  iconName = focused ? "construct" : "construct-outline";
                  break;

                case "Consulta":
                  iconName = focused ? "search" : "search-outline";
                  break;

                case "Joystick":
                  iconName = focused
                    ? "game-controller"
                    : "game-controller-outline";
                  break;

                default:
                  iconName = "home-outline";
              }

              return (
                <Ionicons
                  name={iconName}
                  size={25}
                  color={
                    focused
                      ? theme.colors.primary
                      : theme.colors.onSurfaceVariant
                  }
                />
              );
            },

            headerShown: true,

            headerStyle: {
              backgroundColor: theme.colors.surface,
            },

            headerTintColor: theme.colors.onSurface,

            headerTitleStyle: {
              fontSize: width < 360 ? 17 : 20,
              fontWeight: "bold",
              color: theme.colors.onSurface,
            },

            headerRight: () =>
              isLogged ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginRight: 10,
                    maxWidth: larguraUsuario,
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "column",
                      alignItems: "flex-end",
                      flexShrink: 1,
                      marginRight: 6,
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={{
                        color: theme.colors.onSurface,
                        fontSize: 16,
                        flexShrink: 1,
                      }}
                    >
                      {funcionario?.nome || usuario?.email}
                    </Text>
                    <Text
                      style={{
                        color:
                          usuario?.nivel_acesso === "admin"
                            ? "#006eff"
                            : usuario?.nivel_acesso === "supervisor"
                              ? "#9350ff"
                              : theme.colors.onSurface,
                        fontSize: 10,
                        fontWeight: "bold",
                      }}
                    >
                      {usuario?.nivel_acesso?.toUpperCase()}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={handleLogout}
                    activeOpacity={0.7}
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      padding: 4,
                      marginLeft: 4,
                    }}
                  >
                    <Icon
                      source="logout"
                      size={24}
                      color={theme.colors.onSurface}
                    />
                  </TouchableOpacity>
                </View>
              ) : null,

            // Soma a área dos botões/gestos do celular para a barra não ficar por baixo deles
            tabBarStyle: {
              backgroundColor: theme.colors.surface,
              height: 60 + insets.bottom,
              paddingTop: 6,
              paddingBottom: insets.bottom + 6,
              borderTopWidth: 0,
              elevation: 0,
            },

            tabBarActiveTintColor: theme.colors.primary,

            tabBarInactiveTintColor: "#777777",

            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: "600",
            },
          })}
        >
          {!isLogged && (
            <Tab.Screen name="Login">
              {(props) => (
                <Login {...props} onLoginSuccess={handleLoginSuccess} />
              )}
            </Tab.Screen>
          )}

          {isLogged && (
            <>
              <Tab.Screen name="Dashboard" component={Dashboard} />

              {temEmpilhadeira === true && (
                <Tab.Screen
                  name="Joystick"
                  component={Joystick}
                  options={{
                    headerShown: false,
                    tabBarStyle: { display: "none" },
                  }}
                />
              )}

              {isAdmin && (
                <Tab.Screen
                  name="Cadastro Usuário"
                  component={CadastroUsuario}
                  options={{ tabBarLabel: "Usuário" }}
                />
              )}

              {isAdmin && (
                <Tab.Screen
                  name="Cadastro Funcionario"
                  component={CadastroFuncionario}
                  options={{
                    title: "Cadastro Funcionário",
                    tabBarLabel: "Funcionário",
                  }}
                />
              )}

              {isAdmin && temEmpilhadeira === false && (
                <Tab.Screen
                  name="Cadastro Empilhadeira"
                  options={{ tabBarLabel: "Empilhadeira" }}
                >
                  {(props) => (
                    <CadastroEmpilhadeira
                      {...props}
                      onCadastrado={verificarEmpilhadeira}
                    />
                  )}
                </Tab.Screen>
              )}

              {isAdmin && (
                <Tab.Screen name="Consulta">
                  {(props) => (
                    <Consulta
                      {...props}
                      onEmpilhadeiraExcluida={verificarEmpilhadeira}
                    />
                  )}
                </Tab.Screen>
              )}
            </>
          )}
        </Tab.Navigator>
      </NavigationContainer>

      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Toast topOffset={insets.top + 10} />
    </PaperProvider>
  );
}

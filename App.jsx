import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme, View, Text, TouchableOpacity } from "react-native";
import { useFuncionario } from "./src/features/Funcionario/hooks/useFuncionario.js";

import {
  MD3LightTheme,
  MD3DarkTheme,
  PaperProvider,
  Icon,
} from "react-native-paper";

import { useState, useEffect } from "react";
import Toast from "react-native-toast-message";

import {
  getStoredUser,
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

export default function App() {
  const colorScheme = useColorScheme();

  const [usuario, setUsuario] = useState(null);
  const [funcionario, setFuncionario] = useState(null);
  const [isLogged, setIsLogged] = useState(false);

  const { funcionarios } = useFuncionario();

  const funcUser = funcionarios.find((f) => f.id === usuario?.funcionario);

  useEffect(() => {
    setFuncionario(funcUser || null);
  }, [funcUser]);

  // Recupera o usuário salvo
  useEffect(() => {
    const usuarioSalvo = getStoredUser();

    if (usuarioSalvo) {
      setUsuario(usuarioSalvo);
      setIsLogged(true);
    }
  }, []);

  // Logout
  const handleLogout = () => {
    removeStoredUser();

    setUsuario(null);
    setIsLogged(false);
  };

  // Login realizado
  const handleLoginSuccess = (dadosUsuario) => {
    setUsuario(dadosUsuario);
    setIsLogged(true);
  };

  // Verifica periodicamente se o usuário logado continua ativo
  useEffect(() => {
    if (!isLogged || !usuario) return;

    const verificarUsuarioAtivo = async () => {
      try {
        const usuarios = await getUsuarios();
        const usuarioAtual = usuarios.find(
          (u) => String(u.id) === String(usuario.id)
        );

        if (!usuarioAtual || usuarioAtual.ativo === false) {
          Toast.show({
            type: "error",
            text1: "Acesso bloqueado",
            text2: "Seu usuário foi desativado.",
          });
          handleLogout();
        }
      } catch {
        // Falha ao consultar a API não deve deslogar o usuário
      }
    };

    verificarUsuarioAtivo();
    const intervalId = setInterval(verificarUsuarioAtivo, 30000);

    return () => clearInterval(intervalId);
  }, [isLogged, usuario?.id]);

  // Só pode existir uma empilhadeira cadastrada.
  // null = ainda não verificado (aba de cadastro fica oculta até saber)
  const [temEmpilhadeira, setTemEmpilhadeira] = useState(null);

  const verificarEmpilhadeira = async () => {
    try {
      const response = await getEmpilhadeiras();
      const lista = Array.isArray(response?.data) ? response.data : [];
      setTemEmpilhadeira(lista.length > 0);
    } catch {
      // Falha na API: mantém o estado atual
    }
  };

  useEffect(() => {
    if (!isLogged) {
      setTemEmpilhadeira(null);
      return;
    }

    verificarEmpilhadeira();
  }, [isLogged]);

  // Verifica se é administrador
  const isAdmin =
    usuario?.nivel_acesso?.trim().toLowerCase() === "admin";

  // Tema
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

  const isDark = colorScheme === "dark";

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            /*
             * ============================
             * ÍCONES DAS ABAS
             * ============================
             */
            tabBarIcon: ({ focused }) => {
              let iconName;

              switch (route.name) {
                case "Dashboard":
                  iconName = focused 
                    ? "grid" 
                    : "grid-outline";
                  break;

                case "Login":
                  iconName = focused 
                    ? "person" 
                    : "person-outline";
                  break;

                case "Cadastro Funcionario":
                  iconName = focused
                    ? "person-add"
                    : "person-add-outline";
                  break;
                    
                case "Cadastro Usuário":
                  iconName = focused
                    ? "person-add"
                    : "person-add-outline";
                  break;

                case "Cadastro Empilhadeira":
                  iconName = focused
                    ? "construct"
                    : "construct-outline";
                  break;

                case "Consulta":
                  iconName = focused
                    ? "search"
                    : "search-outline";
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

            /*
             * ============================
             * HEADER
             * ============================
             */
            headerShown: true,

            headerStyle: {
              backgroundColor: theme.colors.surface,
              height: 60,
            },

            headerTintColor: theme.colors.onSurface,

            headerTitleStyle: {
              fontSize: 20,
              fontWeight: "bold",
              color: theme.colors.onSurface,
            },

            /*
             * ============================
             * USUÁRIO + LOGOUT
             * ============================
             */
            headerRight: () =>
              isLogged ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginRight: 10,
                    maxWidth: "100%",
                    overflow: "hidden",
                  }}
                >
                  <View style={{flex: 1, flexDirection: "column", alignItems: "end", maxWidth: "90%", backgroundColor: "", marginRight: 6}}>

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
                  <Text style={{color: usuario?.nivel_acesso === "admin" ? "#006eff" : usuario?.nivel_acesso === "supervisor" ? "#9350ff" : theme.colors.onSurface, fontSize: 10, fontWeight: "bold"}}>
                    {usuario?.nivel_acesso.toUpperCase()}
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

            /*
             * ============================
             * BARRA INFERIOR
             * ============================
             */
            tabBarStyle: {
              backgroundColor: theme.colors.surface,
              height: 65,
              paddingBottom: 8,
              paddingTop: 8,
              borderTopWidth: 0,
              elevation: 0,
            },

            /*
             * COR DO ÍCONE/TEXTO ATIVO
             */
            tabBarActiveTintColor: theme.colors.primary,

            /*
             * COR DO ÍCONE/TEXTO INATIVO
             */
            tabBarInactiveTintColor: "#777777",

            /*
             * TEXTO DAS ABAS
             */
            tabBarLabelStyle: {
              fontSize: 10,
              fontWeight: "600",
            },
          })}
        >
          {/* ============================
              LOGIN
          ============================ */}
          {!isLogged && (
            <Tab.Screen name="Login">
              {(props) => (
                <Login
                  {...props}
                  onLoginSuccess={handleLoginSuccess}
                />
              )}
            </Tab.Screen>
          )}

          {/* ============================
              USUÁRIO LOGADO
          ============================ */}
          {isLogged && (
            <>
              {/* Dashboard aparece para todos */}
              <Tab.Screen
                name="Dashboard"
                component={Dashboard}
              />

              {/* Joystick aparece para todos, se houver empilhadeira cadastrada */}
              {temEmpilhadeira === true && (
                <Tab.Screen
                  name="Joystick"
                  component={Joystick}
                  options={{
                    // Tela cheia: sem menu superior e inferior
                    headerShown: false,
                    tabBarStyle: { display: "none" },
                  }}
                />
              )}

              {/* Cadastro aparece somente para ADMIN */}
              {isAdmin && (
                <Tab.Screen
                  name="Cadastro Usuário"
                  component={CadastroUsuario}
                />
              )}

              {isAdmin && (
                <Tab.Screen
                  name="Cadastro Funcionario"
                  component={CadastroFuncionario}
                />
              )}

              {/* Cadastro de empilhadeira só aparece se não houver nenhuma cadastrada */}
              {isAdmin && temEmpilhadeira === false && (
                <Tab.Screen name="Cadastro Empilhadeira">
                  {(props) => (
                    <CadastroEmpilhadeira
                      {...props}
                      onCadastrado={verificarEmpilhadeira}
                    />
                  )}
                </Tab.Screen>
              )}

              {/* Consulta aparece somente para ADMIN */}
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

      <Toast />
    </PaperProvider>
  );
}
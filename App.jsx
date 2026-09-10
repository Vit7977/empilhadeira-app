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

import Login from "./src/features/Usuario/screens/Login";
import CadastroUsuario from "./src/features/Usuario/screens/CadastroUsuario";
import CadastroFuncionario from "./src/features/Funcionario/screens/CadastroFuncionario";
import Dashboard from "./src/features/Dashboard";

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
                  iconName = focused ? "grid" : "grid-outline";
                  break;

                case "Login":
                  iconName = focused ? "person" : "person-outline";
                  break;

                case "Cadastro Funcionario":
                  iconName = focused
                    ? "person-add"
                    : "person-add-outline";
                    
                case "Cadastro Usuário":
                  iconName = focused
                    ? "person-add"
                    : "person-add-outline";
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
                    maxWidth: "95%",
                    overflow: "hidden",
                    paddingHorizontal: 6,
                  }}
                >
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{
                      color: theme.colors.onSurface,
                      fontSize: 16,
                      marginRight: 8,
                      flexShrink: 1,
                    }}
                  >
                    {funcionario?.nome || usuario?.email}
                  </Text>

                  <TouchableOpacity
                    onPress={handleLogout}
                    activeOpacity={0.7}
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      padding: 4,
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
            </>
          )}
        </Tab.Navigator>
      </NavigationContainer>

      <Toast />
    </PaperProvider>
  );
}
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme, View, Text, TouchableOpacity } from "react-native";
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
import Cadastro from "./src/features/Usuario/screens/Cadastro";
import Dashboard from "./src/features/Dashboard";

const Tab = createBottomTabNavigator();

export default function App() {
  const colorScheme = useColorScheme();

  const [usuario, setUsuario] = useState(null);
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    const usuarioSalvo = getStoredUser();

    if (usuarioSalvo) {
      setUsuario(usuarioSalvo);
      setIsLogged(true);
    }
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

  const isAdmin =
    usuario?.nivel_acesso?.trim().toLowerCase() === "admin";

  const theme =
    colorScheme === "dark"
      ? {
          ...MD3DarkTheme,
          colors: {
            ...MD3DarkTheme.colors,
            primary: "#ffd900",
            neutral: "#ffffff",
          },
        }
      : {
          ...MD3LightTheme,
          colors: {
            ...MD3LightTheme.colors,
            primary: "#ff0000",
            neutral: "#000000",
          },
        };

  const isDark = colorScheme === "dark";

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color }) => {
              let iconName = "home-outline";

              switch (route.name) {
                case "Dashboard":
                  iconName = focused ? "grid" : "grid-outline";
                  break;

                case "Login":
                  iconName = focused ? "person" : "person-outline";
                  break;

                case "Cadastro":
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
                  size={20}
                  color={color}
                />
              );
            },

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
                    {usuario?.nome || usuario?.email}
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

            tabBarStyle: {
              backgroundColor: theme.colors.surface,
              height: 65,
              paddingBottom: 8,
              paddingTop: 8,
              borderTopWidth: 0,
              elevation: 0,
            },

            tabBarActiveTintColor: theme.colors.primary,

            tabBarInactiveTintColor: isDark ? "#777" : "#777",

            tabBarLabelStyle: {
              fontSize: 10,
              fontWeight: "600",
            },
          })}
        >

          {/* USUÁRIO NÃO LOGADO */}
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

          {/* USUÁRIO LOGADO */}
          {isLogged && (
            <>
              {/* TODOS OS NÍVEIS PODEM ACESSAR O DASHBOARD */}
              <Tab.Screen
                name="Dashboard"
                component={Dashboard}
              />

              {/* SOMENTE ADMIN PODE VER O CADASTRO */}
              {isAdmin && (
                <Tab.Screen
                  name="Cadastro"
                  component={Cadastro}
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
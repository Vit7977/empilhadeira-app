import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme, View, Text, TouchableOpacity } from "react-native";
import { MD3LightTheme, MD3DarkTheme, PaperProvider, IconButton, Icon } from "react-native-paper";
import { useState, useEffect } from "react";
import { getStoredUser } from "./src/features/Usuario/Login";
// import Icon from "./src/assets/icon.png"

import Login from "./src/features/Usuario/Login";
import Cadastro from "./src/features/Usuario/Cadastro";
import Dashboard from "./src/features/Dashboard";

const Tab = createBottomTabNavigator();

export default function App() {
  const colorScheme = useColorScheme();

  const [nome, setNome] = useState("");
  const [isLogged, setIsLogged] = useState(false);

  const handleLogout = () => {
    if (typeof globalThis !== "undefined" && "localStorage" in globalThis) {
      globalThis.localStorage.removeItem("usuarioLogado");
    }

    setNome("");
    setIsLogged(false);
  };

  useEffect(() => {
    const usuario = getStoredUser();
    if (usuario) {
      setNome(usuario.nome);
      setIsLogged(true);
    }
  }, []);

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
            tabBarIcon: ({ focused, color, size }) => {
              let iconName = "home-outline";

              switch (route.name) {
                case "Dashboard":
                  iconName = focused ? "grid" : "grid-outline";
                  break;
                case "Login":
                  iconName = focused ? "person" : "person-outline";
                  break;
                case "Cadastro":
                  iconName = focused ? "person-add" : "person-add-outline";
                  break;
                default:
                  iconName = "home-outline";
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },

            headerShown: true,

            headerStyle: {
              backgroundColor: theme.colors.surface,
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
                    justifyContent: "space-between",
                    marginRight: 10,
                    maxWidth: "95%",
                    overflow: "hidden",
                    paddingHorizontal: 6
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
                      maxWidth: "100%",
                    }}
                  >
                    {nome}
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
                    <Icon source="logout" size={24} />
                  </TouchableOpacity>
                </View>
              ) : null,

            tabBarStyle: {
              backgroundColor: theme.colors.surface,
              height: 70,
              paddingBottom: 8,
              paddingTop: 8,
              borderTopWidth: 0,
              elevation: 0,
            },

            tabBarActiveTintColor: theme.colors.primary,

            tabBarInactiveTintColor: isDark ? "#777" : "#777",

            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: "600",
            },
          })}
        >

          {isLogged ? (
            <Tab.Screen name="Dashboard" component={Dashboard} />
          ) : (
            <>
              <Tab.Screen name="Login">
                {(props) => <Login
                          {...props}
                          onLoginSuccess={(usuario) => {
                            setEmail(usuario.email);
                            setIsLogged(true);
                          }}
                        />}
              </Tab.Screen>

              <Tab.Screen name="Cadastro" component={Cadastro} />
            </>
          )}
          
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

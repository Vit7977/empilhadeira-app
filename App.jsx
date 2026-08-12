import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";
import {
  MD3LightTheme,
  MD3DarkTheme,
  PaperProvider,
} from "react-native-paper";

import Login from "./src/features/Usuario/Login";
import Dashboard from "./src/features/Dashboard";

const Tab = createBottomTabNavigator();

export default function App() {
  const colorScheme = useColorScheme();

  const theme =
    colorScheme === "dark"
      ? {
          ...MD3DarkTheme,
          colors: {
            ...MD3DarkTheme.colors,
            primary: "#ffd900",
          },
        }
      : {
          ...MD3LightTheme,
          colors: {
            ...MD3LightTheme.colors,
            primary: "#ff0000",
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

              if (route.name === "Dashboard") {
                iconName = focused
                  ? "grid"
                  : "grid-outline";
              } else if (route.name === "Login") {
                iconName = focused
                  ? "person"
                  : "person-outline";
              }

              return (
                <Ionicons
                  name={iconName}
                  size={size}
                  color={color}
                />
              );
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

            tabBarStyle: {
              backgroundColor: theme.colors.surface,
              height: 70,
              paddingBottom: 8,
              paddingTop: 8,
              borderTopWidth: 0,
              elevation: 0,
            },

            tabBarActiveTintColor: theme.colors.primary,

            tabBarInactiveTintColor: isDark
              ? "#777"
              : "#777",

            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: "600",
            },
          })}
        >
          <Tab.Screen
            name="Dashboard"
            component={Dashboard}
          />

          <Tab.Screen
            name="Login"
            component={Login}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
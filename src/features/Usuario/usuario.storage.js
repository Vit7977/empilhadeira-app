import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "usuarioLogado";

// Cópia em memória para leitura síncrona nas telas
let usuarioEmCache = null;

// Carrega o usuário salvo no dispositivo (chamar uma vez ao abrir o app)
export const loadStoredUser = async () => {
  try {
    const storedUser = await AsyncStorage.getItem(STORAGE_KEY);
    usuarioEmCache = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    usuarioEmCache = null;
  }

  return usuarioEmCache;
};

export const getStoredUser = () => usuarioEmCache;

export const saveStoredUser = (usuario) => {
  usuarioEmCache = usuario;
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(usuario)).catch(() => {});
};

export const removeStoredUser = () => {
  usuarioEmCache = null;
  AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
};

export const getStoredUser = () => {
  if (typeof globalThis === "undefined" || !("localStorage" in globalThis)) {
    return null;
  }

  try {
    const storedUser = globalThis.localStorage.getItem("usuarioLogado");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

export const saveStoredUser = (usuario) => {
  if (typeof globalThis !== "undefined" && "localStorage" in globalThis) {
    globalThis.localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
  }
};

export const removeStoredUser = () => {
  if (typeof globalThis !== "undefined" && "localStorage" in globalThis) {
    globalThis.localStorage.removeItem("usuarioLogado");
  }
};


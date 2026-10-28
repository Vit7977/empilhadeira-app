import { useWindowDimensions } from "react-native";

// Larguras máximas para o conteúdo não ficar esticado em tablets e na web
export const LARGURA_FORMULARIO = 520;
export const LARGURA_CONTEUDO = 1040;

// Centraliza o conteúdo e limita a largura
export const centralizado = (larguraMaxima) => ({
  width: "100%",
  maxWidth: larguraMaxima,
  alignSelf: "center",
});

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  return {
    width,
    height,
    isPequeno: width < 360, // celulares compactos
    isTablet: width >= 768, // tablets e telas maiores
    espacamento: width < 360 ? 14 : width >= 768 ? 28 : 20,
  };
}

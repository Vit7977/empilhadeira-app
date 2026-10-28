export const apiConfig = {
    // Para usar outra API (ex.: local), crie um arquivo .env com EXPO_PUBLIC_API_URL=http://SEU_IP:3000
    url: process.env.EXPO_PUBLIC_API_URL || "https://api-empilhadeira.onrender.com",
    // O Render pode levar alguns segundos para "acordar" a API
    timeout: 60000,
    headers: {
        "Content-Type": "application/json",
    },
}

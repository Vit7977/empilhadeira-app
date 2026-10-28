export const apiConfig = {
    url: process.env.EXPO_PUBLIC_API_URL || "https://api-empilhadeira.onrender.com",
    timeout: 60000,
    headers: {
        "Content-Type": "application/json",
    },
}

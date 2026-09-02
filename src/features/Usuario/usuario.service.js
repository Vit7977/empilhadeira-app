import { api } from "../../api/api.js";

export const createUsuario = async (usuario) => {
    try {
        const response = await api.post("/usuarios", usuario);
        console.log("Usuario criado com sucesso:", response.data);
        return response.data;
    } catch (error) {
        console.error("Erro ao criar usuario:", error.message);
        throw error;
    }
}
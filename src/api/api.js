import axios from "axios";
import { apiConfig } from "./config.js"

export const api = axios.create({
    baseURL: apiConfig.url,
    headers: apiConfig.headers,
})
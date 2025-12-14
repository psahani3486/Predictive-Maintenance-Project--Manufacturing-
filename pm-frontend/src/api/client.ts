import axios from "axios";
const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "/api").trim();

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});
import axios from "axios";
const base = process.env.REACT_APP_BACKEND_URL;
export const api = axios.create({ baseURL: `${base}/api`, withCredentials: true });
export const errMsg = (e) =>
  (e?.response?.data?.error?.message || e?.response?.data?.detail || e?.message || "Erro");
export const money = (cents, currency = "BRL") =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format((cents || 0) / 100);

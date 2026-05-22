import axios from "axios";
import { buildApiUrl } from "../config/api";

const api = buildApiUrl("/api/productos/listarp");

export const getProductos = async () => {
  const listado = await axios.get(api);
  return listado.data;
};

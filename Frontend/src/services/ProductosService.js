import axios from "axios";

const api = "http://localhost:3000/listarp";

export const getProductos = async () => {
  const listado = await axios.get(api);
  return listado.data;
};

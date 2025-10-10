import { useState } from "react";
import Login from "./pages/Login";
import MenuPrincipal from "./pages/MenuPrincipal";

function App() {
  const [mostrarMenu, setMostrarMenu] = useState(false);

  return (
    <div>
      {mostrarMenu ? <MenuPrincipal /> : <Login />}

      <div className="text-center mt-4">
        <button
          onClick={() => setMostrarMenu(!mostrarMenu)}
          className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition"
        >
          {mostrarMenu ? "Volver al Login" : "Ir al Menú Principal"}
        </button>
      </div>
    </div>
  );
}

export default App;

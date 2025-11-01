import { Link } from "react-router-dom";
import "../App.css";

function Sidebar() {
  return (
    <aside className="w-56 bg-white p-4 shadow-lg flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-bold text-gray-700 mb-4">FactuCelest</h2>
        <ul className="space-y-2 text-gray-700">
          <li>
            <Link to="/menu" className="block hover:text-blue-600">
              📊 MenuPrincipal
            </Link>
          </li>
          <li>
            <Link to="/facturas" className="block hover:text-blue-600">
              🧾 Facturas
            </Link>
          </li>
          <li>
            <Link to="/clientes" className="block hover:text-blue-600">
              👥 Clientes
            </Link>
          </li>
          <li>
            <Link to="/pagos" className="block hover:text-blue-600">
              💰 Pagos
            </Link>
          </li>
          <li>
            <Link
              to="/productos"
              className="block hover:text-blue-600 font-semibold"
            >
              📦 Productos
            </Link>
          </li>
          <li>
            <Link to="/reportes" className="block hover:text-blue-600">
              📈 Reportes
            </Link>
          </li>
        </ul>
      </div>
      <div className="text-gray-500 border-t pt-5">⚙️ Configuración</div>
    </aside>
  );
}

export default Sidebar;

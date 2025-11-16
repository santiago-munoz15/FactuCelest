import { Link } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import "../App.css";

function Sidebar() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [showConfig, setShowConfig] = useState(false);

  return (
    <aside className="w-56 bg-white dark:bg-gray-900 p-4 shadow-lg flex flex-col justify-between transition-colors duration-300">
      <div>
        <h2 className="text-xl font-bold text-cyan-600 dark:text-cyan-400 mb-4">
          FactuCelest
        </h2>
        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <Link
              to="/menu"
              className="block hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            >
              📊 MenuPrincipal
            </Link>
          </li>
          <li>
            <Link
              to="/facturacion"
              className="block hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            >
              🧾 Facturacion
            </Link>
          </li>
          <li>
            <Link
              to="/clientes"
              className="block hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            >
              👥 Clientes
            </Link>
          </li>
          <li>
            <Link
              to="/pagos"
              className="block hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            >
              💰 Pagos
            </Link>
          </li>
          <li>
            <Link
              to="/productos"
              className="block hover:text-cyan-600 dark:hover:text-cyan-400 font-semibold transition-colors"
            >
              📦 Productos
            </Link>
          </li>
          <li>
            <Link
              to="/reportes"
              className="block hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            >
              📈 Reportes
            </Link>
          </li>
        </ul>
      </div>
      <div className="border-t pt-5 dark:border-gray-700">
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors w-full text-left"
        >
          ⚙️ Configuración
        </button>
        {showConfig && (
          <div className="mt-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Modo Oscuro
              </span>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isDarkMode ? "bg-cyan-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isDarkMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { showInfoAlert } from "../utils/sweetAlertHelper";

function Reportes() {
  const navigate = useNavigate();

  useEffect(() => {
    showInfoAlert(
      "🚧 En Construcción",
      "El módulo de Reportes está en desarrollo. Pronto estará disponible."
    ).then(() => {
      navigate("/menu");
    });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <p className="text-6xl mb-4">🚧</p>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          En Construcción
        </h2>
        <p className="text-gray-600 dark:text-gray-400">Módulo de Reportes</p>
      </div>
    </div>
  );
}

export default Reportes;

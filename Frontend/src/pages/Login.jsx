import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  showSuccessAlert,
  showErrorAlert,
  showInfoAlert,
} from "../utils/sweetAlertHelper";
import Footer from "../components/Footer";
import Logo from "../assets/login.png";

export default function Login() {
  const navigate = useNavigate();

  // Estados login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Estados para registro y modal
  const [showModal, setShowModal] = useState(false);
  const [registro, setRegistro] = useState({
    nombre: "",
    email: "",
    password: "",
    codigo: "",
  });
  const [verificando, setVerificando] = useState(false);

  // 🔹 LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3000/api/usuarios/login", {
        correo: email,
        contrasena: password,
      });

      if (res.status === 200) {
        await showSuccessAlert("¡Bienvenido!", "Inicio de sesión exitoso");
        navigate("/menu");
      }
    } catch (err) {
      showErrorAlert("Error de acceso", "Email o contraseña incorrectos");
    }
  };

  // 🔹 REGISTRO
  const handleRegistrar = async () => {
    try {
      await axios.post(
        "http://localhost:3000/api/usuarios/registrar",
        registro
      );
      setVerificando(true);
      showInfoAlert(
        "Código enviado",
        "Se envió un código de verificación a tu correo"
      );
    } catch {
      showErrorAlert("Error", "No se pudo registrar el usuario");
    }
  };

  // 🔹 VERIFICAR CÓDIGO
  const handleVerificar = async () => {
    try {
      const res = await axios.post(
        "http://localhost:3000/api/usuarios/verificar",
        {
          correo: registro.correo,
          codigo: registro.codigo,
        }
      );
      await showSuccessAlert("¡Verificado!", res.data.message);
      setShowModal(false);
      setVerificando(false);
    } catch {
      showErrorAlert("Error", "Código incorrecto");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-cyan-900 flex flex-col items-center justify-center p-4">
      {/* Card principal del login */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
        {/* Header con gradiente celeste */}
        <div className="bg-gradient-to-r from-cyan-500 via-cyan-600 to-cyan-700 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10">
            <img
              src={Logo}
              alt="Logo"
              className="w-20 h-20 mx-auto mb-3 rounded-2xl shadow-lg border-4 border-white"
            />
            <h1 className="text-3xl font-bold text-white mb-2">FactuCelest</h1>
            <p className="text-cyan-100 text-sm">
              Sistema de Facturación Inteligente
            </p>
          </div>
        </div>

        {/* Formulario */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Iniciar Sesión
          </h2>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@empresa.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-cyan-700 text-white py-3 rounded-xl font-semibold hover:from-cyan-600 hover:to-cyan-800 transform hover:scale-[1.02] transition-all shadow-lg hover:shadow-xl"
            >
              Ingresar
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              ¿No tienes una cuenta?{" "}
              <span
                onClick={() => setShowModal(true)}
                className="text-cyan-600 font-semibold cursor-pointer hover:text-cyan-700 hover:underline transition-colors"
              >
                Regístrate aquí
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* 🌟 MODAL REGISTRO con opacidad mejorada */}
      {showModal && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50 animate-fadeIn"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl transform animate-slideIn">
            <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">
              {verificando ? "✉️ Verifica tu correo" : "🚀 Crear cuenta"}
            </h3>

            {!verificando ? (
              <>
                <div className="space-y-4">
                  <input
                    className="border-2 border-gray-200 p-3 w-full rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                    placeholder="Nombre completo"
                    onChange={(e) =>
                      setRegistro({ ...registro, nombre: e.target.value })
                    }
                  />
                  <input
                    type="email"
                    className="border-2 border-gray-200 p-3 w-full rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                    placeholder="Correo electrónico"
                    onChange={(e) =>
                      setRegistro({ ...registro, email: e.target.value })
                    }
                  />
                  <input
                    type="password"
                    className="border-2 border-gray-200 p-3 w-full rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                    placeholder="Contraseña"
                    onChange={(e) =>
                      setRegistro({ ...registro, password: e.target.value })
                    }
                  />
                </div>
                <button
                  onClick={handleRegistrar}
                  className="bg-gradient-to-r from-cyan-500 to-cyan-700 text-white p-3 w-full rounded-xl hover:from-cyan-600 hover:to-cyan-800 transition-all font-semibold mt-6 shadow-lg"
                >
                  Registrar
                </button>
              </>
            ) : (
              <>
                <input
                  className="border-2 border-gray-200 p-3 w-full mb-6 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                  placeholder="Código de verificación"
                  onChange={(e) =>
                    setRegistro({ ...registro, codigo: e.target.value })
                  }
                />
                <button
                  onClick={handleVerificar}
                  className="bg-gradient-to-r from-cyan-500 to-cyan-700 text-white p-3 w-full rounded-xl hover:from-cyan-600 hover:to-cyan-800 transition-all font-semibold shadow-lg"
                >
                  Verificar
                </button>
              </>
            )}

            <button
              onClick={() => {
                setShowModal(false);
                setVerificando(false);
              }}
              className="mt-5 text-gray-500 hover:text-gray-700 text-sm font-medium w-full text-center transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 w-full">
        <Footer />
      </div>
    </div>
  );
}

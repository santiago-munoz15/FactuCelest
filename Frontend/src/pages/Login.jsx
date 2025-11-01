import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Footer from "../components/Footer";
import Logo from "../assets/login.png";

export default function Login() {
  const navigate = useNavigate();

  // Estados login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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
        setError("");
        navigate("/menu");
      }
    } catch (err) {
      setError("⚠️ Email o contraseña incorrectos.");
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
      alert("📧 Se envió un código de verificación a tu correo.");
    } catch {
      alert("Error al registrar usuario.");
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
      alert(res.data.message);
      setShowModal(false);
      setVerificando(false);
    } catch {
      alert("❌ Código incorrecto.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ccf7f7] to-white flex flex-col items-center justify-center">
      <div className="bg-gradient-to-b from-[#99CBE8] to-[#8DB3CA] rounded-2xl p-8 text-center shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Bienvenido a FactuCelest
        </h2>
        <img src={Logo} alt="Logo" className="w-24 h-24 mx-auto rounded-2xl" />

        <form
          onSubmit={handleLogin}
          className="flex flex-col space-y-4 py-4 text-left"
        >
          <div>
            <h3 className="font-bold mb-2">Email</h3>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@empresa.com"
              className="bg-white border border-gray-500 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none w-full"
            />
          </div>

          <div>
            <h3 className="font-bold mb-2">Contraseña</h3>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="*********"
              className="bg-white border border-gray-500 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none w-full"
            />
          </div>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Entrar
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-4">
          ¿No tienes una cuenta?{" "}
          <span
            onClick={() => setShowModal(true)}
            className="text-blue-700 font-semibold cursor-pointer hover:underline"
          >
            Regístrate
          </span>
        </p>
      </div>

      {/* 🌟 MODAL REGISTRO */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-2xl w-96 shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-center">
              {verificando ? "Verifica tu correo" : "Crear cuenta"}
            </h3>

            {!verificando ? (
              <>
                <input
                  className="border p-2 w-full mb-2 rounded-lg"
                  placeholder="Nombre completo"
                  onChange={(e) =>
                    setRegistro({ ...registro, nombre: e.target.value })
                  }
                />
                <input
                  className="border p-2 w-full mb-2 rounded-lg"
                  placeholder="Correo electrónico"
                  onChange={(e) =>
                    setRegistro({ ...registro, email: e.target.value })
                  }
                />
                <input
                  type="password"
                  className="border p-2 w-full mb-4 rounded-lg"
                  placeholder="Contraseña"
                  onChange={(e) =>
                    setRegistro({ ...registro, password: e.target.value })
                  }
                />
                <button
                  onClick={handleRegistrar}
                  className="bg-green-600 text-white p-2 w-full rounded-lg hover:bg-green-700 transition duration-300"
                >
                  Registrar
                </button>
              </>
            ) : (
              <>
                <input
                  className="border p-2 w-full mb-4 rounded-lg"
                  placeholder="Código de verificación"
                  onChange={(e) =>
                    setRegistro({ ...registro, codigo: e.target.value })
                  }
                />
                <button
                  onClick={handleVerificar}
                  className="bg-blue-600 text-white p-2 w-full rounded-lg hover:bg-blue-700 transition duration-300"
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
              className="mt-4 text-gray-600 text-sm underline w-full text-center"
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

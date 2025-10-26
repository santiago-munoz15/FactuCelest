import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Logo from "../assets/login.png";

export default function Login() {
  const navigate = useNavigate();

  // Estados del formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Credenciales quemadas (puedes cambiarlas)
  const usuarioValido = {
    email: "admin@factucelest.com",
    password: "12345",
  };

  // Manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();

    if (email === usuarioValido.email && password === usuarioValido.password) {
      setError("");
      navigate("/menu"); // Redirige al menú principal
    } else {
      setError("⚠️ Email o contraseña incorrectos.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ccf7f7] to-white flex flex-col items-center justify-center">
      <div className="bg-gradient-to-b from-[#99CBE8] to-[#8DB3CA] rounded-2xl p-8 text-center shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Bienvenido a FactuCelest
        </h2>
        <img src={Logo} alt="Logo" className="w-25 h-24 mx-auto rounded-2xl" />

        <form
          onSubmit={handleSubmit}
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

        <p className="text-center text-gray-500 text-sm mt-4">
          ¿No tienes una cuenta?{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Regístrate
          </a>
        </p>
      </div>
    </div>
  );
}

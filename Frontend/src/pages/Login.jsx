import Footer from "../components/Footer";
import Logo from "../assets/login.png";

export default function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ccf7f7] to-white flex items-center justify-center">
      <div className="bg-gradient-to-b from-[#99CBE8] to-[#8DB3CA] rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Bienvenido a FactuCelest
        </h2>
        <img src={Logo} alt="Logo" className="w-25 h-24 mx-auto rounded-2xl" />
        <form className="flex flex-col space-y-4 py-4">
          <h3 className="text-left font-bold mb-4">Email</h3>
          <input
            type="email"
            placeholder="ejemplo@empresa.com"
            className="bg-white border border-gray-500 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
          />
          <h3 className="text-left font-bold mb-4">Contraseña</h3>
          <input
            type="password"
            placeholder="*********"
            className="bg-white border border-gray-500 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
          />
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

      <Footer />
    </div>
  );
}

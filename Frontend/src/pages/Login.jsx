import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  showSuccessAlert,
  showErrorAlert,
  showInfoAlert,
} from "../utils/sweetAlertHelper";
import { buildApiUrl } from "../config/api";
import Footer from "../components/Footer";
import Logo from "../assets/login.png";

export default function Login() {
  const navigate = useNavigate();

  // Estados login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Estados para registro y modal
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [registro, setRegistro] = useState({
    nombre: "",
    email: "",
    password: "",
    codigo: "",
  });
  const [verificando, setVerificando] = useState(false);

  const resetRegistration = () => {
    setIsSignUpMode(false);
    setVerificando(false);
  };

  // 🔹 LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(buildApiUrl("/api/usuarios/login"), {
        correo: email,
        contrasena: password,
      });

      if (res.status === 200) {
        localStorage.setItem("usuario", JSON.stringify(res.data.usuario));
        await showSuccessAlert("¡Bienvenido!", "Inicio de sesión exitoso");
        navigate("/menu");
      }
    } catch {
      showErrorAlert("Error de acceso", "Email o contraseña incorrectos");
    }
  };

  // 🔹 REGISTRO
  const handleRegistrar = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(buildApiUrl("/api/usuarios/registrar"), registro);
      setVerificando(true);
      showInfoAlert("Registro", res.data?.message || "Usuario registrado");
    } catch (error) {
      const message =
        error?.response?.data?.message || "No se pudo registrar el usuario";
      showErrorAlert("Error", message);
    }
  };

  // 🔹 VERIFICAR CÓDIGO
  const handleVerificar = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(buildApiUrl("/api/usuarios/verificar"), {
        correo: registro.email,
        codigo: registro.codigo,
      });
      await showSuccessAlert("¡Verificado!", res.data.message);
      resetRegistration();
    } catch {
      showErrorAlert("Error", "Código incorrecto");
    }
  };

  return (
    <main className={`auth-page ${isSignUpMode ? "sign-up-mode" : ""}`}>
      <div className="auth-container">
        <div className="auth-forms">
          <div className="auth-form-stack">
            <form className="auth-form sign-in-form" onSubmit={handleLogin}>
              <img className="auth-form-logo" src={Logo} alt="Logo de FactuCelest" />
              <span className="auth-kicker">FACTUCELEST</span>
              <h1>Bienvenido de nuevo</h1>
              <p className="auth-subtitle">Ingresa para continuar con tu gestión.</p>
              <label className="auth-input">
                <span aria-hidden="true">@</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo electrónico" required />
              </label>
              <label className="auth-input">
                <span aria-hidden="true">*</span>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" required />
              </label>
              <button type="submit" className="auth-button">Ingresar</button>
              <p className="auth-switch">¿Aún no tienes una cuenta? <button type="button" onClick={() => setIsSignUpMode(true)}>Regístrate</button></p>
            </form>

            <form className="auth-form sign-up-form" onSubmit={verificando ? handleVerificar : handleRegistrar}>
              <span className="auth-kicker">FACTUCELEST</span>
              <h1>{verificando ? "Verifica tu cuenta" : "Crea tu cuenta"}</h1>
              <p className="auth-subtitle">{verificando ? "Escribe el código que recibiste en tu correo." : "Empieza a organizar tu facturación."}</p>
              {!verificando ? (
                <>
                  <label className="auth-input"><span aria-hidden="true">+</span><input value={registro.nombre} onChange={(e) => setRegistro({ ...registro, nombre: e.target.value })} placeholder="Nombre completo" required /></label>
                  <label className="auth-input"><span aria-hidden="true">@</span><input type="email" value={registro.email} onChange={(e) => setRegistro({ ...registro, email: e.target.value })} placeholder="Correo electrónico" required /></label>
                  <label className="auth-input"><span aria-hidden="true">*</span><input type="password" value={registro.password} onChange={(e) => setRegistro({ ...registro, password: e.target.value })} placeholder="Contraseña" required /></label>
                  <button type="submit" className="auth-button">Registrar</button>
                </>
              ) : (
                <>
                  <label className="auth-input"><span aria-hidden="true">#</span><input value={registro.codigo} onChange={(e) => setRegistro({ ...registro, codigo: e.target.value })} placeholder="Código de verificación" required /></label>
                  <button type="submit" className="auth-button">Verificar</button>
                </>
              )}
              <p className="auth-switch">¿Ya tienes una cuenta? <button type="button" onClick={resetRegistration}>Inicia sesión</button></p>
            </form>
          </div>
        </div>

        <div className="auth-panels">
          <section className="auth-panel auth-panel-left">
            <div><h2>Controla tu negocio con claridad.</h2><p>Facturación simple, rápida y siempre a tu alcance.</p><button type="button" className="auth-outline-button" onClick={() => setIsSignUpMode(true)}>Crear cuenta</button></div>
          </section>
          <section className="auth-panel auth-panel-right">
            <div><h2>Todo listo para volver.</h2><p>Accede a tus productos, clientes y facturas.</p><button type="button" className="auth-outline-button" onClick={resetRegistration}>Iniciar sesión</button></div>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}

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
  const [showPassword, setShowPassword] = useState(false);

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
    } catch (error) {
      const status = error.response?.status;
      const mensaje = status === 401
        ? "El correo o la contraseña no coinciden con la cuenta registrada."
        : status === 403
          ? error.response?.data?.message || "La cuenta aún no está verificada."
          : status
            ? error.response?.data?.message || "El servidor no pudo completar el inicio de sesión."
            : "No se pudo conectar con el servidor. Revisa la conexión e inténtalo de nuevo.";
      showErrorAlert("No se pudo iniciar sesión", mensaje);
    }
  };

  // 🔹 REGISTRO
  const handleRegistrar = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(buildApiUrl("/api/usuarios/registrar"), registro);
      setVerificando(true);
      const mensaje = res.data?.codigoVerificacion
        ? `${res.data.message} Código: ${res.data.codigoVerificacion}`
        : res.data?.message || "Usuario registrado";
      showInfoAlert("Registro", mensaje);
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
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" required />
                <button type="button" className="auth-password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={showPassword}>
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    {showPassword ? <><path d="M3 3l18 18"/><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 8.5 4.5 9.5 7-.4 1-1.2 2.2-2.3 3.3"/><path d="M6.2 6.2C3.9 7.6 2.7 9.6 2.5 12c.5 1.2 1.5 2.8 3 4a10 10 0 0 0 6.5 2.5c1.1 0 2.1-.2 3-.5"/></> : <><path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"/><circle cx="12" cy="12" r="2.5"/></>}
                  </svg>
                </button>
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

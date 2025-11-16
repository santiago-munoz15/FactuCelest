import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import MainLayout from "./Layouts/MainLayout";
import MenuPrincipal from "./pages/MenuPrincipal";
import Productos from "./pages/Productos";
import Login from "./pages/Login";
import Facturacion from "./pages/Facturacion";
import Clientes from "./pages/Clientes";
import Pagos from "./pages/Pagos";
import Reportes from "./pages/Reportes";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Página de inicio (Login sin layout) */}
          <Route path="/" element={<Login />} />

          {/* Páginas dentro del layout principal */}
          <Route
            path="/menu"
            element={
              <MainLayout>
                <MenuPrincipal />
              </MainLayout>
            }
          />

          <Route
            path="/facturacion"
            element={
              <MainLayout>
                <Facturacion />
              </MainLayout>
            }
          />

          <Route
            path="/productos"
            element={
              <MainLayout>
                <Productos />
              </MainLayout>
            }
          />

          <Route
            path="/clientes"
            element={
              <MainLayout>
                <Clientes />
              </MainLayout>
            }
          />

          <Route
            path="/pagos"
            element={
              <MainLayout>
                <Pagos />
              </MainLayout>
            }
          />

          <Route
            path="/reportes"
            element={
              <MainLayout>
                <Reportes />
              </MainLayout>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

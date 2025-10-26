import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./Layouts/MainLayout";
import MenuPrincipal from "./pages/MenuPrincipal";
import Productos from "./pages/Productos";
import Login from "./pages/Login"; // 👈 importar login

function App() {
  return (
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
          path="/productos"
          element={
            <MainLayout>
              <Productos />
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

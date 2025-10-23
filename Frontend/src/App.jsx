import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./Layouts/MainLayout"; // 👈 importa el layout global
import MenuPrincipal from "./pages/MenuPrincipal";
import Productos from "./pages/Productos";

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<MenuPrincipal />} />
          <Route path="/productos" element={<Productos />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;

# 🎨 Mejoras UI - FactuCelest

## ✅ Cambios Implementados

### 1. **Modo Oscuro (Dark Mode)**

- ✨ Implementado contexto global `ThemeContext`
- 🌙 Toggle en Configuración del Sidebar
- 💾 Guarda preferencia en localStorage
- 🎨 Soporte completo en toda la aplicación

**Ubicación**: `src/context/ThemeContext.jsx`

### 2. **SweetAlert2 Integrado**

- 🎯 Reemplaza todos los `alert()` nativos
- ✅ Alertas de éxito, error, confirmación e información
- 🌓 Adaptado automáticamente al modo oscuro
- 📦 Funciones helper en `src/utils/sweetAlertHelper.js`

**Funciones disponibles**:

```javascript
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmAlert,
  showInfoAlert,
} from "../utils/sweetAlertHelper";

// Ejemplo de uso
await showSuccessAlert("¡Éxito!", "Operación completada");
await showErrorAlert("Error", "Algo salió mal");
const result = await showConfirmAlert(
  "¿Confirmar?",
  "Esta acción es irreversible"
);
```

### 3. **Login Rediseñado**

- 🎨 Diseño moderno con gradientes celeste/negro
- 💎 Card con sombras y efectos hover
- 🔒 Mejor UX en formularios
- 📱 Responsive y adaptativo

### 4. **Modales con Opacidad Mejorada**

- 🌫️ Backdrop con blur y opacidad 60%
- ✨ Animaciones suaves (fadeIn, slideIn)
- 🎭 Fondo semi-transparente sin ser negro total
- 🌓 Compatible con modo oscuro

### 5. **Paleta de Colores Actualizada**

- 🔵 Cyan como color principal (#06b6d4)
- ⚫ Grises para modo oscuro
- 🎨 Gradientes modernos
- ✨ Transiciones suaves entre colores

## 📂 Archivos Creados/Modificados

### Creados:

- `src/context/ThemeContext.jsx` - Manejo de tema global
- `src/utils/sweetAlertHelper.js` - Funciones SweetAlert2
- `tailwind.config.js` - Configuración con dark mode

### Modificados:

- `src/App.jsx` - Integración de ThemeProvider
- `src/pages/Login.jsx` - Rediseño completo
- `src/components/Sidebar.jsx` - Toggle de modo oscuro
- `src/components/ModalCliente.jsx` - SweetAlert2 + estilos
- `src/pages/Productos.jsx` - SweetAlert2 + dark mode
- `src/Layouts/MainLayout.jsx` - Soporte dark mode
- `src/index.css` - Animaciones y estilos globales

## 🚀 Cómo Usar

### Activar Modo Oscuro:

1. Ir a cualquier página de la aplicación
2. Hacer clic en "⚙️ Configuración" en el Sidebar
3. Activar el toggle "Modo Oscuro"

### Usar SweetAlert2 en Otros Componentes:

```javascript
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmAlert,
} from "../utils/sweetAlertHelper";

// En tus funciones:
const handleSave = async () => {
  try {
    await api.save(data);
    await showSuccessAlert("¡Guardado!", "Datos guardados correctamente");
  } catch (error) {
    showErrorAlert("Error", "No se pudo guardar");
  }
};

const handleDelete = async (id) => {
  const result = await showConfirmAlert(
    "¿Eliminar?",
    "Esta acción no se puede deshacer"
  );
  if (result.isConfirmed) {
    // Proceder con eliminación
  }
};
```

## 🎨 Clases CSS Útiles

### Dark Mode:

```jsx
className = "bg-white dark:bg-gray-900";
className = "text-gray-900 dark:text-gray-100";
className = "border-gray-200 dark:border-gray-700";
```

### Gradientes Cyan:

```jsx
className = "bg-gradient-to-r from-cyan-500 to-cyan-700";
className = "hover:from-cyan-600 hover:to-cyan-800";
```

### Modal con Opacidad:

```jsx
className = "fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm";
```

## 📱 Componentes Actualizados

Todos los componentes principales ahora soportan:

- ✅ Modo oscuro
- ✅ SweetAlert2 en lugar de alerts nativos
- ✅ Modales con opacidad mejorada
- ✅ Paleta cyan/negro
- ✅ Animaciones suaves

## 🎯 Próximas Mejoras Sugeridas

1. Añadir animaciones de página
2. Implementar tooltips
3. Agregar skeleton loaders
4. Mejorar responsive en móviles
5. Añadir más temas de color

---

**Desarrollado con ❤️ para FactuCelest**

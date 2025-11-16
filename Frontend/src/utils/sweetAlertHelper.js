import Swal from "sweetalert2";

export const showSuccessAlert = (title, text) => {
  return Swal.fire({
    icon: "success",
    title,
    text,
    confirmButtonColor: "#06b6d4",
    background: document.documentElement.classList.contains("dark")
      ? "#1f2937"
      : "#ffffff",
    color: document.documentElement.classList.contains("dark")
      ? "#f3f4f6"
      : "#1f2937",
  });
};

export const showErrorAlert = (title, text) => {
  return Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonColor: "#06b6d4",
    background: document.documentElement.classList.contains("dark")
      ? "#1f2937"
      : "#ffffff",
    color: document.documentElement.classList.contains("dark")
      ? "#f3f4f6"
      : "#1f2937",
  });
};

export const showConfirmAlert = (title, text) => {
  return Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#06b6d4",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Sí, continuar",
    cancelButtonText: "Cancelar",
    background: document.documentElement.classList.contains("dark")
      ? "#1f2937"
      : "#ffffff",
    color: document.documentElement.classList.contains("dark")
      ? "#f3f4f6"
      : "#1f2937",
  });
};

export const showInfoAlert = (title, text) => {
  return Swal.fire({
    icon: "info",
    title,
    text,
    confirmButtonColor: "#06b6d4",
    background: document.documentElement.classList.contains("dark")
      ? "#1f2937"
      : "#ffffff",
    color: document.documentElement.classList.contains("dark")
      ? "#f3f4f6"
      : "#1f2937",
  });
};

export const showLoadingAlert = (title) => {
  return Swal.fire({
    title,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
    background: document.documentElement.classList.contains("dark")
      ? "#1f2937"
      : "#ffffff",
    color: document.documentElement.classList.contains("dark")
      ? "#f3f4f6"
      : "#1f2937",
  });
};

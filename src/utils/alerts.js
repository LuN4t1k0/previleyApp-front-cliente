import Swal from 'sweetalert2';

export const showSuccessAlert = (title, text) => {
  Swal.fire({
    title: title,
    text: text,
    icon: 'success',
    confirmButtonText: 'Aceptar'
  });
};

export const showErrorAlert = (title, text) => {
  Swal.fire({
    title: title,
    text: text,
    icon: 'error',
    confirmButtonText: 'Aceptar'
  });
};

export const showInfoAlert = (title, text) => {
  Swal.fire({
    title: title,
    text: text,
    icon: 'info',
    confirmButtonText: 'Aceptar'
  });
};

export const showConfirmationAlert = async (title, text) => {
  const result = await Swal.fire({
    title: title,
    text: text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, salir',
    cancelButtonText: 'Cancelar',
  });
  return result.isConfirmed;
};

export const showConfirm = async ({ title, text, confirmText = 'Continuar', cancelText = 'Cancelar', icon = 'warning' }) => {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
  });
  return result.isConfirmed;
};

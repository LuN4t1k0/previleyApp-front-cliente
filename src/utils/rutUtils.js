export const handleRutChange = (formik, field) => (event) => {
  const value = event.target.value;
  let formattedValue = value.replace(/[^0-9kK]/g, "").replace(/-/g, "");
  if (formattedValue.length > 9) {
    formattedValue = formattedValue.substring(0, 9);
  }
  const formattedRut = `${formattedValue.substring(0, formattedValue.length - 1)}-${formattedValue.slice(-1)}`;
  formik.setFieldValue(field, formattedRut);
};


// export const handleRutKeyPress = (event) => {
//   const re = /^[0-9Kk-]*$/;
//   if (!re.test(event.key)) {
//     event.preventDefault();
//   }
// };

// NUEVO:
export const handleRutKeyPress = (event) => {
  // Permite las teclas de edición como Backspace, Delete, y flechas de navegación
  const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
  
  if (allowedKeys.includes(event.key)) return;

  // Permite solo caracteres válidos (0-9, K, k, y guion)
  const re = /^[0-9Kk-]*$/;
  if (!re.test(event.key)) {
    event.preventDefault();
  }
};

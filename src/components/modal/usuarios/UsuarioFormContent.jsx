// import React, { useState, useEffect } from "react";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import { TextInput, Button, Select, SelectItem } from "@tremor/react";
// import apiService from "@/app/api/apiService";
// import { showErrorAlert, showConfirmationAlert } from "@/utils/alerts";
// import { handleRutChange } from "@/utils/rutUtils";

// const getValidationSchema = (isEditMode, rol) => {
//   let schema = {
//     nombre: Yup.string().required("El nombre es requerido"),
//     apellido: Yup.string().required("El apellido es requerido"),
//     telefono: Yup.string().required("El teléfono es requerido"),
//     estado: Yup.string().oneOf(["activo", "inactivo"]).required("El estado es requerido"),
//     rol: Yup.string().required("El rol es requerido"),
//   };

//   if (!isEditMode) {
//     schema.rut = Yup.string().required("El RUT es requerido");
//     schema.email = Yup.string().email("Correo inválido").required("El email es requerido");
//     schema.password = Yup.string().min(6, "Mínimo 6 caracteres").required("La contraseña es requerida");
//   } else {
//     schema.password = Yup.string().min(6, "Mínimo 6 caracteres").nullable();
//   }

//   if (rol === "trabajador") {
//     if (!isEditMode) {
//       schema.fechaNacimiento = Yup.date().required("La fecha de nacimiento es requerida");
//       schema.fechaIngreso = Yup.date().required("La fecha de ingreso es obligatoria");
//     } else {
//       schema.fechaNacimiento = Yup.date().nullable();
//       schema.fechaIngreso = Yup.date().nullable();
//       schema.empresaRut = Yup.string().required("El RUT de la empresa es obligatorio");
//     }
//   }

//   return Yup.object().shape(schema);
// };

// const UsuarioFormModal = ({ initialData, onClose, fetchData }) => {
//   const [empresaOptions, setEmpresaOptions] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const isEditMode = Boolean(initialData?.id);
//   const [selectedRol, setSelectedRol] = useState(initialData?.rol || "");

//   useEffect(() => {
//     const fetchEmpresas = async () => {
//       try {
//         const response = await apiService.get("/empresas/");
//         const { data: empresas } = response.data;
//         setEmpresaOptions(empresas.map((e) => ({ value: e.empresaRut, label: e.empresaRut })));
//       } catch (error) {
//         showErrorAlert("Error al obtener empresas", error.message);
//       }
//     };
//     fetchEmpresas();
//   }, []);

//   const formik = useFormik({
//     initialValues: {
//       nombre: initialData?.nombre || "",
//       apellido: initialData?.apellido || "",
//       rut: initialData?.rut || "",
//       telefono: initialData?.telefono || "",
//       email: initialData?.email || "",
//       password: "",
//       fechaNacimiento: initialData?.fechaNacimiento?.split("T")[0] || "",
//       empresaRut: initialData?.empresaRut || "",
//       fechaIngreso: initialData?.fechaIngreso?.split("T")[0] || "",
//       estado: initialData?.estado || "activo",
//       rol: initialData?.rol || "",
//     },
//     validationSchema: getValidationSchema(isEditMode, selectedRol),
//     enableReinitialize: true,
//     onSubmit: async (values) => {
//       try {
//         setIsLoading(true);
//         const cleanValues = { ...values };

//         if (selectedRol !== "trabajador") {
//           delete cleanValues.empresaRut;
//           delete cleanValues.fechaIngreso;
//           delete cleanValues.fechaNacimiento;
//         }

//         // Eliminar empresaRut si está vacío en creación
//         if (!isEditMode && cleanValues.empresaRut === "") {
//           delete cleanValues.empresaRut;
//         }

//         if (isEditMode) {
//           if (!cleanValues.password) delete cleanValues.password;
//           delete cleanValues.email;
//           delete cleanValues.rut;
//           await apiService.patch(`/usuarios/${initialData.id}`, cleanValues);
//         } else {
//           await apiService.post("/usuarios/", cleanValues);
//         }

//         await fetchData();
//         onClose();
//       } catch (error) {
//         showErrorAlert("Error al guardar el usuario", error?.response?.data?.message || error.message);
//       } finally {
//         setIsLoading(false);
//       }
//     },
//   });

//   const handleClose = async () => {
//     const confirm = await showConfirmationAlert("Cambios sin guardar", "¿Deseas salir sin guardar?");
//     if (confirm) onClose();
//   };

//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-semibold text-gray-800 mb-4">
//         {isEditMode ? "Editar Usuario" : "Nuevo Usuario"}
//       </h2>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <TextInput name="nombre" placeholder="Nombre" {...formik.getFieldProps("nombre")} />
//         <TextInput name="apellido" placeholder="Apellido" {...formik.getFieldProps("apellido")} />
//         {!isEditMode && (
//           <TextInput name="rut" placeholder="RUT" {...formik.getFieldProps("rut")} onChange={handleRutChange(formik, "rut")} />
//         )}
//         <TextInput name="telefono" placeholder="Teléfono" {...formik.getFieldProps("telefono")} />
//         {!isEditMode && <TextInput name="email" placeholder="Email" {...formik.getFieldProps("email")} />}
//         <TextInput
//           type="password"
//           name="password"
//           placeholder={isEditMode ? "Dejar vacío para no cambiar" : "Contraseña"}
//           {...formik.getFieldProps("password")}
//         />
//         <Select value={formik.values.rol} onValueChange={(v) => { setSelectedRol(v); formik.setFieldValue("rol", v); }}>
//           <SelectItem value="">Seleccione un rol</SelectItem>
//           <SelectItem value="trabajador">Trabajador</SelectItem>
//           <SelectItem value="admin">Administrador</SelectItem>
//           <SelectItem value="cliente">Cliente</SelectItem>
//         </Select>
//         <Select name="estado" value={formik.values.estado} onValueChange={(v) => formik.setFieldValue("estado", v)}>
//           <SelectItem value="activo">Activo</SelectItem>
//           <SelectItem value="inactivo">Inactivo</SelectItem>
//         </Select>

//         {(selectedRol === "trabajador" || selectedRol === "admin") && (
//           <TextInput type="date" name="fechaNacimiento" {...formik.getFieldProps("fechaNacimiento")} />
//         )}

//         {selectedRol === "trabajador" && isEditMode && (
//           <Select value={formik.values.empresaRut} onValueChange={(v) => formik.setFieldValue("empresaRut", v)}>
//             <SelectItem value="">Seleccione Empresa</SelectItem>
//             {empresaOptions.map((opt) => (
//               <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
//             ))}
//           </Select>
//         )}

//         {(selectedRol === "trabajador" || selectedRol === "admin") && (
//           <TextInput type="date" name="fechaIngreso" {...formik.getFieldProps("fechaIngreso")} />
//         )}
//       </div>
//       <div className="mt-4 flex justify-end space-x-4">
//         <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
//         <Button color="blue" onClick={formik.handleSubmit} disabled={isLoading}>
//           {isLoading ? "Guardando..." : isEditMode ? "Actualizar" : "Guardar"}
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default UsuarioFormModal;



// NUEVO:
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { TextInput, Button, Select, SelectItem } from "@tremor/react";
import apiService from "@/app/api/apiService";
import { showErrorAlert, showConfirmationAlert } from "@/utils/alerts";
import { handleRutChange } from "@/utils/rutUtils";

const getValidationSchema = (isEditMode, rol) => {
  let schema = {
    nombre: Yup.string().required("El nombre es requerido"),
    apellido: Yup.string().required("El apellido es requerido"),
    telefono: Yup.string().required("El teléfono es requerido"),
    estado: Yup.string().oneOf(["activo", "inactivo"]).required("El estado es requerido"),
    rol: Yup.string().required("El rol es requerido"),
  };

  if (!isEditMode) {
    schema.rut = Yup.string().required("El RUT es requerido");
    schema.email = Yup.string().email("Correo inválido").required("El email es requerido");
    schema.password = Yup.string().min(6, "Mínimo 6 caracteres").required("La contraseña es requerida");
  } else {
    schema.password = Yup.string().min(6, "Mínimo 6 caracteres").nullable();
  }

  if (rol === "trabajador") {
    // Fechas opcionales para trabajador
    schema.fechaNacimiento = Yup.date().nullable();
    schema.fechaIngreso = Yup.date().nullable();
    schema.empresaRut = Yup.string().nullable();
  }

  return Yup.object().shape(schema);
};

const UsuarioFormModal = ({ initialData, onClose, fetchData }) => {
  const [empresaOptions, setEmpresaOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(initialData || {});
  const isEditMode = Boolean(initialData?.id);
  const [selectedRol, setSelectedRol] = useState(initialData?.rol || "");
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Obtener detalles si estamos editando
  useEffect(() => {
    const fetchUserDetail = async () => {
      if (isEditMode) {
        try {
          const response = await apiService.get(`/usuarios/${initialData.id}/detalle`);
          console.log("Detalle usuario:", response.data);
          setUserData(response.data);
          setSelectedRol(response.data.rol);
        } catch (error) {
          showErrorAlert("Error al obtener detalles del usuario", error.message);
        }
      }
    };
    fetchUserDetail();
  }, [initialData, isEditMode]);

  // Cargar empresas
  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const response = await apiService.get("/empresas", { params: { limit: 1000 } });
        const { data: empresas } = response.data;
        setEmpresaOptions(empresas.map((e) => ({ value: e.empresaRut, label: e.empresaRut })));
      } catch (error) {
        showErrorAlert("Error al obtener empresas", error.message);
      }
    };
    fetchEmpresas();
  }, []);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      nombre: userData?.nombre || "",
      apellido: userData?.apellido || "",
      rut: userData?.rut || "",
      telefono: userData?.telefono || "",
      email: userData?.email || "",
      password: "",
      fechaNacimiento: userData?.fechaNacimiento ? userData.fechaNacimiento.split("T")[0] : "",
      empresaRut: userData?.empresaRut || "",
      fechaIngreso: userData?.fechaIngreso ? userData.fechaIngreso.split("T")[0] : "",
      estado: userData?.estado || "activo",
      rol: userData?.rol || "",
    },
    validationSchema: getValidationSchema(isEditMode, selectedRol),
    

    onSubmit: async (values) => {
  try {
    console.log("Submit activado. Valores brutos:", values);
    if (Object.keys(formik.errors).length > 0) {
      console.log("Errores de validación:", formik.errors);
    }

    setIsLoading(true);
    const cleanValues = { ...values };

    if (selectedRol !== "trabajador") {
      delete cleanValues.empresaRut;
      delete cleanValues.fechaIngreso;
      delete cleanValues.fechaNacimiento;
    }

    // Para trabajador: si no se ingresaron fechas, no enviarlas (evita Joi con strings vacíos)
    if (selectedRol === "trabajador") {
      if (!cleanValues.fechaIngreso) delete cleanValues.fechaIngreso;
      if (!cleanValues.fechaNacimiento) delete cleanValues.fechaNacimiento;
    }

    // Siempre eliminar empresaRut si estamos editando
    if (isEditMode) {
      delete cleanValues.empresaRut;
    }

    if (!isEditMode && cleanValues.empresaRut === "") {
      delete cleanValues.empresaRut;
    }

    if (isEditMode) {
      if (!cleanValues.password) delete cleanValues.password;
      delete cleanValues.rut;
      console.log("Enviando PATCH con:", cleanValues);
      await apiService.patch(`/usuarios/${initialData.id}`, cleanValues);
    } else {
      console.log("Enviando POST con:", cleanValues);
      await apiService.post("/usuarios/", cleanValues);
    }

    await fetchData();
    onClose();
  } catch (error) {
    console.error("Error en submit:", error);
    showErrorAlert("Error al guardar el usuario", error?.response?.data?.message || error.message);
  } finally {
    setIsLoading(false);
  }
}

  });

  const handleClose = async () => {
    const confirm = await showConfirmationAlert("Cambios sin guardar", "¿Deseas salir sin guardar?");
    if (confirm) onClose();
  };

  return (
    // <div className="p-4">
    //   <h2 className="text-xl font-semibold text-gray-800 mb-4">
    //     {isEditMode ? "Editar Usuario" : "Nuevo Usuario"}
    //   </h2>
    //   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //     <TextInput name="nombre" placeholder="Nombre" {...formik.getFieldProps("nombre")} />
    //     <TextInput name="apellido" placeholder="Apellido" {...formik.getFieldProps("apellido")} />
    //     {!isEditMode && (
    //       <TextInput name="rut" placeholder="RUT" {...formik.getFieldProps("rut")} onChange={handleRutChange(formik, "rut")} />
    //     )}
    //     <TextInput name="telefono" placeholder="Teléfono" {...formik.getFieldProps("telefono")} />
    //     <TextInput name="email" placeholder="Email" {...formik.getFieldProps("email")} />
    //     <TextInput
    //       type="password"
    //       name="password"
    //       placeholder={isEditMode ? "Dejar vacío para no cambiar" : "Contraseña"}
    //       {...formik.getFieldProps("password")}
    //     />
    //     <Select value={formik.values.rol} onValueChange={(v) => { setSelectedRol(v); formik.setFieldValue("rol", v); }}>
    //       <SelectItem value="">Seleccione un rol</SelectItem>
    //       <SelectItem value="trabajador">Trabajador</SelectItem>
    //       <SelectItem value="admin">Administrador</SelectItem>
    //       <SelectItem value="cliente">Cliente</SelectItem>
    //     </Select>
    //     <Select name="estado" value={formik.values.estado} onValueChange={(v) => formik.setFieldValue("estado", v)}>
    //       <SelectItem value="activo">Activo</SelectItem>
    //       <SelectItem value="inactivo">Inactivo</SelectItem>
    //     </Select>

    //     {(selectedRol === "trabajador" || selectedRol === "admin") && (
    //       <TextInput type="date" name="fechaNacimiento" {...formik.getFieldProps("fechaNacimiento")} />
    //     )}

    //     {selectedRol === "trabajador" && isEditMode && (
    //       <Select value={formik.values.empresaRut} onValueChange={(v) => formik.setFieldValue("empresaRut", v)}>
    //         <SelectItem value="">Seleccione Empresa</SelectItem>
    //         {empresaOptions.map((opt) => (
    //           <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
    //         ))}
    //       </Select>
    //     )}

    //     {(selectedRol === "trabajador" || selectedRol === "admin") && (
    //       <TextInput type="date" name="fechaIngreso" {...formik.getFieldProps("fechaIngreso")} />
    //     )}
    //   </div>
    //   <div className="mt-4 flex justify-end space-x-4">
    //     <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
    //     <Button
    //       color="blue"
    //       onClick={async () => {
    //         try {
    //           await formik.handleSubmit();
    //         } catch (e) {
    //           console.error("Error inesperado al enviar el formulario:", e);
    //         }
    //       }}
    //       disabled={isLoading}
    //     >
    //       {isLoading ? "Guardando..." : isEditMode ? "Actualizar" : "Guardar"}
    //     </Button>
    //   </div>
    // </div>
<div className="p-4 space-y-4">
  {/* Título */}
  <h2 className="text-xl font-bold text-gray-800">
    {isEditMode ? "Editar Usuario" : "Nuevo Usuario"}
  </h2>

  {/* Grid de campos */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">

    <div>
      <p className="text-xs font-medium text-gray-600 mb-1">Nombre</p>
      <TextInput
        name="nombre"
        placeholder="Nombre"
        {...formik.getFieldProps("nombre")}
        disabled={isLoading}
      />
      {submitAttempted && formik.errors.nombre && (
        <p className="text-red-600 text-xs col-span-1 md:col-span-2">{formik.errors.nombre}</p>
      )}
    </div>

    <div>
      <p className="text-xs font-medium text-gray-600 mb-1">Apellido</p>
      <TextInput
        name="apellido"
        placeholder="Apellido"
        {...formik.getFieldProps("apellido")}
        disabled={isLoading}
      />
      {submitAttempted && formik.errors.apellido && (
        <p className="text-red-600 text-xs col-span-1 md:col-span-2">{formik.errors.apellido}</p>
      )}
    </div>

    {!isEditMode && (
      <div>
        <p className="text-xs font-medium text-gray-600 mb-1">RUT</p>
        <TextInput
          name="rut"
          placeholder="RUT"
          {...formik.getFieldProps("rut")}
          onChange={handleRutChange(formik, "rut")}
          disabled={isLoading}
        />
        {submitAttempted && formik.errors.rut && (
          <p className="text-red-600 text-xs col-span-1 md:col-span-2">{formik.errors.rut}</p>
        )}
      </div>
    )}

    <div>
      <p className="text-xs font-medium text-gray-600 mb-1">Teléfono</p>
      <TextInput
        name="telefono"
        placeholder="Teléfono"
        {...formik.getFieldProps("telefono")}
        disabled={isLoading}
      />
      {submitAttempted && formik.errors.telefono && (
        <p className="text-red-600 text-xs col-span-1 md:col-span-2">{formik.errors.telefono}</p>
      )}
    </div>

    <div>
      <p className="text-xs font-medium text-gray-600 mb-1">Email</p>
      <TextInput
        name="email"
        placeholder="Email"
        {...formik.getFieldProps("email")}
        disabled={isLoading}
      />
      {submitAttempted && formik.errors.email && !isEditMode && (
        <p className="text-red-600 text-xs col-span-1 md:col-span-2">{formik.errors.email}</p>
      )}
    </div>

    <div>
      <p className="text-xs font-medium text-gray-600 mb-1">Contraseña</p>
      <TextInput
        type="password"
        name="password"
        placeholder={isEditMode ? "Dejar vacío para no cambiar" : "Contraseña"}
        {...formik.getFieldProps("password")}
        disabled={isLoading}
      />
      {submitAttempted && formik.errors.password && (
        <p className="text-red-600 text-xs col-span-1 md:col-span-2">{formik.errors.password}</p>
      )}
    </div>

    <div>
      <p className="text-xs font-medium text-gray-600 mb-1">Rol *</p>
      <Select
        value={formik.values.rol}
        onValueChange={(v) => {
          setSelectedRol(v);
          formik.setFieldValue("rol", v);
        }}
        disabled={isLoading}
      >
        <SelectItem value="">Seleccione un rol</SelectItem>
        <SelectItem value="trabajador">Trabajador</SelectItem>
        <SelectItem value="admin">Administrador</SelectItem>
        <SelectItem value="cliente">Cliente</SelectItem>
      </Select>
      {submitAttempted && formik.errors.rol && (
        <p className="text-red-600 text-xs col-span-1 md:col-span-2">{formik.errors.rol}</p>
      )}
    </div>

    <div>
      <p className="text-xs font-medium text-gray-600 mb-1">Estado *</p>
      <Select
        name="estado"
        value={formik.values.estado}
        onValueChange={(v) => formik.setFieldValue("estado", v)}
        disabled={isLoading}
      >
        <SelectItem value="activo">Activo</SelectItem>
        <SelectItem value="inactivo">Inactivo</SelectItem>
      </Select>
      {submitAttempted && formik.errors.estado && (
        <p className="text-red-600 text-xs col-span-1 md:col-span-2">{formik.errors.estado}</p>
      )}
    </div>

    {(selectedRol === "admin") && (
      <div>
        <p className="text-xs font-medium text-gray-600 mb-1">Fecha de Nacimiento</p>
        <TextInput
          type="date"
          name="fechaNacimiento"
          {...formik.getFieldProps("fechaNacimiento")}
          disabled={isLoading}
        />
      </div>
    )}

    {selectedRol === "trabajador" && isEditMode && (
      <div>
        <p className="text-xs font-medium text-gray-600 mb-1">Empresa</p>
        <Select
          value={formik.values.empresaRut}
          onValueChange={(v) => formik.setFieldValue("empresaRut", v)}
          disabled={isLoading}
        >
          <SelectItem value="">Seleccione Empresa</SelectItem>
          {empresaOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </Select>
        {submitAttempted && formik.errors.empresaRut && (
          <p className="text-red-600 text-xs col-span-1 md:col-span-2">{formik.errors.empresaRut}</p>
        )}
      </div>
    )}

    {(selectedRol === "admin") && (
      <div>
        <p className="text-xs font-medium text-gray-600 mb-1">Fecha de Ingreso</p>
        <TextInput
          type="date"
          name="fechaIngreso"
          {...formik.getFieldProps("fechaIngreso")}
          disabled={isLoading}
        />
      </div>
    )}
  </div>

  {/* Botones */}
  <div className="pt-3 flex justify-end space-x-4">
    <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
      Cancelar
    </Button>
    <Button
      color="blue"
      onClick={async () => {
        try {
          setSubmitAttempted(true);
          const errors = await formik.validateForm();
          // marcar todos los campos como tocados para mostrar errores
          const touchedAll = Object.keys(formik.values).reduce((acc, key) => {
            acc[key] = true; return acc;
          }, {});
          formik.setTouched(touchedAll);
          if (Object.keys(errors).length > 0) {
            console.error("Errores de validación en formulario de usuario:", errors);
            const firstError = Object.values(errors)[0];
            // Mostrar un resumen amigable
            showErrorAlert("Validación", typeof firstError === 'string' ? firstError : "Por favor, completa los campos requeridos.");
            return;
          }
          await formik.handleSubmit();
        } catch (e) {
          console.error("Error inesperado al enviar el formulario:", e);
          showErrorAlert("Error", "Ocurrió un error inesperado al guardar.");
        }
      }}
      disabled={isLoading}
    >
      {isLoading ? "Guardando..." : isEditMode ? "Actualizar" : "Guardar"}
    </Button>
  </div>
</div>


  );
};

export default UsuarioFormModal;

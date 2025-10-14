// "use client";

// import { useState } from "react";
// import { TextInput, Button } from "@tremor/react";
// import { showErrorAlert, showSuccessAlert } from "@/utils/alerts";

// const EditarCredencialModal = ({
//   initialData,
//   onClose,
//   handleSubmit,
//   fetchData,
// }) => {
//   const [usuario, setUsuario] = useState(initialData?.usuario || "");
//   const [password, setPassword] = useState("");

//   const handleGuardar = async () => {
//     if (!usuario) {
//       showErrorAlert("El campo usuario es obligatorio.");
//       return;
//     }

//     try {
//       const formData = {
//         usuario,
//         ...(password && { password }),
//       };

//       // ⚠️ Aquí estaba el error
//       await handleSubmit(formData, { id: initialData.id });

//       showSuccessAlert("Credencial actualizada correctamente.");
//       fetchData();
//       onClose();
//     } catch (error) {
//       showErrorAlert("Error al actualizar credencial", error.message);
//     }
//   };

//   if (!initialData) {
//     return (
//       <div className="p-4 text-center text-gray-500">
//         Cargando datos para editar...
//       </div>
//     );
//   }

//   // return (
//   //   <div >
//   //     <h2 className="text-lg font-semibold text-gray-800 mb-4">
//   //       Editar Credencial
//   //     </h2>

//   //     {/* Entidad no editable */}
//   //     <div className="mb-4">
//   //       <label className="block text-sm font-medium text-gray-700">Entidad</label>
//   //       <div className="bg-gray-100 p-2 rounded text-sm text-gray-800 border border-gray-300">
//   //         {initialData.entidad}
//   //       </div>
//   //     </div>

//   //     {/* Usuario */}
//   //     <div className="mb-4">
//   //       <label className="block text-sm font-medium text-gray-700">Usuario</label>
//   //       <TextInput
//   //         placeholder="Ej: usuario@empresa.com"
//   //         value={usuario}
//   //         onChange={(e) => setUsuario(e.target.value)}
//   //       />
//   //     </div>

//   //     {/* Contraseña */}
//   //     <div className="mb-4">
//   //       <label className="block text-sm font-medium text-gray-700">
//   //         Contraseña (opcional)
//   //       </label>
//   //       <TextInput
//   //         type="password"
//   //         placeholder="********"
//   //         value={password}
//   //         onChange={(e) => setPassword(e.target.value)}
//   //       />
//   //     </div>

//   //     {/* Botones */}
//   //     <div className="flex justify-end space-x-2 mt-6">
//   //       <Button variant="secondary" onClick={onClose}>
//   //         Cancelar
//   //       </Button>
//   //       <Button color="blue" onClick={handleGuardar}>
//   //         Guardar
//   //       </Button>
//   //     </div>
//   //   </div>
//   // );

//   return (
//   <div className="p-4 space-y-4">
//     <h2 className="text-xl font-bold text-gray-800">Editar Credencial</h2>

//     {/* Entidad no editable */}
//     <div>
//       <p className="text-xs font-medium text-gray-600 mb-1">Entidad</p>
//       <div className="bg-gray-100 p-2 rounded text-sm text-gray-800 border border-gray-300">
//         {initialData.entidad}
//       </div>
//     </div>

//     {/* Usuario */}
//     <div>
//       <p className="text-xs font-medium text-gray-600 mb-1">Usuario</p>
//       <TextInput
//         placeholder="Ej: usuario@empresa.com"
//         value={usuario}
//         onChange={(e) => setUsuario(e.target.value)}
//       />
//     </div>

//     {/* Contraseña */}
//     <div>
//       <p className="text-xs font-medium text-gray-600 mb-1">Contraseña (opcional)</p>
//       <TextInput
//         type="password"
//         placeholder="********"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//       />
//     </div>

//     {/* Botones */}
//     <div className="pt-3 flex justify-end space-x-4">
//       <Button variant="secondary" onClick={onClose}>
//         Cancelar
//       </Button>
//       <Button color="blue" onClick={handleGuardar}>
//         Guardar
//       </Button>
//     </div>
//   </div>
// );



// };

// export default EditarCredencialModal;


"use client";

import { useState } from "react";
import { TextInput, Button } from "@tremor/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { showErrorAlert, showSuccessAlert } from "@/utils/alerts";

const validationSchema = Yup.object().shape({
  usuario: Yup.string().required("El usuario es obligatorio"),
  password: Yup.string(), // opcional
});

const EditarCredencialModal = ({
  initialData,
  onClose,
  handleSubmit,
  fetchData,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      usuario: initialData?.usuario || "",
      password: "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);

        const formData = {
          usuario: values.usuario,
          ...(values.password && { password: values.password }),
        };

        await handleSubmit(formData, { id: initialData.id });
        showSuccessAlert("Credencial actualizada correctamente.");
        fetchData();
        onClose();
      } catch (error) {
        showErrorAlert("Error al actualizar credencial", error.message);
      } finally {
        setIsLoading(false);
      }
    },
  });

  if (!initialData) {
    return (
      <div className="p-4 text-center text-gray-500">
        Cargando datos para editar...
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Editar Credencial</h2>

      {/* Entidad no editable */}
      <div>
        <p className="text-xs font-medium text-gray-600 mb-1">Entidad</p>
        <div className="bg-gray-100 p-2 rounded text-sm text-gray-800 border border-gray-300">
          {initialData.entidad}
        </div>
      </div>

      {/* Usuario */}
      <div>
        <p className="text-xs font-medium text-gray-600 mb-1">Usuario</p>
        <TextInput
          name="usuario"
          placeholder="Ej: usuario@empresa.com"
          value={formik.values.usuario}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          disabled={isLoading}
        />
        {formik.touched.usuario && formik.errors.usuario && (
          <p className="text-red-500 text-xs mt-1">{formik.errors.usuario}</p>
        )}
      </div>

      {/* Contraseña */}
      <div>
        <p className="text-xs font-medium text-gray-600 mb-1">Contraseña (opcional)</p>
        <TextInput
          name="password"
          type="password"
          placeholder="********"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          disabled={isLoading}
        />
      </div>

      {/* Botones */}
      <div className="pt-3 flex justify-end space-x-4">
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          color="blue"
          onClick={formik.handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </div>
  );
};

export default EditarCredencialModal;

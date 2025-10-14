// import React, { useState, useEffect } from "react";
// import {
//   Select,
//   SelectItem,
//   Button,
//   Table,
//   TableHead,
//   TableRow,
//   TableHeaderCell,
//   TableBody,
//   TableCell,
//   TextInput,
// } from "@tremor/react";
// import apiService from "@/app/api/apiService";
// import { showErrorAlert, showSuccessAlert } from "@/utils/alerts";
// import usePasswordReveal from "@/hooks/usePasswordReveal";

// const EmpresaCredencialesModal = ({ onClose }) => {
//   const [empresas, setEmpresas] = useState([]);
//   const [empresaSeleccionada, setEmpresaSeleccionada] = useState("");
//   const [credenciales, setCredenciales] = useState([]);
//   const [entidades, setEntidades] = useState([]);
//   const [entidad, setEntidad] = useState("");
//   const [usuario, setUsuario] = useState("");
//   const [password, setPassword] = useState("");

//   const { passwords, loading, countdown, revealPassword } =
//     usePasswordReveal(10);

//   // 🔹 Cargar empresas y entidades al montar el componente
//   useEffect(() => {
//     cargarEmpresas();
//     cargarEntidades();
//   }, []);

//   const cargarEmpresas = async () => {
//     try {
//       const response = await apiService.get("/empresas/");
//       setEmpresas(response.data.data);
//     } catch (error) {
//       showErrorAlert("Error al cargar empresas", error.message);
//     }
//   };

//   const cargarEntidades = async () => {
//     try {
//       const response = await apiService.get("/enum/entidades-autorizadas");

//       // Convertir el objeto en un array [{ value, label }]
//       const entidadesArray = Object.entries(response.data).map(
//         ([key, value]) => ({
//           value: value, // 👈 Enviar el texto legible esperado por el backend
//           label: value, // 👈 Mostrar la descripción en el frontend
//         })
//       );

//       setEntidades(entidadesArray);
//     } catch (error) {
//       showErrorAlert("Error al cargar entidades", error.message);
//     }
//   };

//   const cargarCredenciales = async (empresaRut) => {
//     try {
//       const response = await apiService.get(
//         `/empresa-credenciales/empresa/${empresaRut}`
//       );
//       setCredenciales(response.data);
//     } catch (error) {
//       showErrorAlert("Error al cargar credenciales", error.message);
//     }
//   };

//   const handleEmpresaChange = (empresaRut) => {
//     setEmpresaSeleccionada(empresaRut);
//     setCredenciales([]);
//     setEntidad("");
//     setUsuario("");
//     setPassword("");
//     cargarCredenciales(empresaRut);
//   };

//   const handleGuardarCredencial = async () => {
//     if (!empresaSeleccionada || !entidad || !usuario || !password) {
//       showErrorAlert("Todos los campos son obligatorios.");
//       return;
//     }

//     const payload = {
//       empresaRut: empresaSeleccionada,
//       entidad,
//       usuario,
//       password,
//     };

//     try {
//       await apiService.post("/empresa-credenciales", payload);
//       showSuccessAlert("Credencial guardada correctamente.");
//       setEntidad("");
//       setUsuario("");
//       setPassword("");
//       cargarCredenciales(empresaSeleccionada);
//     } catch (error) {
//       showErrorAlert("Error al guardar la credencial", error.message);
//     }
//   };

//   const handleEliminarCredencial = async (id) => {
//     try {
//       await apiService.delete(`/empresa-credenciales/${id}`);
//       showSuccessAlert("Credencial eliminada correctamente.");
//       cargarCredenciales(empresaSeleccionada);
//     } catch (error) {
//       showErrorAlert("Error al eliminar credencial", error.message);
//     }
//   };

//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-semibold text-gray-800 mb-4">
//         Gestión de Credenciales
//       </h2>

//       {/* Selección de Empresa */}
//       <div className="mb-4">
//         <label className="block text-sm font-medium text-gray-700">
//           Seleccionar Empresa
//         </label>
//         <Select value={empresaSeleccionada} onValueChange={handleEmpresaChange}>
//           <SelectItem value="">Seleccione una empresa</SelectItem>
//           {empresas.map((empresa) => (
//             <SelectItem key={empresa.empresaRut} value={empresa.empresaRut}>
//               {empresa.nombre} ({empresa.empresaRut})
//             </SelectItem>
//           ))}
//         </Select>
//       </div>

//       {/* Credenciales Asignadas */}
//       {empresaSeleccionada && (
//         <div className="mb-6">
//           <h4 className="text-lg font-semibold text-gray-900 mb-3">
//             Credenciales
//           </h4>
//           <Table className="min-w-full bg-white rounded-lg shadow-sm">
//             <TableHead>
//               <TableRow className="bg-gray-200">
//                 <TableHeaderCell>Entidad</TableHeaderCell>
//                 <TableHeaderCell>Usuario</TableHeaderCell>
//                 <TableHeaderCell>Contraseña</TableHeaderCell>
//                 <TableHeaderCell>Acción</TableHeaderCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {credenciales.length > 0 ? (
//                 credenciales.map((credencial) => (
//                   <TableRow key={credencial.id} className="hover:bg-gray-50">
//                     <TableCell>{credencial.entidad}</TableCell>
//                     <TableCell>{credencial.usuario}</TableCell>
//                     <TableCell>
//                       {passwords[credencial.id] || "********"}
//                     </TableCell>
//                     <TableCell>
//                       <div className="flex space-x-2">
//                         <Button
//                           color="blue"
//                           onClick={() => revealPassword(credencial.id)}
//                           disabled={loading[credencial.id]}
//                         >
//                           {loading[credencial.id]
//                             ? "Cargando..."
//                             : countdown[credencial.id]
//                             ? `Ocultar (${countdown[credencial.id]})`
//                             : "Ver"}
//                         </Button>
//                         <Button
//                           color="red"
//                           onClick={() =>
//                             handleEliminarCredencial(credencial.id)
//                           }
//                         >
//                           Eliminar
//                         </Button>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell
//                     colSpan="4"
//                     className="text-center text-gray-500 py-3"
//                   >
//                     No hay credenciales registradas.
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </div>
//       )}

//       {/* Agregar Nueva Credencial */}
//       {empresaSeleccionada && (
//         <div className="mb-4">
//           <h4 className="text-lg font-semibold text-gray-900 mb-3">
//             Agregar Nueva Credencial
//           </h4>

//           {/* Entidad (Tomada del endpoint de entidades autorizadas) */}
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700">
//               Entidad
//             </label>

//             <Select value={entidad} onValueChange={setEntidad}>
//               <SelectItem value="">Seleccione una entidad</SelectItem>
//               {entidades.map((entidad) => (
//                 <SelectItem key={entidad.value} value={entidad.value}>
//                   {entidad.label}
//                 </SelectItem>
//               ))}
//             </Select>
//           </div>

//           {/* Usuario */}
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700">
//               Usuario
//             </label>
//             <TextInput
//               placeholder="Ej: usuario@empresa.com"
//               value={usuario}
//               onChange={(e) => setUsuario(e.target.value)}
//             />
//           </div>

//           {/* Contraseña */}
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700">
//               Contraseña
//             </label>
//             <TextInput
//               type="password"
//               placeholder="********"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />
//           </div>

//           <Button color="blue" onClick={handleGuardarCredencial}>
//             Guardar Credencial
//           </Button>
//         </div>
//       )}

//       {/* Botón de Cerrar */}
//       <div className="mt-4 flex justify-end">
//         <Button variant="secondary" onClick={onClose}>
//           Cerrar
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default EmpresaCredencialesModal;


import React, { useState, useEffect } from "react";
import {
  Select,
  SelectItem,
  Button,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  TextInput,
} from "@tremor/react";
import apiService from "@/app/api/apiService";
import { showErrorAlert, showSuccessAlert } from "@/utils/alerts";
import usePasswordReveal from "@/hooks/usePasswordReveal";

const EmpresaCredencialesModal = ({ onClose }) => {
  const [empresas, setEmpresas] = useState([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState("");
  const [credenciales, setCredenciales] = useState([]);
  const [entidades, setEntidades] = useState([]);
  const [entidad, setEntidad] = useState("");
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const { passwords, loading, countdown, revealPassword } = usePasswordReveal(10);

  useEffect(() => {
    cargarEmpresas();
    cargarEntidades();
  }, []);

  const cargarEmpresas = async () => {
    try {
      const response = await apiService.get("/empresas", { params: { limit: 1000 } });
      setEmpresas(response.data.data);
    } catch (error) {
      showErrorAlert("Error al cargar empresas", error.message);
    }
  };

  const cargarEntidades = async () => {
    try {
      const response = await apiService.get("/enum/entidades-autorizadas");
      const entidadesArray = Object.entries(response.data).map(([_, value]) => ({
        value,
        label: value,
      }));
      setEntidades(entidadesArray);
    } catch (error) {
      showErrorAlert("Error al cargar entidades", error.message);
    }
  };

  const cargarCredenciales = async (empresaRut) => {
    try {
      const response = await apiService.get(`/empresa-credenciales/empresa/${empresaRut}`);
      setCredenciales(response.data);
    } catch (error) {
      showErrorAlert("Error al cargar credenciales", error.message);
    }
  };

  const handleEmpresaChange = (empresaRut) => {
    setEmpresaSeleccionada(empresaRut);
    setCredenciales([]);
    setEntidad("");
    setUsuario("");
    setPassword("");
    setMostrarFormulario(false);
    cargarCredenciales(empresaRut);
  };

  const handleGuardarCredencial = async () => {
    if (!empresaSeleccionada || !entidad || !usuario || !password) {
      showErrorAlert("Todos los campos son obligatorios.");
      return;
    }

    const payload = { empresaRut: empresaSeleccionada, entidad, usuario, password };

    try {
      setIsSaving(true);
      await apiService.post("/empresa-credenciales", payload);
      showSuccessAlert("Credencial guardada correctamente.");
      setEntidad("");
      setUsuario("");
      setPassword("");
      setMostrarFormulario(false);
      cargarCredenciales(empresaSeleccionada);
    } catch (error) {
      showErrorAlert("Error al guardar la credencial", error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEliminarCredencial = async (id) => {
    try {
      setIsDeletingId(id);
      await apiService.delete(`/empresa-credenciales/${id}`);
      showSuccessAlert("Credencial eliminada correctamente.");
      cargarCredenciales(empresaSeleccionada);
    } catch (error) {
      showErrorAlert("Error al eliminar credencial", error.message);
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Gestión de Credenciales</h2>

      {/* Empresa */}
      <div>
        <p className="text-xs font-medium text-gray-600 mb-1">Seleccionar Empresa</p>
        <Select value={empresaSeleccionada} onValueChange={handleEmpresaChange}>
          <SelectItem value="">Seleccione una empresa</SelectItem>
          {empresas.map((empresa) => (
            <SelectItem key={empresa.empresaRut} value={empresa.empresaRut}>
              {empresa.nombre} ({empresa.empresaRut})
            </SelectItem>
          ))}
        </Select>
      </div>

      {/* Tabla de Credenciales */}
      {empresaSeleccionada && (
        <>
          <div>
            <h4 className="text-base font-bold text-gray-900 mb-2">Credenciales</h4>
            <Table className="min-w-full bg-white rounded-md border shadow-sm">
              <TableHead>
                <TableRow className="bg-gray-100 text-sm">
                  <TableHeaderCell>Entidad</TableHeaderCell>
                  <TableHeaderCell>Usuario</TableHeaderCell>
                  <TableHeaderCell>Contraseña</TableHeaderCell>
                  <TableHeaderCell>Acción</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {credenciales.length > 0 ? (
                  credenciales.map((credencial) => (
                    <TableRow key={credencial.id} className="hover:bg-gray-50">
                      <TableCell>{credencial.entidad}</TableCell>
                      <TableCell>{credencial.usuario}</TableCell>
                      <TableCell>{passwords[credencial.id] || "********"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="xs"
                            color="blue"
                            onClick={() => revealPassword(credencial.id)}
                            disabled={loading[credencial.id]}
                          >
                            {loading[credencial.id]
                              ? "Cargando..."
                              : countdown[credencial.id]
                              ? `Ocultar (${countdown[credencial.id]})`
                              : "Ver"}
                          </Button>
                          <Button
                            size="xs"
                            color="red"
                            disabled={isDeletingId === credencial.id}
                            onClick={() => handleEliminarCredencial(credencial.id)}
                          >
                            {isDeletingId === credencial.id ? "Eliminando..." : "Eliminar"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500 py-3">
                      No hay credenciales registradas.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Botón Agregar */}
          {!mostrarFormulario && (
            <div className="pt-2">
              <Button
                color="blue"
                onClick={() => setMostrarFormulario(true)}
              >
                Agregar Nueva Credencial
              </Button>
            </div>
          )}

          {/* Formulario expandible */}
          {mostrarFormulario && (
            <div className="grid gap-y-3">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Entidad</p>
                <Select value={entidad} onValueChange={setEntidad}>
                  <SelectItem value="">Seleccione una entidad</SelectItem>
                  {entidades.map((entidad) => (
                    <SelectItem key={entidad.value} value={entidad.value}>
                      {entidad.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Usuario</p>
                <TextInput
                  placeholder="Ej: usuario@empresa.com"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                />
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Contraseña</p>
                <TextInput
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-4 pt-2">
                <Button variant="secondary" onClick={() => setMostrarFormulario(false)}>
                  Cancelar
                </Button>
                <Button color="blue" onClick={handleGuardarCredencial} disabled={isSaving}>
                  {isSaving ? "Guardando..." : "Guardar Credencial"}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EmpresaCredencialesModal;

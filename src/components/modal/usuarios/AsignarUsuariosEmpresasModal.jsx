// import React, { useState, useEffect } from "react";
// import { Select, SelectItem, Button, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell } from "@tremor/react";
// import apiService from "@/app/api/apiService";
// import { showErrorAlert, showSuccessAlert } from "@/utils/alerts";

// const AsignarUsuariosEmpresasModal = ({ onClose }) => {
//   const [usuarios, setUsuarios] = useState([]);
//   const [empresas, setEmpresas] = useState([]);
//   const [usuarioSeleccionado, setUsuarioSeleccionado] = useState("");
//   const [empresasAsignadas, setEmpresasAsignadas] = useState([]);
//   const [empresasDisponibles, setEmpresasDisponibles] = useState([]);
//   const [empresaAAsignar, setEmpresaAAsignar] = useState("");

//   useEffect(() => {
//     cargarUsuarios();
//     cargarEmpresas();
//   }, []);

//   const cargarUsuarios = async () => {
//     try {
//       const response = await apiService.get("/usuarios/");
//       setUsuarios(response.data.data);
//     } catch (error) {
//       showErrorAlert("Error al cargar usuarios", error.message);
//     }
//   };

//   const cargarEmpresas = async () => {
//     try {
//       const response = await apiService.get("/empresas", { params: { limit: 1000 } });
//       setEmpresas(response.data.data);
//     } catch (error) {
//       showErrorAlert("Error al cargar empresas", error.message);
//     }
//   };

//   const cargarEmpresasAsignadas = async (usuarioId) => {
//     try {
//       const response = await apiService.get(`/usuarios-empresas`);
      
//       // Filtrar solo las relaciones del usuario seleccionado
//       const asignacionesUsuario = response.data.data.filter(rel => rel.usuarioId === usuarioId);

//       setEmpresasAsignadas(asignacionesUsuario);

//       // Empresas disponibles = todas menos las ya asignadas
//       const asignadasRut = asignacionesUsuario.map((e) => e.empresaRut);
//       setEmpresasDisponibles(empresas.filter(e => !asignadasRut.includes(e.empresaRut)));
//     } catch (error) {
//       showErrorAlert("Error al cargar empresas asignadas", error.message);
//     }
//   };

//   const handleUsuarioChange = (usuarioId) => {
//     setUsuarioSeleccionado(usuarioId);
//     cargarEmpresasAsignadas(usuarioId);
//   };

//   const handleAsignarEmpresa = async () => {
//     if (!usuarioSeleccionado || !empresaAAsignar) {
//       showErrorAlert("Debe seleccionar un usuario y una empresa.");
//       return;
//     }

//     try {
//       await apiService.post("/usuarios-empresas", {
//         usuarioId: usuarioSeleccionado,
//         empresaRut: empresaAAsignar,
//       });

//       showSuccessAlert("Empresa asignada correctamente.");
//       cargarEmpresasAsignadas(usuarioSeleccionado);
//     } catch (error) {
//       showErrorAlert("Error al asignar empresa", error.message);
//     }
//   };

//   const handleEliminarAsignacion = async (id) => {
//     try {
//       await apiService.delete(`/usuarios-empresas/${id}`);
//       showSuccessAlert("Asignación eliminada correctamente.");
//       cargarEmpresasAsignadas(usuarioSeleccionado);
//     } catch (error) {
//       showErrorAlert("Error al eliminar asignación", error.message);
//     }
//   };

//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-semibold text-gray-800 mb-4">Asignar Usuarios a Empresas</h2>

//       {/* Selección de Usuario */}
//       <div className="mb-4">
//         <label className="block text-sm font-medium text-gray-700">Seleccionar Usuario</label>
//         <Select value={usuarioSeleccionado} onValueChange={handleUsuarioChange}>
//           <SelectItem value="">Seleccione un usuario</SelectItem>
//           {usuarios.map((usuario) => (
//             <SelectItem key={usuario.id} value={usuario.id}>
//               {usuario.nombre} {usuario.apellido} - {usuario.email}
//             </SelectItem>
//           ))}
//         </Select>
//       </div>

//       {/* Empresas Asignadas */}
//       {usuarioSeleccionado && (
//         <div className="mb-6">
//           <h4 className="text-lg font-semibold text-gray-900 mb-3">Empresas Asignadas</h4>
//           <Table className="min-w-full bg-white rounded-lg shadow-sm">
//             <TableHead>
//               <TableRow className="bg-gray-200">
//                 <TableHeaderCell>RUT</TableHeaderCell>
//                 <TableHeaderCell>Nombre</TableHeaderCell>
//                 <TableHeaderCell>Acción</TableHeaderCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {empresasAsignadas.length > 0 ? (
//                 empresasAsignadas.map((asignacion) => (
//                   <TableRow key={asignacion.id} className="hover:bg-gray-50">
//                     <TableCell>{asignacion.empresaRut}</TableCell>
//                     <TableCell>{asignacion.nombreEmpresa}</TableCell>
//                     <TableCell>
//                       <Button color="red" onClick={() => handleEliminarAsignacion(asignacion.id)}>
//                         Eliminar
//                       </Button>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell colSpan="3" className="text-center text-gray-500 py-3">
//                     No hay empresas asignadas.
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </div>
//       )}

//       {/* Selección de Empresa para Asignar */}
//       {usuarioSeleccionado && (
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700">Asignar Empresa</label>
//           <Select value={empresaAAsignar} onValueChange={setEmpresaAAsignar}>
//             <SelectItem value="">Seleccione una empresa</SelectItem>
//             {empresasDisponibles.map((empresa) => (
//               <SelectItem key={empresa.empresaRut} value={empresa.empresaRut}>
//                 {empresa.nombre} ({empresa.empresaRut})
//               </SelectItem>
//             ))}
//           </Select>
//           <Button className="mt-2" color="blue" onClick={handleAsignarEmpresa} disabled={!empresaAAsignar}>
//             Asignar Empresa
//           </Button>
//         </div>
//       )}

//       {/* Botón de Cerrar */}
//       <div className="mt-4 flex justify-end space-x-4">
//         <Button variant="secondary" onClick={onClose}>Cerrar</Button>
//       </div>
//     </div>
//   );
// };

// export default AsignarUsuariosEmpresasModal;


// NUEVO:
// import React, { useState, useEffect } from "react";
// import {
//   Select,
//   SelectItem,
//   SearchSelect,
//   SearchSelectItem,
//   Button,
//   Table,
//   TableHead,
//   TableRow,
//   TableHeaderCell,
//   TableBody,
//   TableCell,
//   Card,
//   Grid,
//   Title,
//   Text,
//   Icon,
// } from "@tremor/react";
// import { 
//   TrashIcon, 
//   PlusCircleIcon 
// } from "@heroicons/react/24/outline";
// import apiService from "@/app/api/apiService";
// import { showErrorAlert, showSuccessAlert } from "@/utils/alerts";

// const AsignarUsuariosEmpresasModal = ({ onClose }) => {
//   // --- ESTADOS ---
//   const [usuarios, setUsuarios] = useState([]);
//   const [empresas, setEmpresas] = useState([]);
//   const [usuarioSeleccionado, setUsuarioSeleccionado] = useState("");
//   const [empresasAsignadas, setEmpresasAsignadas] = useState([]);
//   const [empresasDisponibles, setEmpresasDisponibles] = useState([]);
  
//   // Estado para el formulario de asignación
//   const [empresaAAsignar, setEmpresaAAsignar] = useState("");

//   // Estados para controlar la carga y acciones
//   const [isLoading, setIsLoading] = useState(false);
//   const [isDeletingId, setIsDeletingId] = useState(null);

//   // --- EFECTOS ---
//   useEffect(() => {
//     cargarUsuarios();
//     cargarEmpresas();
//   }, []);

//   // --- FUNCIONES API ---
//   const cargarUsuarios = async () => {
//     try {
//       const response = await apiService.get("/usuarios/");
//       setUsuarios(response.data.data);
//     } catch (error) {
//       showErrorAlert("Error al cargar usuarios", error.message);
//     }
//   };

//   const cargarEmpresas = async () => {
//     try {
//       // Usamos un límite alto para asegurar que traemos todas las empresas
//       const response = await apiService.get("/empresas", { params: { limit: 1000 } });
//       setEmpresas(response.data.data);
//     } catch (error) {
//       showErrorAlert("Error al cargar empresas", error.message);
//     }
//   };

//   const cargarEmpresasAsignadas = async (usuarioId) => {
//     try {
//       const response = await apiService.get(`/usuarios-empresas`);
//       // Filtramos en el cliente solo las relaciones del usuario seleccionado
//       const asignacionesUsuario = response.data.data.filter(rel => rel.usuarioId === usuarioId);
      
//       setEmpresasAsignadas(asignacionesUsuario);

//       // Calculamos las empresas disponibles (todas menos las ya asignadas a este usuario)
//       const rutsAsignados = asignacionesUsuario.map((e) => e.empresaRut);
//       setEmpresasDisponibles(empresas.filter(e => !rutsAsignados.includes(e.empresaRut)));
//     } catch (error) {
//       showErrorAlert("Error al cargar empresas asignadas", error.message);
//     }
//   };

//   // --- MANEJADORES DE EVENTOS ---
//   const handleUsuarioChange = (usuarioId) => {
//     setUsuarioSeleccionado(usuarioId);
//     setEmpresasAsignadas([]);
//     setEmpresasDisponibles([]);
//     setEmpresaAAsignar("");
//     if (usuarioId) {
//       // Al cambiar de usuario, cargamos sus empresas y actualizamos la lista de disponibles
//       cargarEmpresasAsignadas(usuarioId);
//     }
//   };

//   const handleAsignarEmpresa = async () => {
//     if (!usuarioSeleccionado || !empresaAAsignar) {
//       showErrorAlert("Debe seleccionar un trabajador y una empresa.");
//       return;
//     }

//     try {
//       setIsLoading(true);
//       await apiService.post("/usuarios-empresas", {
//         usuarioId: usuarioSeleccionado,
//         empresaRut: empresaAAsignar,
//       });
//       showSuccessAlert("Empresa asignada correctamente.");
//       setEmpresaAAsignar(""); // Limpiamos el selector
//       cargarEmpresasAsignadas(usuarioSeleccionado); // Recargamos la lista
//     } catch (error) {
//       showErrorAlert("Error al asignar empresa", error.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleEliminarAsignacion = async (id) => {
//     try {
//       setIsDeletingId(id);
//       await apiService.delete(`/usuarios-empresas/${id}`);
//       showSuccessAlert("Asignación eliminada correctamente.");
//       cargarEmpresasAsignadas(usuarioSeleccionado);
//     } catch (error) {
//       showErrorAlert("Error al eliminar asignación", error.message);
//     } finally {
//       setIsDeletingId(null);
//     }
//   };

//   // --- RENDERIZACIÓN ---
//   return (
//     <div className="p-4 md:p-6 bg-gray-50 min-h-full">
//       <Title className="mb-4">Asignar Empresas a Trabajadores</Title>
      
//       <Card>
//         <Text className="font-medium">Seleccionar Trabajador</Text>
//         <SearchSelect
//           value={usuarioSeleccionado}
//           onValueChange={handleUsuarioChange}
//           placeholder="Buscar trabajador por nombre o email..."
//           className="mt-2"
//         >
//           {usuarios.map((usuario) => (
//             <SearchSelectItem key={usuario.id} value={usuario.id}>
//               {usuario.nombre} {usuario.apellido} ({usuario.email})
//             </SearchSelectItem>
//           ))}
//         </SearchSelect>
//       </Card>

//       {usuarioSeleccionado && (
//         <Grid numItemsLg={5} className="gap-6 mt-6">
//           {/* Columna de la tabla */}
//           <div className="lg:col-span-3">
//             <Card>
//               <Title>Empresas Asignadas</Title>
//               <Table className="mt-4">
//                 <TableHead>
//                   <TableRow>
//                     <TableHeaderCell>Nombre de la Empresa</TableHeaderCell>
//                     <TableHeaderCell>RUT</TableHeaderCell>
//                     <TableHeaderCell className="text-right">Acciones</TableHeaderCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {empresasAsignadas.length > 0 ? (
//                     empresasAsignadas.map((asignacion) => (
//                       <TableRow key={asignacion.id}>
//                         <TableCell>{asignacion.nombreEmpresa}</TableCell>
//                         <TableCell>{asignacion.empresaRut}</TableCell>
//                         <TableCell className="text-right">
//                           <Button
//                             size="xs"
//                             variant="light"
//                             color="red"
//                             icon={TrashIcon}
//                             onClick={() => handleEliminarAsignacion(asignacion.id)}
//                             loading={isDeletingId === asignacion.id}
//                             tooltip="Eliminar asignación"
//                           />
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   ) : (
//                     <TableRow>
//                       <TableCell colSpan="3" className="text-center text-gray-500 py-4">
//                         No hay empresas asignadas para este trabajador.
//                       </TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//             </Card>
//           </div>

//           {/* Columna del formulario de asignación */}
//           <div className="lg:col-span-2">
//             <Card>
//               <Title>Asignar Nueva Empresa</Title>
//               <div className="space-y-4 mt-4">
//                 <div>
//                   <Text className="font-medium">Empresa</Text>
//                   <SearchSelect 
//                     value={empresaAAsignar} 
//                     onValueChange={setEmpresaAAsignar} 
//                     className="mt-2"
//                     placeholder="Buscar empresa por nombre o RUT..."
//                   >
//                     {empresasDisponibles.map((empresa) => (
//                       <SearchSelectItem key={empresa.empresaRut} value={empresa.empresaRut}>
//                         {empresa.nombre} ({empresa.empresaRut})
//                       </SearchSelectItem>
//                     ))}
//                   </SearchSelect>
//                 </div>
//               </div>
//               <Button
//                 icon={PlusCircleIcon}
//                 className="mt-6 w-full"
//                 onClick={handleAsignarEmpresa}
//                 disabled={!empresaAAsignar || isLoading}
//                 loading={isLoading}
//               >
//                 Asignar Empresa
//               </Button>
//             </Card>
//           </div>
//         </Grid>
//       )}

//       {/* Botón de cierre */}
//       <div className="pt-6 flex justify-end">
//         <Button variant="secondary" onClick={onClose}>Cerrar</Button>
//       </div>
//     </div>
//   );
// };

// AsignarUsuariosEmpresasModal.modalSize = "max-w-7xl";

// export default AsignarUsuariosEmpresasModal;

// REVISAR:

import React, { useState, useEffect } from "react";
import {
  Select,
  SelectItem,
  SearchSelect,
  SearchSelectItem,
  Button,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Card,
  Grid,
  Title,
  Text,
  Icon,
} from "@tremor/react";
import { 
  TrashIcon, 
  PlusCircleIcon 
} from "@heroicons/react/24/outline";
import apiService from "@/app/api/apiService";
import { showErrorAlert, showSuccessAlert } from "@/utils/alerts";

const AsignarUsuariosEmpresasModal = ({ onClose }) => {
  // --- ESTADOS ---
  const [usuarios, setUsuarios] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState("");
  const [empresasAsignadas, setEmpresasAsignadas] = useState([]);
  const [empresasDisponibles, setEmpresasDisponibles] = useState([]);
  
  const [empresaAAsignar, setEmpresaAAsignar] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);

  // --- EFECTOS ---
  useEffect(() => {
    cargarUsuarios();
    cargarEmpresas();
  }, []);

  // --- FUNCIONES API ---
  const cargarUsuarios = async () => {
    try {
      const response = await apiService.get("/usuarios/");
      setUsuarios(response.data.data);
    } catch (error) {
      showErrorAlert("Error al cargar usuarios", error.message);
    }
  };

  const cargarEmpresas = async () => {
    try {
      const response = await apiService.get("/empresas", { params: { limit: 1000 } });
      setEmpresas(response.data.data);
    } catch (error) {
      showErrorAlert("Error al cargar empresas", error.message);
    }
  };

  // const cargarEmpresasAsignadas = async (usuarioId) => {
  //   try {
  //     const response = await apiService.get(`/usuarios-empresas`);
  //     const asignacionesDelUsuario = response.data.data.filter(rel => rel.usuarioId === usuarioId);
      
  //     const empresasMapeadas = asignacionesDelUsuario.map(asignacion => ({
  //       id: asignacion.id,
  //       empresaRut: asignacion.empresaRut,
  //       nombreEmpresa: (asignacion.empresas && asignacion.empresas.nombre) 
  //                      ? asignacion.empresas.nombre 
  //                      : asignacion.nombreEmpresa || 'Nombre no disponible',
  //     }));

  //     setEmpresasAsignadas(empresasMapeadas);

  //     const rutsAsignados = empresasMapeadas.map((e) => e.empresaRut);
  //     setEmpresasDisponibles(empresas.filter(e => !rutsAsignados.includes(e.empresaRut)));
  //   } catch (error) {
  //     showErrorAlert("Error al cargar empresas asignadas", error.message);
  //   }
  // };


  const cargarEmpresasAsignadas = async (usuarioId) => {
  try {
    const response = await apiService.get(`/usuarios-empresas/usuario/${usuarioId}`);
    const empresasMapeadas = response.data.data.map(asignacion => ({
      id: asignacion.id,
      empresaRut: asignacion.empresaRut,
      nombreEmpresa: asignacion.empresas?.nombre || "Nombre no disponible",
    }));

    setEmpresasAsignadas(empresasMapeadas);

    const rutsAsignados = empresasMapeadas.map((e) => e.empresaRut);
    setEmpresasDisponibles(empresas.filter(e => !rutsAsignados.includes(e.empresaRut)));
  } catch (error) {
    showErrorAlert("Error al cargar empresas asignadas", error.message);
  }
};

  // --- MANEJADORES DE EVENTOS ---
  const handleUsuarioChange = (usuarioId) => {
    setUsuarioSeleccionado(usuarioId);
    setEmpresasAsignadas([]);
    setEmpresasDisponibles([]);
    setEmpresaAAsignar("");
    if (usuarioId) {
      cargarEmpresasAsignadas(usuarioId);
    }
  };

  const handleAsignarEmpresa = async () => {
    if (!usuarioSeleccionado || !empresaAAsignar) {
      showErrorAlert("Debe seleccionar un trabajador y una empresa.");
      return;
    }

    try {
      setIsLoading(true);
      await apiService.post("/usuarios-empresas", {
        usuarioId: usuarioSeleccionado,
        empresaRut: empresaAAsignar,
      });
      showSuccessAlert("Empresa asignada correctamente.");
      setEmpresaAAsignar("");
      cargarEmpresasAsignadas(usuarioSeleccionado);
    } catch (error) {
      showErrorAlert("Error al asignar empresa", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEliminarAsignacion = async (id) => {
    try {
      setIsDeletingId(id);
      await apiService.delete(`/usuarios-empresas/${id}`);
      showSuccessAlert("Asignación eliminada correctamente.");
      cargarEmpresasAsignadas(usuarioSeleccionado);
    } catch (error) {
      showErrorAlert("Error al eliminar asignación", error.message);
    } finally {
      setIsDeletingId(null);
    }
  };

  // --- RENDERIZACIÓN ---
  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full">
      <Title className="mb-4">Asignar Empresas a Trabajadores</Title>
      
      <Card>
        <Text className="font-medium">Seleccionar Trabajador</Text>
        <SearchSelect
          value={usuarioSeleccionado}
          onValueChange={handleUsuarioChange}
          placeholder="Buscar trabajador por nombre o email..."
          className="mt-2"
        >
          {usuarios.map((usuario) => (
            <SearchSelectItem key={usuario.id} value={usuario.id}>
              {usuario.nombre} {usuario.apellido} ({usuario.email})
            </SearchSelectItem>
          ))}
        </SearchSelect>
      </Card>

      {usuarioSeleccionado && (
        <Grid numItemsLg={5} className="gap-6 mt-6">
          <div className="lg:col-span-3">
            <Card>
              <Title>Empresas Asignadas</Title>
              <Table className="mt-4">
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Nombre de la Empresa</TableHeaderCell>
                    <TableHeaderCell>RUT</TableHeaderCell>
                    <TableHeaderCell className="text-right">Acciones</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {empresasAsignadas.length > 0 ? (
                    empresasAsignadas.map((asignacion) => (
                      <TableRow key={asignacion.id}>
                        <TableCell>{asignacion.nombreEmpresa}</TableCell>
                        <TableCell>{asignacion.empresaRut}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="xs"
                            variant="light"
                            color="red"
                            icon={TrashIcon}
                            onClick={() => handleEliminarAsignacion(asignacion.id)}
                            loading={isDeletingId === asignacion.id}
                            tooltip="Eliminar asignación"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan="3" className="text-center text-gray-500 py-4">
                        No hay empresas asignadas para este trabajador.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <Title>Asignar Nueva Empresa</Title>
              <div className="space-y-4 mt-4">
                <div>
                  <Text className="font-medium">Empresa</Text>
                  <SearchSelect 
                    value={empresaAAsignar} 
                    onValueChange={setEmpresaAAsignar} 
                    className="mt-2"
                    placeholder="Buscar empresa por nombre o RUT..."
                  >
                    {empresasDisponibles.map((empresa) => (
                      <SearchSelectItem key={empresa.empresaRut} value={empresa.empresaRut}>
                        {empresa.nombre} ({empresa.empresaRut})
                      </SearchSelectItem>
                    ))}
                  </SearchSelect>
                </div>
              </div>
              <Button
                icon={PlusCircleIcon}
                className="mt-6 w-full"
                onClick={handleAsignarEmpresa}
                disabled={!empresaAAsignar || isLoading}
                loading={isLoading}
              >
                Asignar Empresa
              </Button>
            </Card>
          </div>
        </Grid>
      )}

      <div className="pt-6 flex justify-end">
        <Button variant="secondary" onClick={onClose}>Cerrar</Button>
      </div>
    </div>
  );
};

AsignarUsuariosEmpresasModal.modalSize = "max-w-7xl";

export default AsignarUsuariosEmpresasModal;

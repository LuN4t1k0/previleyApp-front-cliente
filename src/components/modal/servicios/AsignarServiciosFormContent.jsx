
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
  TextInput,
  Card,
  Grid,
  Title,
  Text,
  Icon,
} from "@tremor/react";
import { 
  PencilSquareIcon, 
  TrashIcon, 
  PlusCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import apiService from "@/app/api/apiService";
import { showErrorAlert, showSuccessAlert } from "@/utils/alerts";

const AsignarServiciosEmpresasModal = ({ onClose }) => {
  // --- ESTADOS ---
  const [empresas, setEmpresas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState("");
  const [serviciosAsignados, setServiciosAsignados] = useState([]);
  const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
  
  // Estados para el formulario de asignación
  const [servicioAAsignar, setServicioAAsignar] = useState("");
  const [porcentajeCobro, setPorcentajeCobro] = useState("");
  
  // Estados para controlar la carga y acciones
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);

  // --- NUEVOS ESTADOS PARA EDICIÓN ---
  const [editingId, setEditingId] = useState(null); // Guarda el 'relacionId' de la fila en edición
  const [porcentajeEditado, setPorcentajeEditado] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // --- EFECTOS ---
  useEffect(() => {
    cargarEmpresas();
    cargarServicios();
  }, []);

  // --- FUNCIONES API ---
  const cargarEmpresas = async () => {
    try {
      const response = await apiService.get("/empresas", { params: { limit: 1000 } });
      setEmpresas(response.data.data);
    } catch (error) {
      showErrorAlert("Error al cargar empresas", error.message);
    }
  };

  const cargarServicios = async () => {
    try {
      const response = await apiService.get("/servicios");
      setServicios(response.data.data);
    } catch (error) {
      showErrorAlert("Error al cargar servicios", error.message);
    }
  };

  const cargarServiciosAsignados = async (empresaRut) => {
    try {
      const response = await apiService.get(`/empresas/${empresaRut}/servicios`);
      const asignadosIds = response.data.data.map((s) => s.id);
      setServiciosAsignados(response.data.data);
      setServiciosDisponibles(servicios.filter((s) => !asignadosIds.includes(s.id)));
    } catch (error) {
      showErrorAlert("Error al cargar servicios asignados", error.message);
    }
  };

  // --- MANEJADORES DE EVENTOS ---
  const handleEmpresaChange = (empresaRut) => {
    setEmpresaSeleccionada(empresaRut);
    setServiciosAsignados([]);
    setServiciosDisponibles([]);
    setServicioAAsignar("");
    setPorcentajeCobro("");
    setEditingId(null); // Resetear modo edición si se cambia de empresa
    if (empresaRut) {
      cargarServiciosAsignados(empresaRut);
    }
  };

  const handleAsignarServicio = async () => {
    if (!empresaSeleccionada || !servicioAAsignar || !porcentajeCobro) {
      showErrorAlert("Debe seleccionar una empresa, un servicio y un porcentaje de cobro.");
      return;
    }

    try {
      setIsLoading(true);
      await apiService.post("/servicios-empresas", {
        empresaRut: empresaSeleccionada,
        servicioId: servicioAAsignar,
        porcentajeCobro: parseFloat(porcentajeCobro),
      });
      showSuccessAlert("Servicio asignado correctamente.");
      setServicioAAsignar("");
      setPorcentajeCobro("");
      cargarServiciosAsignados(empresaSeleccionada);
    } catch (error) {
      showErrorAlert("Error al asignar servicio", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEliminarAsignacion = async (relacionId) => {
    try {
      setIsDeletingId(relacionId);
      await apiService.delete(`/servicios-empresas/${relacionId}`);
      showSuccessAlert("Asignación eliminada correctamente.");
      cargarServiciosAsignados(empresaSeleccionada);
    } catch (error) {
      showErrorAlert("Error al eliminar asignación", error.message);
    } finally {
      setIsDeletingId(null);
    }
  };

  // --- NUEVAS FUNCIONES PARA EDICIÓN ---
  const handleEditar = (servicio) => {
    setEditingId(servicio.relacionId);
    setPorcentajeEditado(String(servicio.porcentajeCobro)); // Convertir a string para el input
  };

  const handleCancelarEdicion = () => {
    setEditingId(null);
    setPorcentajeEditado("");
  };

  const handleGuardarEdicion = async (relacionId) => {
    if (!porcentajeEditado) {
      showErrorAlert("El porcentaje no puede estar vacío.");
      return;
    }
    try {
      setIsSaving(true);
      // Usamos PATCH como confirmaste que existe el endpoint
      await apiService.patch(`/servicios-empresas/${relacionId}`, {
        porcentajeCobro: parseFloat(porcentajeEditado),
      });
      showSuccessAlert("Porcentaje actualizado correctamente.");
      setEditingId(null);
      cargarServiciosAsignados(empresaSeleccionada);
    } catch (error) {
      showErrorAlert("Error al actualizar", error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // --- RENDERIZACIÓN ---
  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full">
      <Title className="mb-4">Asignar Servicios a Empresas</Title>
      
      <Card>
        <Text className="font-medium">Seleccionar Empresa</Text>
        <SearchSelect
          value={empresaSeleccionada}
          onValueChange={handleEmpresaChange}
          placeholder="Buscar empresa por nombre o RUT..."
          className="mt-2"
        >
          {empresas.map((empresa) => (
            <SearchSelectItem key={empresa.empresaRut} value={empresa.empresaRut}>
              {empresa.nombre} ({empresa.empresaRut})
            </SearchSelectItem>
          ))}
        </SearchSelect>
      </Card>

      {empresaSeleccionada && (
        <Grid numItemsLg={5} className="gap-6 mt-6">
          {/* Columna de la tabla */}
          <div className="lg:col-span-3">
            <Card>
              <Title>Servicios Asignados</Title>
              <Table className="mt-4">
                <TableHead>
                  <TableRow>
                    {/* <TableHeaderCell>ID</TableHeaderCell> */}
                    <TableHeaderCell>Nombre del Servicio</TableHeaderCell>
                    <TableHeaderCell>Porcentaje</TableHeaderCell>
                    <TableHeaderCell className="text-right">Acciones</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {serviciosAsignados.length > 0 ? (
                    serviciosAsignados.map((servicio) => (
                      <TableRow key={servicio.relacionId}>
                        {/* <TableCell>{servicio.id}</TableCell> */}
                        <TableCell>{servicio.nombre}</TableCell>
                        <TableCell>
                          {editingId === servicio.relacionId ? (
                            <TextInput
                              type="number"
                              value={porcentajeEditado}
                              onChange={(e) => setPorcentajeEditado(e.target.value)}
                              className="w-24"
                              autoFocus
                            />
                          ) : (
                            `${servicio.porcentajeCobro}%`
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {editingId === servicio.relacionId ? (
                            <div className="flex gap-2 justify-end">
                              <Button 
                                size="xs" 
                                color="green" 
                                icon={CheckCircleIcon}
                                onClick={() => handleGuardarEdicion(servicio.relacionId)}
                                loading={isSaving}
                              >
                                Guardar
                              </Button>
                              <Button 
                                size="xs" 
                                variant="secondary" 
                                icon={XCircleIcon}
                                onClick={handleCancelarEdicion}
                              >
                                Cancelar
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-2 justify-end">
                                <Button 
                                  size="xs" 
                                  variant="light" 
                                  color="blue"
                                  icon={PencilSquareIcon}
                                  onClick={() => handleEditar(servicio)}
                                />
                                <Button
                                  size="xs"
                                  variant="light"
                                  color="red"
                                  icon={TrashIcon}
                                  onClick={() => handleEliminarAsignacion(servicio.relacionId)}
                                  loading={isDeletingId === servicio.relacionId}
                                />
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan="4" className="text-center text-gray-500 py-4">
                        No hay servicios asignados para esta empresa.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>

          {/* Columna del formulario de asignación */}
          <div className="lg:col-span-2">
            <Card>
              <Title>Añadir Nuevo Servicio</Title>
              <div className="space-y-4 mt-4">
                <div>
                  <Text className="font-medium">Servicio</Text>
                  <Select value={servicioAAsignar} onValueChange={setServicioAAsignar} className="mt-2">
                    <SelectItem value="">Seleccione un servicio</SelectItem>
                    {serviciosDisponibles.map((servicio) => (
                      <SelectItem key={servicio.id} value={servicio.id}>
                        {servicio.nombre}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                {servicioAAsignar && (
                  <div>
                    <Text className="font-medium">Porcentaje de Cobro (%)</Text>
                    <TextInput
                      type="number"
                      value={porcentajeCobro}
                      onChange={(e) => setPorcentajeCobro(e.target.value)}
                      placeholder="Ej: 3.5"
                      className="mt-2"
                    />
                  </div>
                )}
              </div>
              <Button
                icon={PlusCircleIcon}
                className="mt-6 w-full"
                onClick={handleAsignarServicio}
                disabled={!servicioAAsignar || !porcentajeCobro || isLoading}
                loading={isLoading}
              >
                Asignar Servicio
              </Button>
            </Card>
          </div>
        </Grid>
      )}

      {/* Botón de cierre */}
      <div className="pt-6 flex justify-end">
        <Button variant="secondary" onClick={onClose}>Cerrar</Button>
      </div>
    </div>
  );
};

AsignarServiciosEmpresasModal.modalSize = "max-w-7xl"; // O el tamaño que prefieras

export default AsignarServiciosEmpresasModal;
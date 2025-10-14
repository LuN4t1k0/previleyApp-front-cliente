
import React from "react";
import {
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Button,
  Title,
  Text,
  Divider,
  Badge,
  Grid,
} from "@tremor/react";
import {
  RiCloseFill,
  RiInformationLine,
  RiLockLine,
  RiServerLine,
  RiUser3Line,
  RiArticleLine,
  RiMailAddLine,
  RiMailLine
} from "@remixicon/react";

import { formatDateChile } from "@/utils/formatDate";
import usePasswordReveal from "@/hooks/usePasswordReveal";

const EmpresaDetailsContent = ({ empresaData, onClose }) => {
  const { passwords, loading, countdown, revealPassword } = usePasswordReveal();

  if (!empresaData)
    return <Text className="p-6">No hay datos para mostrar.</Text>;

  const estadoColor = empresaData.estado === "activo" ? "green" : "red";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <Grid className="grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Title className="text-lg font-bold">
              Detalle de Empresa - {empresaData.nombre}
            </Title>
            <Text className="text-sm text-gray-600">
              RUT: {empresaData.empresaRut}
            </Text>
            <Text className="text-sm text-gray-600">
              Fecha Creación: {formatDateChile(empresaData.createdAt).formattedDate}
            </Text>
          </div>
          <div className="text-right">
            <Button color="red" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </Grid>
      </div>

      {/* Tabs */}
      <TabGroup>
        <TabList className="mb-4">
          <Tab icon={RiInformationLine}>Info General</Tab>
          <Tab icon={RiArticleLine}>Documentos</Tab>
          <Tab icon={RiLockLine}>Credenciales</Tab>
          <Tab icon={RiServerLine}>Servicios</Tab>
          <Tab icon={RiUser3Line}>Usuarios</Tab>
          <Tab icon={RiMailLine}>Correos</Tab>
        </TabList>
        <TabPanels>
          {/* Info General */}
          <TabPanel>
            <div className="overflow-y-auto max-h-[70vh] pr-1 space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <Title className="text-lg font-bold">Datos de la Empresa</Title>
                <Divider className="my-2" />
                <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8 text-sm pt-2">
                  <div>
                    <Text className="uppercase font-bold text-gray-700">RUT</Text>
                    <Text>{empresaData.empresaRut}</Text>
                  </div>
                  <div>
                    <Text className="uppercase font-bold text-gray-700">Nombre</Text>
                    <Text>{empresaData.nombre}</Text>
                  </div>
                  <div>
                    <Text className="uppercase font-bold text-gray-700">Estado</Text>
                    <Badge color={estadoColor} className="capitalize">
                      {empresaData.estado}
                    </Badge>
                  </div>
                  <div>
                    <Text className="uppercase font-bold text-gray-700">Dirección</Text>
                    <Text>{empresaData.direccion}</Text>
                  </div>
                  <div>
                    <Text className="uppercase font-bold text-gray-700">Fecha Creación</Text>
                    <Text>{formatDateChile(empresaData.createdAt).formattedDate}</Text>
                  </div>
                </Grid>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <Title className="text-lg font-bold">Información de Contacto y Banco</Title>
                <Divider className="my-2" />
                <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8 text-sm pt-2">
                  <div>
                    <Text className="uppercase font-bold text-gray-700">Teléfono</Text>
                    <Text>{empresaData.telefono}</Text>
                  </div>
                  <div>
                    <Text className="uppercase font-bold text-gray-700">Email</Text>
                    <Text>{empresaData.email}</Text>
                  </div>
                  {empresaData.banco && (
                    <div>
                      <Text className="uppercase font-bold text-gray-700">Banco</Text>
                      <Text>{empresaData.banco}</Text>
                    </div>
                  )}
                  {empresaData.cuentaCorriente && (
                    <div>
                      <Text className="uppercase font-bold text-gray-700">Cuenta Corriente</Text>
                      <Text>{empresaData.cuentaCorriente}</Text>
                    </div>
                  )}
                </Grid>
              </div>
            </div>
          </TabPanel>

          {/* Documentos */}
          <TabPanel>
            <div className="overflow-y-auto max-h-[70vh] pr-1">
              <div className="bg-gray-50 p-4 rounded-lg">
                <Title className="text-lg font-bold">Documentos</Title>
                <Text className="text-sm text-gray-600">
                  Lista de documentos registrados para {empresaData.nombre}
                </Text>
                <Table className="mt-4">
                  <TableHead>
                    <TableRow className="bg-gray-100">
                      <TableHeaderCell>ID</TableHeaderCell>
                      <TableHeaderCell>Tipo</TableHeaderCell>
                      <TableHeaderCell>Fecha Vencimiento</TableHeaderCell>
                      <TableHeaderCell>Acciones</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {empresaData.documentos?.length > 0 ? (
                      empresaData.documentos.map((doc) => {
                        const { formattedDate, isExpired } = formatDateChile(doc.fecha_vencimiento);
                        return (
                          <TableRow key={doc.id} className="hover:bg-gray-50">
                            <TableCell>{doc.id}</TableCell>
                            <TableCell>{doc.tipo}</TableCell>
                            <TableCell className={isExpired ? "text-red-500 font-bold" : ""}>
                              {formattedDate} {isExpired && "(Vencido)"}
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="primary" onClick={() => window.open(doc.url_firmada, "_blank")}>
                                Ver
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan="4" className="text-center">
                          No hay documentos asociados.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabPanel>

          {/* Credenciales */}
          <TabPanel>
            <div className="overflow-y-auto max-h-[70vh] pr-1">
              <div className="bg-gray-50 p-4 rounded-lg">
                <Title className="text-lg font-bold">Credenciales</Title>
                <Text className="text-sm text-gray-600">
                  Gestiona las credenciales asociadas a la empresa.
                </Text>
                <Table className="mt-4">
                  <TableHead>
                    <TableRow className="bg-gray-100">
                      <TableHeaderCell>Entidad</TableHeaderCell>
                      <TableHeaderCell>Usuario</TableHeaderCell>
                      <TableHeaderCell>Contraseña</TableHeaderCell>
                      <TableHeaderCell>Acciones</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {empresaData.credenciales?.length > 0 ? (
                      empresaData.credenciales.map((cred) => (
                        <TableRow key={cred.id} className="hover:bg-gray-50">
                          <TableCell>{cred.entidad}</TableCell>
                          <TableCell>{cred.usuario}</TableCell>
                          <TableCell>{passwords[cred.id] || "******"}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => revealPassword(cred.id)}
                              disabled={loading[cred.id] || countdown[cred.id] > 0}
                            >
                              {loading[cred.id]
                                ? "Cargando..."
                                : countdown[cred.id] > 0
                                ? `Ocultar en ${countdown[cred.id]}s`
                                : "Mostrar"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan="4" className="text-center">
                          No hay credenciales registradas.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabPanel>

          {/* Servicios */}
          <TabPanel>
            <div className="overflow-y-auto max-h-[70vh] pr-1">
              <div className="bg-gray-50 p-4 rounded-lg">
                <Title className="text-lg font-bold">Servicios</Title>
                <Text className="text-sm text-gray-600">
                  Detalles de los servicios asociados a {empresaData.nombre}.
                </Text>
                <Table className="mt-4">
                  <TableHead>
                    <TableRow className="bg-gray-100">
                      <TableHeaderCell>ID</TableHeaderCell>
                      <TableHeaderCell>Nombre</TableHeaderCell>
                      <TableHeaderCell>Porcentaje</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {empresaData.servicios?.length > 0 ? (
                      empresaData.servicios.map((servicio) => (
                        <TableRow key={servicio.id} className="hover:bg-gray-50">
                          <TableCell>{servicio.id}</TableCell>
                          <TableCell>{servicio.nombre}</TableCell>
                          <TableCell>
                            {servicio.ServiciosEmpresas?.porcentajeCobro
                              ? `${servicio.ServiciosEmpresas.porcentajeCobro}%`
                              : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan="3" className="text-center">
                          No hay servicios asociados.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabPanel>

          {/* Usuarios */}
          <TabPanel>
            <div className="overflow-y-auto max-h-[70vh] pr-1">
              <div className="bg-gray-50 p-4 rounded-lg">
                <Title className="text-lg font-bold">Usuarios Asignados</Title>
                <Text className="text-sm text-gray-600">
                  Lista de usuarios asignados a la empresa.
                </Text>
                <Table className="mt-4">
                  <TableHead>
                    <TableRow className="bg-gray-100">
                      <TableHeaderCell>ID</TableHeaderCell>
                      <TableHeaderCell>Nombre</TableHeaderCell>
                      <TableHeaderCell>Email</TableHeaderCell>
                      <TableHeaderCell>Rol</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {empresaData.usuarios?.length > 0 ? (
                      empresaData.usuarios.map((usuario) => (
                        <TableRow key={usuario.id} className="hover:bg-gray-50">
                          <TableCell>{usuario.id}</TableCell>
                          <TableCell>{usuario.nombre}</TableCell>
                          <TableCell>{usuario.email}</TableCell>
                          <TableCell>{usuario.rol}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan="4" className="text-center">
                          No hay usuarios asignados.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabPanel>


          {/* Correos */}
<TabPanel>
  <div className="overflow-y-auto max-h-[70vh] pr-1">
    <div className="bg-gray-50 p-4 rounded-lg">
      <Title className="text-lg font-bold">Correos Configurados</Title>
      <Text className="text-sm text-gray-600">
        Lista de correos asociados a la empresa.
      </Text>
      <Table className="mt-4">
        <TableHead>
          <TableRow className="bg-gray-100">
            <TableHeaderCell>Tipo</TableHeaderCell>
            <TableHeaderCell>Email</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {empresaData.correosConfigurados?.length > 0 ? (
            empresaData.correosConfigurados.map((correo, index) => (
              <TableRow key={index} className="hover:bg-gray-50">
                <TableCell>{correo.tipo}</TableCell>
                <TableCell>{correo.email}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan="2" className="text-center">
                No hay correos configurados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  </div>
</TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
};

EmpresaDetailsContent.modalSize = "max-w-4xl";
export default EmpresaDetailsContent;

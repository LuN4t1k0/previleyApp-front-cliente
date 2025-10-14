'use client'
import React, { useState, useEffect } from "react";
import apiService from "@/app/api/apiService";

const ProduccionTest = () => {
  // Estado para almacenar la lista de producciones
  const [producciones, setProducciones] = useState([]);
  // Estados para el loading y errores
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Estado para el formulario (usado tanto para creación como para edición)
  const [formData, setFormData] = useState({
    id: null,
    empresaRut: "",
    servicioId: "",
    entidadId: "",
    fechaProduccion: "",
    montoRegularizado: "",
  });
  // Flag para saber si estamos en modo edición o creación
  const [editMode, setEditMode] = useState(false);

  // Función para traer la lista de producciones desde el backend
  const fetchProducciones = async () => {
    setLoading(true);
    try {
      const response = await apiService.get("/produccion/producciones");
      // Dependiendo de la estructura de la respuesta, ajusta:
      // En este ejemplo asumo que los datos están en response.data.data
      setProducciones(response.data.data || response.data);
    } catch (err) {
      console.error("Error al obtener producciones:", err);
      setError("Error al obtener las producciones");
    } finally {
      setLoading(false);
    }
  };

  // Traemos las producciones al montar el componente
  useEffect(() => {
    fetchProducciones();
  }, []);

  // Manejador de cambios en el formulario
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Enviar el formulario para crear o actualizar
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convertir algunos campos a número para que coincidan con lo que espera el backend
      const payload = {
        ...formData,
        servicioId: Number(formData.servicioId),
        entidadId: formData.entidadId ? Number(formData.entidadId) : null,
        montoRegularizado: Number(formData.montoRegularizado),
      };

      if (editMode && formData.id) {
        // Actualización: usamos PATCH al endpoint de actualización
        await apiService.patch(`/produccion/actualizar/${formData.id}`, payload);
      } else {
        // Creación: usamos POST al endpoint de creación
        await apiService.post("/produccion/crear", payload);
      }
      // Actualizamos la lista y reiniciamos el formulario
      await fetchProducciones();
      setFormData({
        id: null,
        empresaRut: "",
        servicioId: "",
        entidadId: "",
        fechaProduccion: "",
        montoRegularizado: "",
      });
      setEditMode(false);
    } catch (err) {
      console.error("Error en submit:", err);
      alert("Error al enviar el formulario");
    }
  };

  // Para editar: se carga la fila seleccionada en el formulario
  const handleEdit = (produccion) => {
    setFormData({
      id: produccion.id,
      empresaRut: produccion.empresaRut || "",
      // Convertimos a string para que se muestren correctamente en los inputs
      servicioId: produccion.servicioId ? produccion.servicioId.toString() : "",
      entidadId: produccion.entidadId ? produccion.entidadId.toString() : "",
      // Si la fecha viene con hora, la partimos para obtener solo YYYY-MM-DD
      fechaProduccion: produccion.fechaProduccion ? produccion.fechaProduccion.split("T")[0] : "",
      montoRegularizado: produccion.montoRegularizado || "",
    });
    setEditMode(true);
  };

  // Eliminar una producción
  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta producción?")) {
      try {
        await apiService.delete(`/produccion/eliminar/${id}`);
        await fetchProducciones();
      } catch (err) {
        console.error("Error al eliminar producción:", err);
        alert("Error al eliminar la producción");
      }
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Prueba de Producciones</h1>

      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Listado de producciones */}
      <table border="1" cellPadding="5" cellSpacing="0" style={{ width: "100%", marginBottom: "20px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Empresa Rut</th>
            <th>Servicio Id</th>
            <th>Entidad Id</th>
            <th>Fecha Producción</th>
            <th>Monto Regularizado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {producciones.map((prod) => (
            <tr key={prod.id}>
              <td>{prod.id}</td>
              <td>{prod.empresaRut}</td>
              <td>{prod.servicioId}</td>
              <td>{prod.entidadId}</td>
              <td>{prod.fechaProduccion}</td>
              <td>{prod.montoRegularizado}</td>
              <td>
                <button onClick={() => handleEdit(prod)}>Editar</button>{" "}
                <button onClick={() => handleDelete(prod.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Formulario para crear o editar */}
      <h2>{editMode ? "Editar Producción" : "Crear Producción"}</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <div>
          <label>Empresa Rut: </label>
          <input
            type="text"
            name="empresaRut"
            value={formData.empresaRut}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Servicio Id: </label>
          <input
            type="text"
            name="servicioId"
            value={formData.servicioId}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Entidad Id: </label>
          <input
            type="text"
            name="entidadId"
            value={formData.entidadId}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Fecha Producción: </label>
          <input
            type="date"
            name="fechaProduccion"
            value={formData.fechaProduccion}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Monto Regularizado: </label>
          <input
            type="number"
            name="montoRegularizado"
            value={formData.montoRegularizado}
            onChange={handleChange}
            required
          />
        </div>
        <div style={{ marginTop: "10px" }}>
          <button type="submit">{editMode ? "Actualizar" : "Crear"}</button>
          {editMode && (
            <button
              type="button"
              onClick={() => {
                setEditMode(false);
                setFormData({
                  id: null,
                  empresaRut: "",
                  servicioId: "",
                  entidadId: "",
                  fechaProduccion: "",
                  montoRegularizado: "",
                });
              }}
              style={{ marginLeft: "10px" }}
            >
              Cancelar Edición
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProduccionTest;

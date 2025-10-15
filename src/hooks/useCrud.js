import { useState, useEffect, useCallback } from "react";
import apiService from "@/app/api/apiService";
import {
  fetchPrefacturaDetailWithSignedUrls,
  shouldEnrichPrefacturaEndpoint,
} from "@/services/prefacturaApi";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmationAlert,
} from "@/utils/alerts";

export const useCrud = (
  resourcePath,
  deletePath,
  detailPath = null,
  buildDetailEndpoint = null,
  createPath = null,
  bulkDeletePath = null,
  updatePath = null,
  bulkUploadPath = null
) => {


  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para los detalles
  const [details, setDetails] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);


  const fetchData = useCallback(
    async (params = {}) => {
      setLoading(true);
      try {
        // Limpiar parámetros vacíos antes de enviarlos
        const cleanedParams = Object.fromEntries(
          Object.entries(params).filter(([_, value]) => value !== "" && value !== null)
        );
  
        const response = await apiService.get(resourcePath, { params: cleanedParams });
        setData(response.data.data);
        setTotal(response.data.total);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [resourcePath]
  );


  // Cargar datos al montar el componente
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Función para obtener los detalles
  const fetchDetails = useCallback(
    async (id) => {
      if (!detailPath || !buildDetailEndpoint) {
        console.error(
          "detailPath y buildDetailEndpoint son necesarios para fetchDetails"
        );
        return null;
      }
      setDetailLoading(true);
      setDetailError(null);
      try {
        const endpoint = buildDetailEndpoint(detailPath, id);
        console.log("Endpoint generado:", endpoint);

        let fetchedDetails;
        if (shouldEnrichPrefacturaEndpoint(endpoint || detailPath)) {
          fetchedDetails = await fetchPrefacturaDetailWithSignedUrls(endpoint);
        } else {
          const response = await apiService.get(endpoint);
          fetchedDetails = response?.data?.data ?? response?.data;
        }
        setDetails(fetchedDetails); // Actualizamos el estado
        console.log("Detalles guardados:", fetchedDetails);
        return fetchedDetails; // Devolvemos los datos obtenidos
      } catch (err) {
        console.error("Error fetching details:", err);
        setDetailError(err);
        return null;
      } finally {
        setDetailLoading(false);
      }
    },
    [detailPath, buildDetailEndpoint]
  );



  // NUEVO: Manejo de eliminación con ID
  const handleDelete = useCallback(
  async (item) => {
    const confirm = await showConfirmationAlert(
      "¿Está seguro de que desea eliminar este registro?",
      "¡No podrás revertir esto!"
    );

    if (confirm) {
      try {
        // 🟢 Acepta ID o objeto
        const id = typeof item === "object" ? item.id : item;

        if (!id) {
          throw new Error("ID inválido para eliminar el registro.");
        }

       await apiService.delete(`${deletePath}/${id}`);
        fetchData();
        showSuccessAlert("¡Eliminado!", "Tu registro ha sido eliminado.");
      } catch (err) {
        console.error("Error deleting record:", err);
        const apiMessage =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "No se pudo eliminar el registro.";
        showErrorAlert("Error", apiMessage);
      }
    }
  },
  [deletePath, fetchData]
);



  const handleSubmit = useCallback(
    async (formData, modalData) => {
      console.log("🔹 handleSubmit ejecutado", { modalData, formData });
      console.log("🔹 updatePath en useCrud:", updatePath);
console.log("🔹 modalData.id en useCrud:", modalData?.id);
  
      try {
        if (modalData && modalData.id) {
          console.log("🟢 Modo edición detectado. ID:", modalData.id);
  
          if (!updatePath) {
            console.error("🔴 Error: updatePath no está definido");
            return;
          }
          const response = await apiService.patch(
            `${process.env.NEXT_PUBLIC_API_URL}${updatePath}/${modalData.id}`,
            formData
          );
          showSuccessAlert(
            "¡Actualizado!",
            response?.data?.message || "Tu registro ha sido actualizado."
          );
        } else {
          console.log("🟡 Modo creación detectado");
  
          if (!createPath) {
            console.error("🔴 Error: createPath no está definido");
            return;
          }
          const response = await apiService.post(
            `${process.env.NEXT_PUBLIC_API_URL}${createPath}`,
            formData
          );
          showSuccessAlert(
            "¡Creado!",
            response?.data?.message || response?.data?.mensaje || "Tu registro ha sido creado."
          );
        }
        fetchData(); // Recargar la lista después de la operación
      } catch (err) {
        console.error("🔴 Error en handleSubmit:", err);
        const apiMessage =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "No se pudo guardar el registro.";
        showErrorAlert("Error", apiMessage);
        throw err; // Lanza el error para manejarlo en el componente que llama
      }
    },
    [createPath, updatePath, fetchData]
  );
  
  

  const handleBulkDelete = useCallback(
    async (ids) => {
      const confirm = await showConfirmationAlert(
        "¿Está seguro de que desea eliminar estos registros?",
        "¡No podrás revertir esto!"
      );
      if (confirm) {
        try {
          const response = await apiService.post(`${bulkDeletePath}`, { ids });
          fetchData();
          showSuccessAlert(
            "¡Eliminados!",
            response?.data?.message || "Tus registros han sido eliminados."
          );
        } catch (err) {
          console.error("Error deleting records:", err);
          showErrorAlert("Error", "No se pudieron eliminar los registros.");
        }
      }
    },
    [bulkDeletePath, fetchData]
  );


  // NUEVO:
  const handleBulkUpload = useCallback(
    async (file, onProgress) => { // Añade onProgress como parámetro
      if (!bulkUploadPath) {
        console.error("El endpoint de subida masiva (bulkUploadPath) no está definido.");
        return;
      }
  
      const formData = new FormData();
      formData.append("file", file);
  
      try {
        const response = await apiService.post(bulkUploadPath, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            if (onProgress) onProgress(percentCompleted); // Llama a onProgress si está definido
          },
        });
  
        if (response.status === 200) {
          showSuccessAlert("Carga masiva completada", "Los archivos fueron subidos correctamente.");
          if (fetchData) fetchData();
          return response.data;
        } else {
          throw new Error("Error al subir el archivo.");
        }
      } catch (error) {
        showErrorAlert("Error", "No se pudo completar la carga masiva.");
        console.error("Error en la carga masiva:", error);
      }
    },
    [bulkUploadPath, fetchData]
  );

  // NUEVO: para scroll infinito
const fetchPage = useCallback(
  async ({ offset = 0, limit = 10, extraParams = {} } = {}) => {
    try {
      const cleanedParams = Object.fromEntries(
        Object.entries(extraParams).filter(
          ([_, value]) => value !== "" && value !== null
        )
      );

      const response = await apiService.get(resourcePath, {
        params: {
          offset,
          limit,
          ...cleanedParams,
        },
      });

      return {
        data: response.data.data || [],
        total: response.data.total || 0,
      };
    } catch (err) {
      console.error("Error in fetchPage (scroll infinito):", err);
      return { data: [], total: 0 };
    }
  },
  [resourcePath]
);

  return {
    data,
    total,
    loading,
    error,
    details,
    detailLoading,
    detailError,
    fetchDetails,
    handleDelete,
    handleSubmit,
    fetchData,
    handleBulkDelete,
    handleBulkUpload,
    fetchPage
  };
};

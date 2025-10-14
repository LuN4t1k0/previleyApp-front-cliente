
# 📘 Guía de Integración de Feedback Visual en Acciones (`runWithFeedback`)

Esta guía te explica cómo integrar feedback visual consistente en tu aplicación utilizando el hook `useActionFeedback`, tanto en acciones simples (sin modal) como en acciones que usan modales (`GenericModal`). Está alineada con el sistema modular que estás utilizando en tu frontend basado en Next.js + Tremor.

---

## 🧩 1. Crear el Hook `useActionFeedback`

Crea el archivo: `src/hooks/useActionFeedback.js`

```js
import { toast } from "react-hot-toast";

const useActionFeedback = () => {
  const runWithFeedback = async ({
    action,
    loadingMessage = "Procesando...",
    successMessage = null,
    errorMessage = "Ocurrió un error",
  }) => {
    const toastId = toast.loading(loadingMessage);
    try {
      const result = await action();
      toast.dismiss(toastId);
      if (successMessage) toast.success(successMessage);
      return result;
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(errorMessage);
      throw err;
    }
  };

  return { runWithFeedback };
};

export default useActionFeedback;
```

---

## 🧑‍💻 2. Integración en el Layout Principal

Agrega el contenedor de toast global en `AuthenticatedLayout.jsx`:

```js
import { Toaster } from "react-hot-toast";

<Toaster
  position="top-center"
  toastOptions={{
    style: {
      background: "#fff",
      color: "#333",
      fontSize: "14px",
      border: "1px solid #e5e7eb",
    },
    success: {
      iconTheme: {
        primary: "#10B981",
        secondary: "#ECFDF5",
      },
    },
    error: {
      iconTheme: {
        primary: "#EF4444",
        secondary: "#FEF2F2",
      },
    },
  }}
/>
```

---

## ✅ 3. Acciones simples (sin modal)

```js
import useActionFeedback from "@/hooks/useActionFeedback";

const { runWithFeedback } = useActionFeedback();

const handleValidateProduccion = useCallback(async (rowData) => {
  try {
    const { id } = rowData;
    await runWithFeedback({
      action: () => apiService.post(`/produccion/${id}/validate`),
      loadingMessage: "Validando producción...",
      errorMessage: "Error al validar la producción",
    });
    await refreshData();
  } catch (err) {
    console.error("Error al validar producción", err);
  }
}, [refreshData]);
```

---

## 🧾 4. Acciones dentro de un Modal

### A. Usar `runWithFeedback` con control de botón `isLoading`

```js
import useActionFeedback from "@/hooks/useActionFeedback";

const RejectProduccionContent = ({ initialData, onClose, fetchData }) => {
  const [motivo, setMotivo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { runWithFeedback } = useActionFeedback();

  const handleReject = async () => {
    if (!motivo.trim()) return;

    setIsLoading(true);
    try {
      await runWithFeedback({
        action: () => apiService.post(`/produccion/${initialData.id}/reject`, { motivo }),
        loadingMessage: "Rechazando producción...",
        errorMessage: "Error al rechazar la producción",
      });

      onClose();         // cerrar modal primero
      await fetchData(); // luego refrescar
    } catch (error) {
      // Ya se mostró el error con toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Textarea
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        disabled={isLoading}
      />
      <Button onClick={onClose} disabled={isLoading}>Cancelar</Button>
      <Button onClick={handleReject} disabled={!motivo.trim() || isLoading}>
        {isLoading ? "Rechazando..." : "Confirmar Rechazo"}
      </Button>
    </>
  );
};
```

---

## 🧠 Notas adicionales

- Usa `onClose()` **antes de `fetchData()`** para evitar demoras en el cierre visual de la modal.
- El `runWithFeedback` es ideal para mantener consistencia de UX sin instalar nuevas dependencias pesadas.
- No necesitas duplicar loaders; puedes usar el toast y el estado `isLoading` local solo si quieres deshabilitar botones o inputs mientras la acción se ejecuta.

---

## 🎉 Conclusión

Este patrón es ligero, reutilizable y consistente visualmente. Puedes extender `runWithFeedback` con más opciones como `onSuccess`, `onError`, o `icon` si en el futuro deseas enriquecer el comportamiento.

---

**Autor:** Cristian Venegas – Integración `runWithFeedback` en plataforma modular

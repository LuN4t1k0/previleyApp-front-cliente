
# 📘 Guía para Agregar Nuevos Modales en PrevileyApp

Esta guía explica cómo agregar nuevos modales en PrevileyApp, tanto desde botones en páginas como desde `ActionButtons`.

---

## 🧩 1. Definir el Modal en `modalsConfig`

Ubicación: dentro del archivo de configuración del módulo, por ejemplo:

```js
modalsConfig: {
  resumenTrabajador: {
    component: GenericModal,
    title: "Resumen de Trabajador",
    content: ResumenTrabajadorModal,
    rolesAllowed: ["admin", "trabajador", "cliente"]
  },
}
```

- `component`: El contenedor base (`GenericModal`, `BulkUploadModal`, etc).
- `title`: Título del modal.
- `content`: El componente que se renderiza dentro.
- `rolesAllowed`: Quién puede abrirlo.

---

## 🧩 2. Registrar el Modal en `ModalManager`

Asegúrate de que el modal esté registrado en el `ModalManager`, generalmente ya está listo si el config está bien conectado.

---

## 🧩 3. Usarlo desde la página (MoraPresuntaPage)

### a) Para abrir desde un botón o acción:

```js
const { openModal } = useModal();

const handleAbrirResumenTrabajador = () => {
  openModal("resumenTrabajador", {
    trabajadorRut: "12345678-9", // props opcionales
  });
};
```

---

## 🧩 4. Usarlo desde ActionButtons

Si quieres que aparezca como botón en la parte superior derecha:

### a) Agrega a `actionsConfig`:

```js
actionsConfig: [
  {
    id: "verResumenTrabajador",
    modalName: "resumenTrabajador",
    buttonText: "Ver Resumen",
    rolesAllowed: ["admin", "trabajador"],
    actionType: "viewResumenTrabajador",
    color: "purple",
    icon: "RiUserSearchLine"
  }
]
```

### b) En `actionHandlers` del módulo:

```js
const actionHandlers = {
  viewResumenTrabajador: handleAbrirResumenTrabajador,
};
```

---

## 📌 Recomendaciones

- Usa `TrabajadorSkeleton` o similar mientras cargas.
- Aplica validaciones como RUT o permisos antes de llamar `openModal`.
- Usa `motion.div` para animaciones fluidas si es necesario.
- Aprovecha el hook `useEmpresasPermitidas` para validar acceso antes de mostrar información sensible.

---

## 🛠️ Ejemplo Completo

```js
openModal("resumenTrabajador", {
  trabajadorRut: "23108561-0",
  empresaRut: "76442211-9"
});
```

---

## ✅ ¡Y eso es todo!

Así puedes agregar cualquier modal a cualquier parte del sistema de manera estructurada y segura.



// NUEVO:
import React from "react";
import { Dialog, DialogPanel } from "@tremor/react";
import { RiCloseLine } from "@remixicon/react";

const GenericModal = ({ title, content: Content, onClose, ...rest }) => {
  // Permite que el componente de contenido defina un tamaño, o usa un default
  const modalSize = Content.modalSize || "max-w-2xl";
  // Permite bloquear cierre por backdrop/Escape si el contenido lo pide
  const staticBackdrop = !!Content.staticBackdrop;
  // Permite ocultar el botón de cierre del header si el contenido lo pide
  const hideHeaderClose = !!Content.hideHeaderClose;

  return (
    <Dialog
      open={true}
      onClose={staticBackdrop ? (() => {}) : onClose}
      className="z-50 flex items-center justify-center"
    >
      <DialogPanel
        className={`
          ${modalSize} 
          w-full
          p-6 
          bg-white 
          rounded-lg 
          shadow-md 
          dark:bg-gray-900 
          mx-auto
        `}
      >
        {/* Encabezado de la modal */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          {!hideHeaderClose && (
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <RiCloseLine className="h-6 w-6" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Contenido de la modal */}
        <div className="overflow-visible">
          <Content {...rest} onClose={onClose} />
        </div>
      </DialogPanel>
    </Dialog>
  );
};

export default GenericModal;

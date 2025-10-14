import React from 'react';
import { useModal } from '@/context/ModalContext';
import { useRole } from '@/context/RoleContext';

const ModalManager = () => {
  const { currentModal, modalProps, closeModal, modalsConfig } = useModal();
  const { role } = useRole();

  if (!currentModal) return null;

  const modalConfig = modalsConfig[currentModal];
  // console.log("modalConfig:", modalConfig); // Verificar que modalConfig tiene la configuración esperada
  if (!modalConfig) {
    console.error(`La modal "${currentModal}" no está definida en la configuración.`);
    return null;
  }

  if (!modalConfig.rolesAllowed.includes(role)) {
    console.error(`El rol "${role}" no tiene permiso para abrir la modal "${currentModal}".`);
    return null;
  }

  const { component: ModalComponent, title, content } = modalConfig;

  // console.log("modalProps",modalProps)
  return (
    
    <ModalComponent
      {...modalProps}
      title={title}
      content={content}
      onClose={closeModal}
    />
  );
};


export default ModalManager;

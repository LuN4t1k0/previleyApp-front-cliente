
'use client';
import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export const ModalProvider = ({ children, modalsConfig }) => {
  const [currentModal, setCurrentModal] = useState(null);
  const [modalProps, setModalProps] = useState({});

  const openModal = (modalName, props = {}) => {
    setCurrentModal(modalName);
    setModalProps(props);
  };

  const closeModal = () => {
    setCurrentModal(null);
    setModalProps({});
  };

  return (
    <ModalContext.Provider value={{ currentModal, modalProps, openModal, closeModal, modalsConfig }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);


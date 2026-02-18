// src/context/RoleContext.jsx
'use client';
import { createContext, useContext } from 'react';
import { useSession } from 'next-auth/react';

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  const { data: session, status } = useSession();

  const rawRole = session?.user?.rol || 'guest';
  const isClientAdmin = rawRole === 'cliente_admin';
  const role = isClientAdmin ? 'cliente' : rawRole; // compatibilidad con guards existentes

  return (
    <RoleContext.Provider value={{ role, rawRole, isClientAdmin, status }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);

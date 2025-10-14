// src/context/RoleContext.jsx
'use client';
import { createContext, useContext } from 'react';
import { useSession } from 'next-auth/react';

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  const { data: session, status } = useSession();

  const userRole = session?.user?.rol || 'guest'; // Asignamos 'guest' si no hay rol

  return (
    <RoleContext.Provider value={{ role: userRole, status }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);

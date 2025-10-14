// import { useSession } from "next-auth/react";

// const useUserData = () => {
//   const { data: session } = useSession();
//   return {
//     id: session?.user?.id, // Extrae el ID del usuario
//     rol: session?.user?.rol, // Extrae el rol del usuario
//   };
// };

// export default useUserData;


// NUEVO: REVISAR:
// src/hooks/useUserData.js (o donde lo tengas)
import { useSession } from "next-auth/react";
import { useMemo } from "react";

const useUserData = () => {
  const { data: session } = useSession();

  // useMemo asegura que el objeto 'user' solo se recalcule si la sesión cambia.
  // Esto rompe el bucle infinito.
  const user = useMemo(() => {
    if (!session?.user) {
      return null;
    }
    // Devolvemos todos los datos del usuario que nos interesan
    return {
      id: session.user.id,
      rol: session.user.rol,
    };
  }, [session]);

  return user;
};

export default useUserData;
import { useSession } from "next-auth/react";

const useUserRole = () => {
  const { data: session } = useSession();
  return session?.user?.rol;
};

export default useUserRole;
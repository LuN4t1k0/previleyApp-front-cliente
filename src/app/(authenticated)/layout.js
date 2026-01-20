// "use client";

// import NavigationMenu from "@/components/menu/NavigationMenu";
// import { useSession, signIn } from "next-auth/react";

// export default function AuthenticatedLayout({ children }) {
//   const { data: session, status } = useSession();

//   // console.log("Session:", session);
//   // console.log("Status:", status);

//   if (status === "loading") {
//     return <p>Loading...</p>; // Puedes personalizar este loading spinner
//   }

//   if (!session) {
//     signIn(); // Redirige al usuario a la página de inicio de sesión
//     return <p>Redirecting...</p>; // También puedes personalizar este mensaje
//   }

//   return (
//     <div>
//       <NavigationMenu />
//       {/* <NavigationMenu/> */}
//       <main>{children}</main>
//     </div>
//   );
// }


"use client";

import AppFooter from "@/components/layout/AppFooter";
import ClientHeader from "@/components/layout/ClientHeader";
import { useSession, signIn, signOut } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { useEffect, useRef } from "react";
import Swal from "sweetalert2";
import useSocket from "@/hooks/useSocket";

export default function AuthenticatedLayout({ children }) {
  const { data: session, status } = useSession();
  const { socket } = useSocket(session?.accessToken);
  const handledRef = useRef(false);

  const decodeJwt = (token) => {
    try {
      const [, payload] = String(token || "").split(".");
      if (!payload) return null;
      return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    } catch (_) {
      return null;
    }
  };

  useEffect(() => {
    if (!socket || !session?.accessToken) return;
    const claims = decodeJwt(session.accessToken);
    const currentSessionId = claims?.sessionId || claims?.jti || null;
    if (!currentSessionId) return;

    const onRevoked = async (payload = {}) => {
      if (handledRef.current) return;
      const reason = payload?.reason;
      const isAdmin =
        reason === "ADMIN_REVOKE" ||
        reason === "ADMIN_REVOKE_ALL" ||
        reason === "ADMIN_FORCE_LOGOUT";
      const newSessionId = payload?.newSessionId;
      if (!isAdmin && (!newSessionId || newSessionId === currentSessionId)) return;
      handledRef.current = true;
      await Swal.fire({
        icon: "warning",
        title: "Sesión cerrada",
        text:
          payload?.message ||
          (isAdmin
            ? "Tu sesión fue cerrada por un administrador."
            : "Se inició sesión en otro dispositivo."),
        confirmButtonText: "Entendido",
        allowOutsideClick: false,
        allowEscapeKey: false,
      });
      signOut({ callbackUrl: "/signin?reason=session-revoked" });
    };

    socket.on("auth:session-revoked", onRevoked);
    return () => {
      socket.off("auth:session-revoked", onRevoked);
    };
  }, [socket, session?.accessToken]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session) {
    signIn();
    return <p>Redirecting...</p>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <ClientHeader />
      <main className="app-shell flex-1">{children}</main>

      {/* 🔥 Global toast feedback */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#fff",
            color: "#333",
            fontSize: "14px",
            border: "1px solid #e5e7eb",
            padding: "12px 16px",
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
      <AppFooter theme="dashboard" />
    </div>
  );
}

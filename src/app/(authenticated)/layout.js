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
import { useSession, signIn } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export default function AuthenticatedLayout({ children }) {
  const { data: session, status } = useSession();

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

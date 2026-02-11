import "./globals.css";
import AuthProvider from "../context/AuthProvider";
import { Sora } from "next/font/google";
import { RoleProvider } from "@/context/RoleContext";

import { FilterProvider } from "@/context/FilterContext";
import { NotificationProvider } from "@/context/NotificationContext";


const sora = Sora({ subsets: ["latin"] });

export const metadata = {
  title: "Previley APP",
  description:
    "una aplicaion web que busca simplificar la entrega de informacion a nuestros clientes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons+Round"
        />
      </head>
      <body className={sora.className}>
        <AuthProvider>
          <NotificationProvider>
            <RoleProvider>
              <FilterProvider>{children}</FilterProvider>
            </RoleProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

import "./globals.css";
import AuthProvider from "../context/AuthProvider";
import { Inter } from "next/font/google";
import { RoleProvider } from "@/context/RoleContext";

import { FilterProvider } from "@/context/FilterContext";
import { NotificationProvider } from "@/context/NotificationContext";


const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Previley APP",
  description:
    "una aplicaion web que busca simplificar la entrega de informacion a nuestros clientes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
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

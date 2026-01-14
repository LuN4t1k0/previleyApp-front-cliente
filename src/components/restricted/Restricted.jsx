"use client";

import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
const Restricted = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        <div className="flex justify-center">
          <div className="bg-red-100 p-4 rounded-full">
            <ShieldAlert className="w-16 h-16 text-red-600" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Acceso Restringido
          </h1>
          <p className="text-gray-500">
            Lo sentimos, no tienes los permisos necesarios para ver este
            contenido. Si crees que esto es un error, contacta al administrador.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            <Home className="w-4 h-4" />
            Volver al Inicio
          </Link>

          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 font-medium py-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Regresar a la página anterior
          </button>
        </div>

        <p className="text-xs text-gray-400 pt-8 border-t border-gray-100">
          Error 403 - Forbidden
        </p>
      </div>
    </div>
  );
};

export default Restricted;

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Las rutas API se ejecutan dentro del contenedor Next.js. En ese contexto
// localhost apunta al propio frontend, por lo que deben usar la URL interna.
const BASE_URL = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL;

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  }

  const url = new URL(request.url);
  const queryString = url.search ? url.search : "";

  try {
    const response = await fetch(`${BASE_URL}/pagex-dashboard/global${queryString}`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      cache: "no-store",
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[pagex/global] No se pudo consultar el backend", error);
    return NextResponse.json(
      { message: "No fue posible cargar el resumen de Pagos en Exceso." },
      { status: 502 }
    );
  }
}

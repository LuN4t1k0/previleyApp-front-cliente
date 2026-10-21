import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL;

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  }

  const url = new URL(request.url);
  const queryString = url.search ? url.search : "";

  try {
    const response = await fetch(`${BASE_URL}/mora-dashboard/global${queryString}`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      cache: "no-store",
    });
    const body = await response.text();
    let data;
    try {
      data = body ? JSON.parse(body) : { message: "El backend no devolvió contenido." };
    } catch {
      data = { message: "El backend devolvió una respuesta inválida." };
    }
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[mora/global] No se pudo consultar el backend", error);
    return NextResponse.json(
      { message: "No fue posible cargar el dashboard global de Mora Presunta." },
      { status: 502 }
    );
  }
}

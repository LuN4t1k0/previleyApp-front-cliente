import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  }

  const url = new URL(request.url);
  const queryString = url.search ? url.search : "";

  const response = await fetch(`${BASE_URL}/licencia-dashboard/global${queryString}`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
    cache: "no-store",
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

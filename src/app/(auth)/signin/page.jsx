'use client'
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TextInput, Button, Text } from "@tremor/react";
import Image from "next/image";
import Link from "next/link"; // Importa el componente Link de Next.js

const LoginV2 = () => {
  const [errors, setErrors] = useState([]);
  const [email, setEmail] = useState("usuario@previley.cl");
  const [password, setPassword] = useState("Previley123");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    const responseNextAuth = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (responseNextAuth?.error) {
      setErrors(responseNextAuth.error.split(","));
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-azul-previley p-4">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="flex justify-center">
          <Image
            alt="Corporate Image"
            src="https://firebasestorage.googleapis.com/v0/b/storage-previleyapp.appspot.com/o/previleApp%2FlogoAzul-web.png?alt=media&token=1b4fb56f-1179-41c1-95d3-6eec9649446e"
            width={300}
            height={80}
            className="object-contain"
          />
        </div>
        <h2 className="mt-6 text-center text-xl font-semibold text-gray-900">INICIAR SESIÓN</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Text className="block text-sm font-semibold text-gray-700" htmlFor="email">
              Email
            </Text>
            <TextInput
              className="w-full"
              id="email"
              placeholder="m@example.com"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Text className="block text-sm font-semibold text-gray-700" htmlFor="password">
              Password
            </Text>
            <TextInput
              className="w-full"
              id="password"
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex justify-between items-center">
            <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <Button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700" type="submit">
            Ingresar
          </Button>
        </form>
        {errors.length > 0 && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <ul>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginV2;

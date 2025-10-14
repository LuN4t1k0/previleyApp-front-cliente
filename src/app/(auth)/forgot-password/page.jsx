// 'use client'
// import { useState } from "react";
// import { TextInput, Button, Text } from "@tremor/react";
// import Link from "next/link";
// import Image from "next/image";
// import { ClipLoader } from "react-spinners"; // Importa el spinner que desees

// const ForgotPassword = () => {
//   const [email, setEmail] = useState("");
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false); // Estado para el loading

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMessage("");
//     setError("");
//     setIsLoading(true); // Iniciar el loading

//     try {
//       // Aquí harías una llamada a tu API para enviar el enlace de restablecimiento
//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/recovery`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setMessage(data.message);
//       } else {
//         setError(data.error);
//       }
//     } catch (err) {
//       setError("Ocurrió un error. Por favor intenta de nuevo.");
//     } finally {
//       setIsLoading(false); // Finalizar el loading
//     }
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-azul-previley p-4">
//       <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-lg">
//         <div className="flex justify-center">
//           <Image
//             alt="Corporate Image"
//             src="https://firebasestorage.googleapis.com/v0/b/storage-previleyapp.appspot.com/o/previleApp%2FlogoAzul-web.png?alt=media&token=1b4fb56f-1179-41c1-95d3-6eec9649446e"
//             width={300}
//             height={80}
//             className="object-contain"
//           />
//         </div>
//         <h2 className="mt-6 text-center text-xl font-semibold text-gray-900">RECUPERAR CONTRASEÑA</h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="space-y-2">
//             <Text className="block text-sm font-medium text-gray-700" htmlFor="email">
//               Email
//             </Text>
//             <TextInput
//               className="w-full"
//               id="email"
//               placeholder="Ingresa tu email"
//               required
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//           </div>
//           <Button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700" type="submit" disabled={isLoading}>
//             {isLoading ? <ClipLoader size={20} color={"#ffffff"} /> : "Enviar Enlace de Restablecimiento"}
//           </Button>
//         </form>
//         {message && <p className="mt-4 text-green-600">{message}</p>}
//         {error && <p className="mt-4 text-red-600">{error}</p>}
//         <div className="mt-4 flex justify-between items-center">
//           <Link href="/" className="text-sm text-blue-600 hover:underline">
//             Volver al Inicio de Sesión
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ForgotPassword;



// NUEVO:
'use client';

import { useState } from "react";
import { TextInput, Button, Text } from "@tremor/react";
import Link from "next/link";
import Image from "next/image";
import { ClipLoader } from "react-spinners";
import api from "@/app/api/apiService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Debug para verificar qué quedó en el build
  console.debug("NEXT_PUBLIC_API_URL =", process.env.NEXT_PUBLIC_API_URL);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true);

    try {
      const { data } = await api.post("/auth/recovery", { email });
      setMessage(data?.message || "Si el correo existe, te enviamos un enlace para restablecer la contraseña.");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Ocurrió un error. Por favor intenta de nuevo.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
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
        <h2 className="mt-6 text-center text-xl font-semibold text-gray-900">RECUPERAR CONTRASEÑA</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Text className="block text-sm font-medium text-gray-700" htmlFor="email">
              Email
            </Text>
            <TextInput
              className="w-full"
              id="email"
              placeholder="Ingresa tu email"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700" type="submit" disabled={isLoading}>
            {isLoading ? <ClipLoader size={20} color={"#ffffff"} /> : "Enviar Enlace de Restablecimiento"}
          </Button>
        </form>
        {message && <p className="mt-4 text-green-600">{message}</p>}
        {error && <p className="mt-4 text-red-600">{error}</p>}
        <div className="mt-4 flex justify-between items-center">
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            Volver al Inicio de Sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

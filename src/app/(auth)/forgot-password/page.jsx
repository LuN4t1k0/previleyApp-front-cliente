
// 'use client';

// import { useState } from "react";
// import { TextInput, Button, Text } from "@tremor/react";
// import Link from "next/link";
// import Image from "next/image";
// import { ClipLoader } from "react-spinners";
// import api from "@/app/api/apiService";

// const ForgotPassword = () => {
//   const [email, setEmail] = useState("");
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   // Debug para verificar qué quedó en el build
//   console.debug("NEXT_PUBLIC_API_URL =", process.env.NEXT_PUBLIC_API_URL);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMessage("");
//     setError("");
//     setIsLoading(true);

//     try {
//       const { data } = await api.post("/auth/recovery", { email });
//       setMessage(data?.message || "Si el correo existe, te enviamos un enlace para restablecer la contraseña.");
//     } catch (err) {
//       const msg = err?.response?.data?.message || err?.message || "Ocurrió un error. Por favor intenta de nuevo.";
//       setError(msg);
//     } finally {
//       setIsLoading(false);
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
import { TextInput, Button, Text, Callout, Divider } from "@tremor/react";
import Link from "next/link";
import Image from "next/image";
import { RiMailSendLine, RiErrorWarningLine, RiArrowLeftLine, RiMailLine } from "@remixicon/react";
import api from "@/app/api/apiService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true);

    try {
      const { data } = await api.post("/auth/recovery", { email });
      setMessage(data?.message || "Si el correo está registrado, recibirás un enlace de restablecimiento en breve.");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "No pudimos procesar la solicitud. Intenta más tarde.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* SECCIÓN FORMULARIO */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-[450px] xl:w-[550px] lg:px-20 bg-white shrink-0 z-40">
        <div className="mx-auto w-full max-w-sm">
          
          <div className="mb-10">
            <Link href="/" className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors mb-8 group">
              <RiArrowLeftLine className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              VOLVER AL LOGIN
            </Link>
            
            <Image
              alt="Previley Asesorías"
              src="https://firebasestorage.googleapis.com/v0/b/storage-previleyapp.appspot.com/o/previleApp%2FlogoAzul-web.png?alt=media&token=1b4fb56f-1179-41c1-95d3-6eec9649446e"
              width={200}
              height={60}
              priority
              className="object-contain mb-8"
            />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Recuperar Acceso</h1>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              Ingresa tu correo institucional para recibir las instrucciones de restablecimiento.
            </p>
          </div>

          {!message ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">
                  Email de Usuario
                </label>
                <TextInput
                  icon={RiMailLine}
                  id="email"
                  placeholder="usuario@previley.cl"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                />
              </div>

              {error && (
                <Callout title="Error de solicitud" icon={RiErrorWarningLine} color="rose">
                  {error}
                </Callout>
              )}

              <Button
                className="w-full h-12 text-sm font-bold shadow-lg bg-[#1D4ED8] hover:bg-[#1e40af] transition-all transform active:scale-[0.97] border-none"
                type="submit"
                loading={isLoading}
              >
                ENVIAR INSTRUCCIONES
              </Button>
            </form>
          ) : (
            <div className="animate-in fade-in zoom-in duration-300">
              <Callout
                title="Correo Enviado"
                icon={RiMailSendLine}
                color="teal"
                className="mb-6"
              >
                {message}
              </Callout>
              <Link href="/">
                <Button variant="secondary" className="w-full border-slate-200 text-slate-600">
                  Regresar al inicio de sesión
                </Button>
              </Link>
            </div>
          )}

          <footer className="mt-16 text-center">
            <Divider className="text-slate-300 text-[10px] uppercase tracking-widest">Atención al Cliente</Divider>
            <p className="mt-6 text-[10px] text-slate-400 uppercase tracking-[0.15em] leading-loose italic">
              Si no recibes el correo en 5 minutos, revisa tu carpeta de SPAM o contacta a soporte corporativo.
            </p>
          </footer>
        </div>
      </div>

      {/* SECCIÓN HERO (Igual que el login para consistencia visual) */}
      <div className="hidden lg:relative lg:block lg:flex-1 bg-slate-950 overflow-hidden">
        <div className="absolute inset-0 bg-slate-950/30 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent z-20" />
        
        <img
          className="absolute inset-0 h-full w-full object-cover brightness-[0.5] contrast-[1.1]"
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80"
          alt="Soporte Previley"
        />

        <div className="absolute bottom-28 left-20 z-30 max-w-xl pr-12">
          <h3 className="text-5xl font-black text-white leading-[1.1] mb-6 drop-shadow-lg">
            Seguridad en la gestión de tu información.
          </h3>
          <p className="text-xl text-blue-50/80 font-light leading-relaxed border-l-4 border-blue-600 pl-6">
            Nuestros protocolos de seguridad garantizan que solo el personal autorizado tenga acceso a las gestiones críticas de tu empresa.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
// 'use client'
// import { signIn } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { useState } from "react";
// import { TextInput, Button, Text } from "@tremor/react";
// import Image from "next/image";
// import Link from "next/link"; // Importa el componente Link de Next.js

// const LoginV2 = () => {
//   const [errors, setErrors] = useState([]);
//   const [email, setEmail] = useState("usuario@previley.cl");
//   const [password, setPassword] = useState("Previley123");
//   const router = useRouter();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setErrors([]);

//     const responseNextAuth = await signIn("credentials", {
//       email,
//       password,
//       redirect: false,
//     });

//     if (responseNextAuth?.error) {
//       setErrors(responseNextAuth.error.split(","));
//       return;
//     }

//     router.push("/dashboard");
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
//         <h2 className="mt-6 text-center text-xl font-semibold text-gray-900">INICIAR SESIÓN</h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="space-y-2">
//             <Text className="block text-sm font-semibold text-gray-700" htmlFor="email">
//               Email
//             </Text>
//             <TextInput
//               className="w-full"
//               id="email"
//               placeholder="m@example.com"
//               required
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//           </div>
//           <div className="space-y-2">
//             <Text className="block text-sm font-semibold text-gray-700" htmlFor="password">
//               Password
//             </Text>
//             <TextInput
//               className="w-full"
//               id="password"
//               required
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />
//           </div>
//           <div className="flex justify-between items-center">
//             <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
//               ¿Olvidaste tu contraseña?
//             </Link>
//           </div>
//           <Button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700" type="submit">
//             Ingresar
//           </Button>
//         </form>
//         {errors.length > 0 && (
//           <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
//             <ul>
//               {errors.map((error, index) => (
//                 <li key={index}>{error}</li>
//               ))}
//             </ul>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default LoginV2;



// NUEVO:

// 'use client'

// import { signIn } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { useState, useEffect } from "react";
// import { TextInput, Button, Callout, Divider } from "@tremor/react";
// import { RiShieldCheckLine, RiErrorWarningLine, RiLockPasswordLine, RiMailLine } from "@remixicon/react";
// import Image from "next/image";
// import Link from "next/link";

// const heroMessages = [
//   {
//     title: "Transparencia y control sobre las gestiones de tu empresa.",
//     body: "Somos expertos en recursos humanos y te entregamos una plataforma donde puedes visualizar, en todo momento, el estado de tus gestiones, avances, reportes y cumplimiento, de forma clara y centralizada.",
//   },
//   {
//     title: "Toda la información de tus gestiones, en un solo lugar.",
//     body: "Accede a reportes, avances y cumplimiento en tiempo real. Somos expertos en recursos humanos y trabajamos con total transparencia.",
//   },
//   {
//     title: "Trabajamos por ti, y aquí ves cada avance.",
//     body: "Nuestra plataforma te permite monitorear las gestiones que realizamos para tu empresa, con claridad, trazabilidad y respaldo profesional en recursos humanos.",
//   },
// ];

// const LoginV2 = () => {
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState([]);
//   const [email, setEmail] = useState("usuario@previley.cl");
//   const [password, setPassword] = useState("Previley123");
//   const router = useRouter();

//   // ---- ROTACIÓN DE TEXTOS HERO ----
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [visible, setVisible] = useState(true);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setVisible(false);

//       const timeout = setTimeout(() => {
//         setCurrentIndex((prev) => (prev + 1) % heroMessages.length);
//         setVisible(true);
//       }, 300);

//       return () => clearTimeout(timeout);
//     }, 7000);

//     return () => clearInterval(interval);
//   }, []);

//   const currentMessage = heroMessages[currentIndex];

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setErrors([]);
//     setLoading(true);

//     try {
//       const responseNextAuth = await signIn("credentials", {
//         email,
//         password,
//         redirect: false,
//       });

//       if (responseNextAuth?.error) {
//         const errorMsg =
//           responseNextAuth.error === "CredentialsSignin"
//             ? "Acceso denegado. Verifique sus credenciales corporativas."
//             : "Error de conexión con el servidor de autenticación.";

//         setErrors([errorMsg]);
//         setLoading(false);
//         return;
//       }

//       router.push("/dashboard");
//       router.refresh();
//     } catch (error) {
//       setErrors(["Error inesperado en el sistema de gestión."]);
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-white">
//       {/* FORMULARIO */}
//       <div className="flex w-full flex-col justify-center px-8 py-12 lg:w-[45%] xl:w-[40%] lg:px-20 bg-white">
//         <div className="mx-auto w-full max-w-sm">
//           <div className="mb-1">
//             <Image
//               alt="Previley Asesorías"
//               src="https://firebasestorage.googleapis.com/v0/b/storage-previleyapp.appspot.com/o/previleApp%2FlogoAzul-web.png?alt=media&token=1b4fb56f-1179-41c1-95d3-6eec9649446e"
//               width={240}
//               height={70}
//               priority
//               className="object-contain mb-8"
//             />
//             <p className="text-sm text-slate-500 leading-relaxed">
//               Plataforma centralizada para analistas y clientes.
//             </p>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-5">
//             <div>
//               <label className="text-xs font-bold uppercase tracking-wider text-slate-700 ml-1">
//                 Email
//               </label>
//               <TextInput
//                 icon={RiMailLine}
//                 id="email"
//                 placeholder="nombre.apellido@previley.cl"
//                 required
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="mt-1.5"
//               />
//             </div>

//             <div>
//               <div className="flex items-center justify-between">
//                 <label className="text-xs font-bold uppercase tracking-wider text-slate-700 ml-1">
//                   Contraseña
//                 </label>
//                 <Link
//                   href="/forgot-password"
//                   title="Solicitar nueva clave"
//                   className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
//                 >
//                   ¿Problemas de acceso?
//                 </Link>
//               </div>
//               <TextInput
//                 icon={RiLockPasswordLine}
//                 id="password"
//                 required
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="mt-1.5"
//               />
//             </div>

//             {errors.length > 0 && (
//               <Callout
//                 title="Fallo de Autenticación"
//                 icon={RiErrorWarningLine}
//                 color="rose"
//                 className="mt-2"
//               >
//                 {errors[0]}
//               </Callout>
//             )}

//             <Button
//               className="w-full h-12 text-sm font-bold shadow-lg bg-[#1D4ED8] hover:bg-[#1e40af] transition-all transform active:scale-[0.98] border-none"
//               type="submit"
//               loading={loading}
//             >
//               INGRESAR AL PANEL
//             </Button>
//           </form>

//           <footer className="mt-12">
//             <Divider>Soporte Técnico</Divider>
//             <p className="mt-4 text-center text-xs text-slate-400">
//               © {new Date().getFullYear()} Previley Asesorías Jurídicas y Previsionales. <br />
//               Sistema de uso exclusivo para personal autorizado.
//             </p>
//           </footer>
//         </div>
//       </div>

//       {/* HERO DERECHA */}
//       <div className="hidden lg:relative lg:block lg:flex-1 bg-slate-900 overflow-hidden">
//         <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#1e3a8a]/40 to-transparent z-10" />

//         <img
//           className="absolute inset-0 h-full w-full object-cover"
//           src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80"
//           alt="Asesoría Legal y Prevención"
//         />

//         <div className="absolute bottom-24 left-20 z-20 max-w-xl">
//           <div className="flex items-center gap-3 mb-6">
//             <RiShieldCheckLine className="text-blue-400 w-10 h-10" />
//             <div className="h-[2px] w-12 bg-blue-500" />
//           </div>

//           <h3
//             className={`text-4xl font-bold text-white leading-[1.2] mb-4 transition-all duration-300 ${
//               visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
//             }`}
//           >
//             {currentMessage.title}
//           </h3>

//           <p
//             className={`text-xl text-blue-100 font-light max-w-md transition-all duration-300 delay-75 ${
//               visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
//             }`}
//           >
//             {currentMessage.body}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginV2;

// NUEVO:
'use client'

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { TextInput, Button, Callout, Divider } from "@tremor/react";
import { 
  RiBarChartBoxLine, 
  RiErrorWarningLine, 
  RiLockPasswordLine, 
  RiMailLine 
} from "@remixicon/react";
import Image from "next/image";
import Link from "next/link";

const heroMessages = [
  {
    title: "Transparencia y control sobre las gestiones de tu empresa.",
    body: "Somos expertos en recursos humanos y te entregamos una plataforma donde puedes visualizar, en todo momento, el estado de tus gestiones, avances, reportes y cumplimiento.",
  },
  {
    title: "Toda la información de tus gestiones, en un solo lugar.",
    body: "Accede a reportes, avances y cumplimiento en tiempo real. Trabajamos con total transparencia para asegurar la trazabilidad de tu capital humano.",
  },
  {
    title: "Trabajamos por ti, y aquí ves cada avance.",
    body: "Nuestra plataforma te permite monitorear las gestiones que realizamos para tu empresa, con claridad y respaldo profesional experto.",
  },
];

const LoginV2 = () => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % heroMessages.length);
        setVisible(true);
      }, 300);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const currentMessage = heroMessages[currentIndex];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);

    try {
      const responseNextAuth = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (responseNextAuth?.error) {
        setErrors(["Acceso denegado. Verifique sus credenciales corporativas."]);
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setErrors(["Error inesperado en el sistema de gestión."]);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* SECCIÓN IZQUIERDA: FORMULARIO (Responsive) */}
      <div className="flex w-full flex-col justify-center px-6 py-10 md:px-12 lg:w-[45%] xl:w-[35%] lg:px-16 bg-white shrink-0">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 text-center lg:text-left">
            <Image
              alt="Previley Asesorías"
              src="https://firebasestorage.googleapis.com/v0/b/storage-previleyapp.appspot.com/o/previleApp%2FlogoAzul-web.png?alt=media&token=1b4fb56f-1179-41c1-95d3-6eec9649446e"
              width={200}
              height={60}
              priority
              className="object-contain mb-6 mx-auto lg:mx-0"
            />
            <h1 className="text-xl font-bold text-slate-800 mb-1">Acceso a Plataforma</h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              Gestión centralizada para analistas y clientes de Previley.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 ml-1">
                Email Corporativo
              </label>
              <TextInput
                icon={RiMailLine}
                id="email"
                placeholder="usuario@previley.cl"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 ml-1">
                  Contraseña
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  ¿Olvidaste tu clave?
                </Link>
              </div>
              <TextInput
                icon={RiLockPasswordLine}
                id="password"
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
              />
            </div>

            {errors.length > 0 && (
              <Callout title="Fallo de ingreso" icon={RiErrorWarningLine} color="rose">
                {errors[0]}
              </Callout>
            )}

            <Button
              className="w-full h-12 text-sm font-bold shadow-lg bg-[#1D4ED8] hover:bg-[#1e40af] transition-all transform active:scale-[0.98] border-none"
              type="submit"
              loading={loading}
            >
              INGRESAR AL PANEL
            </Button>
          </form>

          <footer className="mt-12">
            <Divider>Soporte TI</Divider>
            <p className="mt-4 text-center text-[10px] text-slate-400 uppercase tracking-widest">
              © {new Date().getFullYear()} Previley Asesorías Jurídicas <br />
              Uso exclusivo personal autorizado.
            </p>
          </footer>
        </div>
      </div>

      {/* SECCIÓN DERECHA: HERO (Desktop Only) */}
      <div className="hidden lg:relative lg:block lg:flex-1 bg-slate-900 overflow-hidden">
        {/* Overlay para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a]/90 via-[#1e3a8a]/40 to-[#1e3a8a]/20 z-10" />

        <img
          className="absolute inset-0 h-full w-full object-cover"
          // src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80" // Imagen de equipo colaborando (más RRHH)
           src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80" // Imagen de equipo colaborando (más RRHH)
          alt="Previley Gestión"
        />

        <div className="absolute bottom-20 left-16 z-20 max-w-xl pr-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-500/20 rounded-lg backdrop-blur-md">
                <RiBarChartBoxLine className="text-blue-400 w-8 h-8" />
            </div>
            <div className="h-[1px] w-16 bg-blue-500/50" />
          </div>

          <div className="min-h-[180px]"> {/* Altura fija para evitar saltos al rotar */}
            <h3
                className={`text-4xl xl:text-5xl font-bold text-white leading-tight mb-6 transition-all duration-500 ease-in-out ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
                }`}
            >
                {currentMessage.title}
            </h3>

            <p
                className={`text-lg xl:text-xl text-blue-100 font-light transition-all duration-700 delay-150 ${
                visible ? "opacity-90 translate-x-0" : "opacity-0 -translate-x-4"
                }`}
            >
                {currentMessage.body}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginV2;
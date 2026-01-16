
// // NUEVO:
// 'use client';

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { TextInput, Button, Text } from "@tremor/react";
// import Link from "next/link";
// import { ClipLoader } from "react-spinners";
// import api from "@/app/api/apiService";

// const ChangePassword = () => {
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [token, setToken] = useState("");
//   const router = useRouter();

//   // Debug
//   console.debug("NEXT_PUBLIC_API_URL =", process.env.NEXT_PUBLIC_API_URL);

//   useEffect(() => {
//     const url = new URL(window.location.href);
//     const tokenFromUrl = url.searchParams.get("token");
//     setToken(tokenFromUrl || "");
//   }, []);

//   const validatePassword = (password) => {
//     const lengthValid = password.length >= 8;
//     const hasUpperCase = /[A-Z]/.test(password);
//     const hasLowerCase = /[a-z]/.test(password);
//     const hasNumber = /\d/.test(password);
//     return { lengthValid, hasUpperCase, hasLowerCase, hasNumber };
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMessage("");
//     setError("");
//     setIsLoading(true);

//     if (newPassword !== confirmPassword) {
//       setError("Las contraseñas no coinciden");
//       setIsLoading(false);
//       return;
//     }

//     const { lengthValid, hasUpperCase, hasLowerCase, hasNumber } = validatePassword(newPassword);
//     if (!lengthValid || !hasUpperCase || !hasLowerCase || !hasNumber) {
//       setError("La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula y un número.");
//       setIsLoading(false);
//       return;
//     }

//     try {
//       const { data } = await api.post("/auth/change-password", { token, newPassword });
//       setMessage(data?.message || "Contraseña actualizada correctamente");
//       setTimeout(() => router.push("/signin"), 2000);
//     } catch (err) {
//       const msg = err?.response?.data?.message || err?.message || "Ocurrió un error. Por favor intenta de nuevo.";
//       setError(msg);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const passwordValidations = validatePassword(newPassword);
//   const passwordsMatch = newPassword === confirmPassword;

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-azul-previley p-4">
//       <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-lg">
//         <h2 className="text-center text-xl font-semibold text-gray-900">CAMBIAR CONTRASEÑA</h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="space-y-2">
//             <Text className="block text-sm font-medium text-gray-700" htmlFor="new-password">
//               Nueva Contraseña
//             </Text>
//             <TextInput
//               className="w-full"
//               id="new-password"
//               placeholder="Nueva Contraseña"
//               required
//               type="password"
//               value={newPassword}
//               onChange={(e) => setNewPassword(e.target.value)}
//             />
//             <div className="mt-2">
//               <PasswordValidationIndicator isValid={passwordValidations.lengthValid} label="Al menos 8 caracteres" />
//               <PasswordValidationIndicator isValid={passwordValidations.hasUpperCase} label="Al menos una letra mayúscula" />
//               <PasswordValidationIndicator isValid={passwordValidations.hasLowerCase} label="Al menos una letra minúscula" />
//               <PasswordValidationIndicator isValid={passwordValidations.hasNumber} label="Al menos un número" />
//               <PasswordValidationIndicator isValid={passwordsMatch} label="Las contraseñas coinciden" />
//             </div>
//           </div>

//           <div className="space-y-2">
//             <Text className="block text-sm font-medium text-gray-700" htmlFor="confirm-password">
//               Confirmar Contraseña
//             </Text>
//             <TextInput
//               className="w-full"
//               id="confirm-password"
//               placeholder="Confirmar Contraseña"
//               required
//               type="password"
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//             />
//           </div>

//           <Button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700" type="submit" disabled={isLoading}>
//             {isLoading ? <ClipLoader size={20} color={"#ffffff"} /> : "Cambiar Contraseña"}
//           </Button>
//         </form>

//         {isLoading && <p className="mt-4 text-gray-600">Cambiando contraseña...</p>}
//         {message && <p className="mt-4 text-green-600">{message}</p>}
//         {error && <p className="mt-4 text-red-600">{error}</p>}

//         <div className="mt-4 flex justify-between items-center">
//           <Link href="/signin" className="text-sm text-blue-600 hover:underline">
//             Volver al Inicio de Sesión
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// const PasswordValidationIndicator = ({ isValid, label }) => (
//   <div className="flex items-center space-x-2">
//     <span className={`w-4 h-4 rounded-full ${isValid ? 'bg-green-500' : 'bg-red-500'}`} />
//     <Text className="text-sm">{label}</Text>
//   </div>
// );

// export default ChangePassword;


// NUEVO:

'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TextInput, Button, Text, Callout, Divider } from "@tremor/react";
import Link from "next/link";
import Image from "next/image";
import { 
  RiLockPasswordLine, 
  RiCheckboxCircleLine, 
  RiCloseCircleLine, 
  RiErrorWarningLine,
  RiArrowLeftLine,
  RiShieldKeyholeLine
} from "@remixicon/react";
import api from "@/app/api/apiService";

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState("");
  const [isActivation, setIsActivation] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const url = new URL(window.location.href);
    const tokenFromUrl = url.searchParams.get("token");
    setToken(tokenFromUrl || "");
    const payload = decodeJwtPayload(tokenFromUrl || "");
    setIsActivation(payload?.pr === "activate");
  }, []);

  const validatePassword = (password) => {
    return {
      lengthValid: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true);

    const validations = validatePassword(newPassword);
    const allValid = Object.values(validations).every(Boolean);

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setIsLoading(false);
      return;
    }

    if (!allValid) {
      setError("La contraseña no cumple con los requisitos de seguridad.");
      setIsLoading(false);
      return;
    }

    try {
      const endpoint = isActivation ? "/auth/activate" : "/auth/change-password";
      const { data } = await api.post(endpoint, { token, newPassword });
      setMessage(
        data?.message ||
          (isActivation
            ? "Cuenta activada correctamente. Redirigiendo..."
            : "Contraseña actualizada correctamente. Redirigiendo...")
      );
      setTimeout(() => router.push("/signin"), 2000);
    } catch (err) {
      setError(err?.response?.data?.message || "Error al actualizar la contraseña.");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordValidations = validatePassword(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  return (
    <div className="flex min-h-screen bg-white font-sans antialiased">
      {/* SECCIÓN FORMULARIO */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-[450px] xl:w-[550px] lg:px-20 bg-white shrink-0 z-40 shadow-2xl">
        <div className="mx-auto w-full max-w-sm">
          
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors mb-6 group tracking-widest uppercase">
              <RiArrowLeftLine className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              CANCELAR
            </Link>
            <Image
              alt="Previley Asesorías"
              src="https://firebasestorage.googleapis.com/v0/b/storage-previleyapp.appspot.com/o/previleApp%2FlogoAzul-web.png?alt=media&token=1b4fb56f-1179-41c1-95d3-6eec9649446e"
              width={180}
              height={50}
              priority
              className="object-contain mb-8 mx-auto lg:mx-0"
            />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Nueva Contraseña</h1>
            <p className="mt-2 text-sm text-slate-500">Crea una clave segura para proteger tu cuenta.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">Nueva Contraseña</label>
              <TextInput
                icon={RiLockPasswordLine}
                placeholder="••••••••"
                required
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-11"
              />
            </div>

            {/* INDICADORES DE VALIDACIÓN */}
            <div className="grid grid-cols-1 gap-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <ValidationItem isValid={passwordValidations.lengthValid} label="8+ caracteres" />
              <ValidationItem isValid={passwordValidations.hasUpperCase} label="Una mayúscula" />
              <ValidationItem isValid={passwordValidations.hasNumber} label="Un número" />
              <ValidationItem isValid={passwordsMatch} label="Las contraseñas coinciden" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">Confirmar Contraseña</label>
              <TextInput
                icon={RiLockPasswordLine}
                placeholder="••••••••"
                required
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11"
              />
            </div>

            {error && <Callout title="Atención" icon={RiErrorWarningLine} color="rose">{error}</Callout>}
            {message && <Callout title="Éxito" icon={RiCheckboxCircleLine} color="teal">{message}</Callout>}

            <Button
              className="w-full h-12 text-sm font-bold shadow-lg bg-[#1D4ED8] hover:bg-[#1e40af] transition-all transform active:scale-[0.97] border-none"
              type="submit"
              loading={isLoading}
            >
              ACTUALIZAR CONTRASEÑA
            </Button>
          </form>
        </div>
      </div>

      {/* SECCIÓN HERO (Ajuste de opacidad solicitado) */}
      <div className="hidden lg:relative lg:block lg:flex-1 bg-slate-100 overflow-hidden">
        {/* Gradiente más suave: Menos oscuro, más azulado profesional */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a]/60 via-transparent to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent z-10" />
        
        <img
          className="absolute inset-0 h-full w-full object-cover contrast-[1.05] brightness-90"
          src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80"
          alt="Seguridad Previley"
        />

        <div className="absolute bottom-28 left-20 z-20 max-w-xl">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl w-fit mb-8 border border-white/20">
            <RiShieldKeyholeLine className="text-white w-10 h-10" />
          </div>
          <h3 className="text-5xl font-black text-white leading-tight drop-shadow-md">
            Tu seguridad es <br/> nuestra prioridad.
          </h3>
          <p className="mt-6 text-xl text-white/90 font-medium max-w-md leading-relaxed">
            Utilizamos estándares de encriptación de grado bancario para asegurar que tu información corporativa esté siempre protegida.
          </p>
        </div>
      </div>
    </div>
  );
};

const decodeJwtPayload = (token) => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

// Componente auxiliar para las validaciones
const ValidationItem = ({ isValid, label }) => (
  <div className="flex items-center space-x-2 transition-all duration-300">
    {isValid ? (
      <RiCheckboxCircleLine className="w-4 h-4 text-teal-500" />
    ) : (
      <RiCloseCircleLine className="w-4 h-4 text-slate-300" />
    )}
    <span className={`text-xs font-medium ${isValid ? 'text-teal-700' : 'text-slate-500'}`}>
      {label}
    </span>
  </div>
);

export default ChangePassword;

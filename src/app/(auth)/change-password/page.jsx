// 'use client'
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { TextInput, Button, Text } from "@tremor/react";
// import Link from "next/link";
// import { ClipLoader } from "react-spinners"; // Importa el spinner que desees

// const ChangePassword = () => {
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false); // Estado para el loading
//   const [token, setToken] = useState(""); // Añadir para obtener el token de la URL
//   const router = useRouter();

//   useEffect(() => {
//     const url = new URL(window.location.href);
//     const tokenFromUrl = url.searchParams.get("token");
//     setToken(tokenFromUrl);
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
//     setIsLoading(true); // Iniciar el loading

//     if (newPassword !== confirmPassword) {
//       setError("Las contraseñas no coinciden");
//       setIsLoading(false); // Finalizar el loading
//       return;
//     }

//     const { lengthValid, hasUpperCase, hasLowerCase, hasNumber } = validatePassword(newPassword);
//     if (!lengthValid || !hasUpperCase || !hasLowerCase || !hasNumber) {
//       setError("La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula y un número.");
//       setIsLoading(false); // Finalizar el loading
//       return;
//     }

//     try {
//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ token, newPassword }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setMessage(data.message);
//         setTimeout(() => {
//           router.push("/signin");
//         }, 2000);
//       } else {
//         setError(data.error);
//       }
//     } catch (err) {
//       setError("Ocurrió un error. Por favor intenta de nuevo.");
//     } finally {
//       setIsLoading(false); // Finalizar el loading
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
//               <PasswordValidationIndicator
//                 isValid={passwordValidations.lengthValid}
//                 label="Al menos 8 caracteres"
//               />
//               <PasswordValidationIndicator
//                 isValid={passwordValidations.hasUpperCase}
//                 label="Al menos una letra mayúscula"
//               />
//               <PasswordValidationIndicator
//                 isValid={passwordValidations.hasLowerCase}
//                 label="Al menos una letra minúscula"
//               />
//               <PasswordValidationIndicator
//                 isValid={passwordValidations.hasNumber}
//                 label="Al menos un número"
//               />
//               <PasswordValidationIndicator
//                 isValid={passwordsMatch}
//                 label="Las contraseñas coinciden"
//               />
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
import { TextInput, Button, Text } from "@tremor/react";
import Link from "next/link";
import { ClipLoader } from "react-spinners";
import api from "@/app/api/apiService";

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState("");
  const router = useRouter();

  // Debug
  console.debug("NEXT_PUBLIC_API_URL =", process.env.NEXT_PUBLIC_API_URL);

  useEffect(() => {
    const url = new URL(window.location.href);
    const tokenFromUrl = url.searchParams.get("token");
    setToken(tokenFromUrl || "");
  }, []);

  const validatePassword = (password) => {
    const lengthValid = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    return { lengthValid, hasUpperCase, hasLowerCase, hasNumber };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setIsLoading(false);
      return;
    }

    const { lengthValid, hasUpperCase, hasLowerCase, hasNumber } = validatePassword(newPassword);
    if (!lengthValid || !hasUpperCase || !hasLowerCase || !hasNumber) {
      setError("La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula y un número.");
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await api.post("/auth/change-password", { token, newPassword });
      setMessage(data?.message || "Contraseña actualizada correctamente");
      setTimeout(() => router.push("/signin"), 2000);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Ocurrió un error. Por favor intenta de nuevo.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordValidations = validatePassword(newPassword);
  const passwordsMatch = newPassword === confirmPassword;

  return (
    <div className="flex min-h-screen items-center justify-center bg-azul-previley p-4">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-center text-xl font-semibold text-gray-900">CAMBIAR CONTRASEÑA</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Text className="block text-sm font-medium text-gray-700" htmlFor="new-password">
              Nueva Contraseña
            </Text>
            <TextInput
              className="w-full"
              id="new-password"
              placeholder="Nueva Contraseña"
              required
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <div className="mt-2">
              <PasswordValidationIndicator isValid={passwordValidations.lengthValid} label="Al menos 8 caracteres" />
              <PasswordValidationIndicator isValid={passwordValidations.hasUpperCase} label="Al menos una letra mayúscula" />
              <PasswordValidationIndicator isValid={passwordValidations.hasLowerCase} label="Al menos una letra minúscula" />
              <PasswordValidationIndicator isValid={passwordValidations.hasNumber} label="Al menos un número" />
              <PasswordValidationIndicator isValid={passwordsMatch} label="Las contraseñas coinciden" />
            </div>
          </div>

          <div className="space-y-2">
            <Text className="block text-sm font-medium text-gray-700" htmlFor="confirm-password">
              Confirmar Contraseña
            </Text>
            <TextInput
              className="w-full"
              id="confirm-password"
              placeholder="Confirmar Contraseña"
              required
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <Button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700" type="submit" disabled={isLoading}>
            {isLoading ? <ClipLoader size={20} color={"#ffffff"} /> : "Cambiar Contraseña"}
          </Button>
        </form>

        {isLoading && <p className="mt-4 text-gray-600">Cambiando contraseña...</p>}
        {message && <p className="mt-4 text-green-600">{message}</p>}
        {error && <p className="mt-4 text-red-600">{error}</p>}

        <div className="mt-4 flex justify-between items-center">
          <Link href="/signin" className="text-sm text-blue-600 hover:underline">
            Volver al Inicio de Sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

const PasswordValidationIndicator = ({ isValid, label }) => (
  <div className="flex items-center space-x-2">
    <span className={`w-4 h-4 rounded-full ${isValid ? 'bg-green-500' : 'bg-red-500'}`} />
    <Text className="text-sm">{label}</Text>
  </div>
);

export default ChangePassword;

'use client';

import { useEffect, useState } from "react";
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
  RiShieldKeyholeLine,
  RiKeyLine,
} from "@remixicon/react";
import api from "@/app/api/apiService";

const ActivateAccount = () => {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const url = new URL(window.location.href);
    const tokenFromUrl = url.searchParams.get("token");
    setToken(tokenFromUrl || "");
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

    if (!token) {
      setError("El token de activación es obligatorio.");
      setIsLoading(false);
      return;
    }

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
      const { data } = await api.post("/auth/activate", { token, newPassword });
      setMessage(data?.message || "Cuenta activada correctamente. Redirigiendo...");
      setTimeout(() => router.push("/signin"), 2000);
    } catch (err) {
      setError(err?.response?.data?.message || "Error al activar la cuenta.");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordValidations = validatePassword(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  return (
    <div className="flex min-h-screen bg-white font-sans antialiased">
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-[450px] xl:w-[550px] lg:px-20 bg-white shrink-0 z-40 shadow-2xl">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8">
            <Link href="/signin" className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors mb-6 group tracking-widest uppercase">
              <RiArrowLeftLine className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              VOLVER AL LOGIN
            </Link>
            <Image
              alt="Previley Asesorías"
              src="https://firebasestorage.googleapis.com/v0/b/storage-previleyapp.appspot.com/o/previleApp%2FlogoAzul-web.png?alt=media&token=1b4fb56f-1179-41c1-95d3-6eec9649446e"
              width={180}
              height={50}
              priority
              className="object-contain mb-8 mx-auto lg:mx-0"
            />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Activar Cuenta</h1>
            <p className="mt-2 text-sm text-slate-500">Define tu contraseña inicial para comenzar.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">Token de activación</label>
              <TextInput
                icon={RiKeyLine}
                placeholder="Pega tu token aquí"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="h-11"
              />
            </div>

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

            <div className="grid grid-cols-1 gap-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <ValidationItem isValid={passwordValidations.lengthValid} label="8+ caracteres" />
              <ValidationItem isValid={passwordValidations.hasUpperCase} label="1 mayúscula" />
              <ValidationItem isValid={passwordValidations.hasLowerCase} label="1 minúscula" />
              <ValidationItem isValid={passwordValidations.hasNumber} label="1 número" />
              <ValidationItem isValid={passwordsMatch} label="Coinciden" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">Confirmar Contraseña</label>
              <TextInput
                icon={RiShieldKeyholeLine}
                placeholder="••••••••"
                required
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11"
              />
            </div>

            {error && (
              <Callout title="Error" icon={RiErrorWarningLine} color="rose">
                {error}
              </Callout>
            )}

            {message && (
              <Callout title="Cuenta activada" icon={RiCheckboxCircleLine} color="teal">
                {message}
              </Callout>
            )}

            <Button
              className="w-full h-12 text-sm font-bold shadow-lg bg-[#1D4ED8] hover:bg-[#1e40af] transition-all transform active:scale-[0.97] border-none"
              type="submit"
              loading={isLoading}
            >
              ACTIVAR CUENTA
            </Button>
          </form>

          <footer className="mt-12 text-center">
            <Divider className="text-slate-300 text-[10px] uppercase tracking-widest">Soporte TI</Divider>
            <p className="mt-6 text-[10px] text-slate-400 uppercase tracking-[0.15em] leading-loose italic">
              Si el token expiró, solicita uno nuevo con el equipo de soporte.
            </p>
          </footer>
        </div>
      </div>

      <div className="hidden lg:relative lg:block lg:flex-1 bg-slate-950 overflow-hidden">
        <div className="absolute inset-0 bg-slate-950/30 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent z-20" />

        <img
          className="absolute inset-0 h-full w-full object-cover brightness-[0.5] contrast-[1.1]"
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80"
          alt="Activación Previley"
        />

        <div className="absolute bottom-28 left-20 z-30 max-w-xl pr-12">
          <h3 className="text-5xl font-black text-white leading-[1.1] mb-6 drop-shadow-lg">
            Seguridad y activación controlada.
          </h3>
          <p className="text-xl text-blue-50/80 font-light leading-relaxed border-l-4 border-blue-600 pl-6">
            Activa tu cuenta con un token de un solo uso y protege tus accesos con credenciales seguras.
          </p>
        </div>
      </div>
    </div>
  );
};

const ValidationItem = ({ isValid, label }) => (
  <div className="flex items-center gap-2 text-xs">
    {isValid ? (
      <RiCheckboxCircleLine className="text-emerald-500 w-4 h-4" />
    ) : (
      <RiCloseCircleLine className="text-rose-500 w-4 h-4" />
    )}
    <Text className="text-slate-600">{label}</Text>
  </div>
);

export default ActivateAccount;

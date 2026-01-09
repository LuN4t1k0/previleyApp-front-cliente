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
          
           src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80" // Imagen de equipo colaborando (más RRHH)
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
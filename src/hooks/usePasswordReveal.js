import { useState, useRef, useEffect } from "react";
import apiService from "@/app/api/apiService";
import { showErrorAlert } from "@/utils/alerts"; // Agregamos alertas de error

const usePasswordReveal = (timeoutDuration = 10) => {
  const [passwords, setPasswords] = useState({});
  const [loading, setLoading] = useState({});
  const [countdown, setCountdown] = useState({});
  const intervalRefs = useRef({});

  const revealPassword = async (credencialId) => {
    if (loading[credencialId] || intervalRefs.current[credencialId]) return;

    setLoading((prev) => ({ ...prev, [credencialId]: true }));

    try {
      const response = await apiService.get(`/empresa-credenciales/desencriptar/${credencialId}`);

      setPasswords((prev) => ({ ...prev, [credencialId]: response.data.password }));
      setCountdown((prev) => ({ ...prev, [credencialId]: timeoutDuration }));

      const newInterval = setInterval(() => {
        setCountdown((prevCountdown) => {
          const current = prevCountdown[credencialId];
          if (current > 1) {
            return { ...prevCountdown, [credencialId]: current - 1 };
          }
          clearInterval(intervalRefs.current[credencialId]);
          delete intervalRefs.current[credencialId];

          setPasswords((prevPass) => ({ ...prevPass, [credencialId]: "******" }));
          return { ...prevCountdown, [credencialId]: 0 };
        });
      }, 1000);

      intervalRefs.current[credencialId] = newInterval;
    } catch (error) {
      showErrorAlert("Error al desencriptar la contraseña", error.message);
    } finally {
      setLoading((prev) => ({ ...prev, [credencialId]: false }));
    }
  };

  useEffect(() => {
    return () => {
      Object.values(intervalRefs.current).forEach(clearInterval);
    };
  }, []);

  return { passwords, loading, countdown, revealPassword };
};

export default usePasswordReveal;

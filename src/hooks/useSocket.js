import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const useSocket = (token) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const joinedRooms = useRef(new Set());

  // Decodifica un JWT sin validar firma para extraer claims (solo cliente)
  const decodeJwt = (tkn) => {
    try {
      const [, payload] = String(tkn || '').split('.');
      if (!payload) return null;
      const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      return json || null;
    } catch (_) {
      return null;
    }
  };

  useEffect(() => {
    // Determinar URL del socket: env o mismo origen
    const baseUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      (typeof window !== "undefined" ? window.location.origin : undefined);

    if (!baseUrl) return;

    const socketInstance = io(baseUrl, {
      path: process.env.NEXT_PUBLIC_SOCKET_PATH || "/socket.io",
      // Enviar token tanto por query como por auth para compatibilidad
      query: { token },
      auth: { token },
      transports: ["polling", "websocket"],
      upgrade: true,
      // No enviamos credenciales (cookies) para evitar CORS con wildcard
      withCredentials: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 500,
    });

    // Cuando el socket se conecta
    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log("Conectado al servidor de WebSockets");
      // Intentar unirse explícitamente al room del usuario (backup por si el server no lo hace)
      try {
        const claims = decodeJwt(token);
        const uid = claims?.id || claims?.userId || claims?.sub;
        if (uid) {
          socketInstance.emit("room:join", { type: "user", id: uid });
        }
      } catch (_) {}
    });

    // Cuando el socket se desconecta
    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      console.log("Desconectado del servidor de WebSockets");
    });

    socketInstance.on("connect_error", (err) => {
      console.warn("Socket connect_error:", err?.message);
    });

    setSocket(socketInstance);

    // Limpieza al desmontar el componente
    return () => {
      socketInstance.disconnect();
    };
  }, [token]);

  const joinRoom = (type, id) => {
    if (!socket || !type || !id) return;
    const key = `${type}:${id}`;
    if (!joinedRooms.current.has(key)) {
      socket.emit("room:join", { type, id });
      joinedRooms.current.add(key);
    }
  };

  const leaveRoom = (type, id) => {
    if (!socket || !type || !id) return;
    const key = `${type}:${id}`;
    if (joinedRooms.current.has(key)) {
      socket.emit("room:leave", { type, id });
      joinedRooms.current.delete(key);
    }
  };

  return { socket, isConnected, joinRoom, leaveRoom };
};

export default useSocket;

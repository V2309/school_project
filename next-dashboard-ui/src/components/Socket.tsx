"use client";

import { useEffect, useState } from "react";

import { socket } from "@/socket";

import { useUser } from "@/hooks/useUser";

export default function Socket() {
  const [isConnected, setIsConnected] = useState(false);

  const [transport, setTransport] = useState("N/A");

  const { user } = useUser();

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true); // <-- Bạn đang set state ở đây

      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false); // <-- Và ở đây

      setTransport("N/A");
    }

    socket.on("connect", onConnect);

    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);

      socket.off("disconnect", onDisconnect);
    };
  }, []);

  // Separate useEffect for user registration

  useEffect(() => {
    // === DÒNG ĐÃ SỬA (logic bên trong) ===

    // Dùng state 'isConnected' thay vì 'socket.connected'

    if (user && isConnected) {
      console.log("Registering user with socket:", user.username);

      socket.emit("newUser", user.username);
    }

    // === DÒNG ĐÃ SỬA (dependency array) ===

    // Lắng nghe state 'user' và state 'isConnected'
  }, [user, isConnected]);

  return <span></span>;
}

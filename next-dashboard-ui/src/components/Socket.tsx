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
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);
      
      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
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
    if (user && socket.connected) {
      console.log("Registering user with socket:", user.username);
      socket.emit("newUser", user.username);
    }
  }, [user?.id]); // Only depend on user.id to avoid unnecessary re-runs

  return (
    <span></span>
  );
}
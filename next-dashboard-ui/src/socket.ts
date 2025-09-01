"use client";

import { io } from "socket.io-client";

// Specify explicit URL for socket connection
export const socket = io("http://localhost:3000", {
  transports: ["websocket", "polling"],
});
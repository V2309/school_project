// lib/pusher-client.ts
"use client";

import PusherClient from "pusher-js";

// Kiểm tra các biến môi trường
if (!process.env.NEXT_PUBLIC_PUSHER_KEY) {
  throw new Error("NEXT_PUBLIC_PUSHER_KEY not set");
}
if (!process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
  throw new Error("NEXT_PUBLIC_PUSHER_CLUSTER not set");
}

export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    // Đây là phần quan trọng để xác thực kênh riêng tư
    authEndpoint: "/api/pusher/auth",
    authTransport: "ajax",
  }
);
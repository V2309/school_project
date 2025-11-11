// lib/actions/chat.action.ts
"use server";

import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher-server";
import { getCurrentUser } from "@/hooks/auth";

interface SendMessagePayload {
  content: string;
  classCode: string;
}

export async function sendMessage(payload: SendMessagePayload) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { content, classCode } = payload;
  if (!content || !classCode) {
    return { success: false, error: "Missing content or class code" };
  }

  try {
    // 1. Lưu tin nhắn vào Database
    const newMessage = await prisma.message.create({
      data: {
        content: content,
        classCode: classCode,
        userId: user.id as string,
      },
      include: {
        user: { // Lấy thông tin người gửi để bắn đi
          select: { username: true, img: true }
        }
      }
    });

    // 2. "Bắn" (trigger) sự kiện Pusher
    // Tên kênh (ví dụ: 'presence-class-WIBEZ')
    const channelName = `presence-class-${classCode}`;
    const eventName = "new-message";

    // Data gửi đi (phải chứa cả thông tin user)
    const eventPayload = {
      id: newMessage.id,
      content: newMessage.content,
      createdAt: newMessage.createdAt,
      user: {
        id: user.id,
        username: newMessage.user.username,
        img: newMessage.user.img,
      }
    };

    await pusherServer.trigger(channelName, eventName, eventPayload);

    return { success: true, data: newMessage };

  } catch (error) {
    console.error("Send message error:", error);
    return { success: false, error: "Internal server error" };
  }
}
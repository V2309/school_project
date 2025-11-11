// app/api/pusher/auth/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/hooks/auth"; 
import { pusherServer } from "@/lib/pusher-server"; 

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await request.formData();
    const socketId = data.get("socket_id") as string;
    const channel = data.get("channel_name") as string;

    // --- SỬA LỖI Ở ĐÂY ---
    // Cung cấp CẢ 'id' (cho Presence) VÀ 'user_id' (cho Private)
    const userData = {
      id: user.id as string,
      user_id: user.id as string, // <-- THÊM DÒNG NÀY
      user_info: {
        username: user.username,
        img: user.img,
      }
    };
    // -----------------------

    // *** HỖ TRỢ CẢ HAI KÊNH ***
    let finalAuthResponse;
    if (channel.startsWith('presence-')) {
      // Dùng authenticateUser (sẽ lấy 'id' và 'user_info')
      finalAuthResponse = pusherServer.authenticateUser(socketId, userData);
    } else {
      // Dùng authorizeChannel (sẽ lấy 'user_id' và 'user_info')
      finalAuthResponse = pusherServer.authorizeChannel(socketId, channel, userData);
    }
    
    return NextResponse.json(finalAuthResponse);

  } catch (error) {
    console.error("Pusher Auth Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
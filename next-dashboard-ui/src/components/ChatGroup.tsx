// components/ChatBox.tsx
"use client";

import { useEffect, useState, useRef, FormEvent } from "react";
import { useUser } from "@/hooks/useUser";
import { pusherClient } from "@/lib/pusher-client";
import { type Channel, type Members } from "pusher-js";
import { sendMessage } from "@/lib/actions/chat.action";
import { toast } from "react-toastify";

import Image from "next/image";
// Type cho tin nhắn
interface ChatGroupMessage {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    img: string | null;
  };
}

// Type cho thành viên online (từ Presence Channel)
interface Member {
  id: string;
  info: {
    username: string;
    img: string | null;
  };
}

// Type cho thành viên trong lớp (bao gồm cả online và offline)
interface ClassMember {
  id: string;
  username: string;
  img: string | null;
  isOnline: boolean;
  lastSeen?: Date;
}

// Type cho thông báo hệ thống
interface SystemMessage {
  id: string;
  type: 'system';
  content: string;
  createdAt: string;
}

interface ChatBoxProps {
  classCode: string;
  initialMessages: ChatGroupMessage[]; // Tải tin nhắn cũ từ Server Component
  allMembers?: ClassMember[]; // Tất cả thành viên trong lớp
}

export function ChatBox({ classCode, initialMessages, allMembers = [] }: ChatBoxProps) {
  const { user } = useUser();
  const [messages, setMessages] = useState<(ChatGroupMessage | SystemMessage)[]>(initialMessages);
  const [onlineMembers, setOnlineMembers] = useState<Member[]>([]);
  const [classMembers, setClassMembers] = useState<ClassMember[]>(allMembers);
  const [newMessage, setNewMessage] = useState("");
  const channelRef = useRef<Channel | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!user || !classCode) return;

    // 1. Tên kênh PHẢI BẮT ĐẦU BẰNG 'presence-'
    const channelName = `presence-class-${classCode}`;
    
    // 2. Subscribe kênh
    const channel = pusherClient.subscribe(channelName);
    channelRef.current = channel;

    // 3. Lắng nghe sự kiện "new-message" (tin nhắn mới)
    channel.bind("new-message", (data: ChatGroupMessage) => {
      // Thêm tin nhắn mới vào state
      // (Lọc ra tin nhắn của chính mình nếu đã tự thêm)
      setMessages((prev) => {
        if (prev.find(msg => msg.id === data.id)) return prev;
        return [...prev, data];
      });
    });

    // 4. Lắng nghe "who's online" (Presence Events)
    
    // Khi subscribe thành công (bạn là người mới vào)
    channel.bind("pusher:subscription_succeeded", (members: Members) => {
      const memberArray: Member[] = [];
      members.each((member: Member) => memberArray.push(member));
      setOnlineMembers(memberArray);
      
      // Cập nhật trạng thái online cho class members
      setClassMembers((prev) => 
        prev.map(m => ({
          ...m,
          isOnline: memberArray.some(om => om.id === m.id)
        }))
      );
    });

    // Khi có người mới tham gia
    channel.bind("pusher:member_added", (member: Member) => {
      setOnlineMembers((prev) => [...prev, member]);
      
      // Cập nhật trạng thái online trong classMembers
      setClassMembers((prev) => 
        prev.map(m => 
          m.id === member.id ? { ...m, isOnline: true } : m
        )
      );

      // Thêm thông báo hệ thống
      const systemMessage: SystemMessage = {
        id: `system-join-${Date.now()}`,
        type: 'system',
        content: `${member.info.username} đã tham gia chat`,
        createdAt: new Date().toISOString()
      };
      setMessages((prev) => [...prev, systemMessage]);
    });

    // Khi có người rời đi
    channel.bind("pusher:member_removed", (member: Member) => {
      setOnlineMembers((prev) => prev.filter(m => m.id !== member.id));
      
      // Cập nhật trạng thái offline và lastSeen trong classMembers
      setClassMembers((prev) => 
        prev.map(m => 
          m.id === member.id ? { ...m, isOnline: false, lastSeen: new Date() } : m
        )
      );

      // Thêm thông báo hệ thống
      const systemMessage: SystemMessage = {
        id: `system-leave-${Date.now()}`,
        type: 'system', 
        content: `${member.info.username} đã rời khỏi chat`,
        createdAt: new Date().toISOString()
      };
      setMessages((prev) => [...prev, systemMessage]);
    });

    // 5. Dọn dẹp
    return () => {
      pusherClient.unsubscribe(channelName);
      channelRef.current = null;
    };

  }, [user, classCode]);

  // Hàm gửi tin nhắn
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const optimisticId = `temp-${Date.now()}`;
    const optimisticMessage: ChatGroupMessage = {
      id: optimisticId,
      content: newMessage,
      createdAt: new Date().toISOString(),
      user: {
        id: user.id,
        username: user.username,
        img: user.img || null,
      },
    };

    // Thêm tin nhắn của mình vào UI ngay lập tức
    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage("");

    // Gửi lên server
    const result = await sendMessage({ content: newMessage, classCode });
    
    if (result.error) {
      toast.error(result.error);
      // Xóa tin nhắn lạc quan nếu lỗi
      setMessages((prev) => prev.filter(msg => msg.id !== optimisticId));
    }
    // (Không cần làm gì khi thành công, vì Pusher sẽ gửi lại)
  };

  return (
    <div className="flex h-full">
      {/* Cột chính (Chat) */}
      <div className="flex-1 flex flex-col h-full">
        {/* Khung chat (cuộn) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            // Render system message ở giữa
            if ('type' in msg && msg.type === 'system') {
              return (
                <div key={msg.id} className="flex justify-center">
                  <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {msg.content}
                  </span>
                </div>
              );
            }
            
            // Render normal chat message
            const chatMsg = msg as ChatGroupMessage;
            return (
              <div key={chatMsg.id} className={`flex gap-3 ${chatMsg.user.id === user?.id ? "justify-end" : "justify-start"}`}>
                {/* Avatar */}
                {chatMsg.user.id !== user?.id && (
                  <Image src={chatMsg.user.img || '/default-avatar.png'} alt="avatar" width={32} height={32} className="rounded-full"/>
                )}
                {/* Bubble chat */}
                <div className={`p-3 rounded-lg max-w-xs ${chatMsg.user.id === user?.id ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}>
                  <p className="text-sm">{chatMsg.content}</p>
                  <p className="text-xs opacity-70 mt-1">{new Date(chatMsg.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Khung nhập liệu */}
        <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 border rounded-full px-4 py-2"
            disabled={!user}
          />
          <button type="submit" className="bg-blue-500 text-white rounded-full px-4 py-2" disabled={!user}>
            Gửi
          </button>
        </form>
      </div>

      {/* Cột phụ (All members) */}
      <div className="w-64 border-l p-4 h-full overflow-y-auto">
        <h3 className="font-bold mb-2">
          Thành viên ({classMembers.length})
          <span className="text-green-500 text-sm font-normal ml-1">
            • {onlineMembers.length} online
          </span>
        </h3>
        <ul className="space-y-3">
          {classMembers.map((member) => {
            const isOnline = onlineMembers.some(om => om.id === member.id);
            return (
              <li key={member.id} className="flex items-center gap-3 text-sm">
                <div className="relative">
                  <Image 
                    src={member.img || '/default-avatar.png'} 
                    alt="avatar" 
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  {/* Dot trạng thái online */}
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                    isOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {member.username}
                  </p>
                  {isOnline ? (
                    <p className="text-xs text-green-600">Đang online</p>
                  ) : member.lastSeen ? (
                    <p className="text-xs text-gray-500">
                      {formatLastSeen(member.lastSeen)}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500">Offline</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// Helper function để format thời gian last seen
function formatLastSeen(lastSeen: Date): string {
  const now = new Date();
  const diff = now.getTime() - lastSeen.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'Vừa mới offline';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  
  return lastSeen.toLocaleDateString('vi-VN');
}
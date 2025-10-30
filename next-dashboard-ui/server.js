import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

// Tối ưu: Sử dụng Map thay vì Array cho tìm kiếm nhanh hơn
const onlineUsers = new Map();

const addUser = (username, socketId) => {
  if (!onlineUsers.has(socketId)) {
    onlineUsers.set(socketId, { username, socketId });
    if (dev) console.log(`${username} connected`);
  }
};

const removeUser = (socketId) => {
  const user = onlineUsers.get(socketId);
  if (user) {
    onlineUsers.delete(socketId);
    if (dev) console.log(`${user.username} disconnected`);
  }
};

const getUserByUsername = (username) => {
  for (const [, user] of onlineUsers) {
    if (user.username === username) return user;
  }
  return null;
};

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    // Tối ưu Socket.IO
    pingTimeout: 60000,
    pingInterval: 25000,
    cors: {
      origin: dev ? "http://localhost:3000" : false,
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    if (dev) console.log(`Socket connected: ${socket.id}`);

    socket.on("newUser", (username) => {
      if (username) {
        addUser(username, socket.id);
      }
    });

    socket.on("sendNotification", ({ receiverUsername, data }) => {
      if (!receiverUsername || !data) return;
      
      const receiver = getUserByUsername(receiverUsername);
      
      if (receiver) {
        io.to(receiver.socketId).emit("getNotification", {
          id: uuidv4(),
          timestamp: Date.now(),
          ...data,
        });
        if (dev) console.log(`Notification sent to: ${receiverUsername}`);
      } else {
        if (dev) console.log(`User ${receiverUsername} not online`);
      }
    });

    socket.on("disconnect", (reason) => {
      removeUser(socket.id);
      if (dev) console.log(`Socket disconnected: ${reason}`);
    });

    // Tối ưu: Handle errors
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error("Server error:", err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(` Server ready on http://${hostname}:${port}`);
      console.log(` Environment: ${dev ? 'development' : 'production'}`);
    });
});
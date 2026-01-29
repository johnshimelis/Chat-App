import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { prisma } from "./lib/prisma";

const onlineUsers = new Map<string, string>(); // userId -> socketId


const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("Client connected", socket.id);

    socket.on("join_user", (userId) => {
      socket.join(userId);
      onlineUsers.set(userId, socket.id);
      io.emit("user_status", { userId, status: "online" });
    });

    socket.on("send_message", async (message) => {
      try {
        // Handle poll messages
        let pollData = null;
        if (message.type === 'poll' && message.metadata) {
          try {
            const metadata = JSON.parse(message.metadata);
            pollData = {
              question: metadata.question,
              options: JSON.stringify(metadata.options)
            };
          } catch (e) {
            console.error("Error parsing poll metadata:", e);
          }
        }

        // Save to DB
        const savedMessage = await prisma.message.create({
          data: {
            content: message.content,
            senderId: message.senderId,
            receiverId: message.receiverId,
            isRead: false,
            type: message.type || 'text',
            metadata: message.metadata || null
          },
          include: {
            sender: true,
            receiver: true
          }
        });

        // Create poll if needed
        if (pollData && savedMessage) {
          await prisma.poll.create({
            data: {
              messageId: savedMessage.id,
              question: pollData.question,
              options: pollData.options
            }
          });
        }

        // Emit to receiver
        io.to(message.receiverId).emit("new_message", savedMessage);
        // Emit back to sender (so they have the real ID/timestamp)
        socket.emit("message_sent", savedMessage);

      } catch (e) {
        console.error("Error saving message:", e);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id);
      // Find userId from socket.id
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          io.emit("user_status", { userId, status: "offline" });
          break;
        }
      }
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});

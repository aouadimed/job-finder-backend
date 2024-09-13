const socketIO = require("socket.io");

const initializeSocket = (server) => {
  const io = socketIO(server, {
    pingTimeout: 60000,
    cors: {
      origin: process.env.BASE_URL,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Connected to socket");

    // Setup user socket
    socket.on("setup", (userId) => {
      socket.join(userId);
      socket.broadcast.emit("online-user", userId);
      console.log(`User ${userId} is online`);
    });

    // Handle typing event
    socket.on("typing", (room) => {
      console.log(`User is typing in room ${room}`);
      socket.to(room).emit("typing", room);
    });

    // Handle stop typing event
    socket.on("stop-typing", (room) => {
      console.log(`User stopped typing in room ${room}`);
      socket.to(room).emit("stop-typing", room);
    });

    // Join a specific chat room
    socket.on("join chat", (room) => {
      console.log(`User joined room ${room}`);
      socket.join(room);
    });

    // Handle new message event
    socket.on("new message", (newMessageReceived) => {
      const chat = newMessageReceived.chat;
      const room = chat._id;
      const sender = newMessageReceived.sender;
    
      if (!sender || !sender._id || !chat || !chat._id) {
        console.log("Sender or Chat not defined");
        return;
      }
    
      console.log(`Message sent by user ${sender._id} to room ${room}`);
    
      // Emitting to the specific room
      socket.to(room).emit("message-received", newMessageReceived);
    });
    

    // Handle user disconnecting
    socket.on("disconnect", () => {
      console.log("User disconnected");
    });

    // Clean up on socket off
    socket.off("setup", () => {
      console.log("User offline");
      socket.leave(userId);
    });
  });
};

module.exports = initializeSocket;

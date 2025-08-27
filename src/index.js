import dotenv from "dotenv";
import connectDB from "./Database/index.js";
import app from "./app.js";

import { ensureDirectoryExists } from "./Utils/Helper.js";
import { createAdmin } from "./Utils/createAdmin.js";


import http from "http";
import { Server } from "socket.io";


dotenv.config();

const port = process.env.PORT;

const server = http.createServer(app);
// Initialize Socket.io server 
export const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
});

//socket connection handler
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});


connectDB()
  .then(() => {
    server.listen(port, () => {
      ensureDirectoryExists("./public/temp");
      console.log(`Server is running on port ${port}`);
      createAdmin();
    });


    // export { io };
  })
  .catch((err) => {
    console.log("MONGODB connnection failed: ", err);
  });

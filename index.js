import dotenv from "dotenv";
import express from "express";
import cors from "cors";
// import path from "path";
import http from "http";
import userRouter from "./routes/userRoutes.js";
import chatRouter from "./routes/chatRoutes.js";
import messageRouter from "./routes/messageRouter.js";
import { errorHandler, notFound } from "./middlewares/error.js";
import { Server } from "socket.io";
import connectDB from "./config/db.js";

dotenv.config();
connectDB();

const port =  process.env.PORT;

const app = express();

const server = http.createServer(app);
app.use(express.json());
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors({
  origin: "https://subodh-chat-app-client.vercel.app/"
}));

app.get("/",(req,res)=>{
    res.send("Welcome to Subodh Chat App Server");
});

app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);


app.use(notFound);
app.use(errorHandler);

server.listen(port, console.log(`listening at port ${port}`));

const io = new Server(server);
io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User joined room : " + room);
  });
  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;
    if (!chat.users) return console.log("chat.users not defined");
    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;
      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });
  socket.on("typing", (room) => {
    socket.in(room).emit("typing");
  });
  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing");
  });

  socket.off("setup",()=>{
      console.log("USER DISCONNECTED");
      socket.leave(userData._id)
  })
});
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { chats } from "./data/data.js";
import mongoose from "mongoose";
import path from "path";
import userRouter from "./routes/userRoutes.js";
import chatRouter from "./routes/chatRoutes.js";
import messageRouter from "./routes/messageRouter.js";
import { errorHandler,notFound } from "./middlewares/error.js";
import { Server } from "socket.io";

dotenv.config();
const port = process.env.PORT;


const app = express();
app.use(express.json({limit:"30mb",extended:true}));
app.use(express.urlencoded({limit:"30mb",extended: true}));
app.use(cors());


// app.get("/",(req,res)=>{
//     res.send("Hello world");
// });

app.use('/api/user',userRouter);
app.use('/api/chat',chatRouter);
app.use('/api/message',messageRouter);

// ---------------Deployment----------------

const __dirname1 = path.resolve();
console.log(__dirname1);
console.log(process.env.NODE_ENV);
if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname1,"/build")));
    app.get("*",(req,res)=>{
        res.sendFile(path.resolve(__dirname1,"build","index.html"));
    })
}else{
    app.get("/",(req,res)=>{
        res.send("Hello world");
    });
}

// ---------------Deployment----------------

app.use(notFound);
app.use(errorHandler);


mongoose.connect(process.env.DB_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
    const server = app.listen(port,console.log(`listening at port ${port}`));
    const io = new Server(server,{
        pingTimeout: 5000,
        transports: ['websocket'],
        cors: {
            origin: "http://localhost:3000"
        }
    })
    io.on("connection",(socket)=>{
        console.log("Connected to socket.io");
        socket.on('setup',(userData)=>{
            socket.join(userData._id);
            socket.emit("connected");
        })
        socket.on("join chat",(room)=>{
            socket.join(room);
            console.log("User joined room : "+ room);
        })
        socket.on("new message",(newMessageRecieved)=>{
            var chat = newMessageRecieved.chat;
            if(!chat.users) return console.log("chat.users not defined");
            chat.users.forEach((user)=>{
                if(user._id == newMessageRecieved.sender._id) return;
                socket.in(user._id).emit("message recieved",newMessageRecieved);
            })
        })
        socket.on("typing",(room)=>{
            socket.in(room).emit("typing");
        })
        socket.on("stop typing",(room)=>{
            socket.in(room).emit("stop typing");
        })

        socket.off("setup",()=>{
            console.log("USER DISCONNECTED");
            socket.leave(userData._id)
        })
    })
}).catch((error)=>{
    console.log(error);
})
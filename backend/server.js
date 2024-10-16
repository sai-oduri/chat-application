const express = require("express");

const dotenv = require("dotenv");

const userRoutes = require("./routes/userRoutes.js");
const chatRoutes = require("./routes/chatRoutes.js");
const messageRoutes = require("./routes/messageRoutes.js");

const { chats } = require("./data/data.js")

const connectDB = require("./config/db.js")

dotenv.config();

const { notFound, errorHandler } = require("./middleware/errorMiddleware.js")

connectDB();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("API is Running");
})

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => { console.log(`Server Started on PORT ${PORT}`) });

const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:5173",
    },
});

io.on("connection", (socket) => {

    console.log('connected to socket.io');

    socket.on("setup", (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
    });

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User joined Room: " + room);
    });

    socket.on("typing", (room) => {
        socket.in(room).emit("typing");
    });

    socket.on("stop typing", (room) => {
        socket.in(room).emit("stop typing");
    })

    socket.on("new message", (newMessageReceived) => {
        var chat = newMessageReceived.chat;

        if (!chat.users) return console.log("chat users not defined")

        chat.users.forEach(user => {
            if (user._id == newMessageReceived.sender._id) return;

            socket.in(user._id).emit("message received", newMessageReceived);
        });
    });

    socket.off("setup", () => {
        console.log("User Disconnected");
        socket.leave(userData._id);
    });

})
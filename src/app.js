const express = require("express");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const conversationRoutes = require("./routes/conversation.routes");
const messageRoutes = require("./routes/message.routes");
const privateMessageRoutes = require("./routes/private-message.routes");

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/conversations/:conversationId/messages", messageRoutes);
app.use("/api/messages", privateMessageRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Telegram backend is running"
    });
});

module.exports = app;
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const { createClient } = require("redis");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const presenceService = require("../services/presence.service");
const conversationService = require("../services/conversation.service");

const setupSocket = async (httpServer) => {
    const io = new Server(httpServer, {
        cors: { origin: process.env.CLIENT_ORIGIN || "*" },
    });

    if (process.env.REDIS_URL) {
        const pubClient = createClient({ url: process.env.REDIS_URL });
        const subClient = pubClient.duplicate();
        await Promise.all([pubClient.connect(), subClient.connect()]);
        const { createAdapter } = require("@socket.io/redis-adapter");
        io.adapter(createAdapter(pubClient, subClient));
    }

    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.userId;
            next();
        } catch (error) {
            next(new Error("Invalid or expired token"));
        }
    });

    io.on("connection", async (socket) => {
        const userId = socket.userId;
        await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });
        await presenceService.setPresence(userId, true);

        const conversations = await Conversation.find({ "members.user": userId }).select("_id");
        conversations.forEach((conversation) => socket.join(`conversation:${conversation._id}`));
        socket.join(`user:${userId}`);

        socket.on("send-message", async ({ conversationId, content, replyTo, forwardedFrom }, callback = () => {}) => {
            try {
                const conversation = await Conversation.findOne({ _id: conversationId, "members.user": userId });
                if (!conversation) throw new Error("Conversation not found");
                if (!conversationService.canPostMessages(conversation, userId)) {
                    throw new Error("Only channel admins can post messages");
                }
                const message = await Message.create({ conversation: conversationId, sender: userId, content, replyTo, forwardedFrom });
                await message.populate("sender", "username displayName avatarUrl");
                io.to(`conversation:${conversationId}`).emit("new-message", message);
                callback({ ok: true, message });
            } catch (error) {
                callback({ ok: false, message: error.message });
            }
        });

        socket.on("edit-message", async ({ messageId, content }, callback = () => {}) => {
            const message = await Message.findOneAndUpdate({ _id: messageId, sender: userId, deletedAt: null }, { content, editedAt: new Date() }, { new: true });
            if (message) io.to(`conversation:${message.conversation}`).emit("message-edited", message);
            callback({ ok: Boolean(message), message });
        });

        socket.on("delete-message", async ({ messageId }, callback = () => {}) => {
            const message = await Message.findOneAndUpdate({ _id: messageId, sender: userId, deletedAt: null }, { content: "", deletedAt: new Date() }, { new: true });
            if (message) io.to(`conversation:${message.conversation}`).emit("message-deleted", { messageId, conversationId: message.conversation });
            callback({ ok: Boolean(message) });
        });

        socket.on("typing", ({ conversationId, isTyping }) => {
            socket.to(`conversation:${conversationId}`).emit("typing", { conversationId, userId, isTyping });
        });

        socket.on("read-messages", async ({ conversationId, messageIds }) => {
            await Message.updateMany({ _id: { $in: messageIds }, conversation: conversationId }, { $pull: { readBy: { user: userId } } });
            await Message.updateMany({ _id: { $in: messageIds }, conversation: conversationId }, { $push: { readBy: { user: userId, readAt: new Date() } } });
            io.to(`conversation:${conversationId}`).emit("read-receipt", { conversationId, messageIds, userId });
        });

        socket.on("disconnect", async () => {
            const activeSockets = await io.in(`user:${userId}`).fetchSockets();
            if (!activeSockets.length) {
                await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
                await presenceService.setPresence(userId, false);
            }
        });
    });

    return io;
};

module.exports = setupSocket;

const Message = require("../models/Message");
const conversationService = require("../services/conversation.service");

const send = async (req, res) => {
    try {
        const conversation = await conversationService.getConversationForMember(req.params.conversationId, req.user.userId);
        if (!conversationService.canPostMessages(conversation, req.user.userId)) {
            return res.status(403).json({ message: "Only channel admins can post messages" });
        }
        const message = await Message.create({
            conversation: req.params.conversationId,
            sender: req.user.userId,
            content: req.body.content,
            replyTo: req.body.replyTo || null,
            forwardedFrom: req.body.forwardedFrom || null,
        });
        await message.populate("sender", "username displayName avatarUrl");
        res.status(201).json({ message });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const sendPrivate = async (req, res) => {
    try {
        const username = String(req.body.username || "").trim();
        const content = String(req.body.message || "").trim();
        if (!username || !content) {
            return res.status(400).json({ message: "username and message are required" });
        }

        const { conversation } = await conversationService.getOrCreatePrivateConversation(
            req.user.userId,
            username
        );
        const message = await Message.create({
            conversation: conversation._id,
            sender: req.user.userId,
            content,
        });
        await message.populate("sender", "username displayName avatarUrl");
        res.status(201).json({ conversation, message });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const list = async (req, res) => {
    try {
        await conversationService.getConversationForMember(req.params.conversationId, req.user.userId);
        const limit = Math.min(Number(req.query.limit) || 50, 100);
        const query = { conversation: req.params.conversationId, deletedAt: null };
        if (req.query.before) query.createdAt = { $lt: new Date(req.query.before) };
        const messages = await Message.find(query)
            .populate("sender", "username displayName avatarUrl")
            .sort({ createdAt: -1 })
            .limit(limit);
        res.json({ messages, nextCursor: messages.length ? messages[messages.length - 1].createdAt : null });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

const search = async (req, res) => {
    try {
        await conversationService.getConversationForMember(req.params.conversationId, req.user.userId);
        const messages = await Message.find({
            conversation: req.params.conversationId,
            deletedAt: null,
            $text: { $search: String(req.query.q || "") },
        }).populate("sender", "username displayName").sort({ createdAt: -1 }).limit(50);
        res.json({ messages });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const edit = async (req, res) => {
    const message = await Message.findOneAndUpdate(
        { _id: req.params.messageId, sender: req.user.userId, deletedAt: null },
        { $set: { content: req.body.content, editedAt: new Date() } },
        { new: true, runValidators: true }
    );
    if (!message) return res.status(404).json({ message: "Message not found or not owned by you" });
    res.json({ message });
};

const remove = async (req, res) => {
    const message = await Message.findOneAndUpdate(
        { _id: req.params.messageId, sender: req.user.userId, deletedAt: null },
        { $set: { deletedAt: new Date(), content: "" } },
        { new: true }
    );
    if (!message) return res.status(404).json({ message: "Message not found or not owned by you" });
    res.json({ message });
};

const markRead = async (req, res) => {
    try {
        await conversationService.getConversationForMember(req.params.conversationId, req.user.userId);
        await Message.updateMany(
            { _id: { $in: req.body.messageIds || [] }, conversation: req.params.conversationId },
            { $pull: { readBy: { user: req.user.userId } } }
        );
        await Message.updateMany(
            { _id: { $in: req.body.messageIds || [] }, conversation: req.params.conversationId },
            { $push: { readBy: { user: req.user.userId, readAt: new Date() } } }
        );
        res.json({ message: "Messages marked as read" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { send, sendPrivate, list, search, edit, remove, markRead };

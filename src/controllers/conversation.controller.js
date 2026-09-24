const Conversation = require("../models/Conversation");
const conversationService = require("../services/conversation.service");

const create = async (req, res) => {
    try {
        const conversation = await conversationService.createConversation({
            ...req.body,
            ownerId: req.user.userId,
        });
        res.status(201).json({ conversation });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const list = async (req, res) => {
    const conversations = await Conversation.find({ "members.user": req.user.userId })
        .populate("members.user", "username displayName avatarUrl isOnline lastSeen")
        .sort({ updatedAt: -1 });
    res.json({ conversations });
};

const getOne = async (req, res) => {
    try {
        const conversation = await conversationService.getConversationForMember(req.params.conversationId, req.user.userId);
        await conversation.populate("members.user", "username displayName avatarUrl isOnline lastSeen");
        res.json({ conversation });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

const addMember = async (req, res) => {
    try {
        const conversation = await conversationService.getConversationForMember(req.params.conversationId, req.user.userId);
        if (!conversationService.canManageMembers(conversation, req.user.userId)) {
            return res.status(403).json({ message: "Admin permissions required" });
        }
        conversation.members.addToSet({ user: req.body.userId, role: "member" });
        await conversation.save();
        res.status(201).json({ conversation });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const removeMember = async (req, res) => {
    try {
        const conversation = await conversationService.getConversationForMember(req.params.conversationId, req.user.userId);
        if (!conversationService.canManageMembers(conversation, req.user.userId)) {
            return res.status(403).json({ message: "Admin permissions required" });
        }
        conversation.members = conversation.members.filter((entry) => String(entry.user) !== req.params.userId);
        await conversation.save();
        res.json({ conversation });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const leave = async (req, res) => {
    const conversation = await conversationService.getConversationForMember(req.params.conversationId, req.user.userId);
    conversation.members = conversation.members.filter((entry) => String(entry.user) !== String(req.user.userId));
    await conversation.save();
    res.json({ message: "Left conversation" });
};

const join = async (req, res) => {
    const conversation = await Conversation.findOne({
        _id: req.params.conversationId,
        type: "channel",
    });

    if (!conversation) {
        return res.status(404).json({ message: "Channel not found" });
    }

    conversation.members.addToSet({ user: req.user.userId, role: "member" });
    await conversation.save();
    res.json({ conversation });
};

const updateRole = async (req, res) => {
    try {
        const conversation = await conversationService.getConversationForMember(req.params.conversationId, req.user.userId);
        if (!conversationService.canManageMembers(conversation, req.user.userId)) {
            return res.status(403).json({ message: "Admin permissions required" });
        }
        const member = conversation.members.find((entry) => String(entry.user) === req.params.userId);
        if (!member || !["admin", "member"].includes(req.body.role)) {
            return res.status(400).json({ message: "Invalid member or role" });
        }
        member.role = req.body.role;
        await conversation.save();
        res.json({ conversation });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { create, list, getOne, addMember, removeMember, leave, join, updateRole };

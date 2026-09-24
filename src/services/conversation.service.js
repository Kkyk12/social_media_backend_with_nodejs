const Conversation = require("../models/Conversation");
const User = require("../models/User");
const Message = require("../models/Message");

const getConversationForMember = async (conversationId, userId) => {
    const conversation = await Conversation.findOne({
        _id: conversationId,
        "members.user": userId,
    });

    if (!conversation) {
        throw new Error("Conversation not found");
    }

    return conversation;
};

const createConversation = async ({ type, title, description, ownerId, memberIds = [] }) => {
    const uniqueMemberIds = [...new Set([String(ownerId), ...memberIds.map(String)])];
    if (type === "private" && uniqueMemberIds.length !== 2) {
        throw new Error("Private conversations require exactly two members");
    }

    const users = await User.countDocuments({ _id: { $in: uniqueMemberIds } });
    if (users !== uniqueMemberIds.length) {
        throw new Error("One or more members do not exist");
    }

    return Conversation.create({
        type,
        title,
        description,
        owner: ownerId,
        members: uniqueMemberIds.map((user, index) => ({
            user,
            role: index === 0 ? "owner" : "member",
        })),
    });
};

const canManageMembers = (conversation, userId) => {
    const member = conversation.members.find((entry) => String(entry.user) === String(userId));
    return member && ["owner", "admin"].includes(member.role);
};

const canPostMessages = (conversation, userId) => {
    if (conversation.type !== "channel") return true;
    return canManageMembers(conversation, userId);
};

const getOrCreatePrivateConversation = async (userId, username) => {
    const recipient = await User.findOne({ username: username.toLowerCase() });
    if (!recipient) throw new Error("Recipient username not found");
    if (String(recipient._id) === String(userId)) {
        throw new Error("You cannot start a private conversation with yourself");
    }

    let conversation = await Conversation.findOne({
        type: "private",
        "members.user": { $all: [userId, recipient._id] },
    });

    if (!conversation) {
        conversation = await createConversation({
            type: "private",
            ownerId: userId,
            memberIds: [recipient._id],
        });
    }

    return { conversation, recipient };
};

const getUserInbox = async (userId) => {
    const conversations = await Conversation.find({ "members.user": userId })
        .populate("members.user", "username displayName avatarUrl isOnline lastSeen")
        .sort({ updatedAt: -1 })
        .limit(20);

    return Promise.all(conversations.map(async (conversation) => {
        const messageQuery = { conversation: conversation._id, deletedAt: null };
        const [recentMessages, unreadCount] = await Promise.all([
            Message.find(messageQuery)
                .populate("sender", "username displayName avatarUrl")
                .sort({ createdAt: -1 })
                .limit(20),
            Message.countDocuments({
                ...messageQuery,
                sender: { $ne: userId },
                "readBy.user": { $ne: userId },
            }),
        ]);

        return {
            conversation,
            recentMessages,
            lastMessage: recentMessages[0] || null,
            unreadCount,
        };
    }));
};

module.exports = {
    getConversationForMember,
    createConversation,
    canManageMembers,
    canPostMessages,
    getOrCreatePrivateConversation,
    getUserInbox,
};

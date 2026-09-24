const User = require("../models/User");
const cacheService = require("../services/cache.service");

const publicUserFields = "-passwordHash -blockedUsers -email";

const getMe = async (req, res) => {
    const user = await User.findById(req.user.userId)
        .select("-passwordHash");

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    res.json({
        user
    });
};

const updateProfile = async (req, res) => {
    try {
        const allowedFields = ["username", "displayName", "bio", "avatarUrl"];
        const updates = Object.fromEntries(
            allowedFields
                .filter((field) => req.body[field] !== undefined)
                .map((field) => [field, req.body[field]])
        );

        if (!Object.keys(updates).length) {
            return res.status(400).json({ message: "At least one profile field is required" });
        }

        if (updates.username) {
            updates.username = updates.username.toLowerCase();
            const existingUser = await User.findOne({
                username: updates.username,
                _id: { $ne: req.user.userId }
            });

            if (existingUser) {
                return res.status(409).json({ message: "Username already exists" });
            }
        }

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select("-passwordHash -blockedUsers");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ user });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const searchUsers = async (req, res) => {
    const query = String(req.query.q || "").trim();
    const limit = Math.min(Number(req.query.limit) || 20, 50);

    if (query.length < 2) {
        return res.status(400).json({ message: "Search query must be at least 2 characters" });
    }

    const cacheKey = `user-search:${req.user.userId}:${query.toLowerCase()}:${limit}`;
    const cachedUsers = await cacheService.get(cacheKey);
    if (cachedUsers) {
        return res.json({ users: cachedUsers });
    }

    const users = await User.find({
        $or: [
            { username: { $regex: query, $options: "i" } },
            { displayName: { $regex: query, $options: "i" } }
        ],
        _id: { $ne: req.user.userId }
    }).select(publicUserFields).limit(limit);

    await cacheService.set(cacheKey, users, 30);
    res.json({ users });
};

const setPresence = async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user.userId,
        { $set: { isOnline: Boolean(req.body.isOnline), lastSeen: new Date() } },
        { new: true }
    ).select(publicUserFields);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
};

const blockUser = async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user.userId,
        { $addToSet: { blockedUsers: req.params.userId } },
        { new: true }
    ).select(publicUserFields);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User blocked" });
};

const unblockUser = async (req, res) => {
    await User.findByIdAndUpdate(req.user.userId, {
        $pull: { blockedUsers: req.params.userId }
    });

    res.json({ message: "User unblocked" });
};

module.exports = {
    getMe,
    updateProfile,
    searchUsers,
    setPresence,
    blockUser,
    unblockUser
};

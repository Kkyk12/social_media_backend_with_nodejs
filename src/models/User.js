const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minlength: 3,
        maxlength: 32,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    displayName: {
        type: String,
        trim: true,
        maxlength: 64,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        maxlength: 160,
    },
    avatarUrl: {
        type: String,
        maxlength: 500,
    },
    isOnline: {
        type: Boolean,
        default: false,
    },
    lastSeen: {
        type: Date,
        default: Date.now,
    },
    blockedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
}, {
    timestamps: true,
});

userSchema.index({ username: "text", displayName: "text" });

module.exports = mongoose.model("User", userSchema);

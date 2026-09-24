const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["owner", "admin", "member"], default: "member" },
    joinedAt: { type: Date, default: Date.now },
}, { _id: false });

const conversationSchema = new mongoose.Schema({
    type: { type: String, enum: ["private", "group", "channel"], required: true },
    title: { type: String, trim: true, maxlength: 120 },
    description: { type: String, maxlength: 500 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: { type: [memberSchema], default: [] },
}, { timestamps: true });

conversationSchema.index({ "members.user": 1, updatedAt: -1 });
conversationSchema.index({ type: 1, owner: 1 });

module.exports = mongoose.model("Conversation", conversationSchema);

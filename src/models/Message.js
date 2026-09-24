const mongoose = require("mongoose");

const readReceiptSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    readAt: { type: Date, default: Date.now },
}, { _id: false });

const messageSchema = new mongoose.Schema({
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, maxlength: 4000, trim: true },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null },
    forwardedFrom: { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null },
    editedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
    readBy: { type: [readReceiptSchema], default: [] },
}, { timestamps: true });

messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ conversation: 1, content: "text" });

module.exports = mongoose.model("Message", messageSchema);

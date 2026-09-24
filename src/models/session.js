const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        refreshTokenHash: {
            type: String,
            required: true
        },

        userAgent: {
            type: String,
            default: null
        },

        ipAddress: {
            type: String,
            default: null
        },

        expiresAt: {
            type: Date,
            required: true,
            index: true
        },

        revokedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Session", sessionSchema);
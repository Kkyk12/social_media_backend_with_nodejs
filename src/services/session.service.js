const Session = require("../models/session");

const {
    generateAccessToken,
    generateRefreshToken,
    hashRefreshToken
} = require("./token.service");

const refreshSession = async (refreshToken) => {
    const refreshTokenHash = hashRefreshToken(refreshToken);

    const session = await Session.findOne({
        refreshTokenHash,
        revokedAt: null,
        expiresAt: {
            $gt: new Date()
        }
    });

    if (!session) {
        throw new Error("Invalid or expired refresh token");
    }

    const newAccessToken = generateAccessToken(session.userId);

    const newRefreshToken = generateRefreshToken();

    session.refreshTokenHash = hashRefreshToken(
        newRefreshToken
    );

    await session.save();

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
    };
};
const logoutSession = async (refreshToken) => {
    const refreshTokenHash = hashRefreshToken(refreshToken);

    const session = await Session.findOne({
        refreshTokenHash,
        revokedAt: null
    });

    if (!session) {
        throw new Error("Invalid session");
    }

    session.revokedAt = new Date();

    await session.save();

    return true;
};

const logoutAllSessions = async (userId) => {
    await Session.updateMany(
        {
            userId,
            revokedAt: null
        },
        {
            $set: {
                revokedAt: new Date()
            }
        }
    );

    return true;
};

module.exports = {
    refreshSession,
    logoutSession,
    logoutAllSessions
};
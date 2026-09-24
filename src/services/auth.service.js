const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Session = require("../models/session");

const {
    generateAccessToken,
    generateRefreshToken,
    hashRefreshToken
} = require("./token.service");

const registerUser = async ({
    username,
    email,
    password,
    displayName
}) => {
    const existingUser = await User.findOne({
        $or: [
            { username },
            { email }
        ]
    });

    if (existingUser) {
        throw new Error("Username or email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
        username,
        email,
        passwordHash,
        displayName
    });

    return user;
};

const loginUser = async ({
    email,
    password,
    userAgent,
    ipAddress
}) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("Invalid email or password");
    }

    const passwordMatch = await bcrypt.compare(
        password,
        user.passwordHash
    );

    if (!passwordMatch) {
        throw new Error("Invalid email or password");
    }

    const accessToken = generateAccessToken(user._id);

    const refreshToken = generateRefreshToken();

    const refreshTokenHash = hashRefreshToken(refreshToken);

    const expiresAt = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
    );

    const session = await Session.create({
        userId: user._id,
        refreshTokenHash,
        userAgent,
        ipAddress,
        expiresAt
    });

    return {
        user,
        accessToken,
        refreshToken,
        sessionId: session._id
    };
};
console.log("generateAccessToken:", generateAccessToken);
module.exports = {
    registerUser,
    loginUser
};
const authService = require("../services/auth.service");
const sessionService = require("../services/session.service");
const register = async (req, res) => {
    try {
        const {
            username,
            email,
            password,
            displayName
        } = req.body;

        const user = await authService.registerUser({
            username,
            email,
            password,
            displayName
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                displayName: user.displayName
            }
        });

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};
const login = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        const result = await authService.loginUser({
            email,
            password,
            userAgent: req.get("user-agent"),
            ipAddress: req.ip
        });

        res.json({
            message: "Login successful",

            accessToken: result.accessToken,

            refreshToken: result.refreshToken,

            user: {
                id: result.user._id,
                username: result.user.username,
                email: result.user.email,
                displayName: result.user.displayName
            }
        });

    } catch (error) {
        res.status(401).json({
            message: error.message
        });
    }
};
const refresh = async (req, res) => {
    try {
        const {
            refreshToken
        } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                message: "Refresh token is required"
            });
        }

        const result = await sessionService.refreshSession(
            refreshToken
        );

        res.json(result);

    } catch (error) {
        res.status(401).json({
            message: error.message
        });
    }
};

const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                message: "Refresh token is required"
            });
        }

        await sessionService.logoutSession(refreshToken);

        res.json({
            message: "Logged out successfully"
        });

    } catch (error) {
        res.status(401).json({
            message: error.message
        });
    }
};

const logoutAll = async (req, res) => {
    try {
        await sessionService.logoutAllSessions(req.user.userId);

        res.json({
            message: "Logged out from all sessions successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    register,
    login,
    refresh,
    logout,
    logoutAll
};
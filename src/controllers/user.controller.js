const User = require("../models/User");

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

module.exports = {
    getMe
};
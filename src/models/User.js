const moongose = require("mongoose");


const userSchema = new moongose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 32,

    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true, 
    },
    passwordHash: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        maxlength: 160,
    },
    lastSeen: {
        type: Date,
        default: Date.now,
    }}
);

module.exports = moongose.model("User", userSchema);

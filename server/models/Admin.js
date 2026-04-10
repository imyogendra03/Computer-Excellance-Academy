const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
    },
    name: {
        type: String,
        default: "Administrator",
        trim: true,
    },
    password: {
        type: String,
    },
    role: {
        type: String,
        default: "admin",
        enum: ["admin"]
    },
    lastLoginAt: {
        type: Date,
    },
    currentSessionId: {
        type: String,
        default: null,
    },
    refreshToken: {
        type: String,
        default: null,
    },
}, 
{
    timestamps: true
}
);

module.exports = mongoose.model("Admin", adminSchema);
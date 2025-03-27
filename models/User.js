const mongoose = require("mongoose"); // Mongoose pour travailler avec MongoDB.

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "parent", "driver"]} // Ajoute un rôle
}, { timestamps: true }); // Crée un nouveau schéma Mongoose nommé UserSchema pour définir la structure des documents "User".

module.exports = mongoose.model("User", UserSchema);

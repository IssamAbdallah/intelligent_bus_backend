const mongoose = require("mongoose"); // Mongoose pour définir des schémas et modèles MongoDB.

const BusSchema = new mongoose.Schema({
    number: { type: String, required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Référence à l'utilisateur
    capacity: { type: Number, required: true },
    route: { type: String, required: true }
}, { timestamps: true }); // Crée un nouveau schéma Mongoose nommé BusSchema pour définir la structure des documents "Bus".

module.exports = mongoose.model("Bus", BusSchema);

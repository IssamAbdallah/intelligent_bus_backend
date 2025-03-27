const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connecté à MongoDB");
    } catch (error) {
        console.error("❌ Erreur MongoDB :", error);
        process.exit(1); // Stopper le serveur en cas d'échec
    }
};

module.exports = connectDB;

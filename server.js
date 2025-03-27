const express = require("express"); // Importe le framework Express.js pour créer une application web/server.
const mongoose = require("mongoose"); // Importe Mongoose, une bibliothèque pour interagir avec MongoDB.
const cors = require("cors"); // Importe le middleware CORS pour permettre les requêtes cross-origin.
require("dotenv").config(); // Charge les variables d'environnement depuis un fichier .env.

// Importation des routes
const userRoutes = require("./routes/userRoutes");
const busRoutes = require("./routes/busRoutes");

const app = express(); // Crée une instance de l'application Express.
const PORT = process.env.PORT || 5000; // Définit le port du serveur : utilise la variable d'environnement PORT ou 5000 par défaut.

// Middleware
app.use(cors()); // Active le middleware CORS pour toutes les routes.
app.use(express.json());  // Middleware pour parser le JSON

// Routes
app.use("/api/users", userRoutes); // Monte les routes des utilisateurs sur le chemin "/api/users".
app.use("/api/buses", busRoutes); // Monte les routes des bus sur le chemin "/api/buses".

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  // Établit la connexion à MongoDB en utilisant l'URI stockée dans les variables d'environnement, avec des options pour éviter les avertissements.
    .then(() => console.log("MongoDB connecté")) // Si la connexion réussit, affiche un message de succès dans la console.
    .catch(err => console.error(err)); // En cas d'erreur de connexion, affiche l'erreur dans la console.

// Lancer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Initialisation de l'app
const app = express();
app.use(express.json());
app.use(cors());

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true, // Utilise le nouveau parser d'URL de MongoDB (option recommandée).
  useUnifiedTopology: true, // Utilise le nouveau moteur de gestion de topologie pour MongoDB.
})
.then(() => console.log("Connecté à MongoDB"))
.catch(err => console.log("Erreur MongoDB :", err));

// Route test
app.get("/", (req, res) => {
  res.send("Smart Bus Backend API fonctionne !");
});

// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

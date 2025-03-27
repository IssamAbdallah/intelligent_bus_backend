const express = require("express");
const router = express.Router(); // Crée un routeur Express pour organiser les routes liées aux bus.
const Bus = require("../models/Bus"); // Importe le modèle Bus défini dans "../models/Bus" pour interagir avec la collection des bus.
const { verifyToken } = require("../middleware/authMiddleware"); // Importe la fonction verifyToken depuis un middleware d'authentification pour protéger les routes.

// Ajouter un bus
router.post("/", verifyToken, async (req, res) => {
    try {
        const { number, driver, capacity, route } = req.body;
        
        // Créer un nouveau bus
        const bus = new Bus({
            number,
            driver,
            capacity,
            route
        });

        // Sauvegarder le bus dans la base de données
        await bus.save();
        res.status(201).json({ message: "Bus ajouté avec succès", bus });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// Récupérer tous les bus
router.get("/", verifyToken, async (req, res) => {
    try {
        const buses = await Bus.find().populate("driver", "name email role"); // Populate pour récupérer les infos du driver
        res.status(200).json(buses); // envoie une réponse avec statut 200 (OK) et la liste des bus en JSON.
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

module.exports = router; // Exporte le routeur pour qu'il puisse être utilisé dans l'application principale

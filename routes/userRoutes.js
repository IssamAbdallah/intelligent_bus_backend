const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

// Route d'inscription
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "Utilisateur déjà inscrit" });
        }

        // Vérifier que le rôle est valide
        const validRoles = ["admin", "parent", "driver"];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: "Rôle invalide" });
        }

        // Hasher le mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Créer un nouvel utilisateur
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role
        });

        await user.save();
        res.status(201).json({ message: "Utilisateur créé avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// Route de connexion
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Vérifier si l'utilisateur existe
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Utilisateur non trouvé" });
        }

        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Mot de passe incorrect" });
        }

        // Générer un token JWT
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// Route pour mettre à jour le rôle d'un utilisateur
router.put("/update-role/:id", async (req, res) => {
    try {
        const { role } = req.body;

        // Vérifier que le rôle est valide
        const validRoles = ["admin", "parent", "driver"];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: "Rôle invalide" });
        }

        // Mettre à jour l'utilisateur
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.json({ message: "Rôle mis à jour avec succès", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

module.exports = router;

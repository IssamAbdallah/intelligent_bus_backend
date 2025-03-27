const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    // Récupère le token depuis l'en-tête Authorization
    const token = req.header("Authorization") && req.header("Authorization").startsWith("Bearer ") ? req.header("Authorization").split(" ")[1] : null;

    if (!token) {
        return res.status(401).json({ message: "Accès refusé, token manquant" });
    }

    try {
        const decoded = jwt.verify(token, "secretkey"); // Vérifie le token
        req.user = decoded;  // Ajoute les infos de l'utilisateur dans la requête
        next();
    } catch (error) {
        res.status(400).json({ message: "Token invalide" });
    }
};

module.exports = { verifyToken };

const jwt = require("jsonwebtoken");
const User = require("./models/user");

const adminAuth = async (req, res, next) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({ message: "Accès refusé, token manquant" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
        const user = await User.findById(decoded.id);

        if (!user || user.role !== "admin") {
            return res.status(403).json({ message: "Accès interdit, admin requis" });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: "Token invalide" });
    }
};

module.exports = adminAuth;

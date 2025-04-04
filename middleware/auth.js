const jwt = require('jsonwebtoken');

const isAdmin = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extrait le token après "Bearer"
  if (!token) return res.status(401).json({ message: 'Token requis' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Token invalide' });
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Accès réservé aux admins' });
    req.user = decoded;
    next();
  });
};

module.exports = { isAdmin };
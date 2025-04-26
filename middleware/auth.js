const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  console.log('authHeader:', authHeader);
  if (!authHeader) {
    console.log('Erreur auth: Aucun en-tête Authorization fourni');
    return res.status(401).json({ message: 'Aucun en-tête Authorization fourni' });
  }

  const token = authHeader.replace('Bearer ', '');
  console.log('Token extrait:', token);
  if (!token) {
    console.log('Erreur auth: Token manquant après "Bearer"');
    return res.status(401).json({ message: 'Token manquant après "Bearer"' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token décodé:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.log('Erreur auth: Échec de vérification du token', error.message);
    res.status(401).json({ message: 'Token invalide ou expiré', error: error.message });
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user) {
    console.log('Erreur isAdmin: req.user est undefined');
    return res.status(403).json({ message: 'Accès interdit : utilisateur non authentifié' });
  }
  if (req.user.role !== 'admin') {
    console.log('Erreur isAdmin: rôle non autorisé', req.user.role);
    return res.status(403).json({ message: 'Accès interdit : réservé aux administrateurs' });
  }
  console.log('isAdmin: Accès autorisé pour admin');
  next();
};

module.exports = { auth, isAdmin };
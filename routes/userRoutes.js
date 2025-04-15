const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isAdmin } = require('../middleware/auth');
const router = express.Router();

// Créer un compte parent (par l’admin)
router.post('/add-parent', isAdmin, async (req, res) => {
  const { username, password, email, firstName, lastName, cin, fcmToken } = req.body;

  try {
    // Vérifier si l’utilisateur ou l’email existe déjà
    const existingUser = await User.findOne({ $or: [{ username }, { email }, { cin }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Utilisateur, email ou CIN déjà pris' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newParent = new User({
      username,
      password: hashedPassword,
      email,
      role: 'parent', // Toujours parent
      firstName,
      lastName,
      cin,
      fcmToken,
    });
    await newParent.save();

    res.status(201).json({
      message: 'Parent créé avec succès',
      user: { id: newParent._id, username, email, role: newParent.role, firstName, lastName, cin }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création du parent', error });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Utilisateur non trouvé' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mot de passe incorrect' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, username, role: user.role, firstName: user.firstName, lastName: user.lastName, cin: user.cin } });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la connexion', error });
  }
});

module.exports = router;
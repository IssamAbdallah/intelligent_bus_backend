const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Students');
const { isAdmin } = require('../middleware/auth');
const router = express.Router();

// Créer un compte parent
router.post('/add-parent', isAdmin, async (req, res) => {
  const { username, password, email, firstName, lastName, cin, fcmToken } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }, { cin }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Utilisateur, email ou CIN déjà pris' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newParent = new User({
      username,
      password: hashedPassword,
      email,
      role: 'parent',
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

    const tokenOptions = user.role === 'admin' ? { expiresIn: '30m' } : {}; // 30 min pour admin, pas d'expiration pour parent
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      tokenOptions
    );
    res.json({
      token,
      user: {
        id: user._id,
        username,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        cin: user.cin
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la connexion', error });
  }
});

// Récupérer la liste des parents
router.get('/parents', isAdmin, async (req, res) => {
  try {
    const parents = await User.find({ role: 'parent' }).select('username email firstName lastName cin fcmToken');
    res.json(parents);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des parents', error });
  }
});

// Modifier un parent
router.put('/parents/:id', isAdmin, async (req, res) => {
  const { username, email, firstName, lastName, cin, fcmToken } = req.body;

  try {
    const parent = await User.findById(req.params.id);
    if (!parent || parent.role !== 'parent') {
      return res.status(404).json({ message: 'Parent non trouvé' });
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }, { cin }],
      _id: { $ne: req.params.id },
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Utilisateur, email ou CIN déjà pris' });
    }

    parent.username = username || parent.username;
    parent.email = email || parent.email;
    parent.firstName = firstName || parent.firstName;
    parent.lastName = lastName || parent.lastName;
    parent.cin = cin || parent.cin;
    parent.fcmToken = fcmToken || parent.fcmToken;

    await parent.save();

    res.json({
      message: 'Parent mis à jour avec succès',
      user: {
        id: parent._id,
        username: parent.username,
        email: parent.email,
        role: parent.role,
        firstName: parent.firstName,
        lastName: parent.lastName,
        cin: parent.cin,
        fcmToken: parent.fcmToken,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du parent', error });
  }
});

// Supprimer un parent
router.delete('/parents/:id', isAdmin, async (req, res) => {
  try {
    const parent = await User.findById(req.params.id);
    if (!parent || parent.role !== 'parent') {
      return res.status(404).json({ message: 'Parent non trouvé' });
    }

    const hasStudents = await Student.findOne({ parentId: parent.cin });
    if (hasStudents) {
      return res.status(400).json({ message: 'Impossible de supprimer : ce parent a des élèves associés' });
    }

    await parent.deleteOne();
    res.json({ message: 'Parent supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du parent', error });
  }
});

module.exports = router;
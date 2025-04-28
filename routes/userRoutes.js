const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Students');
const { auth, isAdmin } = require('../middleware/auth');
const router = express.Router();

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - username
 *               - password
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Erreur de connexion
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// Connexion (POST)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Utilisateur non trouvé' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mot de passe incorrect' });
    }

    const tokenOptions = user.role === 'admin' ? { expiresIn: '30m' } : {};
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      tokenOptions
    );
    console.log('Token généré pour', username, ':', { id: user._id, role: user.role });
    res.json({
      token,
      user: {
        id: user._id,
        username,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        cin: user.cin,
        phoneNumber: user.phoneNumber,
        fcmToken: user.fcmToken,
      },
    });
  } catch (error) {
    console.error('Erreur login:', error.message);
    res.status(500).json({ message: 'Erreur lors de la connexion', error });
  }
});

/**
 * @swagger
 * /api/users/add-parent:
 *   post:
 *     summary: Créer un parent
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               cin:
 *                 type: number
 *               phoneNumber:
 *                 type: number
 *               fcmToken:
 *                 type: string
 *             required:
 *               - username
 *               - password
 *               - email
 *               - firstName
 *               - lastName
 *               - cin
 *               - phoneNumber
 *     responses:
 *       201:
 *         description: Parent créé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Créer un compte parent (POST)
router.post('/add-parent', auth, isAdmin, async (req, res) => {
  const { username, password, email, firstName, lastName, cin, phoneNumber, fcmToken } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }, { cin }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Utilisateur, email ou CIN déjà pris' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newParent = new User({
      username,
      password: hashedPassword,
      email,
      role: 'parent',
      firstName,
      lastName,
      cin,
      phoneNumber,
      fcmToken,
    });
    await newParent.save();

    res.status(201).json({
      message: 'Parent créé avec succès',
      user: {
        id: newParent._id,
        username,
        email,
        role: newParent.role,
        firstName,
        lastName,
        cin,
        phoneNumber,
        fcmToken,
      },
    });
  } catch (error) {
    console.error('Erreur add-parent:', error.message);
    res.status(500).json({ message: 'Erreur lors de la création du parent', error: error.message });
  }
});

/**
 * @swagger
 * /api/users/parents:
 *   get:
 *     summary: Lister tous les parents
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des parents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Récupérer la liste des parents (GET)
router.get('/parents', auth, isAdmin, async (req, res) => {
  try {
    const parents = await User.find({ role: 'parent' }).select('username email firstName lastName cin phoneNumber fcmToken');
    res.json(parents);
  } catch (error) {
    console.error('Erreur get-parents:', error.message);
    res.status(500).json({ message: 'Erreur lors de la récupération des parents', error });
  }
});

/**
 * @swagger
 * /api/users/parents/{id}:
 *   get:
 *     summary: Récupérer un parent par ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID MongoDB du parent
 *     responses:
 *       200:
 *         description: Parent récupéré
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Parent non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Récupérer un parent par ID (GET)
router.get('/parents/:id', auth, isAdmin, async (req, res) => {
  try {
    const parent = await User.findById(req.params.id).select('username email firstName lastName cin phoneNumber fcmToken');
    if (!parent || parent.role !== 'parent') {
      return res.status(404).json({ message: 'Parent non trouvé' });
    }
    res.json(parent);
  } catch (error) {
    console.error('Erreur get-parent:', error.message);
    res.status(500).json({ message: 'Erreur lors de la récupération du parent', error });
  }
});

/**
 * @swagger
 * /api/users/parents/{id}:
 *   put:
 *     summary: Modifier un parent
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID MongoDB du parent
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               cin:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               fcmToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Parent mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Parent non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Modifier un parent (PUT)
router.put('/parents/:id', auth, isAdmin, async (req, res) => {
  const { username, email, firstName, lastName, cin, phoneNumber, fcmToken } = req.body;

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
    parent.phoneNumber = phoneNumber || parent.phoneNumber;
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
        phoneNumber: parent.phoneNumber,
        fcmToken: parent.fcmToken,
      },
    });
  } catch (error) {
    console.error('Erreur update-parent:', error.message);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du parent', error: error.message });
  }
});

/**
 * @swagger
 * /api/users/parents/{id}:
 *   delete:
 *     summary: Supprimer un parent
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID MongoDB du parent
 *     responses:
 *       200:
 *         description: Parent supprimé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Impossible de supprimer
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Parent non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Supprimer un parent (DELETE)
router.delete('/parents/:id', auth, isAdmin, async (req, res) => {
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
    console.error('Erreur delete-parent:', error.message);
    res.status(500).json({ message: 'Erreur lors de la suppression du parent', error });
  }
});

module.exports = router;
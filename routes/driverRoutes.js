const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver');
const Bus = require('../models/Bus');
const { auth, isAdmin } = require('../middleware/auth');

/**
 * @swagger
 * /api/drivers/add:
 *   post:
 *     summary: Créer un conducteur
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               cin:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - cin
 *               - phoneNumber
 *     responses:
 *       200:
 *         description: Conducteur créé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 driver:
 *                   $ref: '#/components/schemas/Driver'
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
// Créer un conducteur (POST)
router.post('/add', auth, isAdmin, async (req, res) => {
  const { firstName, lastName, email, cin, phoneNumber } = req.body;
  try {
    const existingDriver = await Driver.findOne({ cin }, { email });
    if (existingDriver) {
      return res.status(400).json({ message: 'CIN déjà pris' });
    }
    const driver = new Driver({ firstName, lastName, email, cin, phoneNumber });
    await driver.save();
    res.json({ message: 'Conducteur créé avec succès', driver });
  } catch (error) {
    console.error('Erreur add-driver:', error.message);
    res.status(500).json({ message: 'Erreur lors de la création du conducteur', error: error.message });
  }
});

/**
 * @swagger
 * /api/drivers:
 *   get:
 *     summary: Lister tous les conducteurs
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des conducteurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Driver'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Lister tous les conducteurs (GET)
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.json(drivers);
  } catch (error) {
    console.error('Erreur get-drivers:', error.message);
    res.status(500).json({ message: 'Erreur lors de la récupération des conducteurs', error });
  }
});

/**
 * @swagger
 * /api/drivers/{id}:
 *   get:
 *     summary: Récupérer un conducteur par ID
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID MongoDB du conducteur
 *     responses:
 *       200:
 *         description: Conducteur récupéré
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Driver'
 *       404:
 *         description: Conducteur non trouvé
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
// Récupérer un conducteur par ID (GET)
router.get('/:id', auth, isAdmin, async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Conducteur non trouvé' });
    }
    res.json(driver);
  } catch (error) {
    console.error('Erreur get-driver:', error.message);
    res.status(500).json({ message: 'Erreur lors de la récupération du conducteur', error });
  }
});

/**
 * @swagger
 * /api/drivers/{id}:
 *   put:
 *     summary: Modifier un conducteur
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID MongoDB du conducteur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               cin:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Conducteur mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 driver:
 *                   $ref: '#/components/schemas/Driver'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Conducteur non trouvé
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
// Modifier un conducteur (PUT)
router.put('/:id', auth, isAdmin, async (req, res) => {
  const { firstName, lastName, email, cin, phoneNumber } = req.body;
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Conducteur non trouvé' });
    }
    if (cin && cin !== driver.cin) {
      const existingDriver = await Driver.findOne({ cin } , { email });
      if (existingDriver) {
        return res.status(400).json({ message: 'CIN déjà pris' });
      }
    }
    driver.firstName = firstName || driver.firstName;
    driver.lastName = lastName || driver.lastName;
    driver.email = email || driver.email;
    driver.cin = cin || driver.cin;
    driver.phoneNumber = phoneNumber || driver.phoneNumber;
    await driver.save();
    res.json({ message: 'Conducteur mis à jour avec succès', driver });
  } catch (error) {
    console.error('Erreur update-driver:', error.message);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du conducteur', error: error.message });
  }
});

/**
 * @swagger
 * /api/drivers/{id}:
 *   delete:
 *     summary: Supprimer un conducteur
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID MongoDB du conducteur
 *     responses:
 *       200:
 *         description: Conducteur supprimé
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
 *         description: Conducteur non trouvé
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
// Supprimer un conducteur (DELETE)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Conducteur non trouvé' });
    }
    const busWithDriver = await Bus.findOne({ $or: [{ driverId1: driver.cin }, { driverId2: driver.cin }] });
    if (busWithDriver) {
      return res.status(400).json({ message: 'Impossible de supprimer : ce conducteur est associé à un bus' });
    }
    await driver.deleteOne();
    res.json({ message: 'Conducteur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur delete-driver:', error.message);
    res.status(500).json({ message: 'Erreur lors de la suppression du conducteur', error });
  }
});

module.exports = router;
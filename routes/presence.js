const express = require('express');
const router = express.Router();
const Presence = require('../models/Presence');
const Student = require('../models/Students');
const Bus = require('../models/Bus');
const { auth, isAdmin } = require('../middleware/auth');

/**
 * @swagger
 * /api/presences/add:
 *   post:
 *     summary: Créer une présence
 *     tags: [Presences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: string
 *               busId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [present, absent]
 *             required:
 *               - studentId
 *               - busId
 *               - status
 *     responses:
 *       200:
 *         description: Présence créée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 presence:
 *                   $ref: '#/components/schemas/Presence'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Élève ou bus non trouvé
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
// Créer une présence (POST)
router.post('/add', auth, isAdmin, async (req, res) => {
  const { studentId, busId, status } = req.body;
  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Élève non trouvé' });
    }
    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({ message: 'Bus non trouvé' });
    }
    const presence = new Presence({ studentId, busId, status });
    await presence.save();
    res.json({ message: 'Présence créée avec succès', presence });
  } catch (error) {
    console.error('Erreur add-presence:', error.message);
    res.status(500).json({ message: 'Erreur lors de la création de la présence', error });
  }
});

/**
 * @swagger
 * /api/presences:
 *   get:
 *     summary: Lister toutes les présences
 *     tags: [Presences]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des présences
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Presence'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Lister toutes les présences (GET)
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const presences = await Presence.find().populate('studentId', 'firstName lastName').populate('busId', 'number');
    res.json(presences);
  } catch (error) {
    console.error('Erreur get-presences:', error.message);
    res.status(500).json({ message: 'Erreur lors de la récupération des présences', error });
  }
});

/**
 * @swagger
 * /api/presences/{id}:
 *   get:
 *     summary: Récupérer une présence par ID
 *     tags: [Presences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID MongoDB de la présence
 *     responses:
 *       200:
 *         description: Présence récupérée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Presence'
 *       404:
 *         description: Présence non trouvée
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
// Récupérer une présence par ID (GET)
router.get('/:id', auth, isAdmin, async (req, res) => {
  try {
    const presence = await Presence.findById(req.params.id)
      .populate('studentId', 'firstName lastName')
      .populate('busId', 'number');
    if (!presence) {
      return res.status(404).json({ message: 'Présence non trouvée' });
    }
    res.json(presence);
  } catch (error) {
    console.error('Erreur get-presence:', error.message);
    res.status(500).json({ message: 'Erreur lors de la récupération de la présence', error });
  }
});

/**
 * @swagger
 * /api/presences/{id}:
 *   put:
 *     summary: Modifier une présence
 *     tags: [Presences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID MongoDB de la présence
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: string
 *               busId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [present, absent]
 *     responses:
 *       200:
 *         description: Présence mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 presence:
 *                   $ref: '#/components/schemas/Presence'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Présence, élève ou bus non trouvé
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
// Modifier une présence (PUT)
router.put('/:id', auth, isAdmin, async (req, res) => {
  const { studentId, busId, status } = req.body;
  try {
    const presence = await Presence.findById(req.params.id);
    if (!presence) {
      return res.status(404).json({ message: 'Présence non trouvée' });
    }
    if (studentId) {
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: 'Élève non trouvé' });
      }
    }
    if (busId) {
      const bus = await Bus.findById(busId);
      if (!bus) {
        return res.status(404).json({ message: 'Bus non trouvé' });
      }
    }
    presence.studentId = studentId || presence.studentId;
    presence.busId = busId || presence.busId;
    presence.status = status || presence.status;
    await presence.save();
    res.json({ message: 'Présence mise à jour avec succès', presence });
  } catch (error) {
    console.error('Erreur update-presence:', error.message);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la présence', error });
  }
});

/**
 * @swagger
 * /api/presences/{id}:
 *   delete:
 *     summary: Supprimer une présence
 *     tags: [Presences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID MongoDB de la présence
 *     responses:
 *       200:
 *         description: Présence supprimée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Présence non trouvée
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
// Supprimer une présence (DELETE)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const presence = await Presence.findById(req.params.id);
    if (!presence) {
      return res.status(404).json({ message: 'Présence non trouvée' });
    }
    await presence.deleteOne();
    res.json({ message: 'Présence supprimée avec succès' });
  } catch (error) {
    console.error('Erreur delete-presence:', error.message);
    res.status(500).json({ message: 'Erreur lors de la suppression de la présence', error });
  }
});

module.exports = router;
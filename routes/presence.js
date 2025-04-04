const express = require('express');
const Presence = require('../models/Presence');
const Student = require('../models/Students');
const Bus = require('../models/Bus');
const { isAdmin } = require('../middleware/auth');
const router = express.Router();

// Enregistrer une présence (monté ou descendu)
router.post('/', isAdmin, async (req, res) => {
  const { studentId, busId, status } = req.body;

  try {
    // Vérifier si l’élève et le bus existent
    const student = await Student.findById(studentId);
    const bus = await Bus.findById(busId);
    if (!student || !bus) {
      return res.status(404).json({ message: 'Élève ou bus non trouvé' });
    }

    // Créer une nouvelle présence
    const presence = new Presence({
      studentId,
      busId,
      status,
    });
    await presence.save();

    res.status(201).json(presence);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l’enregistrement de la présence', error });
  }
});

// Lister les présences (pour l’administration ou parents avec restriction)
router.get('/', isAdmin, async (req, res) => {
  try {
    const presences = await Presence.find()
      .populate('studentId', 'name studentId') // Inclure les infos de l’élève
      .populate('busId', 'busId name'); // Inclure les infos du bus
    res.json(presences);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des présences', error });
  }
});

module.exports = router;
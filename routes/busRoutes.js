const express = require('express');
const Bus = require('../models/Bus');
const Driver = require('../models/Driver');
const Student = require('../models/Students');
const { isAdmin } = require('../middleware/auth');
const router = express.Router();

// Ajouter un bus
router.post('/add', isAdmin, async (req, res) => {
  const { busId, name, capacity, driverId } = req.body;

  try {
    const existingBus = await Bus.findOne({ busId });
    if (existingBus) {
      return res.status(400).json({ message: 'Cet identifiant de bus est déjà pris' });
    }

    if (driverId) {
      const driver = await Driver.findById(driverId);
      if (!driver) {
        return res.status(404).json({ message: 'Conducteur non trouvé' });
      }
    }

    const bus = new Bus({
      busId,
      name,
      capacity,
      driverId: driverId || null,
    });
    await bus.save();

    res.status(201).json(bus);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l’ajout du bus', error });
  }
});

// Récupérer la liste des bus
router.get('/', isAdmin, async (req, res) => {
  try {
    const buses = await Bus.find().populate('driverId', 'firstName lastName cin');
    res.json(buses);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des bus', error });
  }
});

// Modifier un bus
router.put('/:id', isAdmin, async (req, res) => {
  const { busId, name, capacity, driverId } = req.body;

  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({ message: 'Bus non trouvé' });
    }

    if (busId && busId !== bus.busId) {
      const existingBus = await Bus.findOne({ busId });
      if (existingBus) {
        return res.status(400).json({ message: 'Cet identifiant de bus est déjà pris' });
      }
    }

    if (driverId && driverId !== bus.driverId?.toString()) {
      const driver = await Driver.findById(driverId);
      if (!driver) {
        return res.status(404).json({ message: 'Conducteur non trouvé' });
      }
    }

    bus.busId = busId || bus.busId;
    bus.name = name || bus.name;
    bus.capacity = capacity || bus.capacity;
    bus.driverId = driverId !== undefined ? driverId : bus.driverId;

    await bus.save();
    res.json({
      message: 'Bus mis à jour avec succès',
      bus,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du bus', error });
  }
});

// Supprimer un bus
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({ message: 'Bus non trouvé' });
    }

    // Vérifier si le bus a des élèves associés
    const hasStudents = await Student.findOne({ busId: req.params.id });
    if (hasStudents) {
      return res.status(400).json({ message: 'Impossible de supprimer : ce bus a des élèves associés' });
    }

    await bus.deleteOne();
    res.json({ message: 'Bus supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du bus', error });
  }
});

module.exports = router;
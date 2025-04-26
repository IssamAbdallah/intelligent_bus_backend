const express = require('express');
const router = express.Router();
const Bus = require('../models/Bus');
const Driver = require('../models/Driver');
const Student = require('../models/Students');
const { auth, isAdmin } = require('../middleware/auth');

// Créer un bus (POST)
router.post('/add', auth, isAdmin, async (req, res) => {
  const { busId, name, capacity, latitude, longitude, driverId1, driverId2 } = req.body;
  try {
    const existingBus = await Bus.findOne({ busId });
    if (existingBus) {
      return res.status(400).json({ message: 'ID de bus déjà pris' });
    }
    const driver1 = await Driver.findOne({ cin: driverId1 });
    if (!driver1) {
      return res.status(404).json({ message: 'Premier conducteur non trouvé' });
    }
    if (driverId2) {
      const driver2 = await Driver.findOne({ cin: driverId2 });
      if (!driver2) {
        return res.status(404).json({ message: 'Second conducteur non trouvé' });
      }
    }
    const bus = new Bus({
      busId,
      name,
      capacity,
      location: { latitude, longitude, lastUpdated: Date.now() },
      driverId1,
      driverId2,
    });
    await bus.save();
    res.json({ message: 'Bus créé avec succès', bus });
  } catch (error) {
    console.error('Erreur add-bus:', error.message);
    res.status(500).json({ message: 'Erreur lors de la création du bus', error });
  }
});

// Lister tous les bus (GET)
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const buses = await Bus.find();
    res.json(buses);
  } catch (error) {
    console.error('Erreur get-buses:', error.message);
    res.status(500).json({ message: 'Erreur lors de la récupération des bus', error });
  }
});

// Récupérer un bus par ID (GET)
router.get('/:id', auth, isAdmin, async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({ message: 'Bus non trouvé' });
    }
    res.json(bus);
  } catch (error) {
    console.error('Erreur get-bus:', error.message);
    res.status(500).json({ message: 'Erreur lors de la récupération du bus', error });
  }
});

// Modifier un bus (PUT)
router.put('/:id', auth, isAdmin, async (req, res) => {
  const { busId, name, capacity, latitude, longitude, driverId1, driverId2 } = req.body;
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({ message: 'Bus non trouvé' });
    }
    if (busId && busId !== bus.busId) {
      const existingBus = await Bus.findOne({ busId });
      if (existingBus) {
        return res.status(400).json({ message: 'ID de bus déjà pris' });
      }
    }
    if (driverId1 && driverId1 !== bus.driverId1) {
      const driver1 = await Driver.findOne({ cin: driverId1 });
      if (!driver1) {
        return res.status(404).json({ message: 'Premier conducteur non trouvé' });
      }
    }
    if (driverId2 && driverId2 !== bus.driverId2) {
      const driver2 = await Driver.findOne({ cin: driverId2 });
      if (!driver2 && driverId2 !== null) {
        return res.status(404).json({ message: 'Second conducteur non trouvé' });
      }
    }
    bus.busId = busId || bus.busId;
    bus.name = name || bus.name;
    bus.capacity = capacity || bus.capacity;
    bus.location = {
      latitude: latitude || bus.location.latitude,
      longitude: longitude || bus.location.longitude,
      lastUpdated: latitude || longitude ? Date.now() : bus.location.lastUpdated,
    };
    bus.driverId1 = driverId1 || bus.driverId1;
    bus.driverId2 = driverId2 !== undefined ? driverId2 : bus.driverId2;
    await bus.save();
    res.json({ message: 'Bus mis à jour avec succès', bus });
  } catch (error) {
    console.error('Erreur update-bus:', error.message);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du bus', error });
  }
});

// Supprimer un bus (DELETE)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({ message: 'Bus non trouvé' });
    }
    const hasStudents = await Student.findOne({ busId: bus._id });
    if (hasStudents) {
      return res.status(400).json({ message: 'Impossible de supprimer : ce bus est associé à des élèves' });
    }
    await bus.deleteOne();
    res.json({ message: 'Bus supprimé avec succès' });
  } catch (error) {
    console.error('Erreur delete-bus:', error.message);
    res.status(500).json({ message: 'Erreur lors de la suppression du bus', error });
  }
});

module.exports = router;
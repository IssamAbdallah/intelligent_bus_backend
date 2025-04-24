const express = require('express');
const Bus = require('../models/Bus');
const Driver = require('../models/Driver');
const Student = require('../models/Students');
const { isAdmin } = require('../middleware/auth');
const router = express.Router();

// Ajouter un bus
router.post('/add', isAdmin, async (req, res) => {
  const { busId, name, capacity, driverId1, driverId2 } = req.body;

  try {
    // Vérifier si le busId est unique
    const existingBus = await Bus.findOne({ busId });
    if (existingBus) {
      return res.status(400).json({ message: 'Cet identifiant de bus est déjà pris' });
    }

    // Vérifier que driverId1 (CIN) existe
    const driver1 = await Driver.findOne({ cin: driverId1 });
    if (!driver1) {
      return res.status(404).json({ message: 'Premier conducteur non trouvé (CIN invalide)' });
    }

    // Vérifier que driverId2 (CIN) existe (si fourni) et est différent de driverId1
    if (driverId2) {
      const driver2 = await Driver.findOne({ cin: driverId2 });
      if (!driver2) {
        return res.status(404).json({ message: 'Second conducteur non trouvé (CIN invalide)' });
      }
      if (driverId1 === driverId2) {
        return res.status(400).json({ message: 'Les deux conducteurs doivent être différents' });
      }
    }

    const bus = new Bus({
      busId,
      name,
      capacity,
      driverId1,
      driverId2: driverId2 || null,
    });
    await bus.save();

    res.status(201).json({
      message: 'Bus créé avec succès',
      bus,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l’ajout du bus', error });
  }
});

// Récupérer la liste des bus
router.get('/', isAdmin, async (req, res) => {
  try {
    // Récupérer les bus et joindre manuellement les détails des conducteurs
    const buses = await Bus.find();
    const populatedBuses = await Promise.all(
      buses.map(async (bus) => {
        const busObj = bus.toObject();
        busObj.driverId1 = await Driver.findOne({ cin: bus.driverId1 }).select('firstName lastName cin');
        busObj.driverId2 = bus.driverId2
          ? await Driver.findOne({ cin: bus.driverId2 }).select('firstName lastName cin')
          : null;
        return busObj;
      })
    );
    res.json(populatedBuses);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des bus', error });
  }
});

// Modifier un bus
router.put('/:id', isAdmin, async (req, res) => {
  const { busId, name, capacity, driverId1, driverId2 } = req.body;

  try {
    // Vérifier si le bus existe
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({ message: 'Bus non trouvé' });
    }

    // Vérifier l’unicité du busId
    if (busId && busId !== bus.busId) {
      const existingBus = await Bus.findOne({ busId });
      if (existingBus) {
        return res.status(400).json({ message: 'Cet identifiant de bus est déjà pris' });
      }
    }

    // Vérifier que driverId1 (CIN) existe
    if (driverId1 && driverId1 !== bus.driverId1) {
      const driver1 = await Driver.findOne({ cin: driverId1 });
      if (!driver1) {
        return res.status(404).json({ message: 'Premier conducteur non trouvé (CIN invalide)' });
      }
    }

    // Vérifier que driverId2 (CIN) existe (si fourni) et est différent de driverId1
    if (driverId2 && driverId2 !== bus.driverId2) {
      const driver2 = await Driver.findOne({ cin: driverId2 });
      if (!driver2) {
        return res.status(404).json({ message: 'Second conducteur non trouvé (CIN invalide)' });
      }
      if (driverId1 && driverId1 === driverId2) {
        return res.status(400).json({ message: 'Les deux conducteurs doivent être différents' });
      }
    }

    // Mettre à jour les champs
    bus.busId = busId || bus.busId;
    bus.name = name || bus.name;
    bus.capacity = capacity || bus.capacity;
    bus.driverId1 = driverId1 || bus.driverId1;
    bus.driverId2 = driverId2 !== undefined ? driverId2 : bus.driverId2;

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
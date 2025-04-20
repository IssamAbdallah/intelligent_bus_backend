const express = require('express');
const Driver = require('../models/Driver');
const Bus = require('../models/Bus');
const { isAdmin } = require('../middleware/auth');
const router = express.Router();

// Ajouter un conducteur
router.post('/add', isAdmin, async (req, res) => {
  const { firstName, lastName, email, cin, phoneNumber } = req.body;

  try {
    const existingDriver = await Driver.findOne({ $or: [{ email }, { cin }] });
    if (existingDriver) {
      return res.status(400).json({ message: 'Email ou CIN déjà pris' });
    }

    const newDriver = new Driver({
      firstName,
      lastName,
      email,
      cin,
      phoneNumber,
    });
    await newDriver.save();

    res.status(201).json({
      message: 'Conducteur créé avec succès',
      driver: { id: newDriver._id, firstName, lastName, email, cin, phoneNumber }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création du conducteur', error });
  }
});

// Récupérer la liste des conducteurs
router.get('/', isAdmin, async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des conducteurs', error });
  }
});

// Modifier un conducteur
router.put('/:id', isAdmin, async (req, res) => {
  const { firstName, lastName, email, cin, phoneNumber } = req.body;

  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Conducteur non trouvé' });
    }

    const existingDriver = await Driver.findOne({
      $or: [{ email }, { cin }],
      _id: { $ne: req.params.id },
    });
    if (existingDriver) {
      return res.status(400).json({ message: 'Email ou CIN déjà pris' });
    }

    driver.firstName = firstName || driver.firstName;
    driver.lastName = lastName || driver.lastName;
    driver.email = email || driver.email;
    driver.cin = cin || driver.cin;
    driver.phoneNumber = phoneNumber || driver.phoneNumber;

    await driver.save();

    res.json({
      message: 'Conducteur mis à jour avec succès',
      driver: {
        id: driver._id,
        firstName: driver.firstName,
        lastName: driver.lastName,
        email: driver.email,
        cin: driver.cin,
        phoneNumber: driver.phoneNumber,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du conducteur', error });
  }
});

// Supprimer un conducteur
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Conducteur non trouvé' });
    }

    // Vérifier si le conducteur est associé à un bus
    const hasBus = await Bus.findOne({ driverId: req.params.id });
    if (hasBus) {
      return res.status(400).json({ message: 'Impossible de supprimer : ce conducteur est associé à un bus' });
    }

    await driver.deleteOne();
    res.json({ message: 'Conducteur supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du conducteur', error });
  }
});

module.exports = router;
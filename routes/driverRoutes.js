const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver');
const Bus = require('../models/Bus');
const { auth, isAdmin } = require('../middleware/auth');

// Créer un conducteur (POST)
router.post('/add', auth, isAdmin, async (req, res) => {
  const { firstName, lastName, cin, phoneNumber } = req.body;
  try {
    const existingDriver = await Driver.findOne({ cin });
    if (existingDriver) {
      return res.status(400).json({ message: 'CIN déjà pris' });
    }
    const driver = new Driver({ firstName, lastName, cin, phoneNumber });
    await driver.save();
    res.json({ message: 'Conducteur créé avec succès', driver });
  } catch (error) {
    console.error('Erreur add-driver:', error.message);
    res.status(500).json({ message: 'Erreur lors de la création du conducteur', error: error.message });
  }
});

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

// Modifier un conducteur (PUT)
router.put('/:id', auth, isAdmin, async (req, res) => {
  const { firstName, lastName, cin, phoneNumber } = req.body;
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Conducteur non trouvé' });
    }
    if (cin && cin !== driver.cin) {
      const existingDriver = await Driver.findOne({ cin });
      if (existingDriver) {
        return res.status(400).json({ message: 'CIN déjà pris' });
      }
    }
    driver.firstName = firstName || driver.firstName;
    driver.lastName = lastName || driver.lastName;
    driver.cin = cin || driver.cin;
    driver.phoneNumber = phoneNumber || driver.phoneNumber;
    await driver.save();
    res.json({ message: 'Conducteur mis à jour avec succès', driver });
  } catch (error) {
    console.error('Erreur update-driver:', error.message);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du conducteur', error: error.message });
  }
});

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
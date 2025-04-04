const express = require('express');
const Bus = require('../models/Bus');
const { isAdmin } = require('../middleware/auth');
const router = express.Router();

// Ajouter un bus (admin uniquement)
router.post('/add', isAdmin, async (req, res) => {
  const { busId, name, capacity } = req.body;
  try {
    const newBus = new Bus({ busId, name, capacity });
    await newBus.save();
    res.status(201).json(newBus);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l’ajout du bus', error });
  }
});

// Lister tous les bus (admin uniquement)
router.get('/', isAdmin, async (req, res) => {
  const buses = await Bus.find();
  res.json(buses);
});

// Modifier un bus (admin uniquement)
router.put('/:id', isAdmin, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const updatedBus = await Bus.findByIdAndUpdate(id, updates, { new: true });
    res.json(updatedBus);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour', error });
  }
});

// Supprimer un bus (admin uniquement)
router.delete('/:id', isAdmin, async (req, res) => {
  const { id } = req.params;
  await Bus.findByIdAndDelete(id);
  res.json({ message: 'Bus supprimé' });
});

module.exports = router;
const express = require('express');
const router = express.Router();
const Student = require('../models/Students');
const User = require('../models/User');
const Bus = require('../models/Bus');
const { auth, isAdmin } = require('../middleware/auth');

// Créer un élève (POST)
router.post('/add', auth, isAdmin, async (req, res) => {
  const { studentId, name, parentId, busId, imagePath } = req.body;
  try {
    const existingStudent = await Student.findOne({ studentId });
    if (existingStudent) {
      return res.status(400).json({ message: 'ID étudiant (RFID) déjà pris' });
    }
    const parent = await User.findOne({ cin: parentId, role: 'parent' });
    if (!parent) {
      return res.status(404).json({ message: 'Parent non trouvé' });
    }
    if (busId) {
      const bus = await Bus.findById(busId);
      if (!bus) {
        return res.status(404).json({ message: 'Bus non trouvé' });
      }
    }
    const student = new Student({ studentId, name, parentId, busId, imagePath });
    await student.save();
    res.json({ message: 'Élève créé avec succès', student });
  } catch (error) {
    console.error('Erreur add-student:', error.message);
    res.status(500).json({ message: 'Erreur lors de la création de l\'élève', error });
  }
});

// Lister tous les élèves (GET)
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const students = await Student.find().populate('busId', 'busId name');
    res.json(students);
  } catch (error) {
    console.error('Erreur get-students:', error.message);
    res.status(500).json({ message: 'Erreur lors de la récupération des élèves', error });
  }
});

// Récupérer un élève par ID (GET)
router.get('/:id', auth, isAdmin, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('busId', 'busId name');
    if (!student) {
      return res.status(404).json({ message: 'Élève non trouvé' });
    }
    res.json(student);
  } catch (error) {
    console.error('Erreur get-student:', error.message);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'élève', error });
  }
});

// Modifier un élève (PUT)
router.put('/:id', auth, isAdmin, async (req, res) => {
  const { studentId, name, parentId, busId, imagePath } = req.body;
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Élève non trouvé' });
    }
    if (studentId && studentId !== student.studentId) {
      const existingStudent = await Student.findOne({ studentId });
      if (existingStudent) {
        return res.status(400).json({ message: 'ID étudiant (RFID) déjà pris' });
      }
    }
    if (parentId && parentId !== student.parentId) {
      const parent = await User.findOne({ cin: parentId, role: 'parent' });
      if (!parent) {
        return res.status(404).json({ message: 'Parent non trouvé' });
      }
    }
    if (busId && busId !== student.busId) {
      const bus = await Bus.findById(busId);
      if (!bus) {
        return res.status(404).json({ message: 'Bus non trouvé' });
      }
    }
    student.studentId = studentId || student.studentId;
    student.name = name || student.name;
    student.parentId = parentId || student.parentId;
    student.busId = busId || student.busId;
    student.imagePath = imagePath || student.imagePath;
    await student.save();
    res.json({ message: 'Élève mis à jour avec succès', student });
  } catch (error) {
    console.error('Erreur update-student:', error.message);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'élève', error });
  }
});

// Supprimer un élève (DELETE)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Élève non trouvé' });
    }
    const hasPresences = await Presence.findOne({ studentId: student._id });
    if (hasPresences) {
      return res.status(400).json({ message: 'Impossible de supprimer : cet élève a des présences associées' });
    }
    await student.deleteOne();
    res.json({ message: 'Élève supprimé avec succès' });
  } catch (error) {
    console.error('Erreur delete-student:', error.message);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'élève', error });
  }
});

module.exports = router;
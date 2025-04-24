const express = require('express');
const multer = require('multer');
const path = require('path');
const Student = require('../models/Students');
const User = require('../models/User');
const { isAdmin } = require('../middleware/auth');
const router = express.Router();

// Configuration de multer pour l’upload d’images
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'Uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) cb(null, true);
    else cb(new Error('Seules les images JPEG/PNG sont acceptées'));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Ajouter un élève
router.post('/add', isAdmin, upload.single('image'), async (req, res) => {
  const { studentId, name, niveau, parentId, busId } = req.body;

  try {
    const existingStudent = await Student.findOne({ studentId });
    if (existingStudent) {
      return res.status(400).json({ message: 'Ce code RFID est déjà pris' });
    }

    const parent = await User.findOne({ cin: parentId });
    if (!parent) {
      return res.status(404).json({ message: 'Parent avec ce CIN non trouvé' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Image requise pour la reconnaissance faciale' });
    }

    const student = new Student({
      studentId,
      name,
      parentId,
      busId,
      imagePath: req.file.path,
    });

    await student.save();
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l’ajout de l’élève', error });
  }
});

// Récupérer la liste des élèves
router.get('/', isAdmin, async (req, res) => {
  try {
    const students = await Student.find()
      .populate('parentId', 'firstName lastName cin')
      .populate('busId', 'busId name');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des élèves', error });
  }
});

// Modifier un élève
router.put('/:id', isAdmin, upload.single('image'), async (req, res) => {
  const { studentId, name, parentId, busId } = req.body;

  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Élève non trouvé' });
    }

    if (studentId && studentId !== student.studentId) {
      const existingStudent = await Student.findOne({ studentId });
      if (existingStudent) {
        return res.status(400).json({ message: 'Ce code RFID est déjà pris' });
      }
    }

    if (parentId && parentId !== student.parentId) {
      const parent = await User.findOne({ cin: parentId });
      if (!parent) {
        return res.status(404).json({ message: 'Parent avec ce CIN non trouvé' });
      }
    }

    student.studentId = studentId || student.studentId;
    student.name = name || student.name;
    student.parentId = parentId || student.parentId;
    student.busId = busId || student.busId;
    if (req.file) {
      student.imagePath = req.file.path;
    }

    await student.save();
    res.json({
      message: 'Élève mis à jour avec succès',
      student,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l’élève', error });
  }
});

// Supprimer un élève
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Élève non trouvé' });
    }

    await student.deleteOne();
    res.json({ message: 'Élève supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de l’élève', error });
  }
});

module.exports = router;
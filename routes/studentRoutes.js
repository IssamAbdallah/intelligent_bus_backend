const express = require('express');
const multer = require('multer');
const path = require('path');
const Student = require('../models/Students');
const { isAdmin } = require('../middleware/auth');
const router = express.Router();

// Configuration de multer pour l’upload d’images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Dossier où les images seront stockées
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Seules les images JPEG/PNG sont acceptées'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite à 5MB
});

// Ajouter un élève avec une image
router.post('/add', isAdmin, upload.single('image'), async (req, res) => {
  const { studentId, name, parentId, busId } = req.body;

  try {
    // Vérifier si l’élève existe déjà
    const existingStudent = await Student.findOne({ studentId });
    if (existingStudent) {
      return res.status(400).json({ message: 'Cet identifiant élève est déjà pris' });
    }

    // Vérifier si le fichier image est présent
    if (!req.file) {
      return res.status(400).json({ message: 'Image requise' });
    }

    const student = new Student({
      studentId,
      name,
      parentId,
      busId,
      imagePath: req.file.path, // Chemin de l’image sauvegardée
    });

    await student.save();
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l’ajout de l’élève', error });
  }
});

module.exports = router;
// routes/student.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const Student = require('../models/Students');
const User = require('../models/User');
const { isAdmin } = require('../middleware/auth');
const router = express.Router();

// Configuration de multer (inchangée)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage, fileFilter: (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (extname && mimetype) cb(null, true);
  else cb(new Error('Seules les images JPEG/PNG sont acceptées'));
}, limits: { fileSize: 5 * 1024 * 1024 } });

// Ajouter un élève
router.post('/add', isAdmin, upload.single('image'), async (req, res) => {
  const { studentId, name, parentId, busId } = req.body;

  try {
    // Vérifier si l’élève existe
    const existingStudent = await Student.findOne({ studentId });
    if (existingStudent) {
      return res.status(400).json({ message: 'Cet identifiant élève est déjà pris' });
    }

    // Vérifier si le parent existe via son CIN
    const parent = await User.findOne({ cin: parentId });
    if (!parent) {
      return res.status(404).json({ message: 'Parent avec ce CIN non trouvé' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Image requise' });
    }

    const student = new Student({
      studentId,
      name,
      parentId, // CIN du parent (ex. "12345678")
      busId,
      imagePath: req.file.path,
    });

    await student.save();
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l’ajout de l’élève', error });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const Student = require('../models/Students');
const User = require('../models/User');
const Bus = require('../models/Bus');
const { auth, isAdmin } = require('../middleware/auth');

/**
 * @swagger
 * /api/students/add:
 *   post:
 *     summary: Créer un élève
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: string
 *               name:
 *                 type: string
 *               birthday:
 *                 type: string
 *               parentId:
 *                 type: string
 *               busId:
 *                 type: string
 *               imagePath:
 *                 type: string
 *             required:
 *               - studentId
 *               - name
 *               - birthday
 *               - parentId
 *               - imagePath
 *     responses:
 *       200:
 *         description: Élève créé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 student:
 *                   $ref: '#/components/schemas/Student'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Parent ou bus non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Créer un élève (POST)
router.post('/add', auth, isAdmin, async (req, res) => {
  const { studentId, name, birthday, parentId, busId, imagePath } = req.body;
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
    const student = new Student({ studentId, name, birthday, parentId, busId, imagePath });
    await student.save();
    res.json({ message: 'Élève créé avec succès', student });
  } catch (error) {
    console.error('Erreur add-student:', error.message);
    res.status(500).json({ message: 'Erreur lors de la création de l\'élève', error });
  }
});

/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: Lister tous les élèves
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des élèves
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Student'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Lister tous les élèves (GET)
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const students = await Student.find().populate('busId', 'busId name birthday');
    res.json(students);
  } catch (error) {
    console.error('Erreur get-students:', error.message);
    res.status(500).json({ message: 'Erreur lors de la récupération des élèves', error });
  }
});

/**
 * @swagger
 * /api/students/{id}:
 *   get:
 *     summary: Récupérer un élève par ID
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID MongoDB de l'élève
 *     responses:
 *       200:
 *         description: Élève récupéré
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       404:
 *         description: Élève non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Récupérer un élève par ID (GET)
router.get('/:id', auth, isAdmin, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('busId', 'busId name birthday');
    if (!student) {
      return res.status(404).json({ message: 'Élève non trouvé' });
    }
    res.json(student);
  } catch (error) {
    console.error('Erreur get-student:', error.message);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'élève', error });
  }
});

/**
 * @swagger
 * /api/students/{id}:
 *   put:
 *     summary: Modifier un élève
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID MongoDB de l'élève
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: string
 *               name:
 *                 type: string
 *               birthday:
 *                 type: string
 *               parentId:
 *                 type: string
 *               busId:
 *                 type: string
 *               imagePath:
 *                 type: string
 *     responses:
 *       200:
 *         description: Élève mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 student:
 *                   $ref: '#/components/schemas/Student'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Élève, parent ou bus non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Modifier un élève (PUT)
router.put('/:id', auth, isAdmin, async (req, res) => {
  const { studentId, name, birthday, parentId, busId, imagePath } = req.body;
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
    student.birthday = birthday || student.birthday;
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

/**
 * @swagger
 * /api/students/{id}:
 *   delete:
 *     summary: Supprimer un élève
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID MongoDB de l'élève
 *     responses:
 *       200:
 *         description: Élève supprimé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Impossible de supprimer
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Élève non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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
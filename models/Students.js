const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true }, // Identifiant unique
  name: { type: String, required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Lien avec le parent
  busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' }, // Bus assigné
  imagePath: { type: String, required: true }, // Chemin vers l’image sur le serveur
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Student', studentSchema);
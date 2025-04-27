const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: { 
    type: String, 
    required: true, 
    unique: true,
    match: /^[A-Za-z0-9]{8,16}$/, // Ex. 8 à 16 caractères alphanumériques pour un code RFID
    validate: {
      validator: function(v) {
        return /^[A-Za-z0-9]{8,16}$/.test(v);
      },
      message: 'Le code RFID doit être une chaîne alphanumérique de 8 à 16 caractères'
    }
  },
  name: { type: String, required: true },
  birthday: { type: String, required: true },
  parentId: { 
    type: String, 
    required: true, 
    match: /^[0-9]{8}$/, // Doit être exactement 8 chiffres
    validate: {
      validator: function(v) {
        return /^\d{8}$/.test(v); // Validation personnalisée
      },
      message: 'Le parentId doit être un numéro CIN de 8 chiffres'
    }
  }, // CIN du parent au lieu d’un ObjectId
  busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' }, // Toujours un ObjectId pour le bus
  imagePath: { type: String, required: true }, // Chemin de l’image
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Student', studentSchema);
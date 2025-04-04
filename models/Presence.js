const mongoose = require('mongoose');

const presenceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  status: { type: String, enum: ['monté', 'descendu'], required: true }, // État de l’élève
  timestamp: { type: Date, default: Date.now }, // Date et heure de l’événement
});

module.exports = mongoose.model('Presence', presenceSchema);
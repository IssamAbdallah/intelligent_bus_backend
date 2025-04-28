const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  cin: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /^\d{8}$/.test(v);
      },
      message: 'Le CIN doit contenir exactement 8 chiffres.',
    },
  },
  phoneNumber: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^.{8,12}$/.test(v);
      },
      message: 'Le numéro de téléphone doit contenir entre 8 et 12 caractères.',
    },
  },
  createdAt: { type: Date, default: Date.now },
});

// Index unique sur cin (sparse non nécessaire car cin est requis)
driverSchema.index({ cin: 1 }, { unique: true });

module.exports = mongoose.model('Driver', driverSchema);
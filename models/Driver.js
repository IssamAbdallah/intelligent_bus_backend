const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  cin: { 
    type: String,
    required: true,
    unique: true,
    match: /^[0-9]{8}$/,
    validate: {
      validator: function(v) {
        return /^\d{8}$/.test(v);
      },
      message: 'Le CIN doit être un numéro de 8 chiffres'
    }
  },
  phoneNumber: { 
    type: String, 
    required: true, 
    match: /^[0-9]{8,12}$/, // Ex. 8 à 12 chiffres pour un numéro de téléphone
    validate: {
      validator: function(v) {
        return /^[0-9]{8,12}$/.test(v);
      },
      message: 'Le numéro de téléphone doit contenir entre 8 et 12 chiffres'
    }
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Driver', driverSchema);




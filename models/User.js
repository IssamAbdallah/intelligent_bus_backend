const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['admin', 'parent'], required: true },
  cin: {
    type: String,
    required: function () { return this.role === 'parent'; },
    validate: {
      validator: function (v) {
        return this.role !== 'parent' || /^\d{8}$/.test(v);
      },
      message: 'Le CIN doit contenir exactement 8 chiffres pour les parents.',
    },
  },
  phoneNumber: {
    type: String,
    required: function () { return this.role === 'parent'; },
    validate: {
      validator: function (v) {
        return this.role !== 'parent' || /^.{8,12}$/.test(v);
      },
      message: 'Le numéro de téléphone doit contenir entre 8 et 12 caractères pour les parents.',
    },
  },
  fcmToken: { type: String },
});

// Ajouter un index sparse sur cin
userSchema.index({ cin: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('User', userSchema);
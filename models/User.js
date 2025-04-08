// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['admin', 'parent'], default: 'parent' },
  cin: { 
    type: String,
    unique: true, // Unique si fourni
    validate: {
      validator: function(v) {
        // Si role est "parent", cin doit être présent et avoir 8 chiffres
        if (this.role === 'parent') {
          return v && /^\d{8}$/.test(v);
        }
        // Si role est "admin", cin est optionnel (peut être absent ou valide si présent)
        return v ? /^\d{8}$/.test(v) : true;
      },
      message: 'Le CIN doit être un numéro de 8 chiffres pour les parents et est optionnel pour les admins'
    }
  },
  fcmToken: { type: String }, // Token FCM
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
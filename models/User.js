const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['admin', 'parent'], default: 'parent' },
  firstName: { 
    type: String, 
    required: function() { return this.role === 'parent'; } // Requis pour parents
  }, // Prénom
  lastName: { 
    type: String, 
    required: function() { return this.role === 'parent'; } // Requis pour parents
  }, // Nom
  cin: { 
    type: String,
    unique: true,
    validate: {
      validator: function(v) {
        if (this.role === 'parent') {
          return v && /^\d{8}$/.test(v);
        }
        return v ? /^\d{8}$/.test(v) : true;
      },
      message: 'Le CIN doit être un numéro de 8 chiffres pour les parents et est optionnel pour les admins'
    }
  },
  fcmToken: { type: String }, // Token FCM
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
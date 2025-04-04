const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashé avec bcrypt
  role: { type: String, enum: ['admin', 'parent']},
  email: { type: String, required: true, unique: true }, // Ajout pour contact
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
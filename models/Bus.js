const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  busId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  capacity: { type: Number, required: true },
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
    lastUpdated: { type: Date, default: Date.now },
  },
  
  driverId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Driver', 
    default: null // Optionnel
  },
  
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Bus', busSchema);
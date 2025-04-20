const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const busRoutes = require('./routes/busRoutes');
const presenceRoutes = require('./routes/presence');
const studentRoutes = require('./routes/studentRoutes');
const driverRoutes = require('./routes/driverRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());

// Servir les fichiers statiques pour accéder aux images (optionnel)
app.use('/uploads', express.static('uploads'));

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use('/api/users', userRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/presences', presenceRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/drivers', driverRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const userRoutes = require('./routes/userRoutes');
const busRoutes = require('./routes/busRoutes');
const presenceRoutes = require('./routes/presence');
const studentRoutes = require('./routes/studentRoutes');
const driverRoutes = require('./routes/driverRoutes');

dotenv.config();

const app = express();
app.use(express.json());

// Servir les fichiers statiques pour accéder aux images
app.use('/uploads', express.static('uploads'));

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connecté à MongoDB');
    // Initialiser l'admin après connexion
    await initializeAdmin();
  })
  .catch((err) => console.error('Erreur de connexion MongoDB:', err));

// Initialiser l'admin
const initializeAdmin = async () => {
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new User({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
      });
      await admin.save();
      console.log('Admin créé avec succès: username=admin, password=admin123');
    } else {
      console.log('Admin existe déjà');
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de l\'admin:', error.message);
    if (error.code === 11000) {
      console.error('Clé en double détectée:', error.keyValue);
    }
  }
};

// Routes
app.use('/api/users', userRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/presences', presenceRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/drivers', driverRoutes);

// Middleware pour gérer les routes inconnues
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Middleware pour gérer les erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err.message);
  res.status(500).json({ message: 'Erreur serveur', error: err.message });
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
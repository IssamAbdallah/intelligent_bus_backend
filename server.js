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
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

dotenv.config();

const app = express();
app.use(express.json());

// Servir les fichiers statiques pour accéder aux images
app.use('/uploads', express.static('uploads'));

// Configuration de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Bus Scolaire Intelligent Backend',
      description: 'API pour gérer les utilisateurs, bus, élèves, conducteurs et présences dans un système de transport scolaire.',
      version: '1.0.0',
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Serveur local' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'ID de l\'utilisateur' },
            username: { type: 'string', description: 'Nom d\'utilisateur' },
            email: { type: 'string', description: 'Email de l\'utilisateur' },
            firstName: { type: 'string', description: 'Prénom' },
            lastName: { type: 'string', description: 'Nom de famille' },
            cin: { type: 'string', description: 'CIN (8 chiffres, requis pour les parents)' },
            phoneNumber: { type: 'string', description: 'Numéro de téléphone (8-12 caractères, requis pour les parents)' },
            fcmToken: { type: 'string', description: 'Token FCM pour notifications' },
            role: { type: 'string', enum: ['admin', 'parent'], description: 'Rôle de l\'utilisateur' },
          },
          required: ['username', 'email', 'firstName', 'lastName', 'role'],
        },
        Bus: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'ID MongoDB du bus' },
            busId: { type: 'string', description: 'Identifiant unique du bus' },
            name: { type: 'string', description: 'Nom du bus' },
            capacity: { type: 'number', description: 'Capacité du bus' },
            location: {
              type: 'object',
              properties: {
                latitude: { type: 'number' },
                longitude: { type: 'number' },
                lastUpdated: { type: 'string', format: 'date-time' },
              },
              description: 'Localisation du bus',
            },
            driverId1: { type: 'string', description: 'CIN du premier conducteur' },
            driverId2: { type: 'string', description: 'CIN du second conducteur (optionnel)' },
            createdAt: { type: 'string', format: 'date-time', description: 'Date de création' },
          },
          required: ['busId', 'name', 'capacity', 'driverId1'],
        },
        Student: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'ID MongoDB de l\'élève' },
            studentId: { type: 'string', description: 'Code RFID unique (8-16 caractères alphanumériques)' },
            name: { type: 'string', description: 'Nom complet de l\'élève' },
            parentId: { type: 'string', description: 'CIN du parent (8 chiffres)' },
            busId: { type: 'string', description: 'ID MongoDB du bus associé' },
            imagePath: { type: 'string', description: 'Chemin de l\'image de l\'élève' },
            createdAt: { type: 'string', format: 'date-time', description: 'Date de création' },
          },
          required: ['studentId', 'name', 'parentId', 'imagePath'],
        },
        Driver: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'ID MongoDB du conducteur' },
            firstName: { type: 'string', description: 'Prénom' },
            lastName: { type: 'string', description: 'Nom de famille' },
            cin: { type: 'string', description: 'CIN (8 chiffres)' },
            phoneNumber: { type: 'string', description: 'Numéro de téléphone (8-12 caractères)' },
            createdAt: { type: 'string', format: 'date-time', description: 'Date de création' },
          },
          required: ['firstName', 'lastName', 'cin', 'phoneNumber'],
        },
        Presence: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'ID MongoDB de la présence' },
            studentId: { type: 'string', description: 'ID MongoDB de l\'élève' },
            busId: { type: 'string', description: 'ID MongoDB du bus' },
            date: { type: 'string', format: 'date-time', description: 'Date de la présence' },
            status: { type: 'string', enum: ['present', 'absent'], description: 'Statut de la présence' },
          },
          required: ['studentId', 'busId', 'status'],
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            error: { type: 'string' },
          },
          required: ['message'],
        },
      },
    },
  },
  apis: ['./routes/userRoutes.js','./routes/studentRoutes.js','./routes/driverRoutes.js','./routes/busRoutes.js','./routes/presence.js'], // Chemin vers les fichiers contenant les commentaires JSDoc
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
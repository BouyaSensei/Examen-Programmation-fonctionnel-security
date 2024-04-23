require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const app = express();
const cors = require('cors');
const bcrypt = require('bcrypt');



app.use(express.json()); // Pour supporter les corps JSON

app.use(cors({
    origin: ['localhost:3000'], // Autoriser les requêtes de plusieurs origines
    methods: ['GET', 'POST', 'DELETE'], // Types de requêtes autorisées
    allowedHeaders: ['Content-Type', 'Authorization'], // Headers autorisés
    credentials: true, // Permettre ou non les cookies avec les requêtes
    optionsSuccessStatus: 200 // Certains navigateurs (IE11, certains Chrome sous Android) utilisent HTTP 200 OK au lieu du statut 204
  }));


// Connexion à MySQL
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });



  connection.connect(err => {
    if (err) {
      return console.error('Erreur de connexion: ' + err.message);
    }
    console.log('Connecté au serveur MySQL');
  });
  
  app.post('/register', async  (req, res) => {
    const { name, password } = req.body;
    // on hash le password pour le stocker en base de données
    const hashedPassword = await bcrypt.hash(password, 10);
    
    connection.query(
      'INSERT INTO utilisateurs (Username, Password) VALUES (?, ?)',
      [name, hashedPassword],
      (err, results) => {
        if (err) {
            console.log(err);
          res.status(500).send('Erreur lors de l\'enregistrement de l\'utilisateur');
        } else {
          res.status(200).send('Utilisateur enregistré avec succès');
            
        }
      }
    );
  });
  app.post('/login', async(req,res) => {
    const { name, password } = req.body;
    connection.query(
      'SELECT * FROM utilisateurs WHERE Username = ?',
      [name],
      async (err, results) => {
        if (err) {
         
          res.status(500).send('Erreur lors de la connexion');
        } else {
          if (results.length > 0) {
            
            const user = results[0];
            const passwordMatch = await bcrypt.compare(password, user.Password);
            if (passwordMatch) {
              res.status(200).send('Connexion réussie');
            } else {
              res.status(403).send('Nom d\'utilisateur ou mot de passe incorrect');
            }
          } else {
            res.status(403).send('Nom d\'utilisateur ou mot de passe incorrect');
          }
        }
      }
    );
  
  })
  app.listen(5000, () => {
    console.log('Serveur démarré sur http://localhost:5000');
  });


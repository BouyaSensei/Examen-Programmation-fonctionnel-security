require("dotenv").config();
const express = require("express");
const mysql = require("mysql");
const app = express();
const cors = require("cors");
const bcrypt = require("bcrypt");

// TODO : Refactoriser le code

app.use(express.json()); // Pour supporter les corps JSON

app.use(
  cors({
    origin: ["localhost:3000"], // Autoriser les requêtes de plusieurs origines
    methods: ["GET", "POST", "DELETE"], // Types de requêtes autorisées
    allowedHeaders: ["Content-Type", "Authorization"], // Headers autorisés
    credentials: true, // Permettre ou non les cookies avec les requêtes
    optionsSuccessStatus: 200, // Certains navigateurs (IE11, certains Chrome sous Android) utilisent HTTP 200 OK au lieu du statut 204
  })
);

// Connexion à MySQL
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    return console.error("Erreur de connexion: " + err.message);
  }
  console.log("Connecté au serveur MySQL");
});

app.post("/register", async (req, res) => {
  const { name, password } = req.body;
  // on hash le password pour le stocker en base de données
  const hashedPassword = await bcrypt.hash(password, 10);

  connection.query(
    "INSERT INTO utilisateurs (Username, Password) VALUES (?, ?)",
    [name, hashedPassword],
    (err, results) => {
      if (err) {
        // console.log(err);
        res
          .status(500)
          .send("Erreur lors de l'enregistrement de l'utilisateur");
      } else {
        res.status(200).send("Utilisateur enregistré avec succès");
      }
    }
  );
});
app.post("/login", async (req, res) => {
  const { name, password } = req.body;
  connection.query(
    "SELECT * FROM utilisateurs WHERE Username = ?",
    [name],
    async (err, results) => {
      if (err) {
        res.status(500).send("Erreur lors de la connexion");
      } else {
        if (results.length > 0) {
          const user = results[0];
          const passwordMatch = await bcrypt.compare(password, user.Password);
          if (passwordMatch) {
            res.status(200).send("Connexion réussie");
          } else {
            res.status(403).send("Nom d'utilisateur ou mot de passe incorrect");
          }
        } else {
          res.status(403).send("Nom d'utilisateur ou mot de passe incorrect");
        }
      }
    }
  );
});
app.get("/product/:id", (req, res) => {
  const { id } = req.params;
  connection.query(
    "SELECT * FROM produit WHERE ID = ?",
    [id],
    (err, results) => {
      if (err) {
        res.status(500).send("Erreur lors de la récupération du produit");
      } else {
        if (results.length > 0) {
          res.status(200).json(results[0]);
        } else {
          res.status(404).send("Produit non trouvé");
        }
      }
    }
  );
});
app.put("/product/:id", (req, res) => {
  const { id } = req.params;
  const { product_name, product_description, price, category, image } =
    req.body;

  connection.query(
    "UPDATE produit SET Libellé = ?, Description = ?, Images = ?, Prix = ?, Catégorie = ? WHERE ID = ?",
    [product_name, product_description, image, price, category, id],
    (err, results) => {
      if (err) {
        // console.log(err);
        res.status(500).send("Erreur lors de la modification du produit");
      } else {
        res.status(200).send("Produit modifié avec succès");
      }
    }
  );
});

app.all("/products", (req, res) => {
  if (req.method === "GET") {
    connection.query("SELECT * FROM produit", (err, results) => {
      if (err) {
        res.status(500).send("Erreur lors de la récupération des produits");
      } else {
        res.status(200).json(results);
      }
    });
  } else if (req.method === "POST") {
    const { product_name, product_description, price, category, image } =
      req.body; // Remplacez imagePath par image
    connection.query(
      "INSERT INTO produit (Libellé, Description, Images, Prix, Catégorie) VALUES (?, ?, ?, ?, ?)",
      [product_name, product_description, image, price, category], // Assurez-vous que 'image' contient seulement le nom de fichier
      (err, results) => {
        if (err) {
          // console.log(err);
          res.status(500).send("Erreur lors de l'ajout du produit");
        } else {
          res.status(200).send("Produit ajouté avec succès");
        }
      }
    );
  } else if (req.method === "DELETE") {
    const { id } = req.body;
    connection.query(
      "DELETE FROM produit WHERE ID = ?",
      [id],
      (err, results) => {
        if (err) {
          res.status(500).send("Erreur lors de la suppression du produit");
        } else {
          res.status(200).send("Produit supprimé avec succès");
        }
      }
    );
  }
});
app.get("/stats", (req, res) => {
  connection.query(
    "SELECT Catégorie, COUNT(*) as Nombre FROM produit GROUP BY Catégorie",
    (err, results) => {
      if (err) {
        res.status(500).send("Erreur lors de la récupération des statistiques");
      } else {
        res.status(200).json(results);
      }
    }
  );
});

// Recupere les categories
app.get("/categories", (req, res) => {
  connection.query("SELECT DISTINCT Catégorie FROM produit", (err, results) => {
    if (err) {
      res.status(500).send("Erreur lors de la récupération des catégories");
    } else {
      res.status(200).json(results);
    }
  });
});

app.post("/addToCart", (req, res) => {
  const { user_id, product_id, quantity, prix } = req.body;
  console.log("Données reçues pour ajout au panier : ", req.body);

  
  
  connection.query(
    'INSERT INTO panier (user_id, product_id, quantity, prix) VALUES (?, ?, ?, ?)',
    [user_id, product_id, quantity, prix],
    (err, results) => {
      
      if (err) {
        // console.log(err);
        res.status(500).send("Erreur lors de l'ajout du produit au panier");
      } else {
        // res.status(200).send("Produit ajouté au panier avec succès");
        res.json({ success: true, message: 'Produit ajouté au panier avec succès',  });

      }
    }
    
  );
});



  app.get('/getUserID', (req, res) => {
    const username = req.query.username;
    // console.log("Nom d'utilisateur reçu pour récupérer l'ID :", username);
  
    // Effectuer une requête à la base de données pour récupérer l'ID de l'utilisateur
    connection.query(
      'SELECT ID FROM utilisateurs WHERE Username = ?',
      [username],
      (error, results) => {
        if (error) {
          console.error("Erreur lors de la récupération de l'ID de l'utilisateur:", error);
          res.status(500).json({ error: "Erreur lors de la récupération de l'ID de l'utilisateur" });
        } else {
          // Renvoyer l'ID de l'utilisateur
          if (results.length > 0) {
            // console.log("ID de l'utilisateur récupéré avec succès :", results[0].ID);
            res.status(200).json({ user_id: results[0].ID });
          } else {
            console.error("Utilisateur non trouvé");
            res.status(404).json({ error: "Utilisateur non trouvé" });
          }
        }
      }
    );
  });
  

  app.post('/getLibelle', (req,res) => {
    const { product_id } = req.body;
    console.log("Id produit" , product_id);
    // console.log("Nom d'utilisateur reçu pour récupérer l'ID :", username);
  
    // Effectuer une requête à la base de données pour récupérer l'ID de l'utilisateur
    connection.query(
      'SELECT Libellé FROM produit WHERE ID = ?',
      [product_id],
      (error, results) => {
        if (error) {
          console.error("Erreur lors de la récupération du libelle:", error);
          res.status(500).json({ error: "Erreur lors de la récupération du libelle" });
        } else {
          // Renvoyer l'ID de l'utilisateur
          if (results.length > 0) {
            console.log("Nom du produit récupéré avec succès :", results[0].Libellé);
            res.status(200).json({ libelle : results[0].Libellé , success: true });
            
          } else {
            console.error("Utilisateur non trouvé");
            res.status(404).json({ error: "Utilisateur non trouvé" });
          }
        }
      }
    );


  })
  
// Route pour récupérer les informations du panier de l'utilisateur
app.get("/getPanier", async (req, res) => {
  const { username } = req.query;

  try {
    console.log("Nom d'utilisateur reçu pour récupérer le panier :", username);

    // Requête pour récupérer l'ID de l'utilisateur à partir de son nom d'utilisateur
    connection.query('SELECT ID FROM utilisateurs WHERE Username = ?', [username], async (err, userResults) => {
      if (err) {
        console.error('Erreur lors de la récupération de l\'ID de l\'utilisateur:', err);
        res.status(500).send('Erreur lors de la récupération de l\'ID de l\'utilisateur');
      } else {
        // Si l'utilisateur est trouvé
        if (userResults.length > 0) {
          const user_id = userResults[0].ID;
          console.log("ID de l'utilisateur récupéré pour récupérer le panier :", user_id);

          // Maintenant que vous avez l'ID de l'utilisateur, vous pouvez récupérer son panier depuis la base de données
          connection.query('SELECT p.ID, p.product_id, p.quantity, p.prix, pr.Libellé FROM panier p JOIN produit pr ON p.product_id = pr.ID WHERE p.user_id = ?', [user_id], (panierErr, panierResults) => {
            if (panierErr) {
              console.error('Erreur lors de la récupération du panier:');
              res.status(500).send('Erreur lors de la récupération du panier');
            } else {
              console.log("Produits du panier récupérés avec succès :", panierResults);
              // Envoyer les produits du panier au frontend
              res.status(200).json(panierResults);
            }
          });
        } else {
          console.error('Utilisateur non trouvé');
          res.status(404).send('Utilisateur non trouvé');
        }
      }
    });
  } catch (err) {
    console.error('Erreur lors de la récupération du panier:');
    res.status(500).send('Erreur lors de la récupération du panier');
  }
});


app.listen(5000, () => {
  console.log("Serveur démarré sur http://localhost:5000");
});

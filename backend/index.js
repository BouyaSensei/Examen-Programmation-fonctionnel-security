require("dotenv").config();
const express = require("express");
const mysql = require("mysql");
const app = express();
const cors = require("cors");
const bcrypt = require("bcrypt");
const connection = require('./config/db');
const userRoutes = require('./routes/userRoutes')
const productRoutes = require('./routes/productRoutes')
const cartRoutes = require('./routes/cartRoutes')
const categoriesRouter = require('./routes/categoriesRouter')
const statsRoutes = require('./routes/statsRoutes')

app.use(express.json()); // Pour supporter les corps JSON

app.use(
    cors({
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "PUT", "DELETE"], // Inclure la méthode DELETE
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
        optionsSuccessStatus: 200,
    })
);

app.use('/', userRoutes);
app.use('/', productRoutes);
app.use('/', categoriesRouter);
app.use('/', statsRoutes);

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
    const {user_id, product_id, quantity, prix} = req.body;
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
                res.json({success: true, message: 'Produit ajouté au panier avec succès',});

            }
        }
    );
});

app.post('/getLibelle', (req, res) => {
    const {product_id} = req.body;
    console.log("Id produit", product_id);
    // console.log("Nom d'utilisateur reçu pour récupérer l'ID :", username);

    // Effectuer une requête à la base de données pour récupérer l'ID de l'utilisateur
    connection.query(
        'SELECT Libellé FROM produit WHERE ID = ?',
        [product_id],
        (error, results) => {
            if (error) {
                console.error("Erreur lors de la récupération du libelle:", error);
                res.status(500).json({error: "Erreur lors de la récupération du libelle"});
            } else {
                // Renvoyer l'ID de l'utilisateur
                if (results.length > 0) {
                    console.log("Nom du produit récupéré avec succès :", results[0].Libellé);
                    res.status(200).json({libelle: results[0].Libellé, success: true});

                } else {
                    console.error("Utilisateur non trouvé");
                    res.status(404).json({error: "Utilisateur non trouvé"});
                }
            }
        }
    );
})

// Route pour récupérer les informations du panier de l'utilisateur
app.get("/getPanier", async (req, res) => {
    const {username} = req.query;

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

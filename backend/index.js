require("dotenv").config();
const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const cors = require("cors");
const app = express();

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
    const {name, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    connection.query(
        "INSERT INTO utilisateurs (Username, Password) VALUES (?, ?)",
        [name, hashedPassword],
        (error, results) => {
            if (error) {
                res.status(500).send("Erreur lors de l'enregistrement de l'utilisateur");
            } else {
                res.status(200).send("Utilisateur enregistré avec succès");
            }
        }
    );
});

app.post("/login", async (req, res) => {
    const {name, password} = req.body;
    connection.query(
        "SELECT * FROM utilisateurs WHERE Username = ?",
        [name],
        async (error, results) => {
            if (error) {
                res.status(500).send("Erreur lors de la connexion");
            } else if (results.length > 0) {
                const passwordMatch = await bcrypt.compare(password, results[0].Password);
                if (passwordMatch) {
                    res.status(200).send("Connexion réussie");
                } else {
                    res.status(403).send("Nom d'utilisateur ou mot de passe incorrect");
                }
            } else {
                res.status(403).send("Nom d'utilisateur ou mot de passe incorrect");
            }
        }
    );
});

app.get("/product/:id", (req, res) => {
    const {id} = req.params;
    connection.query(
        "SELECT * FROM produit WHERE ID = ?",
        [id],
        (error, results) => {
            if (error) {
                res.status(500).send("Erreur lors de la récupération du produit");
            } else if (results.length > 0) {
                res.status(200).json(results[0]);
            } else {
                res.status(404).send("Produit non trouvé");
            }
        }
    );
});

app.put("/product/:id", (req, res) => {
    const {id} = req.params;
    const {product_name, product_description, price, category, image} = req.body;
    connection.query(
        "UPDATE produit SET Libellé = ?, Description = ?, Images = ?, Prix = ?, Catégorie = ? WHERE ID = ?",
        [product_name, product_description, image, price, category, id],
        (error, results) => {
            if (error) {
                res.status(500).send("Erreur lors de la modification du produit");
            } else {
                res.status(200).send("Produit modifié avec succès");
            }
        }
    );
});

app.all("/products", (req, res) => {
    if (req.method === "GET") {
        connection.query("SELECT * FROM produit", (error, results) => {
            if (error) {
                res.status(500).send("Erreur lors de la récupération des produits");
            } else {
                res.status(200).json(results);
            }
        });
    } else if (req.method === "POST") {
        const {product_name, product_description, price, category, image} = req.body;
        connection.query(
            "INSERT INTO produit (Libellé, Description, Images, Prix, Catégorie) VALUES (?, ?, ?, ?, ?)",
            [product_name, product_description, image, price, category],
            (error, results) => {
                if (error) {
                    res.status(500).send("Erreur lors de l'ajout du produit");
                } else {
                    res.status(200).send("Produit ajouté avec succès");
                }
            }
        );
    } else if (req.method === "DELETE") {
        const {id} = req.body;
        connection.query(
            "DELETE FROM produit WHERE ID = ?",
            [id],
            (error, results) => {
                if (error) {
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
        (error, results) => {
            if (error) {
                res.status(500).send("Erreur lors de la récupération des statistiques");
            } else {
                res.status(200).json(results);
            }
        }
    );
});

app.get("/categories", (req, res) => {
    connection.query("SELECT DISTINCT Catégorie FROM produit", (error, results) => {
        if (error) {
            res.status(500).send("Erreur lors de la récupération des catégories");
        } else {
            res.status(200).json(results);
        }
    });
});

app.post("/addToCart", (req, res) => {
    const {user_id, product_id, quantity} = req.body;
    connection.query(
        "INSERT INTO panier (user_id, product_id, quantity) VALUES (?, ?, ?)",
        [user_id, product_id, quantity],
        (error, results) => {
            if (error) {
                res.status(500).send("Erreur lors de l'ajout du produit au panier");
            } else {
                res.json({success: true, message: "Produit ajouté au panier avec succès"});
            }
        }
    );
});

app.get('/getUserID', (req, res) => {
    const username = req.query.username;
    connection.query(
        "SELECT ID FROM utilisateurs WHERE Username = ?",
        [username],
        (error, results) => {
            if (error) {
                res.status(500).json({error: "Erreur lors de la récupération de l'ID de l'utilisateur"});
            } else if (results.length > 0) {
                res.status(200).json({user_id: results[0].ID});
            } else {
                res.status(404).json({error: "Utilisateur non trouvé"});
            }
        }
    );
});

app.post('/getLibelle', (req, res) => {
    const {product_id} = req.body;
    connection.query(
        "SELECT Libellé FROM produit WHERE ID = ?",
        [product_id],
        (error, results) => {
            if (error) {
                res.status(500).json({error: "Erreur lors de la récupération du libelle"});
            } else if (results.length > 0) {
                res.status(200).json({libelle: results[0].Libellé, success: true});
            } else {
                res.status(404).json({error: "Produit non trouvé"});
            }
        }
    );
});

app.get("/getPanier", async (req, res) => {
    const username = req.query.username;
    try {
        connection.query("SELECT ID FROM utilisateurs WHERE Username = ?", [username], async (err, userResults) => {
            if (err) {
                res.status(500).send("Erreur lors de la récupération de l'ID de l'utilisateur");
            } else if (userResults.length > 0) {
                const user_id = userResults[0].ID;
                connection.query("SELECT p.ID, p.product_id, p.quantity, pr.Libellé FROM panier p JOIN produit pr ON p.product_id = pr.ID WHERE p.user_id = ?", [user_id], (panierErr, panierResults) => {
                    if (panierErr) {
                        res.status(500).send("Erreur lors de la récupération du panier");
                    } else {
                        res.status(200).json(panierResults);
                    }
                });
            } else {
                res.status(404).send("Utilisateur non trouvé");
            }
        });
    } catch (err) {
        res.status(500).send("Erreur lors de la récupération du panier");
    }
});

app.listen(5000, () => {
    console.log("Serveur démarré sur http://localhost:5000");
});


module.exports = app;
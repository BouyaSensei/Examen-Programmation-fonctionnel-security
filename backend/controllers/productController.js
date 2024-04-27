const db = require('../config/db');
const connection = db;

exports.getProductById = (req, res) => {
    const {id} = req.params;
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
};

exports.updateProduct = (req, res) => {
    const {id} = req.params;
    const {name, description, price, category} = req.body;

    const updatedFields = [];
    let query = "UPDATE produit SET ";

    if (name) {
        updatedFields.push(name);
        query += "Libellé = ?, ";
    }
    if (description) {
        updatedFields.push(description);
        query += "Description = ?, ";
    }
    if (price) {
        updatedFields.push(price);
        query += "Prix = ?, ";
    }
    if (category) {
        updatedFields.push(category);
        query += "Catégorie = ?, ";
    }

    query = query.slice(0, -2);

    updatedFields.push(id);

    query += " WHERE ID = ?";

    connection.query(
        query,
        updatedFields,
        (err, results) => {
            if (err) {
                res.status(500).json({message: "Erreur lors de la modification du produit"});
            } else {
                res.status(200).json({message: "Produit modifié avec succès"});
            }
        }
    );
};

exports.getAllProducts = (req, res) => {
    connection.query("SELECT * FROM produit", (err, results) => {
        if (err) {
            res.status(500).send("Erreur lors de la récupération des produits");
        } else {
            res.status(200).json(results);
        }
    });
};

exports.addProduct = (req, res) => {
    const {product_name, product_description, price, category, image} = req.body;
    const images = image.join(','); // Join the array into a string
    connection.query(
        "INSERT INTO produit (Libellé, Description, Images, Prix, Catégorie) VALUES (?, ?, ?, ?, ?)",
        [product_name, product_description, images, price, category],
        (err, results) => {
            if (err) {
                console.error(err); // Log the error
                res.status(500).send("Erreur lors de l'ajout du produit");
            } else {
                res.status(200).send("Produit ajouté avec succès");
            }
        }
    );
};

exports.deleteProduct = (req, res) => {
    const productId = req.params.id;
    connection.query(
        "DELETE FROM produit WHERE ID = ?",
        [productId],
        (err, results) => {
            if (err) {
                res.status(500).json({success: false, message: "Erreur lors de la suppression du produit"});
            } else {
                res.status(200).json({success: true, message: "Produit supprimé avec succès"});
            }
        }
    );
};

exports.getProductName = (req, res) => {
    const {product_id} = req.body;
    connection.query(
        'SELECT Libellé FROM produit WHERE ID = ?',
        [product_id],
        (error, results) => {
            if (error) {
                res.status(500).json({error: "Erreur lors de la récupération du libelle"});
            } else {
                if (results.length > 0) {
                    res.status(200).json({libelle: results[0].Libellé, success: true});
                } else {
                    res.status(404).json({error: "Utilisateur non trouvé"});
                }
            }
        }
    );
};

exports.getLibelle = (req, res) => {
    const {product_id} = req.body;
    console.log("Id produit", product_id);

    connection.query(
        'SELECT Libellé FROM produit WHERE ID = ?',
        [product_id],
        (error, results) => {
            if (error) {
                console.error("Erreur lors de la récupération du libelle:", error);
                res.status(500).json({error: "Erreur lors de la récupération du libelle"});
            } else {
                if (results.length > 0) {
                    console.log("Nom du produit récupéré avec succès :", results[0].Libellé);
                    res.status(200).json({libelle: results[0].Libellé, success: true});
                } else {
                    console.error("Produit non trouvé");
                    res.status(404).json({error: "Produit non trouvé"});
                }
            }
        }
    );
};
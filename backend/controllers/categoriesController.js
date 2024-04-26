const db = require('../config/db');
const connection = db;

exports.getCategories = (req, res) => {
    connection.query("SELECT DISTINCT Catégorie FROM produit", (err, results) => {
        if (err) {
            res.status(500).send("Erreur lors de la récupération des catégories");
        } else {
            res.status(200).json(results);
        }
    });
};
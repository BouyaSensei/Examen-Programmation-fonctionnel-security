const db = require('../config/db');
const connection = db;

exports.getStats = (req, res) => {
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
}
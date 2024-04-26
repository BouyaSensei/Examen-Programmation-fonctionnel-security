const db = require('../config/db');
const connection = db;

exports.addToCart = (req, res) => {
    const {user_id, product_id, quantity, prix} = req.body;
    connection.query(
        'INSERT INTO panier (user_id, product_id, quantity, prix) VALUES (?, ?, ?, ?)',
        [user_id, product_id, quantity, prix],
        (err, results) => {
            if (err) {
                res.status(500).send("Erreur lors de l'ajout du produit au panier");
            } else {
                res.json({success: true, message: 'Produit ajouté au panier avec succès',});
            }
        }
    );
};

exports.getCart = async (req, res) => {
    const {username} = req.query;
    try {
        connection.query('SELECT ID FROM utilisateurs WHERE Username = ?', [username], async (err, userResults) => {
            if (err) {
                res.status(500).send('Erreur lors de la récupération de l\'ID de l\'utilisateur');
            } else {
                if (userResults.length > 0) {
                    const user_id = userResults[0].ID;
                    connection.query('SELECT p.ID, p.product_id, p.quantity, p.prix, pr.Libellé FROM panier p JOIN produit pr ON p.product_id = pr.ID WHERE p.user_id = ?', [user_id], (panierErr, panierResults) => {
                        if (panierErr) {
                            res.status(500).send('Erreur lors de la récupération du panier');
                        } else {
                            res.status(200).json(panierResults);
                        }
                    });
                } else {
                    res.status(404).send('Utilisateur non trouvé');
                }
            }
        });
    } catch (err) {
        res.status(500).send('Erreur lors de la récupération du panier');
    }
};
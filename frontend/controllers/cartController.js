const axios = require('axios');
const jwt = require('jsonwebtoken');

const cartController = {
    addToCart: async (req, res) => {
        const {user_id, product_id, quantity, prix} = req.body;
        if (!user_id) {
            const response = await axios.post('http://localhost:5000/getLibelle', {product_id});
            if (response.data.success) {
                const libelleName = response.data.libelle;
                req.session.cart = [
                    ...req.session.cart ?? [],
                    {
                        ID: product_id,
                        Libellé: libelleName,
                        quantity: quantity,
                        prix: prix
                    }
                ];
                return res.redirect("/panier");
            }
        }
        try {
            const response = await axios.post('http://localhost:5000/addToCart', {user_id, product_id, quantity, prix});
            if (response.data.success) {
                res.redirect("/panier");
            } else {
                console.error('Erreur lors de l\'ajout du produit au panier:');
            }
        } catch (error) {
            console.error('Erreur lors de l\'ajout du produit au panier:');
        }
    },

    getCart: async (req, res) => {
        const token = req.cookies.jwt;
        if (!token) {
            return res.render("panier.ejs", {produitsPanier: req.session.cart, nonce: req.nonce});
        }
        try {
            const decoded = jwt.verify(token, 'secret');
            const username = decoded.name;
            const userResponse = await axios.get('http://localhost:5000/getUserID', {
                params: {
                    username: username
                }
            });
            const user_id = userResponse.data.user_id;
            const userPanier = await axios.get('http://localhost:5000/getPanier', {
                params: {
                    username: username
                }
            });
            const user_panier = userPanier.data;
            res.render("panier.ejs", {produitsPanier: user_panier, nonce: req.nonce});
        } catch (err) {
            console.error("Erreur lors de la vérification du jeton JWT:");
            res.status(401).json({status: 'Erreur', message: 'Jeton inconnu'});
        }
    }
};

module.exports = cartController;
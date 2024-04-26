const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Route pour ajouter un produit au panier
router.post('/addToCart', cartController.addToCart);

// Route pour obtenir le contenu du panier
router.get('/getCart', cartController.getCart);

module.exports = router;
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.post('/addToCart', cartController.addToCart);
router.get('/panier', cartController.getCart);

module.exports = router;
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Route pour obtenir un produit par son ID
router.get('/product/:id', productController.getProductById);

// Route pour mettre à jour un produit par son ID
router.put('/products/:id', productController.updateProduct);

// Route pour obtenir tous les produits
router.get('/products', productController.getAllProducts);

// Route pour ajouter un nouveau produit
router.post('/products', productController.addProduct);

// Route pour supprimer un produit par son ID
router.delete('/products/:id', productController.deleteProduct);

// Route pour obtenir le nom d'un produit
router.get('/getProductName', productController.getProductName);

// Route pour obtenir le libellé d'un produit
router.post('/getLibelle', productController.getLibelle);

module.exports = router;
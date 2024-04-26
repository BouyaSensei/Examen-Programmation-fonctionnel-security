const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/product/:id', productController.getProductById);
router.put('/product/:id', productController.updateProduct);
router.get('/products', productController.getAllProducts);
router.post('/products', productController.addProduct);
router.delete('/products/:id', productController.deleteProduct);
router.get('/getProductName', productController.getProductName);
router.post('/getLibelle', productController.getLibelle);

module.exports = router;
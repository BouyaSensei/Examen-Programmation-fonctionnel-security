const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const multer = require('multer');
const path = require('path');

// Configuration of Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "../frontend/public/images");
    },
    filename: function (req, file, cb) {
        cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    },
});

const upload = multer({storage: storage});

router.get('/products', productController.getProducts);
router.post('/products', upload.array("image", 10), productController.postProduct);
router.delete('/products', productController.deleteProduct);
router.get('/product/:id', productController.getProductById);
router.get('/addProduct', productController.getAddProduct);
router.put('/product/:id', productController.updateProduct);
module.exports = router;
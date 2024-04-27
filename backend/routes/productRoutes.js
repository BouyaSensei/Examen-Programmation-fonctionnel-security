const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

/**
 * @swagger
 * /product/{id}:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get a product by its ID
 *     description: Retrieves a product from the database by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Product successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ID:
 *                   type: integer
 *                 Libellé:
 *                   type: string
 *                 Description:
 *                   type: string
 *                 Prix:
 *                   type: number
 *                 Catégorie:
 *                   type: string
 *       404:
 *         description: Product not found
 *       500:
 *         description: Error occurred while retrieving the product
 */
router.get('/product/:id', productController.getProductById);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     tags:
 *       - Products
 *     summary: Update a product by its ID
 *     description: Updates a product in the database by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Libellé:
 *                 type: string
 *               Description:
 *                 type: string
 *               Prix:
 *                 type: number
 *               Catégorie:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product successfully updated
 *       500:
 *         description: Error occurred while updating the product
 */
router.put('/products/:id', productController.updateProduct);

/**
 * @swagger
 * /products:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get all products
 *     description: Retrieves all products from the database
 *     responses:
 *       200:
 *         description: Products successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ID:
 *                     type: integer
 *                   Libellé:
 *                     type: string
 *                   Description:
 *                     type: string
 *                   Prix:
 *                     type: number
 *                   Catégorie:
 *                     type: string
 *       500:
 *         description: Error occurred while retrieving the products
 */
router.get('/products', productController.getAllProducts);

/**
 * @swagger
 * /products:
 *   post:
 *     tags:
 *       - Products
 *     summary: Add a new product
 *     description: Adds a new product to the database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Libellé:
 *                 type: string
 *               Description:
 *                 type: string
 *               Prix:
 *                 type: number
 *               Catégorie:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product successfully added
 *       500:
 *         description: Error occurred while adding the product
 */
router.post('/products', productController.addProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     tags:
 *       - Products
 *     summary: Delete a product by its ID
 *     description: Deletes a product from the database by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Product successfully deleted
 *       500:
 *         description: Error occurred while deleting the product
 */
router.delete('/products/:id', productController.deleteProduct);

/**
 * @swagger
 * /getProductName:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get the name of a product
 *     description: Retrieves the name of a product from the database
 *     responses:
 *       200:
 *         description: Product name successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 libelle:
 *                   type: string
 *       404:
 *         description: Product not found
 *       500:
 *         description: Error occurred while retrieving the product name
 */
router.get('/getProductName', productController.getProductName);

/**
 * @swagger
 * /getLibelle:
 *   post:
 *     tags:
 *       - Products
 *     summary: Get the label of a product
 *     description: Retrieves the label of a product from the database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Product label successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 libelle:
 *                   type: string
 *       404:
 *         description: Product not found
 *       500:
 *         description: Error occurred while retrieving the product label
 */
router.post('/getLibelle', productController.getLibelle);

module.exports = router;
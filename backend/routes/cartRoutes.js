const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

/**
 * @swagger
 * /addToCart:
 *   post:
 *     tags:
 *       - Panier
 *     summary: Add a product to the cart
 *     description: Adds a product to the user's shopping cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               product_id:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               prix:
 *                 type: number
 *     responses:
 *       200:
 *         description: Product successfully added to the cart
 *       500:
 *         description: Error occurred while adding the product to the cart
 */
router.post('/addToCart', cartController.addToCart);

/**
 * @swagger
 * /getCart:
 *   get:
 *     tags:
 *       - Panier
 *     summary: Get the cart content
 *     description: Retrieves the content of the user's shopping cart
 *     parameters:
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Cart content successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ID:
 *                     type: integer
 *                   product_id:
 *                     type: integer
 *                   quantity:
 *                     type: integer
 *                   prix:
 *                     type: number
 *                   Libellé:
 *                     type: string
 *       404:
 *         description: User not found
 *       500:
 *         description: Error occurred while retrieving the cart content
 */
router.get('/getCart', cartController.getCart);

module.exports = router;
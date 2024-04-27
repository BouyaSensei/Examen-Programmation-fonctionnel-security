const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categoriesController');

/**
 * @swagger
 * /categories:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Get all categories
 *     description: Retrieves all categories from the database
 *     responses:
 *       200:
 *         description: Categories successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Catégorie:
 *                     type: string
 *       500:
 *         description: Error occurred while retrieving the categories
 */
router.get('/categories', categoriesController.getCategories);

module.exports = router;
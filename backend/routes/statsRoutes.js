const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

/**
 * @swagger
 * /stats:
 *   get:
 *     tags:
 *       - Stats
 *     summary: Get statistics
 *     description: Retrieves statistics from the database
 *     responses:
 *       200:
 *         description: Statistics successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Catégorie:
 *                     type: string
 *                   Nombre:
 *                     type: integer
 *       500:
 *         description: Error occurred while retrieving the statistics
 */
router.get('/stats', statsController.getStats);

module.exports = router;
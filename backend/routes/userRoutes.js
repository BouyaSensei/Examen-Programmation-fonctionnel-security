const express = require('express');
const userController = require("../controllers/userController");
const router = express.Router();

/**
 * @swagger
 * /register:
 *   post:
 *     tags:
 *       - Users
 *     summary: Register a new user
 *     description: Registers a new user in the database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User successfully registered
 *       500:
 *         description: Error occurred while registering the user
 */
router.post("/register", userController.register);

/**
 * @swagger
 * /login:
 *   post:
 *     tags:
 *       - Users
 *     summary: Login a user
 *     description: Logs in a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User successfully logged in
 *       403:
 *         description: Incorrect username or password
 *       500:
 *         description: Error occurred while logging in
 */
router.post("/login", userController.login);

/**
 * @swagger
 * /getUserID:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user ID
 *     description: Retrieves the ID of a user
 *     parameters:
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: User ID successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: integer
 *       404:
 *         description: User not found
 *       500:
 *         description: Error occurred while retrieving the user ID
 */
router.get('/getUserID', userController.getUserID);

module.exports = router;
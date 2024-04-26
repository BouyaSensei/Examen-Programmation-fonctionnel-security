const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql');
require('dotenv').config();

const app = require('../index');
app.use(express.json());



// Mock the database connection
const connection = {
    query: jest.fn()
};

// Mock bcrypt
bcrypt.hash = jest.fn().mockResolvedValue('hashedPassword');
bcrypt.compare = jest.fn().mockResolvedValue(true);

// Sample tests
describe('POST /register', () => {
    it('should register a user successfully', async () => {
        const userData = { name: 'john', password: 'password123' };

        connection.query.mockImplementation((sql, params, callback) => {
            callback(null, { affectedRows: 1 }); // Simulate successful insert
        });

        const response = await request(app)
            .post('/register')
            .send(userData);

        expect(response.statusCode).toBe(200);
        expect(response.text).toContain('Utilisateur enregistré avec succès');
    });

    it('should handle database errors', async () => {
        const userData = { name: 'john', password: 'Password123.' };

        connection.query.mockImplementation((sql, params, callback) => {
            callback(new Error('Failed to insert user'), null); // Simulate database error
        });

        const response = await request(app)
            .post('/register')
            .send(userData);

        expect(response.statusCode).toBe(500);
        expect(response.text).toContain('Erreur lors de l\'enregistrement de l\'utilisateur');
    });
});

describe('POST /login', () => {
    it('should login successfully', async () => {
        const userData = { name: 'john', password: 'password123' };

        connection.query.mockImplementation((sql, params, callback) => {
            callback(null, [{ Username: 'john', Password: 'hashedPassword' }]); // Simulate user found
        });

        const response = await request(app)
            .post('/login')
            .send(userData);

        expect(response.statusCode).toBe(200);
        expect(response.text).toContain('Connexion réussie');
    });

    it('should reject incorrect password', async () => {
        const userData = { name: 'john', password: 'wrongpassword' };

        bcrypt.compare.mockResolvedValueOnce(false);

        connection.query.mockImplementation((sql, params, callback) => {
            callback(null, [{ Username: 'john', Password: 'hashedPassword' }]); // Simulate user found
        });

        const response = await request(app)
            .post('/login')
            .send(userData);

        expect(response.statusCode).toBe(403);
        expect(response.text).toContain('Nom d\'utilisateur ou mot de passe incorrect');
    });
});

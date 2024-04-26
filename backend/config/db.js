const mysql = require('mysql');

// Création de la connexion à la base de données
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

// Connexion à la base de données
db.connect((err) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('La connexion à la base de données a été fermée.');
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('La base de données a trop de connexions.');
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('La connexion à la base de données a été refusée.');
        }
        if (err.code === 'ER_BAD_DB_ERROR') {
            console.error('La base de données n\'existe pas.');
        }
        if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('Accès refusé pour cet utilisateur.');
        }
    } else {
        console.log('Connecté à la base de données');
    }
});

module.exports = db;
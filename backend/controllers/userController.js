const bcrypt = require("bcrypt");
const db = require('../config/db');
const connection = db; // Assurez-vous que 'db' est une instance de connexion MySQL

exports.register = async (req, res) => {
    const {name, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    connection.query(
        "INSERT INTO utilisateurs (Username, Password) VALUES (?, ?)",
        [name, hashedPassword],
        (err, results) => {
            if (err) {
                res.status(500).send("Erreur lors de l'enregistrement de l'utilisateur");
            } else {
                res.status(200).send("Utilisateur enregistré avec succès");
            }
        }
    );
};

exports.login = async (req, res) => {
    const {name, password} = req.body;

    connection.query(
        "SELECT * FROM utilisateurs WHERE Username = ?",
        [name],
        async (err, results) => {
            if (err) {
                res.status(500).send("Erreur lors de la connexion");
            } else {
                if (results.length > 0) {
                    const user = results[0];
                    const passwordMatch = await bcrypt.compare(password, user.Password);
                    if (passwordMatch) {
                        res.status(200).send("Connexion réussie");
                    } else {
                        res.status(403).send("Nom d'utilisateur ou mot de passe incorrect");
                    }
                } else {
                    res.status(403).send("Nom d'utilisateur ou mot de passe incorrect");
                }
            }
        }
    );
};

exports.getUserID = (req, res) => {
    const username = req.query.username;

    connection.query(
        'SELECT ID FROM utilisateurs WHERE Username = ?',
        [username],
        (error, results) => {
            if (error) {
                res.status(500).json({error: "Erreur lors de la récupération de l'ID de l'utilisateur"});
            } else {
                if (results.length > 0) {
                    res.status(200).json({user_id: results[0].ID});
                } else {
                    res.status(404).json({error: "Utilisateur non trouvé"});
                }
            }
        }
    );
};
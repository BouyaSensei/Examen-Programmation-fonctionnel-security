const jwt = require('jsonwebtoken');
const axios = require('axios');
const Tokens = require("csrf");
const tokens = new Tokens();

const authController = {
    getRegister: (req, res) => {
        const secret = tokens.secretSync();
        const token = tokens.create(secret);
        res.cookie("csrfToken", token, {httpOnly: true});
        const errorMessage = req.query.error;
        res.render("register.ejs", {csrfToken: token, nonce: req.nonce, errorMessage});
    },

    postRegister: async (req, res) => {
        const csrfToken = req.cookies.csrfToken;
        if (csrfToken !== req.body._csrf) {
            res.status(403).send("Jeton CSRF invalide");
            return;
        }

        const {name, password} = req.body;
        const passwordRegexUpperCase = /^(?=.*[A-Z])/;
        const passwordRegexSpecialChar = /^(?=.*[@$!%*?&.()\\[\]{}<>^=+-_~|:;,])/;
        const passwordRegexChiffre = /^(?=.*[0123456789])/;
        const passwordMinLength = /^(?=.{8,})/;

        if (!name || name.trim() === "") {
            const secret = tokens.secretSync();
            const token = tokens.create(secret);
            res.cookie("csrfToken", token, {httpOnly: true});
            return res.render("register.ejs", {
                csrfToken: token,
                errorMessage: "Veuillez saisir un identifiant.",
                nonce: req.nonce
            });
        }

        if (!passwordRegexUpperCase.test(password) || !passwordRegexSpecialChar.test(password) || !passwordMinLength.test(password) || !passwordRegexChiffre.test(password)) {
            const secret = tokens.secretSync();
            const token = tokens.create(secret);
            res.cookie("csrfToken", token, {httpOnly: true});
            return res.render("register.ejs", {
                csrfToken: token,
                errorMessage: "Mot de passe incorrect. Il doit contenir au moins une majuscule, un chiffre, un caractère spécial et plus de 8 caractères.",
                nonce: req.nonce
            });
        }

        try {
            await axios.post("http://localhost:5000/register", {
                name,
                password
            }, {headers: {"Content-Type": "application/json"}});
            return res.redirect("/login");
        } catch (err) {
            if (err.response) {
                res.status(500).send(err.response.data);
            } else {
                res.status(500).send('Error: no response received from the server');
            }
        }
    },
    getLogin: (req, res) => {
        const secret = tokens.secretSync();
        const token = tokens.create(secret);
        res.cookie("toast", {type: "", message: ""}, {httpOnly: true});
        res.cookie("csrfToken", token, {httpOnly: true});

        const info = {
            csrfToken: token,
            toast: req.cookies.toast,
            nonce: req.nonce
        }
        res.render("login.ejs", {info});
    },

    postLogin: async (req, res) => {
        const csrfToken = req.cookies.csrfToken;
        if (csrfToken !== req.body._csrf) {
            res.status(403).send("Jeton CSRF invalide");
            return;
        }

        const {name, password} = req.body;

        try {
            const response = await axios.post("http://localhost:5000/login", {
                name,
                password
            }, {headers: {"Content-Type": "application/json"}});
            const token = jwt.sign({name}, "secret");
            res.cookie("jwt", token, {httpOnly: true});

            jwt.verify(token, 'secret', async (err, decoded) => {
                if (err) {
                    console.error("Erreur lors de la vérification du jeton JWT:", err);
                    return res.status(401).json({status: 'Erreur', message: 'Jeton inconnu'});
                }

                const username = decoded.name;
                const userResponse = await axios.get('http://localhost:5000/getUserID', {params: {username: username}});
                const user_id = userResponse.data.user_id;

                if (req.session.cart && req.session.cart.length > 0) {
                    req.session.cart.forEach(async function (element) {
                        try {
                            await axios.post('http://localhost:5000/addToCart', {
                                user_id: user_id,
                                product_id: element["ID"],
                                quantity: element["quantity"],
                                prix: element["prix"]
                            });
                        } catch (error) {
                            console.error('Erreur lors de l\'ajout du produit au panier après connexion :', error);
                        }
                    });
                    req.session.cart = [];
                }
            });

            return res.redirect("/dashboard");
        } catch (err) {
            req.cookies.toast.type = "error";
            req.cookies.toast.message = "Erreur  de connexion  utilisateur ! Veuillez réessayer ! ";
            const info = {
                csrfToken: req.cookies.csrfToken,
                toast: req.cookies.toast
            }
            res.render("login.ejs", {info});
        }
    },

    logout: (req, res) => {
        res.clearCookie("jwt");
        req.session.cart = [];
        res.redirect("/");
    }
};

module.exports = authController;
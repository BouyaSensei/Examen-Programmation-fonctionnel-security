const jwt = require('jsonwebtoken');
const axios = require('axios');
const Tokens = require("csrf");
const tokens = new Tokens();

const homeController = {
    getHome: async (req, res) => {
        try {
            const productsResponse = await axios.get("http://localhost:5000/products");
            const categoriesResponse = await axios.get("http://localhost:5000/categories");
            const token = req.cookies.jwt;
            const secret = tokens.secretSync();

            const csrf_token = tokens.create(secret);

            jwt.verify(token, 'secret', async (err, decoded) => {
                if (err) {
                    return res.render("index.ejs", {
                        products: productsResponse.data,
                        categories: categoriesResponse.data,
                        token: token,
                        csrfToken: csrf_token,
                        nonce: req.nonce
                    });
                }

                const username = decoded.name;

                try {
                    const userResponse = await axios.get('http://localhost:5000/getUserID', {
                        params: {
                            username: username
                        }
                    });
                    const user_id = userResponse.data.user_id;

                    if (req.cookies.toast && req.cookies.jwt) {
                        const info = {
                            jwt: req.cookies.jwt,
                            toast: req.cookies.toast,
                            csrfToken: token,
                            categories: categoriesResponse.data,
                            products: productsResponse.data,
                            user_id: user_id,
                            nonce: req.nonce
                        }

                        return res.render("index.ejs", req.cookies.jwt ? {info} : null);
                    }
                    if (!req.cookies.toast) {
                        res.cookie("toast", {type: "", message: ""}, {httpOnly: true});
                    }
                    res.render('index.ejs', {
                        products: productsResponse.data,
                        categories: categoriesResponse.data,
                        token: token,
                        csrfToken: csrf_token,
                        user_id: user_id
                    });

                } catch (error) {
                    console.error("Erreur lors de la récupération de l'ID de l'utilisateur:");
                }
            });

        } catch (error) {
            res.status(500).send("An error occurred");
        }
    }
};

module.exports = homeController;
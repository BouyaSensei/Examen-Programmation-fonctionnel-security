const axios = require('axios');
const jwt = require('jsonwebtoken');
const Tokens = require("csrf");
const tokens = new Tokens();
const productController = {
    getProducts: (req, res) => {
        axios.get("http://localhost:5000/products")
            .then((response) => {
                res.status(200).json(response.data);
            })
            .catch((err) => {
                res.status(500).send("Error retrieving products");
            });
    },

    postProduct: (req, res) => {
        const {product_name, product_description, price, category} = req.body;
        let imagePath = "default.png";
        imagePath = req.files.map(file => file.path).join(', ');
        const csrfToken = req.cookies.csrfToken;
        if (csrfToken !== req.body._csrf) {
            res.status(403).send("Invalid CSRF token");
            return;
        }
        axios.post("http://localhost:5000/products", {
            product_name,
            product_description,
            price,
            category,
            image: imagePath,
        })
            .then((response) => {
                res.cookie("toast", {type: "add-success", message: "Produit ajouter  avec succes !"}, {httpOnly: true});
                res.redirect("/");
            })
            .catch((err) => {
                res.status(500).send("Erreur lors de l'ajout du produit");
            });
    },

    deleteProduct: (req, res) => {
        const {id} = req.body;
        axios.delete("http://localhost:5000/products", {data: {id}})
            .then((response) => {
                res.status(200).send("Produit supprimé avec succès");
            })
            .catch((err) => {
                res.status(500).send("Erreur lors de la suppression du produit");
            });
    },

    getProductById: async (req, res) => {
        const {id} = req.params;
        const token = req.cookies.jwt;

        jwt.verify(token, 'secret', async (err, decoded) => {
            if (err) {
                const productResponse = await axios.get(`http://localhost:5000/product/${id}`);
                return res.render('product.ejs', {
                    product: productResponse.data,
                    token: token,
                    nonce: req.nonce,
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

                try {
                    const productResponse = await axios.get(`http://localhost:5000/product/${id}`);
                    res.render('product.ejs', {
                        product: productResponse.data,
                        token: token,
                        nonce: req.nonce,
                        user_id: user_id
                    });
                } catch (error) {
                    res.status(500).send("An error occurred while fetching the product");
                }

            } catch (error) {
                console.error("Erreur lors de la récupération de l'ID de l'utilisateur:");
            }
        });
    },
    getProductById: async (req, res) => {
        const {id} = req.params;
        const token = req.cookies.jwt;

        jwt.verify(token, 'secret', async (err, decoded) => {
            if (err) {
                const productResponse = await axios.get(`http://localhost:5000/product/${id}`);
                return res.render('product.ejs', {
                    product: productResponse.data,
                    token: token,
                    nonce: req.nonce,
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

                try {
                    const productResponse = await axios.get(`http://localhost:5000/product/${id}`);
                    res.render('product.ejs', {
                        product: productResponse.data,
                        token: token,
                        nonce: req.nonce,
                        user_id: user_id
                    });
                } catch (error) {
                    res.status(500).send("An error occurred while fetching the product");
                }

            } catch (error) {
                console.error("Erreur lors de la récupération de l'ID de l'utilisateur:");
            }
        });
    },
    getAddProduct: (req, res) => {
        const secret = tokens.secretSync();
        const token = tokens.create(secret);

        // Store the csrf token in a cookie
        res.cookie("csrfToken", token, {httpOnly: true});

        res.render("addProduct.ejs", {token: req.cookies.jwt, csrfToken: token});
    }
};

module.exports = productController;
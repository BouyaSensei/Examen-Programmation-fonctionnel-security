const express = require("express");
//const fetch = require('node-fetch');
const axios = require("axios");
const Tokens = require("csrf");
const tokens = new Tokens();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

const cookieParser = require("cookie-parser"); // pour gérer les cookies

const app = express();

app.set("view engine", "ejs");
// TODO : Refactoriser le code

app.use(cookieParser());
app.use(express.urlencoded({extended: true})); // Pour supporter les corps encodés URL
app.use(express.json()); // Pour supporter les corps JSON
// Middleware pour servir les fichiers statiques
app.use(express.static("public"));
app.use('/public/images', express.static('public/images'));
// Configuration de Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "../frontend/public/images");
    },
    filename: function (req, file, cb) {
        cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    },
});
const upload = multer({storage: storage});
app.get("/", async (req, res) => {
    try {
        const productsResponse = await axios.get("http://localhost:5000/products");
        const categoriesResponse = await axios.get("http://localhost:5000/categories");
        const token = req.cookies.jwt;

        res.render('index.ejs', {
            products: productsResponse.data,
            categories: categoriesResponse.data,
            token: token
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred");
    }
});

// Route pour aller sur la wiews pour enregistrer un utilisateur
app.get("/register", (req, res) => {
    const secret = tokens.secretSync();

    const token = tokens.create(secret);

    //je stocke le token csrf dans un cookie
    res.cookie("csrfToken", token, {httpOnly: true});

    res.render("register.ejs", {csrfToken: token});
});

// Route pour enregistrer un utilisateur
app.post("/register", async (req, res) => {
    //je récupère le token csrf dans le cookie
    const csrfToken = req.cookies.csrfToken;
    //je vérifie que le token csrf est valide

    //console.log(tokens.verify(csrfToken,req.body._csrf));
    if (csrfToken !== req.body._csrf) {
        res.status(403).send("Jeton CSRF invalide");
        return;
    }

    const {name, password} = req.body;

    //j'envoi les données de l'utilisateur à l'API server

    await axios
        .post(
            "http://localhost:5000/register",
            {name, password},
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        )
        .then((response) => {
            //res.send('Utilisateur enregistré avec succès');

            return res.redirect("/login");
        })
        .catch((err) => {
            res.status(500).send("Erreur lors de l'enregistrement de l'utilisateur");
        });
});

// Route handler pour toutes les requêtes à "/products"
app.all("/products", upload.single("image"), (req, res) => {

    // Gère les requêtes GET à "/products"
    if (req.method === "GET") {
        // Demande à l'API les produits et envoie les données obtenues en réponse
        axios.get("http://localhost:5000/products")
            .then((response) => {
                res.status(200).json(response.data);
            })
            .catch((err) => { // Gère les erreurs lors de la récupération des produits
                res.status(500).send("Erreur lors de la récupération des produits");
            });
    }
    // Gère les requêtes POST à "/products"
    else if (req.method === "POST") {
        // Extraire les données du corps de requête
        const {product_name, product_description, price, category} = req.body;

        // Valeur par défaut pour l'image
        let imagePath = "default.png";

        // Modifier le chemin de l'image s'il y a un fichier téléchargé
        if (req.file) {
            imagePath = req.file.filename;
        }

        // Extraire le token CSRF du cookie
        const csrfToken = req.cookies.csrfToken;

        // Vérifier le token CSRF
        if (csrfToken !== req.body._csrf) {
            res.status(403).send("Jeton CSRF invalide");
            return;
        }

        // Demande à l'API d'ajouter un nouveau produit
        axios.post("http://localhost:5000/products",
            {
                product_name,
                product_description,
                price,
                category,
                image: imagePath,
            }
        )
            .then((response) => {
                res.redirect("/");
            })
            .catch((err) => { // Gère les erreurs lors de l'ajout du produit
                res.status(500).send("Erreur lors de l'ajout du produit");
            });
    }
    // Gère les requêtes DELETE à "/products"
    else if (req.method === "DELETE") {
        // Logique pour la suppression d'un produit
    }
});

app.get("/categories", (req, res) => {
    // Demander à l'API les catégories et envoyer les données obtenues en réponse
    axios.get("http://localhost:5000/categories")
        .then((response) => {
            res.status(200).json(response.data);
        })
        .catch((err) => {
            // Gère les erreurs lors de la récupération des catégories
            res.status(500).send("Erreur lors de la récupération des catégories");
        });
});
app.get("/addProduct", (req, res) => {
    const secret = tokens.secretSync();

    const token = tokens.create(secret);

    //je stocke le token csrf dans un cookie
    res.cookie("csrfToken", token, {httpOnly: true});

    res.render("addProduct.ejs", {token: req.cookies.jwt, csrfToken: token});
});
// gestion des erreurs CSRF

app.use(function (err, req, res, next) {
    if (err.code === "EBADCSRFTOKEN") {
        // Gérer l'erreur CSRF ici
        res.status(403); // Forbidden
        res.send("La session a expiré ou le formulaire a été altéré");
    } else {
        next(err);
    }
});
app.listen(3000, () => {
    console.log("Serveur démarré sur http://localhost:3000");
});

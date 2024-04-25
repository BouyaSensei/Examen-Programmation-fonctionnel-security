const express = require("express");
//const fetch = require('node-fetch');
const axios = require("axios");
const Tokens = require("csrf");
const tokens = new Tokens();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const session = require('express-session');
const cookieParser = require("cookie-parser"); // pour gérer les cookies

const app = express();

app.set("view engine", "ejs");
// TODO : Refactoriser le code

app.use(cookieParser());
app.use(express.urlencoded({extended: true})); // Pour supporter les corps encodés URL
app.use(express.json()); // Pour supporter les corps JSON

app.use(session({
    secret: '94+@&9miowi(chcx+xr%v)wa4p+yl20s$o-2)8h!3d+y0d(1!$',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 30000}, // Cookie expirera après 30 secondes
}));


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
        const secret = tokens.secretSync();

        const csrf_token = tokens.create(secret);
      
        res.render('index.ejs', {
            products: productsResponse.data,
            categories: categoriesResponse.data,
            token: token,
            csrfToken : csrf_token
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

  const { name, password } = req.body;

  //j'envoi les données de l'utilisateur à l'API server

  await axios
    .post(
      "http://localhost:5000/register",
      { name, password },
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


   


//  partie login
app.all("/login", async (req, res) => {
    if (req.method === "GET") {
        const secret = tokens.secretSync();
        const token = tokens.create(secret);
        res.cookie("toast", {type: "", message: ""}, {httpOnly: true});
        console.log(req.cookies);
        //console.log('oki');
        //declaration des toast pou affichage de message selon circonstance
        //req.session.toast  ? req.session.toast : { type: "", message: "" }
        // req.session.toast = { type: "", message: "" };

        res.cookie("csrfToken", token, {httpOnly: true});

        const info = {
            csrfToken: token,
            toast: req.cookies.toast
        }
        res.render("login.ejs", {info});
        //req.session.toast = null; // Réinitialiser le toast après l'affichage

    } else if (req.method === "POST") {

        const csrfToken = req.cookies.csrfToken;
        //je vérifie que le token csrf est valide

        //console.log(tokens.verify(csrfToken,req.body._csrf));
        if (csrfToken !== req.body._csrf) {
            res.status(403).send("Jeton CSRF invalide");
            return;
        }

        const {name, password} = req.body;

        //j'envoi les données de l'utilisateur à l'API server

        axios
            .post(
                "http://localhost:5000/login",
                {name, password},
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            )
            .then((response) => {
                //res.send('Utilisateur enregistré avec succès');
                const token = jwt.sign({name}, "secret");
                res.cookie("jwt", token, {httpOnly: true});

                return res.redirect("/dashboard");
            })
            .catch((err) => {
                req.cookies.toast.type = "error";
                req.cookies.toast.message = "Erreur  de connexion  utilisateur ! Veuillez réessayer ! ";
                console.log(req.cookies.toast);
                const info = {
                    csrfToken: req.cookies.csrfToken,
                    toast: req.cookies.toast
                }
                res.render("login.ejs", {info});
                // res.status(500).send("Erreur  de connexion  utilisateur");
            });
    }
});

app.get("/logout", (req, res) => {
    res.clearCookie("jwt");
    res.redirect("/");
});
//  partie dashboard
app.get("/dashboard", (req, res) => {

 
  if( req.cookies.jwt){
    if( !req.cookies.toast){
        res.cookie("toast", { type: "", message: "" }, { httpOnly: true });
    }
    req.cookies.toast.message = "Connexion réussi ! Bienvenue sur votre dashboard ! ";
    req.cookies.toast.type = "success";
    
    const info = {
        jwt: req.cookies.jwt,
        toast : req.cookies.toast
    }
    res.render("dashboard.ejs", { info });
    req.cookies.toast = null;
  }else{

    req.session.toast = "Erreur d'authentification ! ";
    req.session.toast.type = "error";
    res.redirect("/login");
   
  }
  //req.cookies.jwt ? res.render("dashboard.ejs", { token: req.cookies.jwt, toast : req.session.toast }): res.redirect("/");
});


// Route handler pour toutes les requêtes à "/products"
app.all("/products", upload.array("image", 10), (req, res) => {
    if (req.method === "GET") {
        // Handle GET requests to "/products"
        axios.get("http://localhost:5000/products")
            .then((response) => {
                res.status(200).json(response.data);
            })
            .catch((err) => {
                res.status(500).send("Error retrieving products");
            });
    } else if (req.method === "POST") {
        // Handle POST requests to "/products"
        const {product_name, product_description, price, category} = req.body;
        let imagePath = "default.png";
        if (req.file) {
            imagePath = req.files.map(file => file.path).join(',');
        }
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

        res.cookie("toast", { type: "add-success", message: "Produit ajouter  avec succes !" }, { httpOnly: true });
        
        res.redirect("/");
        //res.status(200).send("Produit ajouté avec succès");
      })
      .catch((err) => {
        res.status(500).send("Erreur lors de l'ajout du produit");
      });
  
    } else if (req.method === "DELETE") {
        // Handle DELETE requests to "/products"
        // Logic for deleting a product goes here
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


  
  res.render("addProduct.ejs", { token: req.cookies.jwt, csrfToken: token });

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

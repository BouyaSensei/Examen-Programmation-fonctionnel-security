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

app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); // Pour supporter les corps encodés URL
app.use(express.json()); // Pour supporter les corps JSON
// Middleware pour servir les fichiers statiques
app.use(express.static("public"));

// Configuration de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../frontend/public/images"); // Assurez-vous que ce dossier existe
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

app.get("/", (req, res) => {
  res.render("index.ejs", req.cookies.jwt ? { token: req.cookies.jwt } : null);
});

// Route pour aller sur la wiews pour enregistrer un utilisateur
app.get("/register", (req, res) => {
  const secret = tokens.secretSync();

  const token = tokens.create(secret);

  //je stocke le token csrf dans un cookie
  res.cookie("csrfToken", token, { httpOnly: true });

  res.render("register.ejs", { csrfToken: token });
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
app.all("/login", (req, res) => {
  if (req.method === "GET") {
    const secret = tokens.secretSync();
    const token = tokens.create(secret);
    res.cookie("csrfToken", token, { httpOnly: true });
    res.render("login.ejs", { csrfToken: token });
  } else if (req.method === "POST") {
    const csrfToken = req.cookies.csrfToken;
    if (csrfToken !== req.body._csrf) {
      res.status(403).send("Jeton CSRF invalide");
      return;
    }
    const { name, password } = req.body;
    //j'envoi les données de l'utilisateur à l'API server
    axios
      .post(
        "http://localhost:5000/login",
        { name, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        //res.send('Utilisateur enregistré avec succès');
        const token = jwt.sign({ name }, "secret");
        res.cookie("jwt", token, { httpOnly: true });
        return res.redirect("/dashboard");
      })
      .catch((err) => {
        res.status(500).send("Erreur  de connexion  utilisateur");
      });
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/");
});
//  partie dashboard
app.get("/dashboard", (req, res) => {
  req.cookies.jwt
    ? res.render("dashboard.ejs", { token: req.cookies.jwt })
    : res.redirect("/");
});

//  partie gestions des produits
app.all("/products", upload.single("image"), (req, res) => {
  if (req.method === "GET") {
    axios
      .get("http://localhost:5000/products")
      .then((response) => {
        res.status(200).json(response.data);
      })
      .catch((err) => {
        res.status(500).send("Erreur lors de la récupération des produits");
      });
  } else if (req.method === "POST") {
    const { product_name, product_description,price, category } =
      req.body;
     
    const imagePath = req.file.path; // Obtenez le chemin de l'image téléchargée
    //return console.log(imagePath);
    //je récupère le token csrf dans le cookie
    const csrfToken = req.cookies.csrfToken;
    //je vérifie que le token csrf est valide

    //console.log(tokens.verify(csrfToken,req.body._csrf));
    if (csrfToken !== req.body._csrf) {
      res.status(403).send("Jeton CSRF invalide");
      return;
    }

    axios
      .post(
        "http://localhost:5000/products",
        {
          product_name,
          product_description,
          price,
          category,
          imagePath,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        res.redirect("/dashboard");
        //res.status(200).send("Produit ajouté avec succès");
      })
      .catch((err) => {
        res.status(500).send("Erreur lors de l'ajout du produit");
      });
  }
});
app.get("/addProduct", (req, res) => {
  const secret = tokens.secretSync();

  const token = tokens.create(secret);

  //je stocke le token csrf dans un cookie
  res.cookie("csrfToken", token, { httpOnly: true });

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

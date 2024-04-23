const express = require("express");
//const fetch = require('node-fetch');
const axios = require("axios");
const Tokens = require("csrf");
const tokens = new Tokens();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser"); // pour gérer les cookies

const app = express();

app.set("view engine", "ejs");

app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); // Pour supporter les corps encodés URL
app.use(express.json()); // Pour supporter les corps JSON
// Middleware pour servir les fichiers statiques
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/register", (req, res) => {
  const secret = tokens.secretSync();

  const token = tokens.create(secret);

  //je stocke le token csrf dans un cookie
  res.cookie("csrfToken", token, { httpOnly: true });

  res.render("register.ejs", { csrfToken: token });
});

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

app.all("/login", (req, res) => {
    if(req.method === "GET"){
        const secret = tokens.secretSync();
        const token = tokens.create(secret);
        res.cookie("csrfToken", token, { httpOnly: true });
        res.render("login.ejs", { csrfToken: token });
    }else if(req.method === "POST"){
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
    };
});
app.get("/dashboard", (req, res) => {
  req.cookies.jwt ? res.render("dashboard.ejs",{token : req.cookies.jwt} ) : res.redirect("/");
 
});
// gestion des erreurs CSRF
app.get("/logout", (req, res) => {
    res.clearCookie("jwt");
    res.redirect("/");
})
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

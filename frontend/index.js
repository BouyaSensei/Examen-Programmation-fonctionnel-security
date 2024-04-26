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
const { expressCspHeader, NONCE, SELF, UNSAFE_INLINE, INLINE } = require('express-csp-header');
const app = express();

app.set("view engine", "ejs");
// TODO : Refactoriser le code

app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); // Pour supporter les corps encodés URL
app.use(express.json()); // Pour supporter les corps JSON

app.use(session({
  secret: '94+@&9miowi(chcx+xr%v)wa4p+yl20s$o-2)8h!3d+y0d(1!$',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }, // Cookie expirera après 30 secondes
}));

//'img-src': ['data:', 'images.com'],
app.use(expressCspHeader({

    directives: {
       
        'script-src': [SELF,NONCE,UNSAFE_INLINE,INLINE,'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js',
        'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js'],
        'style-src': [SELF,NONCE,UNSAFE_INLINE,INLINE, 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css'
        ,'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css'],
        'report-uri': 'http://localhost:3000/report-violation'
    },
   
    generateNonce: true,  // Active la génération de nonce
    
    

}));
// Middleware pour ajouter l'en-tête Content-Security-Policy
app.use((req, res, next) => {
    res.setHeader('Reporting-Endpoints', 'default="http://localhost:3000/report-violation"');
    next();
  });
// Middleware pour servir les fichiers statiques
app.use(express.static("public"));
app.post('/report-violation',express.json({type: 'application/csp-report'}) , (req, res) => {
    if (req.body) {
        
        console.log('CSP Violation: ', req.body);
        res.status(204).end();
    } else {
        console.log('CSP Violation: No data received!');
        res.status(400).send('No data received'); 
    }
   // res.status(204).end(); // Renvoyer une réponse sans contenu
});

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


const upload = multer({ storage: storage });


app.get("/", async (req, res) => {
  try {
    const productsResponse = await axios.get("http://localhost:5000/products");
    const categoriesResponse = await axios.get("http://localhost:5000/categories");
    const token = req.cookies.jwt;
    const secret = tokens.secretSync();

    const csrf_token = tokens.create(secret);

    jwt.verify(token, 'secret', async (err, decoded) => {
      if (err) {
        //   console.error("Erreur lors de la vérification du jeton JWT:", err);
        //   return res.status(401).json({ status: 'Erreur', message: 'Jeton inconnu' });

        return res.render("index.ejs", {
          products: productsResponse.data,
          categories: categoriesResponse.data,
          token: token,
          csrfToken: csrf_token,
          nonce: req.nonce
        }


        );

      }

      // Extraire le nom d'utilisateur du token décodé
      const username = decoded.name;
      // console.log("Nom d'utilisateur extrait du jeton JWT:", decoded);

      // Effectuer une requête vers le backend pour récupérer l'ID de l'utilisateur
      try {
        const userResponse = await axios.get('http://localhost:5000/getUserID', {
          params: {
            username: username
          }
        });
        const user_id = userResponse.data.user_id;
        console.log("ID de l'utilisateur actuelle récupéré:", user_id);

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


          return res.render("index.ejs", req.cookies.jwt ? { info } : null);

        }
        if (!req.cookies.toast) {
          res.cookie("toast", { type: "", message: "" }, { httpOnly: true });
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
    // console.error(error);
    res.status(500).send("An error occurred");
  }

});

// Route pour aller sur la wiews pour enregistrer un utilisateur
app.get("/register", (req, res) => {

    const secret = tokens.secretSync();
    const token = tokens.create(secret);
    
    // Je stocke le token csrf dans un cookie
    res.cookie("csrfToken", token, { httpOnly: true });
    
    const errorMessage = req.query.error; // Vérifie si une erreur est passée en tant que paramètre GET

    // Rendre la page d'inscription en transmettant le token csrf et éventuellement le message d'erreur
    res.render("register.ejs", { csrfToken: token, nonce : req.nonce, errorMessage });

});

app.post("/register", async (req, res) => {
    const csrfToken = req.cookies.csrfToken;
    
    // Vérification du token csrf
    if (csrfToken !== req.body._csrf) {
        res.status(403).send("Jeton CSRF invalide");
        return;
    }

    const { name, password } = req.body;
    const passwordRegexUpperCase = /^(?=.*[A-Z])/; // Au moins une majuscule
    const passwordRegexSpecialChar = /^(?=.*[@$!%*?&.()\\[\]{}<>^=+-_~|:;,])/; // Au moins un caractère spécial
    const passwordRegexChiffre = /^(?=.*[0123456789])/; // Au moins un caractère spécial
    const passwordMinLength = /^(?=.{8,})/; // Au moins 8 caractères

    if (!name || name.trim() === "") { // Vérification de la présence de l'indentifiant
        const secret = tokens.secretSync();
        const token = tokens.create(secret);
        res.cookie("csrfToken", token, { httpOnly: true });
        return res.render("register.ejs", {
            csrfToken: token,
            errorMessage: "Veuillez saisir un identifiant.",
            nonce : req.nonce
        });
    }

    if (!passwordRegexUpperCase.test(password) || !passwordRegexSpecialChar.test(password) || !passwordMinLength.test(password) || !passwordRegexChiffre.test(password)) { // Vérification pour le mdp 
        const secret = tokens.secretSync();
        const token = tokens.create(secret);
        res.cookie("csrfToken", token, { httpOnly: true });
        return res.render("register.ejs", {
            csrfToken: token,
            errorMessage: "Mot de passe incorrect. Il doit contenir au moins une majuscule, un chiffre, un caractère spécial et plsu de 8 caractères.",
            nonce : req.nonce
        });
    }

    //j'envoie les données de l'utilisateur à l'API server
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
    res.cookie("toast", { type: "", message: "" }, { httpOnly: true });
    //console.log('oki');
    //declaration des toast pou affichage de message selon circonstance
    //req.session.toast  ? req.session.toast : { type: "", message: "" }
    // req.session.toast = { type: "", message: "" };

    res.cookie("csrfToken", token, { httpOnly: true });

    const info = {
      csrfToken: token,
      toast: req.cookies.toast,
      nonce: req.nonce
    }
    res.render("login.ejs", { info });
    //req.session.toast = null; // Réinitialiser le toast après l'affichage

  } else if (req.method === "POST") {

    const csrfToken = req.cookies.csrfToken;
    //je vérifie que le token csrf est valide

    //console.log(tokens.verify(csrfToken,req.body._csrf));
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

        jwt.verify(token, 'secret', async (err, decoded) => {
          if (err) {
            console.error("Erreur lors de la vérification du jeton JWT:", err);
            return res.status(401).json({ status: 'Erreur', message: 'Jeton inconnu' });
          }

          // Extraire le nom d'utilisateur du token décodé
          const username = decoded.name;
          // console.log("Nom d'utilisateur extrait du jeton JWT:", decoded);

          // Effectuer une requête vers le backend pour récupérer l'ID de l'utilisateur
          try {
            const userResponse = await axios.get('http://localhost:5000/getUserID', {
              params: {
                username: username
              }
            });
            const user_id = userResponse.data.user_id;
            console.log("ID de l'utilisateur récupéré apres connexion:", user_id);

            // Inside the POST method for /login route

            // Verifier si req.session.cart existe et si oui "transferer le panier"
            if (req.session.cart && req.session.cart.length > 0) {
              req.session.cart.forEach(async function (element) {
                try {
                  // Effectuer une requête pour ajouter le produit au panier
                  const response = await axios.post('http://localhost:5000/addToCart', { user_id: user_id, product_id: element["ID"], quantity: element["quantity"], prix: element["prix"] });
                  // Vérifier si l'ajout au panier a réussi
                  if (response.data.success) {
                    console.log("Produit ajouté");
                  } else {
                    // Sinon, afficher un message d'erreur
                    console.error('Erreur lors de l\'ajout du produit au panier après connexion :');
                    // Vous pouvez gérer l'affichage de l'erreur comme vous le souhaitez ici
                  }
                } catch (error) {
                  console.error('Erreur lors de l\'ajout du produit au panier après connexion :', error);
                  // Vous pouvez également afficher un message d'erreur en cas d'échec de la requête
                }
              });
              // Une fois que tous les produits ont été ajoutés au panier, vider le panier dans la session
              req.session.cart = [];
              // Rediriger l'utilisateur vers la page du panier une fois que tous les produits ont été ajoutés avec succès
              // res.redirect("/panier");
            }



          } catch (error) {
            console.error("Erreur lors de la récupération de l'ID de l'utilisateur:", error);

          }
        });

        return res.redirect("/dashboard");
      })
      .catch((err) => {
        req.cookies.toast.type = "error";
        req.cookies.toast.message = "Erreur  de connexion  utilisateur ! Veuillez réessayer ! ";
        const info = {
          csrfToken: req.cookies.csrfToken,
          toast: req.cookies.toast
        }
        res.render("login.ejs", { info });
        // res.status(500).send("Erreur  de connexion  utilisateur");
      });
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  req.session.cart = [];
  res.redirect("/");
});
//  partie dashboard
app.get("/dashboard", (req, res) => {


  if (req.cookies.jwt) {
    if (!req.cookies.toast) {
      res.cookie("toast", { type: "", message: "" }, { httpOnly: true });
    }
    req.cookies.toast.message = "Connexion réussi ! Bienvenue sur votre dashboard ! ";
    req.cookies.toast.type = "success";

    const info = {
      jwt: req.cookies.jwt,
      toast: req.cookies.toast,
      nonce: req.nonce
    }
    res.render("dashboard.ejs", { info });
    req.cookies.toast = null;
  } else {

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
    const { product_name, product_description, price, category } = req.body;
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
app.get("/product/:id", async (req, res) => {
  const { id } = req.params;
  const token = req.cookies.jwt;

  jwt.verify(token, 'secret', async (err, decoded) => {
    if (err) {
        // console.error("Erreur lors de la vérification du jeton JWT:", err);
        // return res.status(401).json({ status: 'Erreur', message: 'Jeton inconnu' });
      const productResponse = await axios.get(`http://localhost:5000/product/${id}`);
      return res.render('product.ejs', {
        product: productResponse.data,
        token: token,
        nonce: req.nonce,
  
      });
    }

    // Extraire le nom d'utilisateur du token décodé
    const username = decoded.name;
    // console.log("Nom d'utilisateur extrait du jeton JWT:", decoded);

    // Effectuer une requête vers le backend pour récupérer l'ID de l'utilisateur
    try {
      const userResponse = await axios.get('http://localhost:5000/getUserID', {
        params: {
          username: username
        }
      });
      const user_id = userResponse.data.user_id;
      console.log("ID de l'utilisateur actuelle récupéré pour affichage produit:", user_id);

      try {



        const productResponse = await axios.get(`http://localhost:5000/product/${id}`);
        res.render('product.ejs', {
          product: productResponse.data,
          token: token,
          nonce: req.nonce,
          user_id: user_id
    
        });
      } catch (error) {
        // console.error(error);
        res.status(500).send("An error occurred while fetching the product");
      }

    } catch (error) {
      console.error("Erreur lors de la récupération de l'ID de l'utilisateur:");

    }
  });


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

app.get('/stats', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/stats').then();


    res.send(response.data);
  } catch (error) {
    // console.error(error);
    res.status(500).send('An error occurred');

  }
});

app.get("/addProduct", (req, res) => {
  const secret = tokens.secretSync();

  const token = tokens.create(secret);

  //je stocke le token csrf dans un cookie
  res.cookie("csrfToken", token, { httpOnly: true });



  res.render("addProduct.ejs", { token: req.cookies.jwt, csrfToken: token });

});


app.post("/addToCart", async (req, res) => {
  const { user_id, product_id, quantity, prix } = req.body;
  console.log(user_id);
  if (!user_id) {
    const response = await axios.post('http://localhost:5000/getLibelle', { product_id });

    if (response.data.success) {
      const libelleName = response.data.libelle;

      req.session.cart = [
        ...req.session.cart ?? [],
        {

          ID: product_id,
          Libellé: libelleName,
          quantity: quantity,
          prix: prix
        }
      ];
      return res.redirect("/panier");
    }

  }

  try {
    // Effectuer une requête pour ajouter le produit au panier
    const response = await axios.post('http://localhost:5000/addToCart', { user_id, product_id, quantity, prix });

    // Vérifier si l'ajout au panier a réussi
    if (response.data.success) {

      res.redirect("/panier");

    } else {
      // Sinon, afficher un message d'erreur
      console.error('Erreur lors de l\'ajout du produit au panier:');
      // Vous pouvez gérer l'affichage de l'erreur comme vous le souhaitez ici
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout du produit au panier:');
    // Vous pouvez également afficher un message d'erreur en cas d'échec de la requête
  }
});

// Afficher le panier
app.get("/panier", async (req, res) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.render("panier.ejs", { produitsPanier: req.session.cart, nonce: req.nonce });
  }

  try {
    // Vérifier le token JWT pour récupérer les informations d'identification de l'utilisateur
    const decoded = jwt.verify(token, 'secret');

    // Extraire le nom d'utilisateur du token décodé
    const username = decoded.name;

    // Effectuer une requête vers le backend pour récupérer l'ID de l'utilisateur
    const userResponse = await axios.get('http://localhost:5000/getUserID', {
      params: {
        username: username
      }
    });
    const user_id = userResponse.data.user_id;
    console.log("ID de l'utilisateur récupéré pour panier :", user_id);

    // Maintenant que vous avez l'ID de l'utilisateur, vous pouvez récupérer son panier depuis la base de données
    const userPanier = await axios.get('http://localhost:5000/getPanier', {
      params: {
        username: username
      }
    });
    const user_panier = userPanier.data;
    console.log("Panier du gamin :", user_panier);

    // Rendre la page panier.ejs avec les produits du panier
    res.render("panier.ejs", { produitsPanier: user_panier, nonce: req.nonce });

  } catch (err) {
    console.error("Erreur lors de la vérification du jeton JWT:");
    res.status(401).json({ status: 'Erreur', message: 'Jeton inconnu' });
  }
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

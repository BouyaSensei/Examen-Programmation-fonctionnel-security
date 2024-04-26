const express = require("express");
const axios = require("axios");
const Tokens = require("csrf");
const session = require('express-session');
const cookieParser = require("cookie-parser");
const {expressCspHeader, NONCE, SELF, UNSAFE_INLINE, INLINE} = require('express-csp-header');
const multer = require("multer");

// Importation des routes
const homeRoutes = require("./routes/homeRoutes");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const statsRoutes = require("./routes/statsRoutes");

// Importation de Swagger
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Options pour la documentation Swagger
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: "API de mon application",
            description: "Documentation de l'API",
            contact: {
                name: "Support technique",
            },
            servers: ["http://localhost:3000"],
        },
    },
    // Chemin vers les fichiers contenant la documentation Swagger
    apis: ["./routes/*.js", "./controllers/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Importation des middlewares
const csrfErrorMiddleware = require('./middlewares/crsfErrorMiddleware');

// Initialisation de l'application Express
const app = express();

// Configuration de l'application
app.set("view engine", "ejs"); // Définition du moteur de rendu pour les vues
app.use(cookieParser()); // Gestion des cookies
app.use(express.urlencoded({extended: true})); // Parsing des requêtes HTTP de type application/x-www-form-urlencoded
app.use(express.json()); // Parsing des requêtes HTTP de type application/json

// Configuration de la session
app.use(session({
    secret: '94+@&9miowi(chcx+xr%v)wa4p+yl20s$o-2)8h!3d+y0d(1!$',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 60000},
}));

// Configuration de la politique de sécurité du contenu (CSP)
app.use(expressCspHeader({
    directives: {
        'script-src': [SELF, NONCE, UNSAFE_INLINE, INLINE, 'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js'],
        'style-src': [SELF, NONCE, UNSAFE_INLINE, INLINE, 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css', 'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css'],
        'style-src-attr': [SELF, NONCE, UNSAFE_INLINE, INLINE],
        'report-uri': 'http://localhost:3000/report-violation'
    }, generateNonce: true,
}));

// Configuration des en-têtes de rapport
app.use((req, res, next) => {
    res.setHeader('Reporting-Endpoints', 'default="http://localhost:3000/report-violation"');
    next();
});

// Configuration des fichiers statiques
app.use(express.static("public"));
app.use('/public/images', express.static('public/images'));

// Configuration des routes
app.use(homeRoutes);
app.use(authRoutes);
app.use(dashboardRoutes);
app.use(productRoutes);
app.use(cartRoutes);
app.use(categoryRoutes);
app.use(statsRoutes);

// Utilisation de Swagger
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Gestion des erreurs CSRF
app.use(csrfErrorMiddleware);

// Route pour gérer les rapports de violation de la CSP
app.post('/report-violation', express.json({type: 'application/csp-report'}), (req, res) => {
    if (req.body) {
        console.log('CSP Violation: ', req.body);
        res.status(204).end();
    } else {
        console.log('CSP Violation: No data received!');
        res.status(400).send('No data received');
    }
});

// Démarrage du serveur
app.listen(3000, () => {
    console.log("Serveur démarré sur http://localhost:3000");
});
const express = require("express");
const axios = require("axios");
const Tokens = require("csrf");
const session = require('express-session');
const cookieParser = require("cookie-parser"); // pour gérer les cookies
const {expressCspHeader, NONCE, SELF, UNSAFE_INLINE, INLINE} = require('express-csp-header');
const app = express();
const homeRoutes = require("./routes/homeRoutes");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const statsRoutes = require("./routes/statsRoutes");
const multer = require("multer");
const csrfErrorController = require('./controllers/csrfErrorController');

app.set("view engine", "ejs");

app.use(cookieParser());
app.use(express.urlencoded({extended: true})); // Pour supporter les corps encodés URL
app.use(express.json()); // Pour supporter les corps JSON

app.use(session({
    secret: '94+@&9miowi(chcx+xr%v)wa4p+yl20s$o-2)8h!3d+y0d(1!$',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 60000}, // Cookie expirera après 30 secondes
}));

//'img-src': ['data:', 'images.com'],
app.use(expressCspHeader({

    directives: {

        'script-src': [SELF, NONCE, UNSAFE_INLINE, INLINE, 'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js',
            'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js'],
        'style-src': [SELF, NONCE, UNSAFE_INLINE, INLINE, 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css'
            , 'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css'],
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
app.post('/report-violation', express.json({type: 'application/csp-report'}), (req, res) => {
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


const upload = multer({storage: storage});

app.use(homeRoutes);
app.use(authRoutes);
app.use(dashboardRoutes);
app.use(productRoutes);
app.use(cartRoutes)
app.use(categoryRoutes)
app.use(statsRoutes)


app.use(csrfErrorController.handleCsrfError);
app.listen(3000, () => {
    console.log("Serveur démarré sur http://localhost:3000");
});

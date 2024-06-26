# API Frontend

## Architecture Frontend

L'architecture du projet frontend est la suivante :

```
frontend/
├── public/
│   ├── images
├── dist/
├── controllers/
│   ├── authController.js
│   ├── cartController.js
│   ├── productController.js
│   ├── categoryController.js
│   ├── dashboardController.js
│   ├── homeController.js
│   ├── statsController.js
├── middleewares
│   ├── crsfErrorMiddleware.js
├── routes/
│   ├── authRoutes.js
│   ├── cartRoutes.js
│   ├── productRoutes.js
│   ├── categoryRoutes.js
│   ├── dashboardRoutes.js
│   ├── homeRoutes.js
│   ├── statsRoutes.js
├── views/
│   ├── components/
│   │   └── navbar.ejs
│   ├── addProduct.ejs
│   ├── dashboard.ejs
│   ├── index.ejs
│   ├── login.ejs
│   ├── register.ejs
│   ├── panier.ejs
│   └── product.ejs
├── index.js
├── package.json
├── webpack.config.js
└── README.md

```
## Routes

### `/products`

- `GET /products`: Récupère la liste de tous les produits.
- `POST /products`: Ajoute un nouveau produit. Nécessite un objet produit dans le corps de la requête.
- `GET /products/:id`: Récupère les détails d'un produit spécifique.
- `PUT /products/:id`: Met à jour un produit spécifique. Nécessite un objet produit dans le corps de la requête.
- `DELETE /products/:id`: Supprime un produit spécifique.

### `/cart`

- `GET /cart`: Récupère le contenu du panier.
- `POST /cart`: Ajoute un produit au panier. Nécessite l'ID du produit dans le corps de la requête.

### `/auth`

- `POST /auth/login`: Connecte un utilisateur. Nécessite un objet utilisateur avec nom d'utilisateur et mot de passe dans le corps de la requête.
- `POST /auth/register`: Inscrit un nouvel utilisateur. Nécessite un objet utilisateur avec  nom d'utilisateur et mot de passe dans le corps de la requête.
- `POST /auth/logout`: Déconnecte l'utilisateur actuellement connecté.


## Modèles de données

### Produit

```json
{
  "id": "integer",
  "name": "string",
  "description": "string",
  "price": "number"
}
```
### Utilisateur

```json
{
  "id": "integer",
  "email": "string",
  "password": "string"
}
``` 

### Panier

```json
{
  "id": "integer",
  "userId": "integer",
  "products": [
    {
      "productId": "integer",
      "quantity": "integer"
    }
  ]
}
``` 


# Projet

## Utilisation

Il faudra renseigner un fichier .env à la racine du dossier [backend](backend/) avec les informations suivantes :

```bash
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=store
```

## Installation

```bash
# Un menu va apparaitre pour installer / executer le projet
node run.js

Choisissez une option :
 1. Installer les dépendances
 2. Exécuter les serveurs
 3. Quitter
```

## Documentations

### [Documentation pour le backend](backend/README.md)

### [Documentation pour le frontend](frontend/README.md)

les serveurs sont lancés sur les ports 3000 et 5000

### Fonctionnalités

### Webpack

Utilisation de Webpack pour la compilation du code et la minification du code.

 ```bash
# Compilation du code
npm run build

# exécution du serveur
npm run prod
```

- [x] Compilation du code
- [x] Minification du code

#### Produits

- [x] Affichage de la liste des produits
- [x] Ajout d'un produit
- [x] Suppression d'un produit
- [x] Modification d'un produit
- [x] Filtrage des produits

#### Panier

- [x] Affichage du panier
- [x] Ajout d'un produit au panier

#### Authentification

- [x] Connexion
- [x] Inscription
- [x] Déconnexion

#### Sécurité

- [x] CRSF
- [x] JWT
- [x] Chiffrement des mots de passe
- [x] Protection des routes
- [x] Protection des formulaires
- [x] Protection des requêtes
- [x] Protection des cookies
- [x] Protection des headers
- [x] Protection des données
- [x] Protection des sessions
- [x] Protection des tokens
- [x] Protection des cookies
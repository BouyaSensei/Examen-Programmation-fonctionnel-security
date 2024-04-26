const axios = require('axios');

const categoryController = {
    getCategories: (req, res) => {
        axios.get("http://localhost:5000/categories")
            .then((response) => {
                res.status(200).json(response.data);
            })
            .catch((err) => {
                res.status(500).send("Erreur lors de la récupération des catégories");
            });
    }
};

module.exports = categoryController;
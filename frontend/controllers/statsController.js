const axios = require('axios');

const statsController = {
    getStats: async (req, res) => {
        try {
            const response = await axios.get('http://localhost:5000/stats');
            res.send(response.data);
        } catch (error) {
            res.status(500).send('An error occurred');
        }
    }
};

module.exports = statsController;
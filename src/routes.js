const express = require('express');
const routes = express.Router();
const path = require('path');

routes.use(express.static(path.join(__dirname, '/PUBLIC/')));
routes.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/PUBLIC/index.html'));
});
routes.get('/status', (req, res) => {
    res.send({status: 200});
});

module.exports = routes;
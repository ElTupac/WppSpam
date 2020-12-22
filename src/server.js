const express = require('express');
const cors = require('cors');
const socket = require('websocket').server;
const { Client } = require('whatsapp-web.js');

const routes = require('./routes');
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());
app.use('/', routes);

let wss;
let id = 0;
let activeConn = [];
try {
    wss = new socket({
        httpServer: app.listen(PORT, () => {
            console.log(`Server en puerto ${PORT}`);
        })
    });
} catch (error) {
    console.log(`Fallo en ${PORT} socket`, error);
}

wss.on('request', req => {
    const connection = req.accept(null, req.origin);
    id++;
    activeConn.push({
        connection,
        id
    });
    let client = new Client();
    client.on('qr', qr => {
        connection.send(qr);
    });
    connection.on('close', (reason, desc) => {
        const index = activeConn.indexOf(c => c.id == id);
        activeConn.splice(index, 1);
    });
});
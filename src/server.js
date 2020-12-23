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
    let client = new Client({puppeteer:{ args: ['--no-sandbox'] }});
    client.on('qr', qr => {
        connection.send(JSON.stringify({connected: false, qr}));
    });
    client.on('authenticated', session => {
        connection.send(JSON.stringify({connected: true, qr: null}));
    });
    client.initialize();
    connection.on('close', (reason, desc) => {
        const index = activeConn.indexOf(c => c.id == id);
        console.log("desconectado");
        activeConn.splice(index, 1);
    });
    connection.on('message', data => {
        console.log(data.utf8Data);
        const { phoneNumber, howMany, interval, text } = JSON.parse(data.utf8Data).message;
        let counter = 0;
        const intervalID = setInterval(() => {
            if(counter < howMany){
                client.sendMessage(`${phoneNumber}@c.us`, text);
                counter++;
            }else{
                clearInterval(intervalID);
                client.logout();
            }
        }, parseInt(interval) * 1000);
    });
});

/* setInterval(() => {
    console.log(`${activeConn.length} usuarios conectados`);
}, 10000); */
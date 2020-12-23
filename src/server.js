const express = require('express');
const cors = require('cors');
const socket = require('websocket').server;
const { Client } = require('whatsapp-web.js');

const routes = require('./routes');
const PORT = process.env.PORT || 5000;
//This is all basis for our server config
const app = express();
app.use(cors());
app.use(express.json());
app.use('/', routes);

let wss; //here we will save our websocket server
let id = 0; //This will be an incremental id only for identifying our connections on the array
/*
    We are not really using these saved connections now, but in a future we can have them for other purpouses
*/
let activeConn = []; //Here we save our actives connections with the clients
try {   //try and catch for listening at our server
    wss = new socket({
        httpServer: app.listen(PORT, () => {
            console.log(`Server en puerto ${PORT}`);
        })
    });
} catch (error) {
    console.log(`Fallo en ${PORT} socket`, error);
}

wss.on('request', req => {  //event when a request of connection is made to the web socket server
    const connection = req.accept(null, req.origin); //With this we accept every request, not good for production, must add a middleware to control
    id++;   //we increment the id and add the connection to our array
    activeConn.push({
        connection,
        id
    });
    let count = 0;  //Will only make 10 qr refresh before loginout the client
    let timeoutLogout;
    let sending = false;
    let client = new Client({puppeteer:{ args: ['--no-sandbox'] }});
    client.on('qr', qr => {
        count++;
        connection.send(JSON.stringify({connected: false, qr}));    //Send the qr string to the client via web socket message
        if(count == 10) {
            client.logout();
        }
    });
    client.on('authenticated', session => { //listening to the authenticated event of wpp web and sending it to the client
        connection.send(JSON.stringify({connected: true, qr: null}));
        timeoutLogout = setTimeout(() => {  //In case no message is send on this time, the wpp client is logged out
            client.destroy();
        }, 1000 * 60 * 10);
    });
    client.initialize(); //Client initilize every time a request is made
    connection.on('close', (reason, desc) => { //when wss connection is close we get it out of the array
        const index = activeConn.indexOf(c => c.id == id);
        console.log("desconectado");
        activeConn.splice(index, 1);
        if(!sending) client.destroy();
    });
    connection.on('message', data => {  //listening for incoming message to start a message spam
        console.log(data.utf8Data);
        clearTimeout(timeoutLogout);
        sending = true;
        const { phoneNumber, howMany, interval, text } = JSON.parse(data.utf8Data).message;
        let counter = 0;
        const intervalID = setInterval(() => {
            if(counter < howMany){
                client.sendMessage(`${phoneNumber}@c.us`, text);
                counter++;
            }else{
                clearInterval(intervalID);
                client.destroy();
            }
        }, parseInt(interval) * 1000);
    });
});

/* setInterval(() => {
    console.log(`${activeConn.length} usuarios conectados`);
}, 10000); */
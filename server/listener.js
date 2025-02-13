const { database } = require('./database');
const express = require('express');
const webSocket = require('ws');
const http = require('http');

const wss = new webSocket.Server({ noServer: true });
const listenerApi = express();
const httpServer = http.createServer(listenerApi);

function create_message(body) {
  wss.clients.forEach(client => {
    if (client.readyState === webSocket.OPEN) {
      client.send(JSON.stringify(body));
    }
  });
}

httpServer.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (socket) => {
    wss.emit('connection', socket, request);
  });
});

httpServer.listen(process.env.MESSAGE_LISTENER_PORT);
module.exports = { create_message };
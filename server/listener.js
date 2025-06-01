const express = require('express');
const webSocket = require('ws');
const http = require('http');

const wss = new webSocket.Server({ noServer: true });
const listenerApi = express();
const httpServer = http.createServer(listenerApi);
const clients = new Map();

function create_message(body) {
  wss.clients.forEach(client => {
    if (client.readyState === webSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'message',
        body,
      }));
    }
  });
}

wss.on('connection', (ws, request) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    
    if (data.type === 'set_username') {
      clients.set(ws, data.username);
      
      wss.clients.forEach(client => {
        if (client.readyState === webSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'users',
            clients: Array.from(clients.values()),
          }));
        }
      });
    }
  });
  
  ws.on('close', (code, reason) => {
    clients.delete(ws);
    
    wss.clients.forEach(client => {
      if (client.readyState === webSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'users',
          clients: Array.from(clients.values()),
        }));
      }
    });
  });
});

httpServer.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (socket) => {
    wss.emit('connection', socket, request);
  });
});

httpServer.listen(process.env.WS_PORT);
module.exports = {
  create_message,
};
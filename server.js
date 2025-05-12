// server.js
const WebSocket = require('ws');
const express = require('express');
const { createProxy } = require('http-proxy-middleware');
const base64 = require('base-64');

const app = express();
const port = process.env.PORT || 3000;

// WebSocket Proxy
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws, req) => {
  const path = req.url.split('/')[1];
  try {
    const decoded = base64.decode(path);
    const [poolAddress, poolPort] = decoded.split(':');
    
    // Connect ke pool mining asli
    const poolSocket = new WebSocket(`wss://${poolAddress}:${poolPort}`);
    
    poolSocket.on('message', (data) => {
      ws.send(data);
    });
    
    ws.on('message', (data) => {
      poolSocket.send(data);
    });
    
    ws.on('close', () => {
      poolSocket.close();
    });
    
  } catch (error) {
    console.error('Invalid pool address:', error);
    ws.close();
  }
});

// HTTP Server
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Handle WebSocket upgrade
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});
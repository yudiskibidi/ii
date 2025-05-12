const WebSocket = require('ws');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws, req) => {
  const path = req.url.split('/')[1];
  try {
    // Menggunakan Buffer native untuk decode base64
    const decoded = Buffer.from(path, 'base64').toString();
    const [poolAddress, poolPort] = decoded.split(':');
    
    const poolSocket = new WebSocket(`wss://${poolAddress}:${poolPort}`);
    
    poolSocket.on('message', (data) => ws.send(data));
    poolSocket.on('error', (error) => console.error('Pool error:', error));
    
    ws.on('message', (data) => poolSocket.send(data));
    ws.on('error', (error) => console.error('Client error:', error));
    
    ws.on('close', () => poolSocket.close());

  } catch (error) {
    console.error('Invalid pool address:', error);
    ws.close();
  }
});

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

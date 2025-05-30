// server.js
const WebSocket = require('ws');
const port = 3000;
const wss = new WebSocket.Server({ host: '0.0.0.0', port });

console.log(`WebSocket server running on ws://localhost:${port}`);

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    const data = message.toString();
    try {
      const parsed = JSON.parse(data);
      console.log('Received:', parsed);

      // 广播给所有客户端
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(parsed));
        }
      });
    } catch (e) {
      console.error('Failed to parse message:', e);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});
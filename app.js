const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;

const wss = new WebSocket.Server({ port: PORT });

const clients = new Set();

wss.on('connection', function connection(ws) {
  clients.add(ws);
  ws.on('message', function incoming(message) {
    clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', function () {
    clients.delete(ws);
  });
});

console.log(`WebSocket server is running on port ${PORT}`);

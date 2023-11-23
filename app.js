const http = require('http');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

// app.use(express.static.apply("public"));
const serverPort = PORT;
const server = http.createServer(app);
const WebSocket = require('ws');


const wss = new WebSocket.Server({ server });

server.listen(serverPort);

const clients = new Set();

app.get('/', (req, res) => {
  res.write(`<h1>Socket IO Start on Port : ${PORT}</h1>`);
  res.end();
});

wss.on('connection', function connection(ws) {
  clients.add(ws);
  console.log("Connected!");
  ws.send('Welcome to the WebSocket server!');
  ws.on('message', function incoming(message) {
    console.log(message);
    clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', function () {
    console.log("Closed!")
    clients.delete(ws);
  });
});

console.log(`WebSocket server is running on port ${PORT}`);

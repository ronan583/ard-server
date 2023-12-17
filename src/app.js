const http = require("http");
const express = require("express");
const cors = require("cors");
const router = require("./routes/routes.js");
const startWebSocketServer = require("./controllers/wssHandler.js");
const WSS_PORT = process.env.PORT || 8765;  // heroku automatically sets a port number; in local it's 8765

const app = express();
app.use(
  cors({
    origin: "*",
  })
);
app.use("/api", router);
app.listen(8080, () => {
  console.log("http on 8080");
});

const server = http.createServer(app);
server.listen(WSS_PORT);
startWebSocketServer(server);

app.get("/", (_, res) => {
  res.write(`<h1>Socket IO Start on Port : ${WSS_PORT}</h1>`);
  res.end();
});

async function main() {
  try {
    console.log(`WebSocket server is running on  ${WSS_PORT}`);
  } catch (err) {}
}
main();

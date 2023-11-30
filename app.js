const http = require("http");
const cors = require("cors");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8765;

app.use(
  cors({
    origin: "*",
  })
);

const router = express.Router();
router.get("/names", getAllNames);
router.get("/csv/:name", getCsvByName);

app.use("/api", router);
app.listen(8080, () => {
  console.log("http on 8080");
});

// app.use(express.static.apply("public"));
const serverPort = PORT;
const server = http.createServer(app);
const WebSocket = require("ws");

const fs = require("fs").promises;
const os = require("os");
const BigNumber = require("bignumber");
const path = require("path");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const csvHeader = require("./constant.js");
const MilkingSessionManager = require("./milkingSession.js");

const wss = new WebSocket.Server({ server });

server.listen(serverPort);

const clients = new Set();

const MilkingStorage = require("./milkingStorage.js");
const storage = new MilkingStorage();

app.get("/", (req, res) => {
  res.write(`<h1>Socket IO Start on Port : ${PORT}</h1>`);
  res.end();
});

let isMilkingActive = false;
let milkingName = "";
let onMilking = false;

const EMPTY_VALUE = -1;

wss.on("connection", function connection(ws) {
  clients.add(ws);
  console.log("Connected!");
  ws.send("Welcome to the WebSocket server!");
  ws.on("message", async (data) => {
    console.log("Received data", String(data));
    // clients.forEach((client) => {
    //   if (client !== ws && client.readyState === WebSocket.OPEN) {
    //     client.send(data);
    //   }
    // });
    if (!isMilkingActive) {
      isMilkingActive = true;
      milkingName = createMilkingFileName();
    }
    try {
      const jsonData = JSON.parse(data);
      const now = new Date();
      const formattedDate = `${now.getFullYear()}-${
        now.getMonth() + 1
      }-${now.getDate()}`;
      const formattedTime = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
      const adc = jsonData.adc;
      const rgbArr = [];
      const sens = jsonData.Sens;
      console.log("Sens: ", sens);
      for (let i = 0; i < 4; i++) {
        if (adc[i] == 1 && sens[i].d) {
          rgbArr.push(sens[i].d.X);
          rgbArr.push(sens[i].d.Y);
          rgbArr.push(sens[i].d.Z);
          rgbArr.push(sens[i].d.I1);
          rgbArr.push(sens[i].d.I2);
        } else {
          rgbArr.push(null);
          rgbArr.push(null);
          rgbArr.push(null);
          rgbArr.push(null);
          rgbArr.push(null);
        }
      }
      let dataLine = null;
      dataLine = {
        name: milkingName,
        date: formattedDate,
        time: formattedTime,
        adc0: jsonData.adc[0] * 1,
        adc1: jsonData.adc[1] * 1,
        adc2: jsonData.adc[2] * 1,
        adc3: jsonData.adc[3] * 1,
        r_br:
          adc[0] == 1 && jsonData.Sens[0].d
            ? jsonData.Sens[0].d.X
            : EMPTY_VALUE,
        g_br:
          adc[0] == 1 && jsonData.Sens[0].d
            ? jsonData.Sens[0].d.Y
            : EMPTY_VALUE,
        b_br:
          adc[0] == 1 && jsonData.Sens[0].d
            ? jsonData.Sens[0].d.Z
            : EMPTY_VALUE,
        ir1_br:
          adc[0] == 1 && jsonData.Sens[0].d
            ? jsonData.Sens[0].d.I1
            : EMPTY_VALUE,
        ir2_br:
          adc[0] == 1 && jsonData.Sens[0].d
            ? jsonData.Sens[0].d.I2
            : EMPTY_VALUE,
        r_bl:
          adc[1] == 1 && jsonData.Sens[1].d
            ? jsonData.Sens[1].d.X
            : EMPTY_VALUE,
        g_bl:
          adc[1] == 1 && jsonData.Sens[1].d
            ? jsonData.Sens[1].d.Y
            : EMPTY_VALUE,
        b_bl:
          adc[1] == 1 && jsonData.Sens[1].d
            ? jsonData.Sens[1].d.Z
            : EMPTY_VALUE,
        ir1_bl:
          adc[1] == 1 && jsonData.Sens[1].d
            ? jsonData.Sens[1].d.I1
            : EMPTY_VALUE,
        ir2_bl:
          adc[1] == 1 && jsonData.Sens[1].d
            ? jsonData.Sens[1].d.I2
            : EMPTY_VALUE,
        r_fr:
          adc[2] == 1 && jsonData.Sens[2].d
            ? jsonData.Sens[2].d.X
            : EMPTY_VALUE,
        g_fr:
          adc[2] == 1 && jsonData.Sens[2].d
            ? jsonData.Sens[2].d.Y
            : EMPTY_VALUE,
        b_fr:
          adc[2] == 1 && jsonData.Sens[2].d
            ? jsonData.Sens[2].d.Z
            : EMPTY_VALUE,
        ir1_fr:
          adc[2] == 1 && jsonData.Sens[2].d
            ? jsonData.Sens[2].d.I1
            : EMPTY_VALUE,
        ir2_fr:
          adc[2] == 1 && jsonData.Sens[2].d
            ? jsonData.Sens[2].d.I2
            : EMPTY_VALUE,
        r_fl:
          adc[3] == 1 && jsonData.Sens[3].d
            ? jsonData.Sens[3].d.X
            : EMPTY_VALUE,
        g_fl:
          adc[3] == 1 && jsonData.Sens[3].d
            ? jsonData.Sens[3].d.Y
            : EMPTY_VALUE,
        b_fl:
          adc[3] == 1 && jsonData.Sens[3].d
            ? jsonData.Sens[3].d.Z
            : EMPTY_VALUE,
        ir1_fl:
          adc[3] == 1 && jsonData.Sens[3].d
            ? jsonData.Sens[3].d.I1
            : EMPTY_VALUE,
        ir2_fl:
          adc[3] == 1 && jsonData.Sens[3].d
            ? jsonData.Sens[3].d.I2
            : EMPTY_VALUE,
      };

      // let message;
      // if (jsonData.adc == "1111" && !onMilking) {
      //   message = "Milking started, all 4 cups working.";
      //   console.log(message);
      //   onMilking = true;
      // } else if (jsonData.adc !== "1111" && onMilking) {
      //   message = "Milking stopping...";
      //   console.log(message);
      //   onMilking = false;
      // } else if (jsonData.adc == "1111" && onMilking) {
      // }
      // dataLine.rg_br = getRG(dataLine.r_br, dataLine.g_br);
      // dataLine.rg_bl = getRG(dataLine.r_bl, dataLine.g_bl);
      // dataLine.rg_fr = getRG(dataLine.r_fr, dataLine.g_fr);
      // dataLine.rg_fl = getRG(dataLine.r_fl, dataLine.g_fl);
      // dataLine.msg = getMsgFrom([
      //   dataLine.rg_br,
      //   dataLine.rg_bl,
      //   dataLine.rg_fr,
      //   dataLine.rg_fl,
      // ]);
      //await fs.appendFile(`${milkingName}.csv`, csvLine + '\n');
      await storage.insertData(dataLine);
      console.log("Inserted data: ", dataLine);
    } catch (err) {
      console.error("Error writing to file", err);
    }
  });

  ws.on("close", () => {
    console.log("Client closed!");
    if (isMilkingActive) {
      console.log("Milking end.");
      isMilkingActive = false;
      milkingName = "";
    }
  });
});

function createMilkingFileName() {
  const now = new Date();
  return `${now.getDate()}_${
    now.getMonth() + 1
  }_${now.getFullYear()}_${now.getHours()}_${now.getMinutes()}`;
}

function getMsgFrom(rgArr) {
  let msg = "";
  let arr = [" BR", " BL", " FR", " FL"];
  let isBlood = false;
  for (idx in rgArr) {
    if (rgArr[idx] > 1.2) {
      isBlood = true;
      msg += arr[idx];
    }
  }
  if (isBlood) {
    msg = "Blood at" + msg;
  }
  return msg;
}

function getRG(r, g) {
  if (r != EMPTY_VALUE && g != EMPTY_VALUE) {
    const result = new BigNumber(r).dividedBy(g).toFixed(2);
    return parseFloat(result);
  } else {
    return EMPTY_VALUE;
  }
}

async function getAllNames(req, res) {
  try {
    const names = await storage.getAllMilkingNames("ASC");
    res.status(200).json(names);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getCsvByName(req, res) {
  const nameToLookup = req.params.name;
  console.log("request name to look: ", nameToLookup);
  try {
    const records = await storage.getAllRecordsByName(nameToLookup);
    console.log("records is: ", records);
    if (records.length == 0) {
      return res.status(400).json({ error: "no records found" });
    }
    const filePath = await generateCSV(records, nameToLookup);
    console.log("file path: ", filePath);
    res.download(filePath, (err) => {
      if (err) {
        console.error("File download fialed: ", err);
      }
      fs.unlink(filePath, () => {});
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function generateCSV(data, name) {
  const filePath = path.join(os.tmpdir(), `${name}.csv`);
  console.log(filePath);
  const writer = createCsvWriter({
    path: filePath,
    header: csvHeader,
  });
  data = data.map(({ id, name, date, ...item }) => {
    const rg_br = getRG(item.r_br, item.g_br);
    const rg_bl = getRG(item.r_bl, item.g_bl);
    const rg_fr = getRG(item.r_fr, item.g_fr);
    const rg_fl = getRG(item.r_fl, item.g_fl);
    const msg = getMsgFrom([rg_br, rg_bl, rg_fr, rg_fl]);
    date = new Date(date);
    date = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    return {
      ...item,
      date,
      rg_br,
      rg_bl,
      rg_fr,
      rg_fl,
      msg,
    };
  });
  await writer.writeRecords(data);
  return filePath;
}

async function main() {
  try {
    console.log(`WebSocket server is running on  ${PORT}`);
    await storage.open();
  } catch (err) {}
}
main();

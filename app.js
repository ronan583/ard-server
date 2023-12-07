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

// const router = express.Router();
// router.get("/names", getAllNames);
// router.get("/csv/:name", getCsvByName);

// app.use("/api", router);
app.get("/api/names", getAllNames);
app.get("/api/csv/:name", getCsvByName);
app.get("/api/statistic", getStatisticByDate);
app.listen(8080, () => {
  console.log("http on 8080");
});

// app.use(express.static.apply("public"));
const serverPort = PORT;
const server = http.createServer(app);
const WebSocket = require("ws");

const fs = require("fs").promises;
const os = require("os");
const Decimal = require("decimal.js");
const mathjs = require("mathjs");
const path = require("path");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const { sensorCsvHeader, statisticCsvHeader } = require("./constant.js");
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
    const result = new Decimal(r).dividedBy(g).toFixed(2);
    return result;
  } else {
    return EMPTY_VALUE;
  }
}

async function getAllNames(req, res) {
  try {
    let results;
    let todayFormattedString = getFormattedDateString(new Date());
    if (req.query.startDate) {
      if (req.query.endDate) {
        results = await queryNamesByDate(
          req.query.startDate,
          req.query.endDate
        );
      } else {
        results = await queryNamesByDate(
          req.query.startDate,
          todayFormattedString
        );
      }
    } else {
      results = await queryNamesByDate();
    }
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function queryNamesByDate(startDateString, endDateString) {
  try {
    let results;
    if (startDateString && endDateString) {
      results = await storage.getAllMilkingNames(
        "ASC",
        startDateString,
        endDateString
      );
    } else {
      results = await storage.getAllMilkingNames("ASC");
    }
    return results;
  } catch (err) {
    console.log(err);
  }
}

async function getStatisticListByDate() {}

async function getStatisticByDate(req, res) {
  try {
    const nameResults = await queryNamesByDate(
      req.query.startDate,
      req.query.endDate
    );
    let csvData = [];
    let fileNameDate =
      req.query.startDate.replaceAll("-", "") +
      "-" +
      req.query.endDate.replaceAll("-", "");
    console.log(fileNameDate);
    for (const item of nameResults) {
      // if (fileNameDate === "") {
      //   fileNameDate = transferWeirdDate(item.name);
      // }
      const records = await storage.getAllRecordsByName(item.name);
      const len = records.length;
      let startTime = records[0].time;
      let stopTime = records[len - 1].time;
      const rgBrArray = records.reduce((prevs, cur) => {
        let ratio = getRG(cur.r_br, cur.g_br);
        if (ratio !== EMPTY_VALUE) {
          prevs.push(ratio);
        }
        return prevs;
      }, []);
      const rgBlArray = records.reduce((prevs, cur) => {
        let ratio = getRG(cur.r_bl, cur.g_bl);
        if (ratio !== EMPTY_VALUE) {
          prevs.push(ratio);
        }
        return prevs;
      }, []);
      const rgFrArray = records.reduce((prevs, cur) => {
        let ratio = getRG(cur.r_fr, cur.g_fr);
        if (ratio !== EMPTY_VALUE) {
          prevs.push(ratio);
        }
        return prevs;
      }, []);
      const rgFlArray = records.reduce((prevs, cur) => {
        let ratio = getRG(cur.r_fl, cur.g_fl);
        if (ratio !== EMPTY_VALUE) {
          prevs.push(ratio);
        }
        return prevs;
      }, []);
      const [
        maxRgBr,
        maxRgBl,
        maxRgFr,
        maxRgFl,
        minRgBr,
        minRgBl,
        minRgFr,
        minRgFl,
        avgRgBr,
        avgRgBl,
        avgRgFr,
        avgRgFl,
        sigmaRgBr,
        sigmaRgBl,
        sigmaRgFr,
        sigmaRgFl,
      ] = [
        rgBrArray.length > 0 ? mathjs.max(rgBrArray) : -1,
        rgBlArray.length > 0 ? mathjs.max(rgBlArray) : -1,
        rgFrArray.length > 0 ? mathjs.max(rgFrArray) : -1,
        rgFlArray.length > 0 ? mathjs.max(rgFlArray) : -1,
        rgBrArray.length > 0 ? mathjs.min(rgBrArray) : -1,
        rgBlArray.length > 0 ? mathjs.min(rgBlArray) : -1,
        rgFrArray.length > 0 ? mathjs.min(rgFrArray) : -1,
        rgFlArray.length > 0 ? mathjs.min(rgFlArray) : -1,
        rgBrArray.length > 0 ? mathjs.mean(rgBrArray).toFixed(2) : -1,
        rgBlArray.length > 0 ? mathjs.mean(rgBlArray).toFixed(2) : -1,
        rgFrArray.length > 0 ? mathjs.mean(rgFrArray).toFixed(2) : -1,
        rgFlArray.length > 0 ? mathjs.mean(rgFlArray).toFixed(2) : -1,
        rgBrArray.length > 0 ? mathjs.std(rgBrArray).toFixed(2) : -1,
        rgBlArray.length > 0 ? mathjs.std(rgBlArray).toFixed(2) : -1,
        rgFrArray.length > 0 ? mathjs.std(rgFrArray).toFixed(2) : -1,
        rgFlArray.length > 0 ? mathjs.std(rgFlArray).toFixed(2) : -1,
      ];
      let csvLine = {
        name: transferWeirdDate(item.name),
        startTime,
        stopTime,
        maxRgBr,
        maxRgBl,
        maxRgFr,
        maxRgFl,
        minRgBr,
        minRgBl,
        minRgFr,
        minRgFl,
        avgRgBr,
        avgRgBl,
        avgRgFr,
        avgRgFl,
        sigmaRgBr,
        sigmaRgBl,
        sigmaRgFr,
        sigmaRgFl,
      };
      // console.log(csvLine);
      csvData.push(csvLine);
    }
    const filePath = await writeCsv(
      statisticCsvHeader,
      csvData,
      `batches_statistics_${fileNameDate}`
    );
    res.download(filePath, (err) => {
      if (err) {
        console.error("File download failed: ", err);
      }
      fs.unlink(filePath, () => {});
    });
  } catch (err) {
    console.log(err);
  }
}

async function writeCsv(header, data, name) {
  const filePath = path.join(os.tmpdir(), `${name}.csv`);
  const writer = createCsvWriter({
    path: filePath,
    header,
    encoding: "utf8",
  });
  await writer.writeRecords(data);
  console.log("-------", header);
  return filePath;
}

function getFormattedDateString(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const date = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${date}`;
}

async function getCsvByName(req, res) {
  const nameToLookup = req.params.name;
  try {
    const records = await storage.getAllRecordsByName(nameToLookup);
    if (records.length == 0) {
      return res.status(400).json({ error: "no records found" });
    }
    const filePath = await generateCSV(records, nameToLookup);
    res.download(filePath, (err) => {
      if (err) {
        console.error("File download failed: ", err);
      }
      fs.unlink(filePath, () => {});
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function generateCSV(data, name) {
  try {
    const filePath = path.join(os.tmpdir(), `${transferWeirdDate(name)}.csv`);
    const writer = createCsvWriter({
      path: filePath,
      header: sensorCsvHeader,
    });
    let withBlood = false;
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
    console.log(filePath);
    await writer.writeRecords(data);
    return filePath;
  } catch (error) {
    console.log(error);
  }
}

// dd-m-yyyy-h-min
function transferWeirdDate(weirdDate) {
  const arr = weirdDate.split("_");
  return `${arr[0].padStart(2, "0")}_${arr[1].padStart(2, "0")}_${
    arr[2]
  }_${arr[3].padStart(2, "0")}_${arr[4].padStart(2, "0")}`;
}

async function main() {
  try {
    console.log(`WebSocket server is running on  ${PORT}`);
    await storage.open();
  } catch (err) {}
}
main();
module.exports = {
  getStatisticByDate,
};

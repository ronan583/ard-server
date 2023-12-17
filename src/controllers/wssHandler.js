const WebSocket = require("ws");

const milkingStorage = require("../models/milkingStorage.js");
const { EMPTY_VALUE } = require("../constant.js");

let isMilkingActive = false;
let milkingName = "";
let onMilking = false;

/**
 * Logging data into database
 * Only support messages from 1 Arduino client device
 */
function startWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", function connection(ws) {
    console.log("Connected!");
    ws.send("Welcome to the WebSocket server!");
    ws.on("message", async (data) => {
      console.log("Received data", String(data));
      // clients.forEach((client) => {
      //   if (client !== ws && client.readyState === WebSocket.OPEN) {
      //     client.send(data);
      //   }
      // });

      // Name this milking with date and time on the first message
      if (!isMilkingActive) {
        isMilkingActive = true;
        milkingName = createMilkingName();
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
        // console.log("Sens: ", sens);
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
        await milkingStorage.insertData(dataLine);
        console.log("Inserted data: ", JSON.stringify(dataLine));
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
}

function createMilkingName() {
  const now = new Date();
  return `${now.getDate()}_${
    now.getMonth() + 1
  }_${now.getFullYear()}_${now.getHours()}_${now.getMinutes()}`;
}

module.exports = startWebSocketServer;

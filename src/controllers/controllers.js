const fs = require("fs").promises;
const os = require("os");
const mathjs = require("mathjs");
const path = require("path");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const milkingStorage = require("../models/milkingStorage.js");
const DateTimeUtils = require("../utils/timeAndDate.js");
const { getMsgFrom, getRG } = require("../utils/calculation.js");

const {
  sensorCsvHeader,
  statisticCsvHeader,
  EMPTY_VALUE,
  AVG_RG_THRESHOLD,
  DURATION_THRESHOLD,
} = require("../constant.js");

const queryNamesByDate = async (startDateString, endDateString) => {
  try {
    let results;
    if (startDateString && endDateString) {
      results = await milkingStorage.getAllMilkingNames(
        startDateString,
        endDateString,
        "ASC"
      );
    } else {
      results = await milkingStorage.getAllMilkingNames();
    }
    return results;
  } catch (err) {
    console.log(err);
  }
};

const retriveRgArr = (records, pos) => {
  return records.reduce((prevs, cur) => {
    let ratio = getRG(cur[`r_${pos}`], cur[`g_${pos}`]);
    if (ratio !== EMPTY_VALUE) {
      prevs.push(ratio);
    }
    return prevs;
  }, []);
};
/**
 * @param {*} records 
 * @param {string} name milking name (date)
 * @returns Nam/StartTime/StopTime/Type/Duration/Avg...Max...
 */
const createRecordsMetrics = (records, name) => {
  const len = records.length;
  const startTime = records[0].time;
  const stopTime = records[len - 1].time;
  const { duration, durationSec } = DateTimeUtils.calculateTimeGap(
    startTime,
    stopTime
  );
  const rgBrArray = retriveRgArr(records, "br");
  const rgBlArray = retriveRgArr(records, "bl");
  const rgFrArray = retriveRgArr(records, "fr");
  const rgFlArray = retriveRgArr(records, "fl");

  const rAndGArray = records.reduce((prevs, cur) => {
    const positionArr = [
      "r_br",
      "r_bl",
      "r_fr",
      "r_fl",
      "g_br",
      "g_bl",
      "g_fr",
      "g_fl",
    ];
    for (let i = 0; i < positionArr.length; i++) {
      const pos = positionArr[i];
      if (cur[pos] !== EMPTY_VALUE) {
        prevs.push(cur[pos]);
      }
    }
    return prevs;
  }, []);
  const [
    avgRG,
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
    rAndGArray.length > 0 ? mathjs.mean(rAndGArray).toFixed(2) : -1,
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

  // rule of judging whether the record is milking or washing/testing/...
  const type =
    avgRG < AVG_RG_THRESHOLD || durationSec <= DURATION_THRESHOLD
      ? "Not-Milking"
      : "Milking";

  return {
    name: DateTimeUtils.transferWeirdDate(name),
    startTime,
    stopTime,
    duration,
    avgRG,
    type,
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
};
/**
 * generate rg ratio and message when fetching sensor data file
 * @param {*} records 
 * @returns red/green ratio and info message for this line 
 */
const processRgMsg = (records) => {
  return records.map(({ id, name, date, ...item }) => {
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
};

const writeCsv = async (header, data, name) => {
  const filePath = path.join(os.tmpdir(), `${name}.csv`);
  const writer = createCsvWriter({
    path: filePath,
    header,
    encoding: "utf8",
  });
  await writer.writeRecords(data);
  return filePath;
};
/**
 * Retrieves milking record names for a specified date range.
 */
const getAllNames = async (req, res) => {
  try {
    let results;
    let todayFormattedString = DateTimeUtils.formatDateString(new Date());
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
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
/**
 * Retrieves statistical data for a specified date range.
 */
const getStatisticByDate = async (req, res) => {
  try {
    const nameResults = await queryNamesByDate(
      req.query.startDate,
      req.query.endDate
    );
    let csvData = [];
    let fileNameDate = DateTimeUtils.concatDateRange(
      req.query.startDate,
      req.query.endDate
    );
    for (const item of nameResults) {
      const records = await milkingStorage.getAllRecordsByName(item.name);
      const csvLine = createRecordsMetrics(records, item.name);
      // console.log(csvLine);
      csvData.push(csvLine);
    }
    csvData.sort((a, b) => a.name.localeCompare(b.name));
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
};
/**
 * Retrieves a CSV file with the specified name.
 */
const getCsvByName = async (req, res) => {
  const nameToLookup = req.params.name;
  try {
    const records = await milkingStorage.getAllRecordsByName(nameToLookup);
    if (records.length == 0) {
      return res.status(400).json({ error: "no records found" });
    }
    let withBlood = false;
    const data = processRgMsg(records);
    const filePath = await writeCsv(
      sensorCsvHeader,
      data,
      DateTimeUtils.transferWeirdDate(nameToLookup)
    );
    res.download(filePath, (err) => {
      if (err) {
        console.error("File download failed: ", err);
      }
      fs.unlink(filePath, () => {});
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllNames,
  getCsvByName,
  getStatisticByDate,
};

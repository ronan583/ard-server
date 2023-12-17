const {
  getAllNames,
  getCsvByName,
  getStatisticByDate,
} = require("../controllers/controllers.js");

const express = require("express");
const router = express.Router();

router.get("/names", getAllNames);
router.get("/csv/:name", getCsvByName);
router.get("/statistic", getStatisticByDate);

module.exports = router;

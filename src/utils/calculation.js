const { EMPTY_VALUE, BLOOD_THRESHOLD } = require("../constant.js");
const Decimal = require("decimal.js");

/**
 * receive r/g values, return blood info message
 */
const getMsgFrom = (rgArr) => {
  let msg = "";
  let arr = [" BR", " BL", " FR", " FL"];
  let isBlood = false;
  for (idx in rgArr) {
    if (rgArr[idx] > BLOOD_THRESHOLD) {
      isBlood = true;
      msg += arr[idx];
    }
  }
  if (isBlood) {
    msg = "Blood at" + msg;
  }
  return msg;
}

/**
 * calculate r/g ratio. return -1 when r or g illegal
 */
const getRG = (r, g) => {
  if (r != EMPTY_VALUE && g != EMPTY_VALUE) {
    const result = new Decimal(r).dividedBy(g).toFixed(2);
    return result;
  } else {
    return EMPTY_VALUE;
  }
}

module.exports = { getMsgFrom, getRG };

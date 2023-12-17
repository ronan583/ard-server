/**
 * @class "format" means yyyy-mm-dd
 */
class DateTimeUtils {
  /**
   * @param {string} startStr yyyy-mm-dd
   * @param {string} endStr yyyy-mm-dd
   * @returns {string} yyyymmdd-yyyymmdd
   */
  static concatDateRange(startStr, endStr) {
    return `${startStr.replaceAll("-", "")}-${endStr.replaceAll("-", "")}`;
  }

  /**
   * @param {Date} dateObj
   * @returns {string} "yyyy-mm-dd"
   */
  static formatDateString(dateObj) {
    return `${dateObj.getFullYear()}-${DateTimeUtils.pad(
      dateObj.getMonth() + 1
    )}-${DateTimeUtils.pad(dateObj.getDate())}`;
  }

  /**
   * "hh-mm-ss" "hh-mm-ss" -> "hh-mm-ss" diff
   * @param {string} startTime "hh-mm-ss"
   * @param {string} stopTime "hh-mm-ss"
   * @returns { {diffSec: number, diffStr: string} } {number, hh-mm-ss}
   */
  static calculateTimeGap(startTime, stopTime) {
    const start = DateTimeUtils.timeStringToDate(startTime);
    const stop = DateTimeUtils.timeStringToDate(stopTime);
    const diff = stop > start ? stop - start : 0;
    const diffTime = new Date(diff);
    let formatString = "";
    if (diffTime.getUTCHours() > 0) {
      formatString = `${DateTimeUtils.pad(
        diffTime.getUTCHours()
      )}:${DateTimeUtils.pad(diffTime.getUTCMinutes())}:${DateTimeUtils.pad(
        diffTime.getUTCSeconds()
      )}`;
    } else {
      formatString = `${DateTimeUtils.pad(
        diffTime.getUTCMinutes()
      )}:${DateTimeUtils.pad(diffTime.getUTCSeconds())}`;
    }
    // console.log(formatString);
    return { durationSec: diffTime / 1000, duration: formatString };
  }

  /**
   * Date obj -> "yyyy-mm-dd-hh-mm" -> int yyyymmddhhmm
   * @param {Date} date
   * @returns {number} yyyymmddhhmm
   */
  static formatDateTimeToNumber(date) {
    const formatted = DateTimeUtils.formatDateTimeString(date);
    return parseInt(formatted.replaceAll("-", "").replaceAll(":", ""));
  }

  /**
   * "d_m_yyyy_h_m" -> "yyyy-mm-dd-hh-mm" or "yyyy_mm_dd_hh_mm"
   * @param {string} weirdDate "d_m_yyyy_h_m"
   * @param {string} delimiter "- _ / etc."
   * @returns {string} "yyyy-mm-dd-hh-mm"
   */
  static transferWeirdDate(weirdDate, delimiter = "-") {
    const arr = weirdDate.split("_");
    const year = arr[2];
    const month = arr[1].padStart(2, "0");
    const day = arr[0].padStart(2, "0");
    const hour = arr[3].padStart(2, "0");
    const minute = arr[4].padStart(2, "0");
    return `${year}${delimiter}${month}${delimiter}${day}${delimiter}${hour}${delimiter}${minute}`;
  }

  /**
   * @example 9 -> 09
   */
  static pad(number) {
    return number.toString().padStart(2, "0");
  }

  static timeStringToDate(timeString, delimiter = ":") {
    const [hours, minutes, seconds] = timeString.split(delimiter);
    const date = new Date();
    date.setHours(hours, minutes, seconds, 0);
    return date;
  }

  /**
   * @param {Date} dateObj
   * @returns {string} "yyyy-mm-dd-hh-mm"
   */
  static formatDateTimeString(dateObj) {
    return `${DateTimeUtils.formatDateString(dateObj)}-${DateTimeUtils.pad(
      dateObj.getHours()
    )}:${DateTimeUtils.pad(dateObj.getMinutes())}`;
  }
}

module.exports = DateTimeUtils;

// console.log(DateTimeUtils.concatDateRange("2023-01-01", "2023-01-07"));
// console.log(DateTimeUtils.formatDateString(new Date()));
// console.log(DateTimeUtils.calculateTimeGap("08-30-10", "08-31-01").diffStr);
// console.log(DateTimeUtils.formatDateTimeToNumber(new Date()));
// console.log(DateTimeUtils.transferWeirdDate("1_2_2023_4_30", "-"));
// console.log(DateTimeUtils.transferWeirdDate("1_2_2023_4_30", "_"));

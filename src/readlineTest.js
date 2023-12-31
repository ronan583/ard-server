const readline = require("readline");
const app = require("./app.js");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const testCommand = {
  tz: () => {
    const transferTime = (now) => {
      console.log(typeof now);
      if (typeof now == "string") {
        return now;
      }
      return `${now.getFullYear()}-${
        now.getMonth() + 1
      }-${now.getDate()}  ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    };
    const now = new Date();
    const nzNow = now.toLocaleString("en-NZ", { timeZone: "Pacific/Auckland" });
    const utcNow = now.toLocaleString("en-GB", { timeZone: "UTC" });
    const nzNowNow = utcNow.toLocaleString("en-NZ", {
      timeZone: "Pacific/Auckland",
    });
    console.log(transferTime(now));
    console.log(transferTime(nzNow));
    console.log(transferTime(utcNow));
    console.log(transferTime(nzNowNow));
  },
  sts: () => {
    app.getStatisticByDate({
      query: { startDate: "2023-11-28", endDate: "2023-11-29" },
    });
  },
  tg: () => {
    console.log(app.calculateTimeGap("09:26:28", "10:26:42"));
  },
};

const readAndTest = () => {
  rl.question("Enter test input\n", (input) => {
    const test = testCommand[input];
    if (test) {
      test();
    } else {
      console.log(`Unknown command: ${test}`);
    }
  });
};

const justTest = () => {
  testCommand["tg"]();
};

justTest();

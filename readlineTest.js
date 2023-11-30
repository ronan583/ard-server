const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const testCommand = {
  timezone: () => {
    const transferTime = (now) => {
      console.log(typeof(now));
      if(typeof(now) == 'string'){
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
  test1: () => {},
};

const readTest = () => {
  rl.question("Enter test input\n", (input) => {
    const test = testCommand[input];
    if (test) {
      test();
    } else {
      console.log(`Unknown command: ${test}`);
    }
  });
};

readTest();

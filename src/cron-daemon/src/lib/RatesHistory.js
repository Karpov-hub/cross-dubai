import Queue from "@lib/queue";
import config from "@lib/config";

const time = "58 23 * * *";
// const time = "*/5 * * * *";
const description = "Rates history";

async function run() {
  if (config.ENABLE_NIL_RATE_HISTORY) {
    console.log(description);
    await Queue.newJob("ccoin-service", {
      method: "calculateAverageDailyRate",
      data: {}
    });
  }
  return;
}

export default {
  time,
  description,
  run
};

import Queue from "@lib/queue";
import config from "@lib/config";

const time = "*/30 * * * *";
// const time = "* * * * *";
const description = "Daily rates history";

async function run() {
  if (config.ENABLE_NIL_RATE_HISTORY) {
    console.log(description);
    await Queue.newJob("ccoin-service", {
      method: "calculateTodaysNilRates",
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

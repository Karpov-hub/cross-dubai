import Queue from "@lib/queue";

const time = "0 0 * * *"; //Cron job every night at midnight is a commonly used cron schedule.
// const time = "* * * * *"; //every 1 minute (for develop)
const description = "VAT checker daemon";

async function run() {
  console.log("VAT checker");

  await Queue.newJob("auth-service", {
    method: "checkVAT",
    data: {}
  });
  return;
}

export default {
  time,
  description,
  run
};

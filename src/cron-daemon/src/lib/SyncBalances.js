import db from "@lib/db";
import Queue from "@lib/queue";

const time = "1 1 1 * * *"; //"1 1 * * * *";
const description = "Rates reader daemon";

async function run() {
  await Queue.newJob("account-service", {
    method: "syncBalances",
    data: {}
  });
  return;
}

export default {
  time,
  description,
  run
};

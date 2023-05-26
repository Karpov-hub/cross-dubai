import Queue from "@lib/queue";

const time = "0 55 23 * * *"; // At 11:55 PM
// const time = "*/30 * * * * *"; //every 30 seconds (for develop)
const description = "Fixing balances";

async function run() {
  console.log(description);
  await Queue.newJob("account-service", {
    method: "fixingBalances",
    data: {}
  });
  return;
}

export default {
  time,
  description,
  run
};

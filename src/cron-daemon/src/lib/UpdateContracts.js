import Queue from "@lib/queue";

const time = "0 0 * * *"; // At 00:00
// const time = "* * * * *"; //every 1 minute (for develop)
const description = "Change contract status or expiration date";

async function run() {
  await Queue.newJob("merchant-service", {
    method: "renewalContracts",
    data: {}
  });
  return;
}

export default {
  time,
  description,
  run
};

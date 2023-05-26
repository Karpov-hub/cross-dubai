import Queue from "@lib/queue";

const time = "*/2 * * * *";
const description = "Get latest network fees";

async function run() {
  await Queue.newJob("ccoin-service", {
    method: "getAndSaveLatestFees",
    data: {}
  });
  return;
}

export default {
  time,
  description,
  run
};

import config from "@lib/config";
import Queue from "@lib/queue";

const time = config.paymentCheckerCron;
const description = "Payment checker";

async function run() {
  await Queue.newJob("ccoin-service", {
    method: "sendCryptoPaymentChecker",
    data: {}
  });
  return;
}

export default {
  time,
  description,
  run
};

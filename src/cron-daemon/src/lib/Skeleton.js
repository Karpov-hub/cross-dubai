import db from "@lib/db";
import Queue from "@lib/queue";

const time = "1 1 1 * * *";
const description = "Monthly comissions";

async function run(jobId, checkRecord) {}

export default {
  time,
  description,
  run
};

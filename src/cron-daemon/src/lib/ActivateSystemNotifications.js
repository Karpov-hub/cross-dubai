import Queue from "@lib/queue";
import config from "@lib/config";

const time = "*/5 * * * *";
const description = "Update system notification status";

async function run() {
  console.log(description);

  await Queue.newJob("auth-service", {
    method: "updateSystemNotificationsStatus",
    data: {}
  });
}

export default {
  time,
  description,
  run
};

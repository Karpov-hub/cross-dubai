import Queue from "@lib/queue";

// const time = "* * * * *";
const time = "0 0 1 * *";
const description = "Monthly invoice data record report";

async function run() {
  await Queue.newJob("report-service", {
    method: "generateReport",
    data: { report_name: "DataRecordReport", format: "xlsx" }
  });
  return;
}

export default {
  time,
  description,
  run
};

import db from "@lib/db";
import Queue from "@lib/queue";

async function requestReport(data) {
  await db.reports_queue.create({
    data: data
  });
  return true;
}

async function reportChecker() {
  let job = await db.reports_queue.findOne({
    where: {
      status: 1 //0-pending, 1-in process, 2-done, 3-error
    },
    raw: true
  });

  if (job) return false;

  job = await db.reports_queue.findOne({
    where: {
      status: 0
    },
    order: [["ctime", "ASC"]],
    raw: true
  });

  if (job) {
    await db.reports_queue.update({ status: 1 }, { where: { id: job.id } });

    _callAdmin(job);

    let report = await Queue.newJob(job.data.service, {
      method: job.data.method,
      data: { job_id: job.id, ...job.data }
    });

    let report_status = 3;
    if (report && report.result && report.result.success) report_status = 2;

    const err =
      report && report.result && report.result.error
        ? report.result.error
        : null;

    await db.reports_queue.update(
      { status: report_status, error: err },
      { where: { id: job.id } }
    );

    _callAdmin(job);

    return true;
  }

  return false;
}

function _callAdmin(data) {
  Queue.broadcastJob("call-admin", {
    model: "Crm.modules.reports.model.ReportsQueueModel",
    method: "onChange",
    data
  });
}

export default {
  requestReport,
  reportChecker
};

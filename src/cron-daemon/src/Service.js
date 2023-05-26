import Base from "@lib/base";
import db from "@lib/db";
import { CronJob } from "cron";
import Jobs from "./lib";

export default class Service extends Base {
  publicMethods() {
    return {};
  }
  async run() {
    this.pushPermissions();
    await this.getTriggersFromService();
    this.subscribe();
    this.jobs = {};

    await this.continueUnfinished();

    this.createJobs();
    this.startJobs();
  }

  createJobs() {
    Object.keys(Jobs).forEach((jobName) => {
      this.jobs[jobName] = new CronJob(Jobs[jobName].time, () => {
        this.runJob(jobName, Jobs[jobName]);
      });
    });
  }

  async runJob(jobName, jobInstance) {
    if (!jobInstance || !jobInstance.run) return;
    const jobId = await this.getJobId(jobName);
    try {
      await jobInstance.run(jobId, async (id) => {
        return await this.checkRecord(jobId, id);
      });
    } catch (e) {
      console.log("ERROR IN JOB: ", jobName);
      console.log(e);
    }
    await db.operation.destroy({ where: { name: jobName } });
  }

  async getJobId(name) {
    let res = await db.operation.findOne({
      where: { name },
      attributes: ["id"]
    });
    if (res) return res.get("id");
    res = await db.operation.create({ name, ctime: new Date() });
    if (res) return res.get("id");
    return null;
  }

  async checkRecord(op_id, rec_id) {
    const res = await db.operation_processed.findOne({
      where: { op_id, rec_id },
      attributes: ["op_id"]
    });
    return !res;
  }

  startJobs() {
    Object.keys(this.jobs).forEach((jobName) => {
      this.jobs[jobName].start();
    });
  }

  stopJobs() {
    Object.keys(this.jobs).forEach((jobName) => {
      this.jobs[jobName].stop();
    });
  }

  stopJob(name) {
    this.jobs[name].stop();
  }

  startJob(name) {
    this.jobs[name].start();
  }

  async continueUnfinished() {
    const res = await db.operation.findAll({ attributes: ["name"] });
    for (let item of res) {
      await this.runJob(item.get("name"), Jobs[item.get("name")]);
    }
  }
}

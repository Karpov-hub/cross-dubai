import Base from "@lib/base";
import db from "@lib/db";
import Queue from "@lib/queue";
import MemStore from "@lib/memstore";
import FeeCalculator from "./lib/feeCalculator";
import RuleFunctions from "./lib/ruleFunctions";

const CHECK_TRIGGER_TIMEOUT = 30; // sec

export default class Service extends Base {
  async run() {
    this.pushPermissions();
    await this.publicTriggers();
    await this.getTriggersFromService();
    await this.updateViews();
    this.subscribe();
  }

  publicMethods() {
    return {
      onTrigger: {},
      readTriggers: {},
      publicTriggers: {},
      testTrigger: {},
      getRuleFunctions: {},
      updateViews: {}
    };
  }

  async updateViews() {
    const views = await db.viewset.findAll({});
    const out = {};
    views.forEach((v) => {
      out[v.name] = v.sql;
    });
    FeeCalculator.viewsSet(out);
  }

  async onTrigger(data, realmId, userId) {
    const res = await MemStore.get(data.trigger);
    if (res) {
      // триггер заполнен примером данных, пропускаем его
    } else {
      await this.saveTriggerDataExample(data);
    }
    let result, error;

    try {
      result = await FeeCalculator.calculate(data, realmId, userId);
    } catch (e) {
      error = e;
    }
    return {
      list: result ? result.transactions : null,
      tags: result ? result.tags : null,
      output: result ? result.output : null,
      error
    };
  }

  async saveTriggerDataExample(data) {
    const trigger = data.trigger.split(":");
    await db.trigger.update(
      {
        data
      },
      {
        where: {
          service: trigger[0],
          method: trigger[1]
        }
      }
    );
    await MemStore.set(data.trigger, true, CHECK_TRIGGER_TIMEOUT); // restore data once in 10 minutes
  }

  async readTriggers(params) {
    let data = [];

    if (!params.service) throw "INVALIDREQUEST";

    const res = await db.trigger.findAll({
      where: { service: params.service },
      attributes: ["method"]
    });

    if (res && res.length)
      res.forEach((row) => {
        data.push(row.dataValues.method);
      });

    return { data };
  }

  async publicTriggers() {
    Queue.broadcastJob("getTriggersFromService", {});
  }

  async testTrigger(data, realmId, userId, transfers, hooks) {
    return { id: 123 };
  }

  getRuleFunctions() {
    return Object.keys(RuleFunctions).map((funcName) => {
      name: funcName;
    });
  }
}

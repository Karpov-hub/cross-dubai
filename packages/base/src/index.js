import Queue from "@lib/queue";
import db from "@lib/db";
import config from "@lib/config";
import Transaction from "./transaction";

export default class Base {
  constructor(conf) {
    this.config = conf;
    /*if (
      !!this.config.name &&
      ["staging", "production"].includes(process.env.NODE_ENV)
    )
      process.title = this.config.name;*/
    this.triggers = [];
  }

  async run() {
    this.pushPermissions();
    await this.getTriggersFromService();
    this.subscribe();
  }

  async pushPermissions() {
    await this.waitGate();
    Queue.broadcastJob("pushPermissions", this.serviceDescription());
  }

  waitGate() {
    return new Promise(async (res, rej) => {
      const { result } = await Queue.newJob(
        "gate-server",
        {
          method: "getStatus",
          data: {}
        },
        10000
      );
      if (result && result.isReady) {
        return res();
      }
      setTimeout(async () => {
        await this.waitGate();
        return;
      }, 500);
    });
  }

  serviceDescription() {
    return {
      service: this.config.name,
      publicMethods: this.publicMethods()
    };
  }

  // we list public methods by default
  allPublicMethods() {
    let list = this.publicMethods();
    list.serviceDescription = {};
    list.getTriggersFromService = {};
    return list;
  }

  async runServiceMethod(data, testObj) {
    const permis = this.allPublicMethods();
    if (!data.dataHeaders) {
      data.dataHeaders = { lang: "en" };
    }

    if (!!permis[data.method].method) {
      return await this.runMethodTroughTriggers(
        permis[data.method].method,
        data
      );
    }
    if (!!this[data.method]) {
      return await this.runMethodTroughTriggers(
        this[data.method],
        data,
        testObj
      );
    }
    throw "METHODNOTFOUND";
  }

  async runMethodTroughTriggers(method, data, testObj) {
    const transfers = {
      service: this.config.name,
      method: data.method,
      data: data.data,
      list: [],
      tags: [],
      output: {}
    };
    const hooks = {};

    let refUserId;
    if (data.userId) refUserId = await this.getRefUserId(data.userId);
    let variables = [];

    let result = await method.call(
      this,
      data.data,
      data.realmId,
      data.userId,
      transfers,
      hooks,
      data.scope,
      data.operation,
      data.dataHeaders,
      variables
    );

    data.refUserId = refUserId;
    let { list, tags, error, output } = await this.checkTriggers(
      {
        result,
        data,
        realmId: data.realmId,
        userId: data.userId
      },
      transfers,
      variables
    );

    if (error) throw error;

    if (output) result.output = output;

    let transfer, txQueries;

    if (list) transfers.list = transfers.list.concat(list);
    if (tags) transfers.tags = transfers.tags.concat(tags);
    if (output)
      Object.keys(output).forEach((key) => {
        transfers.output[key] = output[key];
      });

    if (transfers.list && transfers.list.length) {
      if (transfers) {
        if (!!testObj) testObj.transfers = transfers.list;
        txQueries = await this.doTransaction(
          transfers,
          data.realmId,
          data.userId,
          hooks
        );
        if (!!hooks.onTariffCompleted) {
          await hooks.onTariffCompleted(result, transfers, txQueries);
        }
      } else if (!!hooks.onTariffCompleted) {
        await hooks.onTariffCompleted(result, transfers);
      }
    }

    if (tags) {
      txQueries = this.addTagsQuery(txQueries, tags);
    }

    if (txQueries && !data.data.test) {
      transfer = await Transaction.transaction(
        txQueries,
        hooks.onTransaction,
        data.operation
      );
    }

    if (!!hooks.beforeSendResult) {
      const sendRes = await hooks.beforeSendResult(result, transfer, list);
      if (sendRes) result = sendRes;
    }
    try {
      if (data.data && data.data.ref_id && result && !result.ref_id)
        result.ref_id = data.data.ref_id;
    } catch (error) {
      console.log("runMethodTroughTriggers", error);
      throw "runMethodTroughTriggers result TypeError";
    }

    if (tags && !!testObj) testObj.tags = tags;

    return result;
  }

  addTagsQuery(txQueries, tags) {
    if (!txQueries) txQueries = {};
    if (!txQueries.list) txQueries.list = [];
    tags.forEach((t) => {
      txQueries.list.push({
        model: "tag",
        action: "create",
        data: {
          entity: t.entity,
          tag: t.tag
        }
      });
    });
    return txQueries;
  }

  async getRefUserId(userId) {
    const user = await db.user.findOne({
      where: { id: userId },
      attributes: ["ref_user"]
    });
    if (user) return user.get("ref_user");
    return null;
  }

  subscribe() {
    const permis = this.allPublicMethods();
    console.log("Service ", this.config.name, "started...");

    //process.title = this.config.name;

    Queue.subscribe(
      this.config.name,
      { queue: config.queueName },
      async (data, reply) => {
        let result;
        if (!!data.method && !!permis[data.method]) {
          try {
            result = await this.runServiceMethod(data);
            Queue.publish(reply, { result });
          } catch (e) {
            console.log(
              "error(",
              data.method,
              "):",
              e && e.response ? e.response.data : e,
              result
            );
            Queue.publish(reply, { error: e });
          }
        }
      }
    );
    Queue.subscribe("broadcast-request", async (data, reply) => {
      let result;
      if (!!data.method && !!permis[data.method] && !!this[data.method]) {
        try {
          result = await this.runServiceMethod(data);
          Queue.publish(reply, result);
        } catch (e) {
          Queue.publish(reply, { error: e });
        }
      }
    });
  }

  async getTriggersFromService() {
    let res;
    if (this.config.name == "tariff-service") {
      res = await this.readTriggers({ service: this.config.name });
    } else {
      const { result } = await Queue.newJob(
        "tariff-service",
        {
          method: "readTriggers",
          data: { service: this.config.name }
        },
        1000
      );
      res = result;
    }
    if (res && res.data) this.triggers = res.data;
    return true;
  }

  async checkTriggers(data, transfers, variables) {
    let res = [],
      result;

    if (this.triggers.includes(data.data.method)) {
      if (this.config.name == "tariff-service") {
        result = await this.onTrigger(
          {
            trigger: `${this.config.name}:${data.data.method}`,
            variables,
            data: data.data.data,
            ref_user: data.data.refUserId,
            transfers,
            result: data.result,
            scope: data.data.scope
          },
          data.data.realmId,
          data.data.userId
        );
      } else {
        const jRes = await Queue.newJob("tariff-service", {
          method: "onTrigger",
          data: {
            trigger: `${this.config.name}:${data.data.method}`,
            variables,
            data: data.data.data,
            ref_user: data.data.refUserId,
            transfers,
            result: data.result,
            scope: data.data.scope
          },
          realmId: data.data.realmId,
          userId: data.data.userId
        });
        result = jRes.result;
      }
      if (result) res = result;
    }

    return res;
  }

  async doTransaction(data, realmId, userId, hooks) {
    if (!!this.doTransfer) {
      return await this.doTransfer(data, realmId, userId);
    } else {
      const result = await Queue.newJob("account-service", {
        method: "doTransfer",
        data,
        realmId,
        userId
      });
      if (result.error) throw result.error;
      return result.result;
    }
  }
}

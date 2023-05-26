import Base from "@lib/base";
import db from "@lib/db";
import excelGenerator from "@lib/excel-generator";
import Queue from "@lib/queue";
import config from "@lib/config";

const Op = db.Sequelize.Op;

export default class Service extends Base {
  publicMethods() {
    return {
      serviceDescription: {},
      sendStatement: {
        realm: true,
        description: "sendStatement",
        method: this.sendStatement,
        schema: {
          type: "object",
          properties: {
            date_from: { type: "string" },
            date_to: { type: "string" },
            acc_no: { type: "string" },
            type: { type: "string" },
          },
          required: ["date_from", "date_to", "acc_no", "type"],
        },
      },
      getPublicMethods: {
        realm: true,
        description: "getPublicMethods",
      },
    };
  }

  async getAccountStatement(data, realm) {
    let where = {};
    let attributes = ["id", "amount", "ctime"];
    let out = [];

    if (data.date_from || data.date_to)
      where.ctime = this.getDateConditions(data.date_from, data.date_to);
    if (data.type == "incoming") {
      where.acc_dst = data.acc_no;
      attributes.push("currency_dst", "description_dst", "acc_src");
    }
    if (data.type == "outgoing") {
      where.acc_src = data.acc_no;
      attributes.push("currency_src", "description_src", "acc_dst");
    }

    const transactions = await db.transaction.findAll({
      where,
      attributes,
    });

    if (!transactions && !transactions.length) throw "THEREISNTTRANSACTIONS";

    for (const item of transactions) {
      let outdata = {};
      if (data.type == "incoming") {
        outdata.counterparty = await this.query(item.acc_src, realm);
        outdata.currency = item.currency_dst;
        outdata.description = item.description_dst;
      }
      if (data.type == "outgoing") {
        outdata.counterparty = await this.query(item.acc_dst, realm);
        outdata.currency = item.currency_src;
        outdata.description = item.description_src;
      }
      out.push({
        date: item.ctime,
        amount: item.amount,
        currency: outdata.currency,
        type: data.type,
        description: outdata.description,
        id: item.id,
        counterparty:
          outdata.counterparty.first_name +
          " " +
          outdata.counterparty.last_name,
      });
    }

    return out;
  }

  async sendStatement(data, realm) {
    let res = await this.getAccountStatement(data, realm);

    if (!res.length) throw "THEREISNTACCOUNTSTATEMENTS";

    let keys = await this.getKeys(res[0]).flat(4);
    let columns = [];

    for (const item of keys) {
      if (item != "first_name" && item != "last_name" && item != "email")
        columns.push({ header: item, key: item, width: 50 });
    }

    let xls_data = {
      name: `Transactions ${new Date()}.xlsx`,
      title: "Title",
      description: "Description",
      lists: [
        {
          title: `Report ${new Date()}`,
          columns,
          data: res,
        },
      ],
    };
    let xls_code = await excelGenerator.generate(xls_data);

    let attachments = [
      {
        filename: "Statement",
        path: `${config.upload_dir}/${xls_code.code}`,
      },
    ];

    Queue.newJob("mail-service", {
      method: "send",
      data: {
        lang: arguments[7].lang,
        code: "send-statement",
        to: res[0].counterparty.email,
        body: "",
        attachments,
      },
      realmId: realm,
    });

    return { success: true };
  }

  getKeys(obj) {
    if (obj == undefined) return [];
    return Object.keys(obj).map((key, i, keys) => {
      if (typeof obj[key] !== "object") return key;
      return [key, this.getKeys(obj[key])];
    });
  }

  getDateConditions(date_from, date_to) {
    const out = {};
    if (date_from) out[Op.gte] = new Date(date_from);
    if (date_to)
      out[Op.lte] = new Date(new Date(date_to).getTime() + 24 * 3600000);
    return out;
  }

  async query(acc_no, realm) {
    const res = await db.account.findOne({
      where: { acc_no },
      attributes: ["id"],
      include: [
        {
          model: db.user,
          attributes: ["id", "first_name", "last_name", "email"],
          where: { realm },
        },
      ],
    });

    if (res && res.dataValues)
      return {
        first_name: res.user.first_name,
        last_name: res.user.last_name,
        email: res.user.email,
      };
    throw "THEREISNTCOUNTERPARTY";
  }
}

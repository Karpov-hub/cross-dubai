import Base from "@lib/base";
import Services from "./sources";
import db from "@lib/db";

export default class Service extends Base {
  publicMethods() {
    return {
      serviceDescription: {},
      getRates: {
        //realm: true,
        description: "Update currency rates",
        schema: {
          type: "object",
          properties: {
            service: { type: "string" }
          },
          required: ["service"]
        }
      },
      getLatestRates: {
        description: "Get latest currency rates",
        schema: {
          type: "object",
          properties: {
            service: { type: "string" }
          }
        }
      },
      calculateAmount: {
        description: "Calculate amount by two currencies"
      },
      getServices: {
        //realm: true,
        description: "Available services list"
      },
      getPublicMethods: {
        realm: true,
        description: "getPublicMethods"
      }
    };
  }

  async getRates(data) {
    if (!data.service || !Services[data.service])
      throw "CURRENCYSERVICENOTFOUND:" + data.service;
    return { currency: await Services[data.service].getData() };
  }

  async calculateAmount(data) {
    let currency = await db.currency_values.findAll({
      where: {
        abbr: data.curr_src
      },
      raw: true
    });

    let res_currency = await db.currency_values.findAll({
      where: {
        abbr: data.curr_dst
      },
      raw: true
    });

    return (
      data.amount *
      currency[currency.length - 1].value *
      (1 / res_currency[res_currency.length - 1].value)
    );
  }

  async getLatestRates(data) {
    const currency = await db.currency_values.findOne({
      where: {
        abbr: data.currency
      },
      raw: true
    });

    const res_currency = await db.currency_values.findOne({
      where: {
        abbr: data.res_currency
      },
      raw: true
    });

    const rate = res_currency.value * (1 / currency.value);

    return rate;
  }

  async getServices() {
    return Object.keys(Services);
  }
}

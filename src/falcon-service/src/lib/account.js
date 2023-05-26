import db from "@lib/db";
import Queue from "@lib/queue";
import MemStore from "@lib/memstore";
import Request from "./request.js";

const Op = db.Sequelize.Op;

async function depositSysUsdt(data, realm) {
  let reqData = {
    request: {
      path: "/instruments/",
      method: "Get"
    },
    json: {
      amount: "1000",
      currency: "USD",
      destination_bank_account: "Test Bank"
    }
  };
  let response = await Request.sendRequest(reqData);

  return response;
}

export default {
  depositSysUsdt
};

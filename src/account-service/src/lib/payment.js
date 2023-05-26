import db from "@lib/db";
import parse from "csv-parse";
import config from "@lib/config";
import fs from "fs";
import Queue from "@lib/queue";

async function massPayment(data, realm, user) {
  let report = [];
  let failed_transfers = [];

  let fileData = await readFile(data.files[0].code);
  let parsedData = await parseFile(fileData);

  data.realm = realm;
  data.user = user;

  for (const addressee of parsedData) {
    if (isEmail(addressee[0])) {
      const res = await query({ email: addressee[0] }, data, addressee);
      if (res && res.success) report.push(res.res_transfer);
      else failed_transfers.push(res.failed_transfers);
    } else {
      const res = await query({ phone: addressee[0] }, data, addressee);
      if (!res) {
        const res = await query(
          { acc_no: addressee[0] },
          data,
          addressee,
          true
        );
        if (res && res.success) report.push(res.res_transfer);
        else failed_transfers.push(res.failed_transfers);
      } else report.push(res);
    }
  }

  return {
    success_transfers: report.length,
    failed_transfers
  };
}

function readFile(code) {
  return new Promise((resolve, reject) => {
    fs.readFile(`${config.upload_dir}/${code}`, "utf-8", (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
}

async function query(where, data, addressee, acc_query) {
  let res;
  if (acc_query) {
    res = await db.account.findOne({
      where,
      attributes: ["id", "acc_no", "currency"]
    });
  } else {
    res = await db.user.findOne({
      where,
      attributes: ["id", "country"],
      include: [
        {
          model: db.account,
          attributes: ["acc_no", "currency"],
          where: {}
        }
      ]
    });
  }

  if (res && res != null) {
    let realmtransferdata = {
      ref_id: "",
      acc_src: data.payment_account,
      acc_dst:
        res.account && res.account.acc_no != undefined
          ? res.account.acc_no
          : res.acc_no,
      amount: addressee[1],
      currency:
        res.account && res.account.currency != undefined
          ? res.account.currency
          : res.currency,
      country: res.country || ""
    };

    const res_transfer = await realmtransfer(
      realmtransferdata,
      data.realm,
      data.user
    );

    if (res_transfer && res_transfer != null)
      return { success: true, res_transfer };
  }
  return {
    success: false,
    failed_transfers: {
      name: addressee[0],
      amount: addressee[1],
      comment: addressee[2]
    }
  };
}

function parseFile(data) {
  const output = [];
  return new Promise((resolve, reject) => {
    parse(data, {
      trim: true,
      skip_empty_lines: true
    }).on("readable", function() {
      let record;
      while ((record = this.read())) {
        output.push(record);
      }
      resolve(output);
    });
  });
}

function isEmail(str) {
  return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    str
  );
}

async function realmtransfer(data, realm, user) {
  let transfer = await Queue.newJob("account-service", {
    method: "realmtransfer",
    data,
    realm,
    user
  });
  return transfer;
}

async function auto() {
  return { success: true };
}

async function bankCharge(data, realm_id, userId, transactions, hooks) {
  return data;
}

export default {
  massPayment,
  auto,
  bankCharge
};

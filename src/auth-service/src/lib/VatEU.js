import db from "@lib/db";
import config from "@lib/config";
import MemStore from "@lib/memstore";
import Queue from "@lib/queue";
import uuid from "uuid/v4";
import validate from "validate-vat";

const Op = db.Sequelize.Op;

async function checkMultipleVATs(data, realm, user) {
  const merchantsVAT = await db.merchant.findAll({
    where: { vat: { [Op.ne]: null } },
    attributes: ["id", "vat", "country"],
    raw: true
  });
  for (let item of merchantsVAT) {
    await checkVAT(
      { vat_num: item.vat, country_code: item.country },
      null,
      null
    );
  }
  return { success: true };
}

async function checkVAT(data, realm, user) {
  let res = await validateVAT(data);

  let log = {
    id: uuid(),
    request: data,
    responce: res,
    realm: realm,
    service: "auth-service",
    method: "checkVAT",
    ctime: new Date(),
    removed: 0
  };

  await db.log.create(log);

  return res;
}

async function validateVAT(data) {
  return new Promise((resolve, reject) => {
    if (!data.country_code || !data.vat_num) reject("VARORCOUNTRYCODEISNULL");
    validate(data.country_code, data.vat_num, function(err, validationInfo) {
      if (err) reject(err);
      else resolve(validationInfo);
    });
  });
}

export default {
  checkVAT,
  checkMultipleVATs
};

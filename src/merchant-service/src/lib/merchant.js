import db from "@lib/db";
import crypto from "crypto";
import moment from "moment";

async function createMerchant(data, realmId, userId) {
  let merchant = {
    name: data.name,
    website: data.website,
    description: data.description,
    categories: data.categories,
    user_id: userId,
    callback: data.callback,
    callback_error: data.callback_error
  };

  const acc = await db.account.findAll({
    where: {
      acc_no: [data.account_fiat, data.account_crypto]
    }
  });

  const token = crypto.randomBytes(42).toString("hex");
  const secret = crypto.randomBytes(42).toString("hex");
  merchant.token = token;
  merchant.secret = secret;

  const res = await db.merchant.create(merchant);

  let merchant_account = [];

  for (const account of acc) {
    merchant_account.push({
      id_merchant: res.id,
      id_account: account.id
    });
  }

  const merch_acc = await db.merchant_account.bulkCreate(merchant_account);

  if (res && res.dataValues && merch_acc) return { token: token };
  throw "CREATEMERCHANTAPIERROR";
}

async function getMerchants(data, realmId, userId) {
  const count = await db.vw_merchants.count({
    where: { user_id: userId }
  });

  if (!data.start) data.start = 0;
  if (!data.limit) data.limit = 100;

  const res = await db.vw_merchants.findAll({
    where: { user_id: userId },
    order: [["name", "ASC"]],
    offset: data.start,
    limit: data.limit
  });

  if (res && res.length) {
    let out = {
      count: count,
      merchants: res.map((i) => {
        i = i.toJSON();
        i.acc_no_fiat = [];
        i.acc_no_crypto = [];
        for (let j = 0; j < i.acc_no.length; j++) {
          i[`acc_no_${i.crypto[j] ? "crypto" : "fiat"}`].push(i.acc_no[j]);
        }
        return i;
      })
    };
    return out;
  }
  return { count: count, merchants: [] };
}

async function getCompanies(data, realm, user) {
  const searchParams = {
    where: { user_id: user, removed: 0 },
    order: [["name", "ASC"]],
    attributes: ["id", "name", "ctime", "active"],
    offset: data.start || 0,
    limit: data.limit || null,
    raw: true
  };

  let res = null;
  if (data && data.monitoringWallets) {
    searchParams.attributes.push(
      "monitoring_crypto_address",
      "wallet_currency"
    );
    res = await db.vw_merchant_monitoring_addresses.findAndCountAll(
      searchParams
    );
  } else {
    res = await db.merchant.findAndCountAll(searchParams);
  }

  return { list: await prepareCompaniesData(res.rows), count: res.count };
}

async function prepareCompaniesData(arr) {
  for (const wallet of arr) {
    wallet.ctime = moment(wallet.ctime).format("L");
    if (wallet.monitoring_crypto_address) {
      for (let i = 0; i < wallet.monitoring_crypto_address.length; i++) {
        wallet.monitoring_crypto_address[i] += ` ${wallet.wallet_currency[i]}`;
      }
    }
  }
  return arr;
}
async function getMerchantSecret(data, realmId) {
  const merchant = await db.merchant.findOne({
    where: { id: data.id },
    attributes: ["token", "secret"]
  });

  if (merchant) return merchant.toJSON();
  throw "MERCHANTNOTFOUND";
}

async function updateMerchant(data, realmId, userId) {
  data.active = false;

  const res = await db.merchant.update(data, {
    where: { user_id: userId, id: data.merchant_id }
  });

  const del_merch_acc = await db.merchant_account.destroy({
    where: {
      id_merchant: data.merchant_id
    }
  });

  const acc = await db.account.findAll({
    where: {
      id: [data.acc1, data.acc2]
    }
  });

  if (del_merch_acc) {
    let merchant_account = [];

    for (const account of acc) {
      merchant_account.push({
        id_merchant: data.merchant_id,
        id_account: account.id
      });
    }

    const merch_acc = await db.merchant_account.bulkCreate(merchant_account);
    if (res && res.length && merch_acc) return { success: true };
  }

  throw "UPDATEMERCHANTAPIERROR";
}

async function getMerchant(data, realmId, userId) {
  const res = await db.merchant.findAll({
    where: { id: data.merchant_id },
    include: [
      {
        model: db.merchant_account
      }
    ]
  });

  const id_accounts = [];
  const out = res[0].toJSON();

  for (const merchant of res)
    id_accounts.push(merchant.merchant_account.id_account);

  const acc = await db.account.findAll({
    where: {
      id: id_accounts
    },
    attributes: ["id", "acc_no", "currency", "acc_name"],
    include: [
      {
        model: db.currency,
        as: "Currency"
      }
    ]
  });

  out.accounts = acc.map((a) => a.toJSON());

  if (out) return out;
  throw "GETMERCHANTAPIERROR";
}

async function addIBAN(data, realm, user) {
  // let res = await db.iban.create({
  //   iban: data.name,
  //   bank_details: data.bank_details,
  //   owner: user,
  //   ctime: new Date()
  // });
  let res = await db.iban.create({
    iban: data.bank_details,
    bank_details: data.bank_details,
    name: data.name,
    owner: user,
    ctime: new Date(),
    removed: 0
  });
  // await db.org_iban.create({
  //   org_id: data.org_id,
  //   iban_id: res.id,
  //   ctime: new Date()
  // });
  return { success: true };
}

async function addContract(data) {
  let newContract;
  let ownersArr = [data.merchant, data.realm];

  const insData = {
    id: data.id,
    director_name: data.director_name,
    contract_subject: data.contract_subject,
    code: data.files ? data.files[0].code : null,
    name: data.files ? data.files[0].name : null,
    description: data.description,
    memo: data.memo,
    automatic_renewal: data.automatic_renewal,
    contract_date: data.contract_date,
    expiration_date: data.expiration_date,
    status: data.status || 0,
    ctime: new Date(),
    removed: 0,
    tariff: data.tariff || null,
    variables: { _arr: data.variables },
    other_signatories: data.other_signatories
  };

  let contract = await db.contract.findOne({
    where: { id: data.id }
  });
  if (contract && contract.dataValues.id) {
    if (
      contract.dataValues.director_name_history &&
      contract.dataValues.director_name_history._arr
    ) {
      if (contract.dataValues.director_name_history._arr.length == 1) {
        contract.dataValues.director_name_history._arr = [];
      }
      if (data.director_name != contract.dataValues.director_name) {
        contract.dataValues.director_name_history._arr.push(
          "Was: " + contract.dataValues.director_name
        );
        contract.dataValues.director_name_history._arr.push(
          "Became: " + data.director_name
        );

        insData.director_name_history =
          contract.dataValues.director_name_history;
      }
    } else {
      insData.director_name_history = {
        _arr: [
          "Was: " + contract.director_name,
          "Became: " + data.director_name
        ]
      };
    }

    await db.contract.update(insData, {
      where: { id: contract.dataValues.id }
    });
  } else {
    insData.director_name_history = { _arr: [data.director_name] };
    newContract = await db.contract.create(insData, { raw: true });
  }
  if (contract && !newContract) {
    await db.orgs_contract.destroy({
      where: { contract_id: contract.dataValues.id }
    });
  }

  for (let owner of ownersArr) {
    await db.orgs_contract.create({
      owner_id: owner,
      contract_id: newContract
        ? newContract.dataValues.id
        : contract.dataValues.id
    });
  }
  return { success: true };
}

async function uploadFile(data, realm, user) {
  const insData = {
    id: data.id,
    code: data.files[0].code,
    name: data.name && data.name.length > 0 ? data.name : data.files[0].name,
    ctime: new Date(),
    mtime: new Date(),
    owner_id: data.owner_id,
    type: data.type || null,
    removed: 0
  };
  let file = await db.file.findOne({
    where: { id: data.id }
  });
  if (file && file.dataValues.id) {
    await db.file.update(insData, {
      where: { id: file.dataValues.id }
    });
  } else {
    let res = await db.file.create(insData, { raw: true });
  }
  return { success: true };
}

async function getContracts(data, realm, user) {
  let res = await db.sequelize.query(
    `select c.id, c.director_name, c.contract_subject,c.description, c.status, c.contract_date, c.expiration_date, c.ctime,
    (select json_agg(file_obj) from (select f.name file_name, f.code from files f where f.owner_id = c.id) file_obj) files
    from contracts as c
    inner join orgs_contracts oc
    on (oc.contract_id = c.id and oc.owner_id = :owner_id)
    inner join merchants m on (m.id = oc.owner_id) and m.user_id = :user_id
    where c.removed=0`,
    {
      replacements: { owner_id: data.org_id, user_id: user },
      raw: true,
      type: db.Sequelize.QueryTypes.SELECT
    }
  );
  if (!res || !res.length) return;
  return { list: res, count: res.length };
}

async function changeStatusIban(data, realm, user) {
  if (data.active) {
    await db.org_iban.create({
      org_id: data.org_id,
      iban_id: data.iban_id,
      ctime: new Date()
    });
    return { success: true };
  } else {
    await db.org_iban.destroy({
      where: { iban_id: data.iban_id, org_id: data.org_id }
    });
    return { success: true };
  }
}

async function getIBANList(data, realm, user) {
  let where = "i.owner = :user_id and i.removed <> 1";
  let sql;
  if (data.org_id) {
    sql =
      "select i.id, i.name, i.bank_details, i.status, oi.org_id from ibans i left join org_ibans oi on (i.id = oi.iban_id and oi.org_id = :org_id) where " +
      where;
  } else
    sql =
      "select i.id, i.name, i.bank_details, i.status from ibans i where " +
      where;
  const ibans = await db.sequelize.query(sql, {
    replacements: { user_id: user, org_id: data.org_id },
    raw: true,
    type: db.Sequelize.QueryTypes.SELECT
  });

  let result = [];
  for (let item of ibans) {
    result.push({
      id: item.id,
      name: item.name,
      bank_details: item.bank_details,
      org_id: item.org_id,
      status: item.status
    });
  }
  return result;
}
function delIBAN(data, realm, user) {
  let removed, removed2;
  return db.sequelize.transaction(async (t) => {
    removed = await db.iban.update(
      {
        removed: 1,
        status: 2
      },
      { where: { id: data.id }, transaction: t }
    );
    if (removed) {
      removed2 = await db.org_iban.destroy({
        where: { iban_id: data.id },
        transaction: t
      });
    }
    if (removed.length == 1 && removed2 == 0) return { success: true };
    throw "ERRORWHILEREMOVEIBAN";
  });
}

export default {
  createMerchant,
  getMerchants,
  getMerchantSecret,
  updateMerchant,
  getMerchant,
  getCompanies,
  addIBAN,
  addContract,
  getContracts,
  // getContract,
  getIBANList,
  changeStatusIban,
  delIBAN,
  uploadFile
};

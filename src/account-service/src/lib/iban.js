import db from "@lib/db";
const Op = db.Sequelize.Op;

async function createIban(data, realm, user) {
  let now = new Date();
  if (!(await checkCurrency(data.currency))) throw "CURRENCYUNDEFINED";

  let bank = await db.bank.findOne({
    where: {
      swift: data.swift
    },
    attributes: ["id"]
  });

  if (!bank) {
    bank = await db.bank.create({
      name: data.name,
      swift: data.swift,
      corr_bank: data.corr_bank,
      corr_swift: data.corr_swift,
      corr_acc: data.corr_acc,
      ctime: now,
      mtime: now,
      maker: realm,
      removed: 0
    });
  }

  let filesID = [];
  let filesName = [];
  let filesSize = [];

  if (data.files && data.files.length)
    for (const file of data.files) {
      filesID.push(file.code);
      filesSize.push(file.size);
      filesName.push(file.name);
    }

  const iban = await db.iban.create({
    bank_id: bank.id,
    iban: data.iban,
    currency: data.currency,
    owner: user,
    file_id: filesID,
    file_name: filesName,
    file_size: filesSize,
    ctime: now,
    mtime: now,
    removed: 0,
    maker: realm
  });

  if (!iban) throw "UNKNOWNERROR";
  return { success: true };
}

async function deleteIban(data, realm, user) {
  const res = await db.iban.update(
    { removed: 1 },
    {
      where: {
        owner: user,
        id: data.iban_id,
        maker: realm
      }
    }
  );

  if (!res) throw "UNKNOWNERROR";
  return { success: true };
}

async function getUserIbans(data, realmId, userId) {
  const count = await db.iban.count({
    where: { owner: userId }
  });

  if (!data.start) data.start = 0;
  if (!data.limit) data.limit = 100;

  const res = await db.iban.findAll({
    where: { owner: userId, [Op.or]: [{ removed: null }, { removed: 0 }] },
    attributes: ["id", "iban", "active"],
    order: [["ctime", "ASC"]],
    offset: data.start,
    limit: data.limit,
    include: [
      {
        model: db.bank,
        attributes: [
          "id",
          "name",
          "swift",
          "country",
          "zip_addr1",
          "city_addr1",
          "street_addr1",
          "house_addr1",
          "apartment_addr1",
          "zip_addr2",
          "city_addr2",
          "street_addr2",
          "house_addr2",
          "apartment_addr2",
          "code"
        ]
      }
    ]
  });

  let response = [];

  if (res && res.length) {
    for (let iban of res) {
      response.push({
        id_iban: iban.id,
        iban: iban.iban,
        active: iban.active,
        bank_name: iban.bank.name,
        bank_swift: iban.bank.swift,
        zip_addr1: iban.bank.zip_addr1,
        city_addr1: iban.bank.city_addr1,
        street_addr1: iban.bank.street_addr1,
        house_addr1: iban.bank.house_addr1,
        apartment_addr1: iban.bank.apartment_addr1,
        zip_addr2: iban.bank.zip_addr2,
        city_addr2: iban.bank.city_addr2,
        street_addr2: iban.bank.street_addr2,
        house_addr2: iban.bank.house_addr2,
        apartment_addr2: iban.bank.apartment_addr2,
        bank_country: iban.bank.country,
        bank_code: iban.bank.code
      });
    }
  }

  return { ibans: response, count: count };
}

async function getBanks(data, realm, user) {
  const res = await db.bank.findAll({
    where: {
      maker: realm
    }
  });

  if (res && res.length) {
    return res;
  }

  return [];
}

async function checkCurrency(abbr) {
  if (!abbr) return false;
  const { dataValues } = await db.currency.findOne({ where: { abbr } });
  return !!dataValues;
}

export default {
  createIban,
  getUserIbans,
  deleteIban,
  getBanks
};

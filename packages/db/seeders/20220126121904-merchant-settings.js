"use strict";

async function getCurrency(db) {
  const res = await db.query("SELECT abbr, crypto FROM currency");
  const currency = {};
  res[0].forEach((item) => {
    currency[item.abbr] = item.crypto;
  });
  return currency;
}

async function getAccountCryptoAddress(db, acc_no) {
  const res = await db.query(
    "select address from account_crypto WHERE acc_no='" + acc_no + "'"
  );
  return res && res[0] ? (res[0][0] ? res[0][0].address : res[0].address) : "";
}

async function getWalletsOfMerchant(db, merchant_id) {
  console.log("getWalletsOfMerchant:", merchant_id);
  const res = await db.query(
    "select w.num as address, w.curr_name as currency  from crypto_wallets w, org_cryptowallets o  WHERE w.id=o.wallet_id and o.org_id='" +
      merchant_id +
      "'"
  );
  return res[0];
}

async function updateMerchantVariables(db, merchant_id, variables) {
  const res = await await db.sequelize.query(
    `SELECT variables FROM merchants WHERE id=:merchant_id`,
    {
      replacements: { merchant_id },
      type: db.sequelize.QueryTypes.SELECT
    }
  );

  variables = res[0].variables._arr.concat(variables);

  //console.log("variables:", variables);

  await db.sequelize.query(
    `UPDATE merchants SET variables=:variables WHERE id=:merchant_id`,
    {
      replacements: {
        merchant_id,
        variables: JSON.stringify({ _arr: variables })
      },
      type: db.sequelize.QueryTypes.UPDATE
    }
  );
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    let merchantAccounts = {};
    let res = await queryInterface.sequelize.query(
      `SELECT m.id_merchant, a.acc_no, a.currency FROM accounts a, merchant_accounts m WHERE a.id=m.id_account`
    );

    for (let item of res[0]) {
      if (!merchantAccounts[item.id_merchant])
        merchantAccounts[item.id_merchant] = [];
      merchantAccounts[item.id_merchant].push({
        acc_no: item.acc_no,
        currency: item.currency
      });
    }
    const currency = await getCurrency(queryInterface.sequelize);

    for (let merchant_id in merchantAccounts) {
      let address = "";
      let variables = [];
      console.log("merchant_id:", merchant_id);
      for (let account of merchantAccounts[merchant_id]) {
        if (currency[account.currency]) {
          address = await getAccountCryptoAddress(
            queryInterface.sequelize,
            account.acc_no
          );
          if (address) {
            variables.push({
              key: `MONITOR_ADDR_${account.currency}`,
              value: address,
              descript: `Адрес мониторингового кошелька в ${account.currency}`
            });
            variables.push({
              key: `MONITOR_ACC_${account.currency}`,
              value: account.acc_no,
              descript: `Мониторинговый счет в ${account.currency}`
            });
          }
        } else {
          variables.push({
            key: `SRC_ACC_${account.currency}`,
            value: account.acc_no,
            descript: `Счет списания в ${account.currency}`
          });
        }
      }
      let wallets = await getWalletsOfMerchant(
        queryInterface.sequelize,
        merchant_id
      );
      for (let item of wallets) {
        variables.push({
          key: `EXTERNAL_${item.currency}`,
          value: item.address,
          descript: `Внешний кошелек в ${item.currency}`
        });
      }
      await updateMerchantVariables(queryInterface, merchant_id, variables);
    }
  },

  down: async (queryInterface, Sequelize) => {}
};

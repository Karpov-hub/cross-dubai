"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(`DROP VIEW vw_accounts_with_gas;`, {
          transaction: t
        }),
        queryInterface.sequelize.query(
          `create or replace view vw_accounts_with_gas as
          select
            a.id id,
            ac.id as wallet_id,
            a."owner" as owner_id,
            u.legalname as owner_name,
            ma.id_merchant as merchant_id,
            m."name" as merchant_name,
            a.acc_no as acc_no,
            a.currency as currency,
            a.balance as balance,
            ac.address as address,
            ac2.acc_no as gas_acc_no,
            ac2.abbr as gas_currency,
            ac2.id as gas_acc_id,
            a.status as status,
            tc.join_link as telegram_link,
            a.ctime as ctime,
            ac.wallet_type as wallet_type
          from accounts a
          left join account_crypto ac on (ac.acc_no = a.acc_no and ac.abbr not in ('ETH','TRX'))
          left join merchant_accounts ma on (a.id = ma.id_account)
          left join account_crypto ac2 on (ac.address = ac2.address and ac2.abbr in ('ETH','TRX'))
          left join telegram_channels tc on (tc.ref_id = ac.id)
          left join users u on (a."owner" = u.id)
          left join merchants m on (m.id = ma.id_merchant)
          where a.currency not in ('ETH','TRX');`,
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(`DROP VIEW vw_accounts_with_gas;`, {
          transaction: t
        }),
        queryInterface.sequelize.query(
          `create or replace view vw_accounts_with_gas as
          select
            a.id id,
            a."owner" as owner_id,
            u.legalname as owner_name,
            ma.id_merchant as merchant_id,
            m."name" as merchant_name,
            a.acc_no as acc_no,
            a.currency as currency,
            a.balance as balance,
            ac.address as address,
            ac2.acc_no as gas_acc_no,
            ac2.abbr as gas_currency,
            ac2.id as gas_acc_id,
            a.status as status,
            tc.join_link as telegram_link,
            a.ctime as ctime,
            ac.wallet_type as wallet_type
          from accounts a
          left join account_crypto ac on (ac.acc_no = a.acc_no and ac.abbr not in ('ETH','TRX'))
          left join merchant_accounts ma on (a.id = ma.id_account)
          left join account_crypto ac2 on (ac.address = ac2.address and ac2.abbr in ('ETH','TRX'))
          left join telegram_channels tc on (tc.ref_id = ac.id)
          left join users u on (a."owner" = u.id)
          left join merchants m on (m.id = ma.id_merchant)
          where a.currency not in ('ETH','TRX');`,
          { transaction: t }
        )
      ]);
    });
  }
};

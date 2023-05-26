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
            a."owner" owner_id,
            ma.id_merchant merchant_id,
            a.acc_no acc_no,
            a.currency currency,
            a.balance balance,
            ac.address address,
            ac2.acc_no gas_acc_no,
            ac2.abbr gas_currency,
            a.status status,
            tc.join_link telegram_link,
            a.ctime ctime,
            ac.wallet_type wallet_type
          from accounts a
          left join account_crypto ac 
          on (ac.acc_no = a.acc_no and ac.abbr not in ('ETH','TRX'))
          left join merchant_accounts ma 
          on (a.id = ma.id_account)
          left join account_crypto ac2 
          on (ac.address = ac2.address and ac2.abbr in ('ETH','TRX'))
          left join telegram_channels tc 
          on (tc.ref_id = ac.id)
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
            a."owner" owner_id,
            ma.id_merchant merchant_id,
            a.acc_no acc_no,
            a.currency currency,
            a.balance balance,
            ac.address address,
            ac2.acc_no gas_acc_no,
            ac2.abbr gas_currency,
            a.status status,
            tc.join_link telegram_link,
            a.ctime ctime
          from accounts a
          left join account_crypto ac 
          on (ac.acc_no = a.acc_no and ac.abbr not in ('ETH','TRX'))
          left join merchant_accounts ma 
          on (a.id = ma.id_account)
          left join account_crypto ac2 
          on (ac.address = ac2.address and ac2.abbr in ('ETH','TRX'))
          left join telegram_channels tc 
          on (tc.ref_id = ac.id)
          where a.currency not in ('ETH','TRX');`,
          { transaction: t }
        )
      ]);
    });
  }
};

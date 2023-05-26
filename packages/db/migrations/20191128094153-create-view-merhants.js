"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.sequelize.query(`drop view vw_merchants`, {
          transaction: t
        }),
        queryInterface.sequelize.query(
          `create view vw_merchants as select m.*, a.acc_no, a.crypto from merchants m left join merchant_accounts ma on m.id=ma.id_merchant left join (select accounts.id, acc_no, crypto from accounts, currency where accounts.currency = currency.abbr) as a on a.id=ma.id_account`,
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {}
};

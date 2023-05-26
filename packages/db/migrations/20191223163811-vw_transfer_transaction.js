"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.sequelize.query(`drop view vw_transfer_transactions`, {
          transaction: t
        }),
        queryInterface.sequelize.query(
          `create view vw_transfer_transactions as select t.id, t.ref_id, t.held, t.canceled, t.ctime, t.mtime, array_agg(x.acc_src) as acc_src, array_agg(x.acc_dst) as acc_dst, array_agg(x.amount) as amount, array_agg(x.exchange_amount) as exchange_amount, array_agg(x.currency_src) as currency_src, array_agg(x.currency_dst) as currency_dst, t.data from transfers t, transactions x where t.id=x.transfer_id group by t.id, t.ref_id, t.held, t.canceled, t.ctime, t.mtime`,
          {
            transaction: t
          }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {}
};

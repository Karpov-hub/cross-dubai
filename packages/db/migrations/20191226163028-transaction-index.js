"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.sequelize.query(`DROP VIEW vw_transfer_transactions`, {
          transaction: t
        }),
        queryInterface.addColumn(
          "transactions",
          "index",
          {
            type: Sequelize.INTEGER
          },
          { transaction: t }
        ),

        queryInterface.sequelize.query(
          `CREATE VIEW vw_transfer_transactions AS SELECT t.id,
          t.ref_id,
          t.held,
          t.canceled,
          t.ctime,
          t.mtime,
          array_agg(x.acc_src) AS acc_src,
          array_agg(x.acc_dst) AS acc_dst,
          array_agg(x.amount) AS amount,
          array_agg(x.exchange_amount) AS exchange_amount,
          array_agg(x.currency_src) AS currency_src,
          array_agg(x.currency_dst) AS currency_dst,
          array_agg(x.index) AS index,
          t.data
         FROM transfers t,
          transactions x
        WHERE t.id = x.transfer_id
        GROUP BY t.id, t.ref_id, t.held, t.canceled, t.ctime, t.mtime`,
          {
            transaction: t
          }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn("transactions", "index", {
          transaction: t
        })
      ]);
    });
  }
};

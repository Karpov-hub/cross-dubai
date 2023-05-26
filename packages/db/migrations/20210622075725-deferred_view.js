"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(
          `CREATE VIEW vw_deferred_transfers AS select * from transfers where deferred=true and id not in (SELECT transfer_id FROM withdrawal_transfers)`,
          {
            transaction: t
          }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(`DROP VIEW vw_deferred_transfers`, {
          transaction: t
        })
      ]);
    });
  }
};

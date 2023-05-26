"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.sequelize.query(
          `CREATE INDEX idx_vw_acc_src on transactions ("acc_src")`,
          {
            transaction: t
          }
        ),

        queryInterface.sequelize.query(
          `CREATE INDEX idx_vw_acc_dst on transactions ("acc_dst")`,
          {
            transaction: t
          }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {}
};

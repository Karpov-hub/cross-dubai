"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.sequelize.query(
          `CREATE OR REPLACE VIEW vw_realmaccounts AS select a.*, r.type, r.details, r.country  FROM realmaccounts r, accounts a where r.account_id = a.id`,
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {}
};

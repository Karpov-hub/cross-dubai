"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.sequelize.query(
          `CREATE OR REPLACE VIEW vw_accounts AS select a.id, a.acc_no, a.status, a.owner, a.balance, a.currency, u.first_name, u.last_name, u.legalname, u.addr1_zip as zip, u.addr1_address as address, u.country, u.realm, r.name as realmname from accounts a, users u, realms r where a.owner = u.id and u.realm = r.id`,
          { transaction: t }
        ),
        queryInterface.addColumn(
          "banks",
          "corr_bank",
          {
            type: Sequelize.STRING(255)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "banks",
          "corr_swift",
          {
            type: Sequelize.STRING(30)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "banks",
          "corr_acc",
          {
            type: Sequelize.STRING(30)
          },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {}
};

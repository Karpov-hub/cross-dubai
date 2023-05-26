"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(
          `CREATE VIEW vw_client_accs AS SELECT 
          a.*, m."name" as merchant_name
          FROM accounts a, vw_org_accounts o, merchants m
          WHERE o.acc_no=a.acc_no and m.id=o.org`,
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
        queryInterface.sequelize.query(`DROP VIEW vw_client_accs`, {
          transaction: t
        })
      ]);
    });
  }
};

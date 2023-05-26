"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(`DROP VIEW vw_plans_weights`, {
          transaction: t
        }),
        queryInterface.sequelize.query(
          `CREATE VIEW vw_plans_weights as select ap.*, pw.weight, pw.merchant_id 
          FROM accounts_plans ap 
          LEFT JOIN plans_weights pw ON ap.id=pw.plan_id;`,
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
        queryInterface.sequelize.query(`DROP VIEW vw_plans_weights`, {
          transaction: t
        }),
        queryInterface.sequelize.query(
          `CREATE VIEW vw_plans_weights as select ap.*, pw.weight, pw.merchant_id 
          FROM accounts_plans ap 
          LEFT JOIN plans_weights pw ON ap.id=pw.plan_id;`,
          {
            transaction: t
          }
        )
      ]);
    });
  }
};

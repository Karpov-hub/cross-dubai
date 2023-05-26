"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(`DROP VIEW vw_client_accs`, {
          transaction: t
        }),
        queryInterface.sequelize.query(
          `CREATE VIEW vw_client_accs AS SELECT 
          a.*, m."name" as merchant_name, u.legalname
          FROM accounts a
          left join vw_org_accounts o
          on o.acc_no=a.acc_no
          left join merchants m on m.id=o.org
          left join users u on a."owner"=u.id;`,
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
        }),
        queryInterface.sequelize.query(
          `CREATE VIEW vw_client_accs AS SELECT 
          a.*, m."name" as merchant_name
          FROM accounts a
          left join vw_org_accounts o
          on o.acc_no=a.acc_no
          left join merchants m on m.id=o.org;`,
          {
            transaction: t
          }
        )
      ]);
    });
  }
};

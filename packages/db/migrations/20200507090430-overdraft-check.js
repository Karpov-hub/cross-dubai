"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(
          `alter table accounts add overdraft DOUBLE PRECISION default 0`,
          {
            transaction: t,
          }
        ),
        queryInterface.sequelize.query(
          `alter table accounts add check (negative=true or balance>=overdraft)`,
          {
            transaction: t,
          }
        ),
        queryInterface.sequelize.query(`DROP VIEW vw_accounts`, {
          transaction: t,
        }),
        queryInterface.sequelize.query(
          `CREATE VIEW vw_accounts AS SELECT a.id,
          a.acc_no,
          a.status,
          a.owner,
          a.overdraft,
          a.balance,
          a.currency,
          u.first_name,
          u.last_name,
          u.legalname,
          u.addr1_zip AS zip,
          u.addr1_address AS address,
          u.country,
          u.realm,
          r.name AS realmname
         FROM accounts a,
          users u,
          realms r
        WHERE a.owner = u.id AND u.realm = r.id;`,
          {
            transaction: t,
          }
        ),
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(`alter table accounts drop overdraft`, {
          transaction: t,
        }),
      ]);
    });
  },
};

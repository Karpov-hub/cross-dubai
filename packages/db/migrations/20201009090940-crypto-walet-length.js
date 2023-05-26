"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(`DROP VIEW IF EXISTS vw_orgs_crypto`, {
          transaction: t
        }),
        queryInterface.sequelize.query(`DROP VIEW IF EXISTS vw_org_wallets`, {
          transaction: t
        }),

        queryInterface.changeColumn(
          "crypto_wallets",
          "num",
          {
            type: Sequelize.STRING(255)
          },
          { transaction: t }
        ),

        queryInterface.sequelize.query(
          `SELECT oc.org_id,
          cw.id,
          cw.name,
          cw.num,
          cw.curr_name,
          cw.user_id
         FROM org_cryptowallets oc
           JOIN crypto_wallets cw ON cw.id = oc.wallet_id`,
          {
            transaction: t
          }
        ),
        queryInterface.sequelize.query(
          `CREATE VIEW vw_org_wallets AS SELECT m.org_id AS org,
          a.id,
          a.name,
          a.num,
          a.curr_name,
          a.user_id,
          a.removed,
          a.signobject,
          a.maker,
          a.ctime,
          a.mtime
         FROM crypto_wallets a,
          org_cryptowallets m
        WHERE m.wallet_id = a.id`,
          {
            transaction: t
          }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};

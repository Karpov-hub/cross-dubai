"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(`DROP VIEW IF EXISTS vw_org_wallets`, {
          transaction: t
        }),
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
          a.mtime,
          a.status,
          a.send_via_chain_required
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
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(`DROP VIEW IF EXISTS vw_org_wallets`, {
          transaction: t
        }),
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
  }
};

"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      CREATE VIEW vw_orgs_crypto as 
      select oc.org_id, cw.id, cw."name", cw.num, cw.curr_name, cw.user_id 
      from org_cryptowallets oc
      inner join crypto_wallets cw
      on (cw.id=oc.wallet_id)`);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`DROP VIEW vw_orgs_crypto`);
  }
};

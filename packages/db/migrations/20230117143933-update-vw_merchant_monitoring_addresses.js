"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      `CREATE OR REPLACE VIEW vw_merchant_monitoring_addresses as
        SELECT m.id, m.name, m.ctime, m."active", m.user_id, m.removed, array_agg(ac.address) AS monitoring_crypto_address, array_agg(ac.abbr) AS wallet_currency
        FROM merchants m
        LEFT JOIN merchant_accounts ma ON (m.id = ma.id_merchant)
        LEFT JOIN accounts a ON (a.id = ma.id_account)
        LEFT JOIN account_crypto ac ON (a.acc_no = ac.acc_no)
        INNER JOIN currency c ON (c.abbr = ac.abbr and c.crypto = 'true')
        GROUP BY m.id, m.name;`
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      `DROP VIEW vw_merchant_monitoring_addresses;`
    );
  }
};

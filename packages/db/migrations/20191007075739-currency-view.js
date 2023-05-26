"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      `CREATE VIEW vw_current_currency AS SELECT max(value) as k, abbr FROM currency_values WHERE pid in (SELECT id FROM currency_history WHERE active = true ORDER BY ctime desc LIMIT 1) GROUP BY abbr`
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`DROP VIEW vw_current_currency`);
  }
};

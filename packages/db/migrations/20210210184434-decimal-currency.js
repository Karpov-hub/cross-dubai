"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(`DROP VIEW vw_currency_values`, {
          transaction: t
        }),
        queryInterface.sequelize.query(
          `create view vw_currency_values as select v.abbr, realm, amount, value, c.crypto, c.decimal from (select id, jsonb_array_elements_text(realms -> '_arr'::text) AS realm from currency_history where active=true) as h, currency_values v, currency c where c.abbr=v.abbr and h.id=v.pid`,
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(`drop view vw_currency_values`, {
          transaction: t
        })
      ]);
    });
  }
};

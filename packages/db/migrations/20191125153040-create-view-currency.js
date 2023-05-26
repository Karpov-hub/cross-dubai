"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn(
          "currency_values",
          "crypto",
          {
            type: Sequelize.BOOLEAN,
            defaultValue: false
          },
          {
            transaction: t
          }
        ),
        queryInterface.sequelize.query(
          `alter table currency_history alter column realms type jsonb`,
          {
            transaction: t
          }
        ),
        queryInterface.sequelize.query(
          `create view vw_currency_values as select abbr, realm, amount, value, crypto from (select id, jsonb_array_elements_text(realms -> '_arr'::text) AS realm from currency_history where active=true) as h, currency_values v where h.id=v.pid`,
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.sequelize.query(
          `alter table currency_history alter column realms type json`,
          {
            transaction: t
          }
        ),
        queryInterface.sequelize.query(`drop view vw_currency_values`, {
          transaction: t
        })
      ]);
    });
  }
};
